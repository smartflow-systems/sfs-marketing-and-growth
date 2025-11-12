"""
Security Module
Handles CSRF protection, rate limiting, input sanitization, and security headers
"""

import os
import logging
import hashlib
import secrets
from functools import wraps
from datetime import datetime, timedelta
from typing import Optional, Callable
from flask import request, session, jsonify, abort
import re

logger = logging.getLogger(__name__)

# Try importing optional dependencies
try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    logger.warning("Redis not available. Rate limiting will use in-memory storage.")

try:
    import bleach
    BLEACH_AVAILABLE = True
except ImportError:
    BLEACH_AVAILABLE = False
    logger.warning("Bleach not available. Install with: pip install bleach")


# ===================
# CSRF Protection
# ===================

class CSRFProtection:
    """CSRF token generation and validation"""

    @staticmethod
    def generate_token() -> str:
        """Generate a CSRF token"""
        if 'csrf_token' not in session:
            session['csrf_token'] = secrets.token_urlsafe(32)
        return session['csrf_token']

    @staticmethod
    def validate_token(token: str) -> bool:
        """Validate a CSRF token"""
        session_token = session.get('csrf_token')
        if not session_token:
            return False
        return secrets.compare_digest(session_token, token)

    @staticmethod
    def get_token_from_request() -> Optional[str]:
        """Get CSRF token from request (header or form)"""
        # Check X-CSRF-Token header first
        token = request.headers.get('X-CSRF-Token')
        if token:
            return token

        # Check form data
        if request.form:
            return request.form.get('csrf_token')

        # Check JSON body
        if request.is_json:
            data = request.get_json(silent=True)
            if data:
                return data.get('csrf_token')

        return None


def csrf_protect(f: Callable) -> Callable:
    """
    Decorator to protect routes with CSRF validation

    Usage:
        @app.route('/api/sensitive', methods=['POST'])
        @csrf_protect
        def sensitive_endpoint():
            return {"ok": True}
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Skip CSRF for GET, HEAD, OPTIONS (safe methods)
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return f(*args, **kwargs)

        token = CSRFProtection.get_token_from_request()
        if not token or not CSRFProtection.validate_token(token):
            logger.warning(f"CSRF validation failed for {request.path}")
            abort(403, description="CSRF token validation failed")

        return f(*args, **kwargs)

    return decorated_function


# ===================
# Rate Limiting
# ===================

class RateLimiter:
    """Rate limiting using Redis or in-memory fallback"""

    def __init__(self):
        self.redis_client = None
        self.memory_store = {}  # Fallback for when Redis unavailable

        # Try to connect to Redis
        if REDIS_AVAILABLE:
            redis_url = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
            try:
                self.redis_client = redis.from_url(redis_url, decode_responses=True)
                self.redis_client.ping()
                logger.info("Rate limiter using Redis")
            except Exception as e:
                logger.warning(f"Redis connection failed: {e}. Using in-memory fallback.")
                self.redis_client = None
        else:
            logger.info("Rate limiter using in-memory storage")

    def _get_key(self, identifier: str, route: str) -> str:
        """Generate rate limit key"""
        return f"ratelimit:{identifier}:{route}"

    def _clean_memory_store(self):
        """Clean expired entries from memory store"""
        now = datetime.utcnow()
        expired_keys = [
            k for k, v in self.memory_store.items()
            if v['expires'] < now
        ]
        for key in expired_keys:
            del self.memory_store[key]

    def is_allowed(
        self,
        identifier: str,
        route: str,
        limit: int = 60,
        window: int = 60
    ) -> tuple[bool, dict]:
        """
        Check if request is allowed

        Args:
            identifier: User ID, IP address, or other identifier
            route: Route being accessed
            limit: Max requests allowed
            window: Time window in seconds

        Returns:
            Tuple of (allowed: bool, info: dict)
        """
        key = self._get_key(identifier, route)

        if self.redis_client:
            # Use Redis for distributed rate limiting
            try:
                current = self.redis_client.get(key)
                if current is None:
                    # First request
                    self.redis_client.setex(key, window, 1)
                    return True, {
                        "limit": limit,
                        "remaining": limit - 1,
                        "reset": int(datetime.utcnow().timestamp()) + window
                    }

                current = int(current)
                if current >= limit:
                    # Rate limit exceeded
                    ttl = self.redis_client.ttl(key)
                    return False, {
                        "limit": limit,
                        "remaining": 0,
                        "reset": int(datetime.utcnow().timestamp()) + ttl,
                        "retry_after": ttl
                    }

                # Increment counter
                self.redis_client.incr(key)
                ttl = self.redis_client.ttl(key)

                return True, {
                    "limit": limit,
                    "remaining": limit - current - 1,
                    "reset": int(datetime.utcnow().timestamp()) + ttl
                }

            except Exception as e:
                logger.error(f"Redis rate limit error: {e}")
                # Fall through to memory store

        # In-memory fallback
        self._clean_memory_store()
        now = datetime.utcnow()

        if key in self.memory_store:
            entry = self.memory_store[key]
            if entry['expires'] < now:
                # Window expired, reset
                self.memory_store[key] = {
                    'count': 1,
                    'expires': now + timedelta(seconds=window)
                }
                return True, {
                    "limit": limit,
                    "remaining": limit - 1,
                    "reset": int((now + timedelta(seconds=window)).timestamp())
                }

            if entry['count'] >= limit:
                # Rate limit exceeded
                return False, {
                    "limit": limit,
                    "remaining": 0,
                    "reset": int(entry['expires'].timestamp()),
                    "retry_after": int((entry['expires'] - now).total_seconds())
                }

            # Increment
            entry['count'] += 1
            return True, {
                "limit": limit,
                "remaining": limit - entry['count'],
                "reset": int(entry['expires'].timestamp())
            }

        # First request
        self.memory_store[key] = {
            'count': 1,
            'expires': now + timedelta(seconds=window)
        }
        return True, {
            "limit": limit,
            "remaining": limit - 1,
            "reset": int((now + timedelta(seconds=window)).timestamp())
        }


# Global rate limiter instance
_rate_limiter = None


def get_rate_limiter() -> RateLimiter:
    """Get or create global rate limiter"""
    global _rate_limiter
    if _rate_limiter is None:
        _rate_limiter = RateLimiter()
    return _rate_limiter


def rate_limit(limit: int = 60, window: int = 60, per: str = "ip"):
    """
    Decorator for rate limiting endpoints

    Args:
        limit: Max requests allowed
        window: Time window in seconds
        per: What to rate limit by ('ip', 'user', 'session')

    Usage:
        @app.route('/api/endpoint')
        @rate_limit(limit=10, window=60, per='ip')
        def my_endpoint():
            return {"ok": True}
    """
    def decorator(f: Callable) -> Callable:
        @wraps(f)
        def decorated_function(*args, **kwargs):
            limiter = get_rate_limiter()

            # Determine identifier
            if per == "ip":
                identifier = request.remote_addr or "unknown"
            elif per == "user":
                identifier = session.get('user_id', request.remote_addr or "unknown")
            elif per == "session":
                identifier = session.get('session_id', request.remote_addr or "unknown")
            else:
                identifier = request.remote_addr or "unknown"

            # Check rate limit
            allowed, info = limiter.is_allowed(
                identifier=identifier,
                route=request.endpoint or request.path,
                limit=limit,
                window=window
            )

            # Add rate limit headers
            response_headers = {
                'X-RateLimit-Limit': str(info['limit']),
                'X-RateLimit-Remaining': str(info['remaining']),
                'X-RateLimit-Reset': str(info['reset'])
            }

            if not allowed:
                logger.warning(f"Rate limit exceeded for {identifier} on {request.path}")
                response = jsonify({
                    "error": "Rate limit exceeded",
                    "retry_after": info.get('retry_after', window)
                })
                response.status_code = 429
                for key, value in response_headers.items():
                    response.headers[key] = value
                response.headers['Retry-After'] = str(info.get('retry_after', window))
                return response

            # Execute route
            result = f(*args, **kwargs)

            # Add headers to successful response
            if hasattr(result, 'headers'):
                for key, value in response_headers.items():
                    result.headers[key] = value

            return result

        return decorated_function
    return decorator


# ===================
# Input Sanitization
# ===================

class InputSanitizer:
    """Sanitize user input to prevent XSS and injection attacks"""

    @staticmethod
    def sanitize_html(text: str, allowed_tags: Optional[list] = None) -> str:
        """
        Sanitize HTML to prevent XSS

        Args:
            text: HTML text to sanitize
            allowed_tags: List of allowed HTML tags (default: none)

        Returns:
            Sanitized HTML
        """
        if not BLEACH_AVAILABLE:
            # Fallback: strip all HTML
            return re.sub(r'<[^>]*>', '', text)

        if allowed_tags is None:
            allowed_tags = []

        return bleach.clean(text, tags=allowed_tags, strip=True)

    @staticmethod
    def sanitize_sql(text: str) -> str:
        """
        Basic SQL injection prevention (use parameterized queries instead!)

        Args:
            text: Input text

        Returns:
            Sanitized text
        """
        # Remove common SQL injection patterns
        dangerous_patterns = [
            r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)",
            r"(--|\;|\/\*|\*\/)",
            r"(\bOR\b.*=.*)",
            r"(\bAND\b.*=.*)"
        ]

        sanitized = text
        for pattern in dangerous_patterns:
            sanitized = re.sub(pattern, '', sanitized, flags=re.IGNORECASE)

        return sanitized.strip()

    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))

    @staticmethod
    def validate_url(url: str) -> bool:
        """Validate URL format"""
        pattern = r'^https?://[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(/.*)?$'
        return bool(re.match(pattern, url))

    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """Sanitize filename to prevent directory traversal"""
        # Remove path separators
        filename = filename.replace('/', '').replace('\\', '')
        # Remove dots at start
        filename = filename.lstrip('.')
        # Keep only safe characters
        filename = re.sub(r'[^a-zA-Z0-9._-]', '_', filename)
        return filename[:255]  # Limit length


# ===================
# Security Headers
# ===================

def add_security_headers(response):
    """
    Add security headers to response

    Usage in Flask app:
        @app.after_request
        def after_request(response):
            return add_security_headers(response)
    """
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'

    # Content Security Policy
    csp = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "font-src 'self' data:; "
        "connect-src 'self' https://api.stripe.com; "
        "frame-ancestors 'none';"
    )
    response.headers['Content-Security-Policy'] = csp

    return response


# ===================
# Password Hashing
# ===================

class PasswordHasher:
    """Secure password hashing using SHA-256 with salt"""

    @staticmethod
    def hash_password(password: str) -> str:
        """
        Hash password with salt

        Args:
            password: Plain text password

        Returns:
            Hashed password with salt (salt$hash)
        """
        salt = secrets.token_hex(16)
        hash_obj = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
        hash_hex = hash_obj.hex()
        return f"{salt}${hash_hex}"

    @staticmethod
    def verify_password(password: str, hashed: str) -> bool:
        """
        Verify password against hash

        Args:
            password: Plain text password
            hashed: Stored hash (salt$hash)

        Returns:
            True if password matches
        """
        try:
            salt, hash_hex = hashed.split('$')
            hash_obj = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
            return secrets.compare_digest(hash_obj.hex(), hash_hex)
        except Exception as e:
            logger.error(f"Password verification error: {e}")
            return False

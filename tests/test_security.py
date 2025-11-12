"""
Tests for Security Module
"""

import pytest
from security import (
    CSRFProtection,
    RateLimiter,
    InputSanitizer,
    PasswordHasher,
    get_rate_limiter
)


class TestCSRFProtection:
    """Test CSRF token generation and validation"""

    def test_generate_token(self):
        """Test CSRF token generation"""
        token = CSRFProtection.generate_token()
        assert token is not None
        assert len(token) > 20
        assert isinstance(token, str)

    def test_validate_token_success(self):
        """Test valid CSRF token"""
        from flask import Flask, session as flask_session
        app = Flask(__name__)
        app.secret_key = 'test-secret'

        with app.test_request_context():
            token = CSRFProtection.generate_token()
            assert CSRFProtection.validate_token(token) is True

    def test_validate_token_failure(self):
        """Test invalid CSRF token"""
        from flask import Flask
        app = Flask(__name__)
        app.secret_key = 'test-secret'

        with app.test_request_context():
            CSRFProtection.generate_token()
            assert CSRFProtection.validate_token('invalid-token') is False


class TestRateLimiter:
    """Test rate limiting functionality"""

    def test_rate_limiter_init(self):
        """Test rate limiter initialization"""
        limiter = RateLimiter()
        assert limiter is not None

    def test_is_allowed_first_request(self):
        """Test first request is allowed"""
        limiter = RateLimiter()
        allowed, info = limiter.is_allowed('test-user', '/api/test', limit=10, window=60)

        assert allowed is True
        assert info['limit'] == 10
        assert info['remaining'] == 9

    def test_is_allowed_rate_limit_exceeded(self):
        """Test rate limit enforcement"""
        limiter = RateLimiter()

        # Make requests up to limit
        for i in range(10):
            allowed, _ = limiter.is_allowed('test-user-2', '/api/test', limit=10, window=60)
            assert allowed is True

        # Next request should be blocked
        allowed, info = limiter.is_allowed('test-user-2', '/api/test', limit=10, window=60)
        assert allowed is False
        assert info['remaining'] == 0

    def test_different_users_separate_limits(self):
        """Test that different users have separate rate limits"""
        limiter = RateLimiter()

        # User 1 makes requests
        for i in range(5):
            allowed, _ = limiter.is_allowed('user-1', '/api/test', limit=10, window=60)
            assert allowed is True

        # User 2 should have full limit
        allowed, info = limiter.is_allowed('user-2', '/api/test', limit=10, window=60)
        assert allowed is True
        assert info['remaining'] == 9


class TestInputSanitizer:
    """Test input sanitization"""

    def test_sanitize_html_removes_scripts(self):
        """Test HTML sanitization removes scripts"""
        dirty = '<script>alert("xss")</script><p>Hello</p>'
        clean = InputSanitizer.sanitize_html(dirty)

        assert '<script>' not in clean
        assert 'alert' not in clean or '<script>' not in clean

    def test_sanitize_html_with_allowed_tags(self):
        """Test HTML sanitization with allowed tags"""
        html = '<p>Hello</p><b>World</b><script>bad</script>'
        clean = InputSanitizer.sanitize_html(html, allowed_tags=['p', 'b'])

        # Script should be removed
        assert '<script>' not in clean

    def test_validate_email_valid(self):
        """Test valid email validation"""
        assert InputSanitizer.validate_email('test@example.com') is True
        assert InputSanitizer.validate_email('user.name@domain.co.uk') is True

    def test_validate_email_invalid(self):
        """Test invalid email validation"""
        assert InputSanitizer.validate_email('not-an-email') is False
        assert InputSanitizer.validate_email('@example.com') is False
        assert InputSanitizer.validate_email('test@') is False

    def test_validate_url_valid(self):
        """Test valid URL validation"""
        assert InputSanitizer.validate_url('https://example.com') is True
        assert InputSanitizer.validate_url('http://test.org/path') is True

    def test_validate_url_invalid(self):
        """Test invalid URL validation"""
        assert InputSanitizer.validate_url('not-a-url') is False
        assert InputSanitizer.validate_url('ftp://example.com') is False

    def test_sanitize_filename(self):
        """Test filename sanitization"""
        assert InputSanitizer.sanitize_filename('../../../etc/passwd') == 'etcpasswd'
        assert InputSanitizer.sanitize_filename('test file.txt') == 'test_file.txt'
        assert InputSanitizer.sanitize_filename('.hidden') == 'hidden'

    def test_sanitize_sql(self):
        """Test SQL injection prevention"""
        dirty = "user' OR '1'='1"
        clean = InputSanitizer.sanitize_sql(dirty)

        assert 'OR' not in clean or "'" not in clean


class TestPasswordHasher:
    """Test password hashing"""

    def test_hash_password(self):
        """Test password hashing"""
        password = 'SecurePassword123!'
        hashed = PasswordHasher.hash_password(password)

        assert hashed is not None
        assert '$' in hashed  # Salt separator
        assert password not in hashed

    def test_verify_password_correct(self):
        """Test password verification with correct password"""
        password = 'TestPassword456!'
        hashed = PasswordHasher.hash_password(password)

        assert PasswordHasher.verify_password(password, hashed) is True

    def test_verify_password_incorrect(self):
        """Test password verification with incorrect password"""
        password = 'CorrectPassword'
        hashed = PasswordHasher.hash_password(password)

        assert PasswordHasher.verify_password('WrongPassword', hashed) is False

    def test_different_hashes_for_same_password(self):
        """Test that same password produces different hashes (due to salt)"""
        password = 'SamePassword'
        hash1 = PasswordHasher.hash_password(password)
        hash2 = PasswordHasher.hash_password(password)

        assert hash1 != hash2
        assert PasswordHasher.verify_password(password, hash1) is True
        assert PasswordHasher.verify_password(password, hash2) is True


class TestRateLimiterGlobal:
    """Test global rate limiter instance"""

    def test_get_rate_limiter_singleton(self):
        """Test that get_rate_limiter returns singleton"""
        limiter1 = get_rate_limiter()
        limiter2 = get_rate_limiter()

        assert limiter1 is limiter2


if __name__ == '__main__':
    pytest.main([__file__, '-v'])

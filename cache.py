"""
Redis Caching Layer
High-performance caching with Redis backend and in-memory fallback
"""

import os
import json
import logging
import pickle
from typing import Any, Optional, Callable
from functools import wraps
from datetime import timedelta

logger = logging.getLogger(__name__)

try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    logger.warning("Redis not available. Using in-memory cache fallback.")


class Cache:
    """Universal cache with Redis backend and in-memory fallback"""

    def __init__(self):
        self.redis_client = None
        self.memory_cache = {}  # Fallback cache

        # Try to connect to Redis
        if REDIS_AVAILABLE:
            redis_url = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
            try:
                self.redis_client = redis.from_url(redis_url, decode_responses=False)
                self.redis_client.ping()
                logger.info("Cache using Redis backend")
            except Exception as e:
                logger.warning(f"Redis connection failed: {e}. Using in-memory cache.")
                self.redis_client = None
        else:
            logger.info("Cache using in-memory storage")

    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache

        Args:
            key: Cache key

        Returns:
            Cached value or None if not found/expired
        """
        if self.redis_client:
            try:
                value = self.redis_client.get(key)
                if value:
                    return pickle.loads(value)
                return None
            except Exception as e:
                logger.error(f"Redis get error: {e}")
                return None

        # In-memory fallback
        return self.memory_cache.get(key)

    def set(self, key: str, value: Any, expire: Optional[int] = None) -> bool:
        """
        Set value in cache

        Args:
            key: Cache key
            value: Value to cache (must be pickleable)
            expire: Expiration time in seconds (None = no expiration)

        Returns:
            True if successful
        """
        if self.redis_client:
            try:
                serialized = pickle.dumps(value)
                if expire:
                    self.redis_client.setex(key, expire, serialized)
                else:
                    self.redis_client.set(key, serialized)
                return True
            except Exception as e:
                logger.error(f"Redis set error: {e}")
                return False

        # In-memory fallback
        self.memory_cache[key] = value
        return True

    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        if self.redis_client:
            try:
                self.redis_client.delete(key)
                return True
            except Exception as e:
                logger.error(f"Redis delete error: {e}")
                return False

        # In-memory fallback
        if key in self.memory_cache:
            del self.memory_cache[key]
        return True

    def exists(self, key: str) -> bool:
        """Check if key exists in cache"""
        if self.redis_client:
            try:
                return bool(self.redis_client.exists(key))
            except Exception as e:
                logger.error(f"Redis exists error: {e}")
                return False

        return key in self.memory_cache

    def clear(self, pattern: Optional[str] = None) -> int:
        """
        Clear cache

        Args:
            pattern: Optional key pattern (e.g., 'user:*') - only works with Redis

        Returns:
            Number of keys deleted
        """
        if self.redis_client:
            try:
                if pattern:
                    keys = self.redis_client.keys(pattern)
                    if keys:
                        return self.redis_client.delete(*keys)
                    return 0
                else:
                    return self.redis_client.flushdb()
            except Exception as e:
                logger.error(f"Redis clear error: {e}")
                return 0

        # In-memory fallback
        count = len(self.memory_cache)
        self.memory_cache.clear()
        return count

    def incr(self, key: str, amount: int = 1) -> int:
        """Increment a counter"""
        if self.redis_client:
            try:
                return self.redis_client.incrby(key, amount)
            except Exception as e:
                logger.error(f"Redis incr error: {e}")
                return 0

        # In-memory fallback
        current = self.memory_cache.get(key, 0)
        new_value = current + amount
        self.memory_cache[key] = new_value
        return new_value

    def get_many(self, keys: list[str]) -> dict:
        """Get multiple keys at once"""
        if self.redis_client:
            try:
                values = self.redis_client.mget(keys)
                result = {}
                for key, value in zip(keys, values):
                    if value:
                        result[key] = pickle.loads(value)
                return result
            except Exception as e:
                logger.error(f"Redis get_many error: {e}")
                return {}

        # In-memory fallback
        return {key: self.memory_cache.get(key) for key in keys if key in self.memory_cache}

    def set_many(self, mapping: dict, expire: Optional[int] = None) -> bool:
        """Set multiple key-value pairs"""
        if self.redis_client:
            try:
                pipe = self.redis_client.pipeline()
                for key, value in mapping.items():
                    serialized = pickle.dumps(value)
                    if expire:
                        pipe.setex(key, expire, serialized)
                    else:
                        pipe.set(key, serialized)
                pipe.execute()
                return True
            except Exception as e:
                logger.error(f"Redis set_many error: {e}")
                return False

        # In-memory fallback
        self.memory_cache.update(mapping)
        return True


# Global cache instance
_cache = None


def get_cache() -> Cache:
    """Get or create global cache instance"""
    global _cache
    if _cache is None:
        _cache = Cache()
    return _cache


# ===================
# Decorators
# ===================

def cached(expire: int = 300, key_prefix: str = ""):
    """
    Decorator to cache function results

    Args:
        expire: Cache expiration in seconds (default: 5 minutes)
        key_prefix: Prefix for cache keys

    Usage:
        @cached(expire=600, key_prefix='user')
        def get_user(user_id):
            return User.query.get(user_id)
    """
    def decorator(f: Callable) -> Callable:
        @wraps(f)
        def decorated_function(*args, **kwargs):
            cache = get_cache()

            # Build cache key
            func_name = f.__name__
            args_str = str(args) + str(sorted(kwargs.items()))
            cache_key = f"{key_prefix}:{func_name}:{args_str}" if key_prefix else f"{func_name}:{args_str}"

            # Try to get from cache
            result = cache.get(cache_key)
            if result is not None:
                logger.debug(f"Cache hit: {cache_key}")
                return result

            # Execute function
            logger.debug(f"Cache miss: {cache_key}")
            result = f(*args, **kwargs)

            # Store in cache
            cache.set(cache_key, result, expire=expire)

            return result

        return decorated_function
    return decorator


def cache_clear(pattern: str = "*"):
    """
    Decorator to clear cache after function execution

    Args:
        pattern: Cache key pattern to clear

    Usage:
        @cache_clear(pattern='user:*')
        def update_user(user_id, data):
            # Update user...
            return user
    """
    def decorator(f: Callable) -> Callable:
        @wraps(f)
        def decorated_function(*args, **kwargs):
            result = f(*args, **kwargs)

            # Clear cache
            cache = get_cache()
            cache.clear(pattern)
            logger.debug(f"Cache cleared: {pattern}")

            return result

        return decorated_function
    return decorator


# ===================
# Common Cache Patterns
# ===================

class CachePatterns:
    """Common caching patterns"""

    @staticmethod
    def get_or_set(key: str, factory: Callable, expire: int = 300) -> Any:
        """
        Get from cache or compute and set

        Args:
            key: Cache key
            factory: Function to compute value if not cached
            expire: Cache expiration

        Returns:
            Cached or computed value
        """
        cache = get_cache()

        value = cache.get(key)
        if value is not None:
            return value

        value = factory()
        cache.set(key, value, expire=expire)
        return value

    @staticmethod
    def remember(key: str, expire: int = 300):
        """
        Decorator to remember function result

        Usage:
            @CachePatterns.remember('user:{user_id}', expire=600)
            def get_user_profile(user_id):
                return fetch_from_db(user_id)
        """
        def decorator(f: Callable) -> Callable:
            @wraps(f)
            def decorated_function(*args, **kwargs):
                cache = get_cache()

                # Replace placeholders in key
                cache_key = key
                if args:
                    cache_key = cache_key.replace('{0}', str(args[0]))
                for k, v in kwargs.items():
                    cache_key = cache_key.replace(f'{{{k}}}', str(v))

                value = cache.get(cache_key)
                if value is not None:
                    return value

                value = f(*args, **kwargs)
                cache.set(cache_key, value, expire=expire)
                return value

            return decorated_function
        return decorator

    @staticmethod
    def invalidate(pattern: str):
        """
        Decorator to invalidate cache

        Usage:
            @CachePatterns.invalidate('user:*')
            def update_user(user_id, data):
                # Update...
        """
        def decorator(f: Callable) -> Callable:
            @wraps(f)
            def decorated_function(*args, **kwargs):
                result = f(*args, **kwargs)

                cache = get_cache()
                cache.clear(pattern)

                return result

            return decorated_function
        return decorator


# ===================
# Session Cache
# ===================

class SessionCache:
    """
    Cache for user sessions

    Stores session data in Redis for scalability
    """

    @staticmethod
    def get_session(session_id: str) -> Optional[dict]:
        """Get session data"""
        cache = get_cache()
        return cache.get(f"session:{session_id}")

    @staticmethod
    def set_session(session_id: str, data: dict, expire: int = 3600):
        """
        Set session data

        Args:
            session_id: Session ID
            data: Session data
            expire: Expiration in seconds (default: 1 hour)
        """
        cache = get_cache()
        cache.set(f"session:{session_id}", data, expire=expire)

    @staticmethod
    def delete_session(session_id: str):
        """Delete session"""
        cache = get_cache()
        cache.delete(f"session:{session_id}")

    @staticmethod
    def extend_session(session_id: str, expire: int = 3600):
        """Extend session expiration"""
        cache = get_cache()
        data = cache.get(f"session:{session_id}")
        if data:
            cache.set(f"session:{session_id}", data, expire=expire)

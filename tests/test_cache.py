"""
Tests for Cache Module
"""

import pytest
from cache import Cache, get_cache, cached, cache_clear, CachePatterns


class TestCache:
    """Test cache operations"""

    def test_cache_init(self):
        """Test cache initialization"""
        cache = Cache()
        assert cache is not None

    def test_set_and_get(self):
        """Test basic set and get operations"""
        cache = Cache()
        cache.set('test_key', 'test_value')

        assert cache.get('test_key') == 'test_value'

    def test_get_nonexistent_key(self):
        """Test getting non-existent key returns None"""
        cache = Cache()
        assert cache.get('nonexistent_key') is None

    def test_delete(self):
        """Test delete operation"""
        cache = Cache()
        cache.set('delete_me', 'value')
        assert cache.get('delete_me') == 'value'

        cache.delete('delete_me')
        assert cache.get('delete_me') is None

    def test_exists(self):
        """Test exists check"""
        cache = Cache()
        cache.set('exists_key', 'value')

        assert cache.exists('exists_key') is True
        assert cache.exists('nonexistent') is False

    def test_incr(self):
        """Test increment operation"""
        cache = Cache()
        cache.set('counter', 0)

        result1 = cache.incr('counter')
        assert result1 == 1

        result2 = cache.incr('counter', amount=5)
        assert result2 == 6

    def test_get_many(self):
        """Test getting multiple keys"""
        cache = Cache()
        cache.set('key1', 'value1')
        cache.set('key2', 'value2')
        cache.set('key3', 'value3')

        result = cache.get_many(['key1', 'key2', 'key3', 'nonexistent'])

        assert result['key1'] == 'value1'
        assert result['key2'] == 'value2'
        assert result['key3'] == 'value3'
        assert 'nonexistent' not in result

    def test_set_many(self):
        """Test setting multiple keys"""
        cache = Cache()
        data = {
            'bulk1': 'value1',
            'bulk2': 'value2',
            'bulk3': 'value3'
        }

        cache.set_many(data)

        assert cache.get('bulk1') == 'value1'
        assert cache.get('bulk2') == 'value2'
        assert cache.get('bulk3') == 'value3'

    def test_clear(self):
        """Test clearing cache"""
        cache = Cache()
        cache.set('clear1', 'value1')
        cache.set('clear2', 'value2')

        count = cache.clear()

        assert count >= 2
        assert cache.get('clear1') is None
        assert cache.get('clear2') is None

    def test_cache_complex_objects(self):
        """Test caching complex Python objects"""
        cache = Cache()

        data = {
            'list': [1, 2, 3],
            'dict': {'nested': 'value'},
            'tuple': (4, 5, 6)
        }

        cache.set('complex', data)
        retrieved = cache.get('complex')

        assert retrieved['list'] == [1, 2, 3]
        assert retrieved['dict'] == {'nested': 'value'}
        assert retrieved['tuple'] == (4, 5, 6)


class TestCachedDecorator:
    """Test @cached decorator"""

    def test_cached_decorator_basic(self):
        """Test basic caching with decorator"""
        call_count = [0]

        @cached(expire=60)
        def expensive_function(x):
            call_count[0] += 1
            return x * 2

        # First call
        result1 = expensive_function(5)
        assert result1 == 10
        assert call_count[0] == 1

        # Second call should use cache
        result2 = expensive_function(5)
        assert result2 == 10
        assert call_count[0] == 1  # Not incremented

        # Different argument should call function
        result3 = expensive_function(10)
        assert result3 == 20
        assert call_count[0] == 2

    def test_cached_decorator_with_key_prefix(self):
        """Test cached decorator with key prefix"""
        @cached(expire=60, key_prefix='user')
        def get_user_data(user_id):
            return f"user_data_{user_id}"

        result = get_user_data(123)
        assert result == "user_data_123"


class TestCacheClearDecorator:
    """Test @cache_clear decorator"""

    def test_cache_clear_decorator(self):
        """Test cache clearing with decorator"""
        cache = get_cache()
        cache.set('clear_test_1', 'value1')
        cache.set('clear_test_2', 'value2')

        @cache_clear(pattern='*')
        def update_data():
            return "updated"

        result = update_data()
        assert result == "updated"


class TestCachePatterns:
    """Test common cache patterns"""

    def test_get_or_set(self):
        """Test get_or_set pattern"""
        call_count = [0]

        def factory():
            call_count[0] += 1
            return "computed_value"

        # First call computes value
        result1 = CachePatterns.get_or_set('pattern_key', factory, expire=60)
        assert result1 == "computed_value"
        assert call_count[0] == 1

        # Second call uses cache
        result2 = CachePatterns.get_or_set('pattern_key', factory, expire=60)
        assert result2 == "computed_value"
        assert call_count[0] == 1  # Not incremented

    def test_remember_decorator(self):
        """Test remember decorator pattern"""
        call_count = [0]

        @CachePatterns.remember('user:{user_id}', expire=60)
        def get_user_profile(user_id):
            call_count[0] += 1
            return f"profile_{user_id}"

        # First call
        result1 = get_user_profile(user_id=123)
        assert result1 == "profile_123"
        assert call_count[0] == 1

        # Second call uses cache
        result2 = get_user_profile(user_id=123)
        assert result2 == "profile_123"
        assert call_count[0] == 1


class TestGlobalCache:
    """Test global cache instance"""

    def test_get_cache_singleton(self):
        """Test that get_cache returns singleton"""
        cache1 = get_cache()
        cache2 = get_cache()

        assert cache1 is cache2


if __name__ == '__main__':
    pytest.main([__file__, '-v'])

import os
import json
from redis import Redis
from typing import Optional, Any
import structlog

logger = structlog.get_logger()

# Get Redis URL from environment variable
REDIS_URL = os.getenv("REDIS_URL")
if not REDIS_URL:
    logger.warning("REDIS_URL not set, Redis functionality will be disabled")
    redis_client = None
else:
    redis_client = Redis.from_url(REDIS_URL, decode_responses=True)

async def get_cache(key: str) -> Optional[Any]:
    """Get a value from Redis cache."""
    if not redis_client:
        return None
    try:
        value = redis_client.get(key)
        if value:
            return json.loads(value)
        return None
    except Exception as e:
        logger.error("redis_cache_error", error=str(e), key=key)
        return None

async def set_cache(key: str, value: Any, expire: int = 3600) -> bool:
    """Set a value in Redis cache with expiration."""
    if not redis_client:
        return False
    try:
        redis_client.setex(key, expire, json.dumps(value))
        return True
    except Exception as e:
        logger.error("redis_cache_error", error=str(e), key=key)
        return False

async def delete_cache(key: str) -> bool:
    """Delete a value from Redis cache."""
    if not redis_client:
        return False
    try:
        redis_client.delete(key)
        return True
    except Exception as e:
        logger.error("redis_cache_error", error=str(e), key=key)
        return False

async def acquire_lock(key: str, expire: int = 30) -> bool:
    """Acquire a distributed lock."""
    if not redis_client:
        return True  # If Redis is not available, assume lock is acquired
    try:
        return redis_client.set(key, "1", ex=expire, nx=True)
    except Exception as e:
        logger.error("redis_lock_error", error=str(e), key=key)
        return False

async def release_lock(key: str) -> bool:
    """Release a distributed lock."""
    if not redis_client:
        return True
    try:
        redis_client.delete(key)
        return True
    except Exception as e:
        logger.error("redis_lock_error", error=str(e), key=key)
        return False 
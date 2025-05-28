import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from databases import Database
from sqlalchemy import MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.engine.url import make_url
from ..models.database import Base

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
if not DATABASE_URL:
    raise RuntimeError("🛑 DATABASE_URL not set")

# Ensure we use asyncpg
url = make_url(DATABASE_URL)
if url.drivername == "postgresql":
    url = url.set(drivername="postgresql+asyncpg")

# Create databases Database instance for async operations
database = Database(str(url))

# Create async SQLAlchemy engine
engine = create_async_engine(str(url), echo=True)

# Create async session factory
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def init_db():
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Connect to database
    await database.connect()

async def close_db():
    await database.disconnect()
    await engine.dispose()

# Dependency to get DB session
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close() 
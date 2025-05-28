import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from databases import Database
from ..models.database import Base

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://localhost/remap_pt")

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create databases Database instance for async operations
database = Database(DATABASE_URL)

async def init_db():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Connect to database
    await database.connect()

async def close_db():
    await database.disconnect()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 
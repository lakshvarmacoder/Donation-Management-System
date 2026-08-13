from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from .config import settings

# Engine configuration compatible with Supabase (Direct & Pooled modes)
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    future=True,

    connect_args={
        "prepared_statement_cache_size": 0,
        "statement_cache_size": 0,
    }
)

AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db():
    """Dependency for FastAPI to get database session."""
    async with AsyncSessionLocal() as session:
        yield session


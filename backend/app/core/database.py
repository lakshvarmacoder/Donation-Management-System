from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from .config import settings

connect_args = {
    "prepared_statement_cache_size": 0,
    "statement_cache_size": 0,
}

# Require SSL when connecting to remote cloud database (e.g. Supabase)
if "localhost" not in settings.database_url and "127.0.0.1" not in settings.database_url:
    connect_args["ssl"] = "require"

# Engine configuration compatible with Supabase (Direct & Pooled modes)
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    future=True,
    connect_args=connect_args,
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

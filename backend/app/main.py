from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core import settings, engine
from app.api.v1 import api_v1_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management."""
    yield
    # Shutdown: Clean up DB pool
    await engine.dispose()


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Fix Vercel Serverless path rewrite scope
@app.middleware("http")
async def fix_vercel_path_middleware(request, call_next):
    raw_path = (
        request.headers.get("x-matched-path")
        or request.headers.get("x-forwarded-path")
        or request.headers.get("x-vercel-forwarded-path")
    )
    if raw_path and raw_path != request.scope["path"]:
        request.scope["path"] = raw_path
    return await call_next(request)

# Enable CORS for external client site integrations
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
async def root_check():
    """Root status check endpoint."""
    return {"status": "ok", "app": settings.app_name, "version": "1.0.0"}


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "app": settings.app_name, "version": "1.0.0"}


# Register API v1 Routers
app.include_router(api_v1_router, prefix="/api/v1")

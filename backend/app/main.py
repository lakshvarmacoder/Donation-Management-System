from fastapi import FastAPI, Request
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

# Vercel Serverless Path Rewriter Middleware
@app.middleware("http")
async def vercel_asgi_path_rewriter(request: Request, call_next):
    path = request.scope.get("path", "")
    
    # 1. Check query parameter `path` passed by Vercel rewrite
    query_path = request.query_params.get("path")
    if query_path:
        request.scope["path"] = query_path
    elif path == "/api/index.py" or path == "/api/index":
        request.scope["path"] = "/"
    elif path.startswith("/api/index.py"):
        request.scope["path"] = path[len("/api/index.py"):] or "/"
    elif path.startswith("/api/index"):
        request.scope["path"] = path[len("/api/index"):] or "/"

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

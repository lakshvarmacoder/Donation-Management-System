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
    path = request.scope.get("path", "")
    
    # 1. Check Vercel forwarded headers
    for header_name in ["x-matched-path", "x-forwarded-path", "x-vercel-forwarded-path", "x-invoke-path"]:
        header_val = request.headers.get(header_name)
        if header_val and not header_val.startswith("/api/index"):
            request.scope["path"] = header_val
            return await call_next(request)
            
    # 2. Strip Vercel rewritten file prefix if present
    if path.startswith("/api/index.py"):
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

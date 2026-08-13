import os
import sys
import traceback

# Add parent directory to sys.path to allow imports from `app` package
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from app.main import app
except Exception as err:
    error_msg = str(err)
    tb_str = traceback.format_exc()
    print("=== FATAL FASTAPI STARTUP ERROR ===")
    print(tb_str)
    
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    
    app = FastAPI(title="Emergency Error Handler")
    
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"])
    async def catch_all(path: str):
        return JSONResponse(
            status_code=500,
            content={
                "error": "FastAPI Startup Failed",
                "message": error_msg,
                "traceback": tb_str.splitlines()
            }
        )

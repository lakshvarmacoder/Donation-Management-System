from typing import Optional
from fastapi import Header, HTTPException, status
from .config import settings


async def verify_admin_key(x_api_key: Optional[str] = Header(None, alias="X-API-Key")) -> bool:
    """Dependency to verify API Key or Service Role access for admin endpoints."""
    if not settings.supabase_service_role_key and not settings.razorpay_key_secret:
        # Development mode fallback
        return True
        
    if x_api_key and (x_api_key == settings.supabase_service_role_key or x_api_key == settings.razorpay_key_secret):
        return True
        
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Unauthorized access: Invalid or missing API Key"
    )


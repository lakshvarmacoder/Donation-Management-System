import hmac
import hashlib
from typing import Dict, Any
from app.core.config import settings
from fastapi import HTTPException, status


class RazorpayService:
    """Service encapsulating Razorpay Payment Gateway integration."""

    @staticmethod
    def create_order(amount: float, currency: str = "INR", receipt: str = "") -> Dict[str, Any]:
        """Create a Razorpay payment order via API request."""
        if not settings.razorpay_key_id or not settings.razorpay_key_secret:
            # Demo mode fallback order
            return {
                "id": f"order_demo_{receipt}",
                "amount": int(amount * 100),
                "currency": currency,
                "status": "created"
            }

        import httpx
        
        url = "https://api.razorpay.com/v1/orders"
        amount_in_paise = int(amount * 100)
        
        payload = {
            "amount": amount_in_paise,
            "currency": currency,
            "receipt": receipt,
            "payment_capture": 1
        }
        
        try:
            response = httpx.post(
                url,
                json=payload,
                auth=(settings.razorpay_key_id, settings.razorpay_key_secret),
                timeout=10.0
            )
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Razorpay order creation failed: {response.text}"
                )
            return response.json()
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Razorpay connection error: {str(e)}"
            )

    @staticmethod
    def is_demo_order(order_id: str) -> bool:
        """Check if an order ID belongs to demo/local mode."""
        return order_id.startswith("order_demo_")

    @staticmethod
    def verify_payment_signature(order_id: str, payment_id: str, signature: str) -> bool:
        """Verify Razorpay payment signature using HMAC-SHA256.

        Returns True for demo orders (order_demo_*) without verification,
        allowing the full payment flow to work on localhost.
        """
        if RazorpayService.is_demo_order(order_id):
            return True

        secret = settings.razorpay_key_secret
        if not secret or not signature:
            return False

        message = f"{order_id}|{payment_id}"
        expected = hmac.new(
            secret.encode("utf-8"),
            message.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()
        return hmac.compare_digest(expected, signature)

    @staticmethod
    def verify_webhook_signature(body_bytes: bytes, signature: str) -> bool:
        """Verify HMAC-SHA256 signature from Razorpay webhook header."""
        secret = settings.razorpay_webhook_secret or settings.razorpay_key_secret
        if not secret or not signature:
            return False

        expected_signature = hmac.new(
            secret.encode("utf-8"),
            body_bytes,
            hashlib.sha256
        ).hexdigest()

        return hmac.compare_digest(expected_signature, signature)

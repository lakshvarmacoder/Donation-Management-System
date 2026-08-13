from fastapi import APIRouter, Depends, Request, Header, HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
import json

from app.core.database import get_db
from app.models import Donation, DonationStatus
from app.services.razorpay_service import RazorpayService

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])


@router.post("/razorpay")
async def handle_razorpay_webhook(
    request: Request,
    x_razorpay_signature: str = Header(None, alias="x-razorpay-signature"),
    db: AsyncSession = Depends(get_db)
):
    """Receive and process payment webhooks from Razorpay."""
    body_bytes = await request.body()
    
    # 1. Verify HMAC Signature
    if x_razorpay_signature and not RazorpayService.verify_webhook_signature(body_bytes, x_razorpay_signature):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Razorpay webhook signature"
        )

    # 2. Parse Event Payload
    try:
        event = json.loads(body_bytes)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON payload"
        )

    event_type = event.get("event")
    payload = event.get("payload", {})
    payment_entity = payload.get("payment", {}).get("entity", {})
    
    order_id = payment_entity.get("order_id")
    payment_id = payment_entity.get("id")

    if event_type in ["payment.captured", "order.paid"]:
        if order_id:
            # Update donation status to COMPLETED
            stmt = (
                update(Donation)
                .where(Donation.gateway_order_id == order_id)
                .values(
                    status=DonationStatus.COMPLETED,
                    gateway_payment_id=payment_id
                )
            )
            await db.execute(stmt)
            await db.commit()

    elif event_type == "payment.failed":
        if order_id:
            stmt = (
                update(Donation)
                .where(Donation.gateway_order_id == order_id)
                .values(
                    status=DonationStatus.FAILED,
                    gateway_payment_id=payment_id
                )
            )
            await db.execute(stmt)
            await db.commit()

    return Response(status_code=status.HTTP_200_OK, content=json.dumps({"status": "received"}))

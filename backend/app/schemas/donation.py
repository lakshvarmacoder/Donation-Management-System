from pydantic import BaseModel, ConfigDict, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class DonationCreate(BaseModel):
    github_username: str = Field(..., min_length=1, max_length=39)
    donor_name: Optional[str] = None
    donor_email: Optional[str] = None
    donor_phone: Optional[str] = None
    amount: float = Field(..., gt=0)
    currency: str = "INR"


class OfflineDonationCreate(BaseModel):
    donor_name: str = Field(..., min_length=2, max_length=120)
    donor_email: EmailStr
    amount: float = Field(..., gt=0)


class DonationResponse(BaseModel):
    id: UUID
    donor_name: str
    donor_email: str
    amount: float
    currency: str
    source: str
    status: str
    gateway_order_id: Optional[str] = None
    github_username: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WallDonorResponse(BaseModel):
    """Minimal donor info for the public wall — no email exposed."""
    id: UUID
    donor_name: str
    amount: float
    avatar_url: Optional[str] = None
    github_username: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PlatformStatsResponse(BaseModel):
    """Aggregate statistics for admin dashboard."""
    total_raised: float
    unique_donors: int
    active_campaigns: int = 1


class RazorpayOrderResponse(BaseModel):
    donation_id: UUID
    order_id: str
    amount: float
    currency: str
    key_id: str


class PaymentVerification(BaseModel):
    """Payload sent by frontend after Razorpay checkout completes."""
    razorpay_order_id: str
    razorpay_payment_id: str = ""
    razorpay_signature: str = ""

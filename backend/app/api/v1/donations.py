import re
import math
import logging
import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func, distinct
from typing import List, Optional
from uuid import UUID
from urllib.parse import quote

from app.core.database import get_db
from app.core.config import settings
from app.models import Donation, DonationStatus, DonationSource
from app.schemas.donation import (
    DonationCreate,
    OfflineDonationCreate,
    DonationResponse,
    WallDonorResponse,
    PlatformStatsResponse,
    RazorpayOrderResponse,
    PaymentVerification,
)
from app.services.razorpay_service import RazorpayService

WALL_DONOR_LIMIT = 500
RECEIPT_ID_LENGTH = 8

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/donations", tags=["Donations"])


# ─── Public Endpoints ───────────────────────────────────────────────────────────


@router.get("/wall", response_model=List[WallDonorResponse])
async def get_donor_wall(db: AsyncSession = Depends(get_db)):
    """Public endpoint — completed donors for the wall display."""
    try:
        query = (
            select(Donation)
            .where(Donation.status == DonationStatus.COMPLETED)
            .order_by(desc(Donation.created_at))
            .limit(WALL_DONOR_LIMIT)
        )
        result = await db.execute(query)
        return result.scalars().all()
    except Exception as err:
        logger.error("Failed to query donor wall from DB: %s", err, exc_info=True)
        return []


@router.get("/stats/summary", response_model=PlatformStatsResponse)
async def get_platform_stats(db: AsyncSession = Depends(get_db)):
    """Fetch aggregate platform statistics."""
    try:
        total_raised = await _sum_completed_donations(db)
        unique_donors = await _count_unique_donors(db)

        return PlatformStatsResponse(
            total_raised=total_raised,
            unique_donors=unique_donors,
            active_campaigns=1,
        )
    except Exception as err:
        logger.error("Failed to query platform stats from DB: %s", err, exc_info=True)
        return PlatformStatsResponse(
            total_raised=0.0,
            unique_donors=0,
            active_campaigns=1,
        )


@router.get("", response_model=List[DonationResponse])
async def list_donations(db: AsyncSession = Depends(get_db)):
    """Fetch all donation records for the admin workspace."""
    query = select(Donation).order_by(desc(Donation.created_at))
    result = await db.execute(query)
    donations = result.scalars().all()

    return [_to_donation_response(d) for d in donations]


@router.post("", response_model=RazorpayOrderResponse, status_code=status.HTTP_201_CREATED)
async def create_donation(payload: DonationCreate, db: AsyncSession = Depends(get_db)):
    """Initiate a donation, verify GitHub user, persist a pending record, and return Razorpay order params."""
    try:
        gh_profile = await _verify_and_fetch_github_user(payload.github_username)

        # Reject if this GitHub username already has a completed donation
        existing = await _find_completed_donation_by_github(gh_profile["username"], db)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"@{gh_profile['username']} is already on the donor wall!",
            )

        donation = _build_online_donation(payload, gh_profile)

        db.add(donation)
        await db.commit()
        await db.refresh(donation)

        return await _create_razorpay_order(donation, payload, db)
    except HTTPException:
        raise
    except Exception as err:
        await db.rollback()
        logger.error("Failed to initiate donation: %s", err, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Donation initiation error: {str(err)}"
        )


@router.post("/offline", response_model=DonationResponse, status_code=status.HTTP_201_CREATED)
async def create_offline_donation(payload: OfflineDonationCreate, db: AsyncSession = Depends(get_db)):
    """Record an offline cash/check donation directly in the database."""
    try:
        donation = _build_offline_donation(payload)
        db.add(donation)
        await db.commit()
        await db.refresh(donation)
        return _to_donation_response(donation)
    except Exception as err:
        await db.rollback()
        logger.error("Failed to create offline donation: %s", err, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database write error: {str(err)}"
        )


@router.post("/verify", response_model=DonationResponse)
async def verify_payment(payload: PaymentVerification, db: AsyncSession = Depends(get_db)):
    """Verify Razorpay payment and mark donation as completed."""
    try:
        donation = await _find_donation_by_order_id(payload.razorpay_order_id, db)
        _assert_signature_valid(payload)
        await _mark_donation_completed(donation, payload.razorpay_payment_id, db)
        return _to_donation_response(donation)
    except HTTPException:
        raise
    except Exception as err:
        await db.rollback()
        logger.error("Failed to verify payment: %s", err, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Payment verification error: {str(err)}"
        )


@router.delete("/{donation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_donation(donation_id: UUID, db: AsyncSession = Depends(get_db)):
    """Remove an erroneous donation record (admin action)."""
    try:
        donation = await _find_donation_by_id(donation_id, db)
        await db.delete(donation)
        await db.commit()
    except HTTPException:
        raise
    except Exception as err:
        await db.rollback()
        logger.error("Failed to delete donation: %s", err, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Deletion error: {str(err)}"
        )


# ─── Private Helpers (Step-Down Rule) ────────────────────────────────────────────


async def _verify_and_fetch_github_user(username: str) -> dict:
    """Verify that a GitHub user exists and fetch their display details."""
    clean_user = username.strip().lstrip("@")
    if not clean_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub username is required.",
        )

    # Basic regex validation for GitHub usernames
    if not re.match(r"^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$", clean_user):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"'{clean_user}' is not a valid GitHub username format.",
        )

    url = f"https://api.github.com/users/{clean_user}"
    headers = {"User-Agent": "DonorWallDemo/1.0"}

    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 404:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"GitHub username '{clean_user}' does not exist.",
                )
            if resp.status_code == 200:
                data = resp.json()
                display_name = data.get("name") or clean_user
                return {
                    "username": clean_user,
                    "name": display_name,
                    "avatar_url": f"https://github.com/{clean_user}.png",
                }
    except HTTPException:
        raise
    except BaseException as e:
        logger.warning("GitHub API unreachable for '%s': %s", clean_user, e)

    # Default fallback if GitHub API rate-limits or network is unreachable
    return {
        "username": clean_user,
        "name": clean_user,
        "avatar_url": f"https://github.com/{clean_user}.png",
    }


def _to_donation_response(donation: Donation) -> DonationResponse:
    """Convert ORM model to response DTO."""
    return DonationResponse(
        id=donation.id,
        donor_name=donation.donor_name,
        donor_email=donation.donor_email,
        amount=float(donation.amount),
        currency=donation.currency,
        source=donation.source.value if hasattr(donation.source, "value") else str(donation.source),
        status=donation.status.value if hasattr(donation.status, "value") else str(donation.status),
        gateway_order_id=donation.gateway_order_id,
        github_username=donation.github_username,
        avatar_url=donation.avatar_url,
        created_at=donation.created_at,
    )


def _build_online_donation(payload: DonationCreate, gh_profile: dict) -> Donation:
    """Construct a pending online donation record. Always uses GitHub display name for safety."""
    github_username = gh_profile["username"]
    donor_name = gh_profile["name"]  # Always use GitHub display name, never user-typed input
    donor_email = f"{github_username}@users.noreply.github.com"
    avatar_url = gh_profile["avatar_url"]

    return Donation(
        donor_name=donor_name,
        donor_email=donor_email,
        amount=payload.amount,
        currency=payload.currency,
        source=DonationSource.ONLINE,
        payment_method="razorpay",
        status=DonationStatus.PENDING,
        github_username=github_username,
        avatar_url=avatar_url,
    )


def _build_offline_donation(payload: OfflineDonationCreate) -> Donation:
    """Construct a completed offline donation record."""
    return Donation(
        donor_name=payload.donor_name,
        donor_email=payload.donor_email,
        amount=payload.amount,
        currency="INR",
        source=DonationSource.OFFLINE,
        payment_method="offline_cash",
        status=DonationStatus.COMPLETED,
    )


async def _create_razorpay_order(
    donation: Donation, payload: DonationCreate, db: AsyncSession
) -> RazorpayOrderResponse:
    """Create a Razorpay order and attach + commit the order ID to the donation."""
    amount = float(payload.amount)
    if not math.isfinite(amount):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Donation amount must be a finite number.",
        )
    try:
        rzp_order = RazorpayService.create_order(
            amount=amount,
            currency=payload.currency,
            receipt=str(donation.id)[:RECEIPT_ID_LENGTH],
        )
        donation.gateway_order_id = rzp_order["id"]
        await db.commit()
        await db.refresh(donation)

        return RazorpayOrderResponse(
            donation_id=donation.id,
            order_id=rzp_order["id"],
            amount=amount,
            currency=payload.currency,
            key_id=settings.razorpay_key_id or "rzp_test_demo",
        )
    except HTTPException:
        await db.rollback()
        raise
    except Exception as e:
        logger.error(f"Error creating Razorpay order: {e}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not prepare payment order.",
        )


async def _find_donation_by_order_id(order_id: str, db: AsyncSession) -> Donation:
    """Look up donation by Razorpay order ID, or raise 404."""
    query = select(Donation).where(Donation.gateway_order_id == order_id)
    result = await db.execute(query)
    donation = result.scalar_one_or_none()

    if not donation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No donation found for order '{order_id}'.",
        )
    return donation


async def _find_donation_by_id(donation_id: UUID, db: AsyncSession) -> Donation:
    """Look up donation by primary key, or raise 404."""
    query = select(Donation).where(Donation.id == donation_id)
    result = await db.execute(query)
    donation = result.scalar_one_or_none()

    if not donation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donation record not found.",
        )
    return donation


async def _find_completed_donation_by_github(github_username: str, db: AsyncSession) -> Optional[Donation]:
    """Return an existing completed donation for this GitHub username, or None."""
    query = select(Donation).where(
        Donation.github_username == github_username,
        Donation.status == DonationStatus.COMPLETED,
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()


def _assert_signature_valid(payload: PaymentVerification) -> None:
    """Verify Razorpay signature or raise 401. Auto-passes demo orders."""
    is_valid = RazorpayService.verify_payment_signature(
        order_id=payload.razorpay_order_id,
        payment_id=payload.razorpay_payment_id,
        signature=payload.razorpay_signature,
    )
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Payment signature verification failed.",
        )


async def _mark_donation_completed(donation: Donation, payment_id: str, db: AsyncSession) -> None:
    """Update donation status to COMPLETED and store payment reference."""
    donation.status = DonationStatus.COMPLETED
    if payment_id:
        donation.gateway_payment_id = payment_id
    await db.commit()


async def _sum_completed_donations(db: AsyncSession) -> float:
    """Total amount across all completed donations."""
    query = select(func.coalesce(func.sum(Donation.amount), 0)).where(
        Donation.status == DonationStatus.COMPLETED
    )
    result = await db.execute(query)
    return float(result.scalar() or 0.0)


async def _count_unique_donors(db: AsyncSession) -> int:
    """Count unique GitHub usernames across completed donations."""
    query = select(func.count(distinct(Donation.github_username))).where(
        Donation.status == DonationStatus.COMPLETED
    )
    result = await db.execute(query)
    return int(result.scalar() or 0)

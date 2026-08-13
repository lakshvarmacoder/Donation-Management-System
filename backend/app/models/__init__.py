from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, relationship
from datetime import datetime, timezone
import enum
import uuid


class Base(DeclarativeBase):
    pass


class ProfileRole(str, enum.Enum):
    ADMIN = "admin"


class DonationSource(str, enum.Enum):
    ONLINE = "online"
    OFFLINE = "offline"


class DonationStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


def get_utc_now():
    return datetime.now(timezone.utc)


class Profile(Base):
    __tablename__ = "profiles"
    
    id = Column(UUID(as_uuid=True), primary_key=True)
    full_name = Column(String(120), nullable=False)
    role = Column(
        SQLEnum(ProfileRole, name="profile_role", create_type=False, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=ProfileRole.ADMIN,
    )
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)


class Donation(Base):
    __tablename__ = "donations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    donor_name = Column(String(120), nullable=False)
    donor_email = Column(String, nullable=False)
    donor_phone = Column(String, nullable=True)
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String, default="INR", nullable=False)
    source = Column(
        SQLEnum(DonationSource, name="donation_source", create_type=False, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=DonationSource.ONLINE,
    )
    payment_method = Column(String, nullable=True)
    gateway_order_id = Column(String, unique=True, nullable=True)
    gateway_payment_id = Column(String, unique=True, nullable=True)
    github_username = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    status = Column(
        SQLEnum(DonationStatus, name="donation_status", create_type=False, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=DonationStatus.PENDING,
    )
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)

    receipt = relationship("Receipt", back_populates="donation", uselist=False, cascade="all, delete-orphan")


class Receipt(Base):
    __tablename__ = "receipts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    donation_id = Column(UUID(as_uuid=True), ForeignKey("donations.id"), unique=True, nullable=False)
    receipt_number = Column(String, unique=True, nullable=False)
    pdf_url = Column(String, nullable=True)
    issued_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    donation = relationship("Donation", back_populates="receipt")

import asyncio
import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select
from app.core.database import AsyncSessionLocal, engine
from app.models import Donation, DonationStatus, DonationSource


async def seed_database():
    """Seed sample completed donor wall records into Supabase/PostgreSQL database."""
    async with AsyncSessionLocal() as session:
        query = select(Donation).limit(1)
        result = await session.execute(query)
        existing = result.scalar_one_or_none()

        if not existing:
            print("Seeding initial donor wall record...")
            donation = Donation(
                donor_name="Aarav Mehta",
                donor_email="aarav@example.com",
                amount=100.00,
                currency="INR",
                source=DonationSource.ONLINE,
                status=DonationStatus.COMPLETED,
                payment_method="razorpay",
                github_username="aaravmehta",
                avatar_url="https://github.com/aaravmehta.png",
            )
            session.add(donation)
            await session.commit()
            print("Seeding completed successfully!")
        else:
            print("Donation records already exist. Skipping seed.")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed_database())

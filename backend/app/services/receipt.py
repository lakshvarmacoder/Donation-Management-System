from datetime import datetime, timezone
import uuid


class ReceiptService:
    """Service for generating and managing receipts."""
    
    @staticmethod
    def generate_receipt_number() -> str:
        """Generate unique receipt number."""
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d")
        unique_id = str(uuid.uuid4())[:8].upper()
        return f"RCP-{timestamp}-{unique_id}"
    
    @staticmethod
    def generate_receipt_content(donation, receipt_number: str = "N/A", organization_name: str = "Lakshvarma Demo") -> str:
        """Generate receipt content (HTML/text)."""
        return f"""
        <html>
        <body>
        <h2>Donation Receipt</h2>
        <p><strong>Receipt Number:</strong> {receipt_number}</p>
        <p><strong>Organization:</strong> {organization_name}</p>
        <p><strong>Donor Name:</strong> {donation.donor_name}</p>
        <p><strong>Donor Email:</strong> {donation.donor_email}</p>
        <p><strong>Amount:</strong> {donation.amount} {donation.currency}</p>
        <p><strong>Date:</strong> {donation.created_at.strftime('%Y-%m-%d %H:%M:%S') if hasattr(donation, 'created_at') and donation.created_at else 'N/A'}</p>
        <p>Thank you for your generous contribution to the live donor wall!</p>
        </body>
        </html>
        """


receipt_service = ReceiptService()

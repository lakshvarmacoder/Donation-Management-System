# Backend — FastAPI

FastAPI application that owns all business logic and mediates all data access. Connects to PostgreSQL via Firebase SQL Connect emulator locally.

## Setup

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Environment Variables

Create `.env` file:

```
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/donation_db
FIREBASE_PROJECT_ID=donation-system-local
FIREBASE_EMULATOR_HOST=localhost:9099
```

## Running

```bash
uvicorn app.main:app --reload
```

API will be available at `http://localhost:8000`
Docs at `http://localhost:8000/docs`

## Project Structure

- `app/main.py` — FastAPI app initialization
- `app/core/` — Config, database, auth
- `app/api/` — Route handlers (campaigns, donations, receipts, etc.)
- `app/models/` — SQLAlchemy ORM models
- `app/schemas/` — Pydantic request/response schemas
- `app/services/` — Business logic (payment processing, receipt generation, etc.)
- `migrations/` — Alembic database migrations
- `tests/` — Test suite

## Key Endpoints

### Auth
- `POST /auth/login` — Firebase token verification
- `GET /auth/me` — Current user info

### Campaigns
- `GET /campaigns` — List org campaigns
- `POST /campaigns` — Create campaign
- `GET /campaigns/{id}` — Get campaign details
- `PUT /campaigns/{id}` — Update campaign
- `PATCH /campaigns/{id}/close` — Close campaign

### Donations
- `POST /donations` — Create donation (guest)
- `GET /donations` — List org donations (admin)
- `GET /donations/{id}` — Get donation details

### Receipts
- `GET /receipts/{id}` — Get receipt
- `POST /receipts/{id}/resend` — Resend receipt email

### Mock Payment Gateway
- `POST /webhooks/payment` — Payment webhook handler
- `POST /mock-gateway/checkout` — Simulate checkout

## Database

Migrations are managed with Alembic. To create a new migration:

```bash
alembic revision --autogenerate -m "description"
alembic upgrade head
```

## Testing

```bash
pytest
```

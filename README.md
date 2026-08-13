# Donation Management System — V1 (Local-First MVP)

A local-first donation management platform for nonprofits. Phase 1 focuses on proving the core loop: donor → donation → receipt → dashboard, entirely local with a mock payment gateway.

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Firebase CLI
- Docker (optional, for later phases)

### Setup

1. **Backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm install
   ```

3. **Firebase Emulators**
   ```bash
   firebase emulators:start
   ```

4. **Run Backend**
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

5. **Run Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

## Project Structure

```
.
├── backend/              # FastAPI application
│   ├── app/
│   │   ├── api/         # Route handlers
│   │   ├── models/      # SQLAlchemy models
│   │   ├── schemas/     # Pydantic schemas
│   │   ├── services/    # Business logic
│   │   ├── core/        # Config, auth, database
│   │   └── main.py      # App entry point
│   ├── migrations/      # Alembic migrations
│   ├── tests/           # Test suite
│   └── requirements.txt
├── frontend/            # Next.js application
│   ├── app/            # App router
│   ├── components/     # React components
│   ├── lib/            # Utilities
│   └── package.json
├── firebase/           # Firebase config & emulator setup
├── scripts/            # Setup & utility scripts
└── docs/              # Documentation
```

## Roadmap

### Phase 1: Local Core Loop (Now)
- M1: Environment & scaffolding
- M2: Org + admin bootstrap
- M3: Campaign management
- M4: Donation flow + mock gateway
- M5: Donor + receipt generation
- M6: Admin dashboard

### Phase 2: Multi-org & Real Payments
- Self-serve org signup
- Real payment gateway (Razorpay)
- Staff role management

### Phase 3: Public Release
- Docker packaging
- Setup documentation
- Open-source release

## Architecture

**Data Flow:**
```
Donor → Public campaign page → Mock Payment Gateway
     → Webhook verification → FastAPI → PostgreSQL
     → Receipt generation → Email (Mailhog)
     → Dashboard update
```

**Admin Flow:**
```
Admin → Firebase Auth → ID token (org_id + role)
     → FastAPI (Bearer token verification)
     → Scoped queries (org_id filtering)
```

## Key Decisions

| Area | Choice |
|---|---|
| Frontend | Next.js + shadcn/ui + Tailwind CSS |
| Backend | FastAPI (owns all business logic) |
| Auth | Firebase Authentication |
| Database | PostgreSQL (via Firebase SQL Connect) |
| Payments | Mock gateway (Phase 1) → Razorpay (Phase 2) |
| Deployment | Local only (Phase 1) |

## Development

See individual README files in `backend/` and `frontend/` for detailed setup.

## License

TBD

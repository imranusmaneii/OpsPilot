# OpsPilot AI

Enterprise Multi-Agent AI Operations Copilot

## Tech Stack

**Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion

**Backend:** FastAPI, Python, SQLAlchemy, Celery, Redis, PostgreSQL + pgvector

**AI:** LangGraph, LangChain, LlamaIndex, SentenceTransformers, OpenAI SDK

## Getting Started

### Prerequisites

- Node.js 22+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 16 (with pgvector)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/opspilot.git
cd opspilot

# Copy environment file
cp .env.example .env

# Start infrastructure
cd docker
docker compose up -d postgres redis

# Start backend
cd ../backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

# Start frontend
cd ../frontend
npm install
npm run dev
```

### URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Project Structure

```
OpsPilot/
├── frontend/          # Next.js 15 app
├── backend/           # FastAPI app
├── docker/            # Docker configs
├── .github/           # CI/CD
└── docs/              # Documentation
```

## Architecture

Clean Architecture with Domain-Driven Design. Each domain module owns its models, schemas, business logic, data access, and routes.

## License

MIT

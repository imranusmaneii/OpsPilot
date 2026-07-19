# OpsPilot AI - System Flow

## Overview

OpsPilot AI is a production-grade enterprise multi-agent AI operations copilot. It combines RAG (Retrieval-Augmented Generation), a 7-agent orchestration pipeline, hybrid search, document management, evaluation, analytics, and external integrations into a single platform.

**Stack:** Next.js 15 (frontend) / FastAPI (backend) / PostgreSQL + pgvector / Redis + Celery / LangGraph

---

## High-Level Architecture

```
                        +-----------------+
                        |   Next.js 15    |
                        |   (Frontend)    |
                        +--------+--------+
                                 |
                          REST + SSE
                                 |
                        +--------v--------+
                        |    FastAPI       |
                        |   (Backend)      |
                        +--+-----+-----+--+
                           |     |     |
              +------------+     |     +------------+
              |                  |                  |
       +------v------+  +-------v-------+  +-------v-------+
       | PostgreSQL   |  | Redis +       |  | Celery        |
       | + pgvector   |  | Celery Broker |  | Workers       |
       +--------------+  +---------------+  +-------+-------+
                                                          |
                                               Document Indexing
                                               (Extract -> Chunk -> Embed -> Store)
```

---

## User Flow

### 1. Authentication

```
/register  -->  POST /api/v1/auth/register  -->  User created (bcrypt hashed)
/login     -->  POST /api/v1/auth/login     -->  JWT access + refresh tokens
              (30min access, 7-day refresh)
```

All protected routes require `Authorization: Bearer <token>`.

### 2. Knowledge Base Setup

```
/dashboard/knowledge-base
    |
    v
Create Collection (name, description)
    |
    v
/dashboard/documents
    |
    v
Upload Files (PDF, TXT, MD, CSV, JSON, DOCX, PNG, JPEG - up to 50MB)
    |
    v
Celery Worker picks up indexing task
    |
    +---> Extract content (PyMuPDF / python-docx / text parser)
    +---> Chunk into 512-word segments (64-word overlap)
    +---> Generate 384-dim embeddings (all-MiniLM-L6-v2)
    +---> Store chunks + embeddings in PostgreSQL (pgvector)
    +---> Update document status: indexed
```

### 3. Chat (RAG)

```
/dashboard/chat
    |
    v
User sends message
    |
    v
+---> HybridRetriever.search()
|       |
|       +---> Semantic Search: embed query -> pgvector cosine distance
|       +---> BM25 Search: PostgreSQL full-text (tsvector + ts_rank_cd)
|       +---> Reciprocal Rank Fusion (70% semantic, 30% BM25)
|
+---> Reranker.rerank()
|       Cross-encoder (ms-marco-MiniLM-L-6-v2) re-scores results
|
+---> ContextCompressor.compress()
|       Truncate to 3000 tokens, format with source citations
|
+---> Stream LLM Response (SSE)
|       GPT-4o generates answer using context + system prompt
|       Streamed token-by-token to frontend
|
+---> Save message (model, tokens, latency, cost)
```

### 4. Multi-Agent Pipeline

```
User Query
    |
    v
+---> Planner Agent
|       Decomposes query into execution plan
|       (retrieve_documents, document_qa, api_call, reason, cite, evaluate)
|
+---> Retriever Agent
|       Hybrid semantic + keyword search across knowledge base
|       Tools: semantic_search, bm25_search, hybrid_search
|
+---> Document QA Agent
|       Extracts precise answers from retrieved chunks
|       Tools: document_lookup, table_qa, visual_qa
|
+---> API Agent
|       Fetches data from external integrations
|       Tools: github_api, slack_api, notion_api, jira_api
|
+---> Reasoning Agent
|       Synthesizes all information into coherent answer
|       Tools: chain_of_thought, reflection
|
+---> Citation Agent
|       Maps claims back to source documents
|       Tools: source_matching, citation_generation
|
+---> Evaluator Agent
|       Checks quality, detects hallucinations, computes confidence
|       Tools: faithfulness_check, relevance_check, groundedness_check
|
    v
Final Answer with confidence score
```

Workflow DAG: `planner -> retriever -> document_qa -> api_agent -> reasoning -> citation -> evaluator`

Built with LangGraph `StateGraph`. State flows through `AgentState` (query, plan, chunks, answers, citations, metrics).

### 5. Evaluation

```
/dashboard/evaluation
    |
    v
Create Evaluation (name, model, dataset of question/ground_truth pairs)
    |
    v
POST /api/v1/evaluation/{id}/run
    |
    +---> For each sample in dataset:
    |       +---> Compute faithfulness (answer grounded in docs?)
    |       +---> Compute answer_relevancy (answers the question?)
    |       +---> Compute context_precision (retrieved context relevant?)
    |       +---> Compute context_recall (ground truth covered?)
    |       +---> Compute hallucination_score (fabricated content?)
    |       +---> Record latency, tokens, cost per sample
    |
    +---> Aggregate into summary metrics
    +---> Store results, mark completed
    |
    v
View regression trends across evaluations over time
```

### 6. Analytics

```
/dashboard/analytics
    |
    v
+---> Overview: doc count, messages, evals, tokens, cost, avg latency
+---> Usage over time (daily aggregation)
+---> Cost breakdown by model
+---> Latency metrics (avg/min/max over time)
+---> Model comparison (count, avg latency, tokens, total cost)
```

### 7. Integrations

```
/dashboard/integrations
    |
    v
+---> GitHub:   sync repos, issues, PRs (PAT token)
+---> Slack:    sync messages, channels (bot token)
+---> Notion:   sync pages, databases (integration token)
+---> Jira:     sync issues, sprints (email + API token)
+---> Google Drive: sync files (OAuth2 - placeholder)
    |
    +---> Test connection
    +---> Sync data into knowledge base
```

### 8. Playground & Cost Estimator

```
/dashboard/playground
    +---> Send prompts with model/temperature settings
    +---> 4 templates: RAG Q&A, Summarization, Entity Extraction, Classification
    +---> View output, usage, latency

/dashboard/cost-estimator
    +---> 7 models: GPT-4o, GPT-4o-mini, GPT-4-Turbo, Claude 3.5 Sonnet,
    |              Claude 3 Haiku, text-embedding-3-small/large
    +---> Calculate cost per request
    +---> Monthly projection with usage scenarios

/dashboard/model-comparison
    +---> Side-by-side model performance comparison
    +---> Radar chart: speed, cost, accuracy, context window, multimodal

/dashboard/embeddings
    +---> Canvas-based 2D visualization of embedding space
    +---> 5 cluster types with interactive scatter plot
```

---

## API Structure

All endpoints under `/api/v1`:

| Prefix | Purpose |
|---|---|
| `/auth` | Register, login, refresh, profile, API key |
| `/knowledge-base` | Collection CRUD |
| `/documents` | Upload, list, chunks, delete, reindex |
| `/chat` | Conversations, messages, SSE streaming |
| `/search` | Standalone hybrid search |
| `/agents` | Agent definitions, workflow DAG, run history |
| `/evaluation` | Create, run, results, regression |
| `/analytics` | Overview, usage, cost, latency, models |
| `/integrations` | Providers, CRUD, test, sync |
| `/playground` | Prompt testing, templates |
| `/cost` | Model pricing, estimation |

---

## Frontend Pages

| Route | Page |
|---|---|
| `/login` | Login |
| `/register` | Registration |
| `/dashboard` | Overview with KPI cards |
| `/dashboard/knowledge-base` | Collection manager |
| `/dashboard/documents` | Document upload & grid |
| `/dashboard/chat` | Streaming chat interface |
| `/dashboard/agents` | SVG workflow visualization + execution viewer |
| `/dashboard/evaluation` | Evaluation runner + regression charts |
| `/dashboard/analytics` | Bar charts, line charts, donut charts |
| `/dashboard/integrations` | Provider cards + config modal |
| `/dashboard/playground` | Prompt sandbox with templates |
| `/dashboard/model-comparison` | Side-by-side comparison + radar chart |
| `/dashboard/embeddings` | Canvas 2D scatter plot |
| `/dashboard/cost-estimator` | Calculator + monthly projection |
| `/dashboard/settings` | User settings |

---

## Data Flow Summary

```
Upload -> Extract -> Chunk -> Embed -> Store (pgvector)
                                            |
Query -> Embed -> Semantic Search (pgvector cosine)
                  BM25 Search (tsvector)
                  RRF Merge
                  Cross-Encoder Rerank
                  Context Compression
                  LLM Generation (SSE stream)
                  Save (tokens, latency, cost)
```

---

## Background Processing

```
FastAPI --> Celery (Redis broker) --> index_document_task
                                         |
                                    Extract text
                                    Chunk (512 words, 64 overlap)
                                    Embed (MiniLM-L6-v2, 384 dims)
                                    Store in PostgreSQL
                                    Update status
```

Retry: max 3 attempts, 60s delay between retries.

---

## Security

- JWT HS256: 30min access tokens, 7-day refresh tokens
- Bcrypt password hashing
- Per-user API keys (`opspilot_` prefix)
- Bearer token auth on all protected routes
- CORS configured for frontend origins
- Request ID propagation (UUID per request)

---

## 164 Production Files | 9 Milestones | 10 Domain Modules | 7 AI Agents | 5 Integrations

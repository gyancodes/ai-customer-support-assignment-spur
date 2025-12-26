# Spur AI Customer Support Chat

A production-quality AI-powered customer support chat application built with React, Express, Neon PostgreSQL, and Groq LLM.

## Table of Contents

- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Architecture Overview](#architecture-overview)
- [LLM Integration](#llm-integration)
- [API Reference](#api-reference)
- [Trade-offs and Future Improvements](#trade-offs-and-future-improvements)
- [Deployment](#deployment)

---

## Quick Start

### Prerequisites

- Node.js 18+
- Neon Database account (https://neon.tech)
- Groq API key (https://console.groq.com)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ai-customer-support-assignment-spur

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running Locally

```bash
# Terminal 1: Start backend (port 3001)
cd backend
npm run dev

# Terminal 2: Start frontend (port 5173)
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Environment Setup

Create a `.env` file in the `backend/` directory:

```bash
cp backend/.env.example backend/.env
```

Required environment variables:

| Variable | Description |
|----------|-------------|
| DATABASE_URL | Neon PostgreSQL connection string |
| GROQ_API_KEY | API key from Groq Console |

Optional variables:

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3001 | Backend server port |
| NODE_ENV | development | Environment mode |
| LLM_MODEL | llama-3.3-70b-versatile | Groq model |
| LLM_MAX_TOKENS | 500 | Max response tokens |
| LLM_TEMPERATURE | 0.7 | Response creativity (0-1) |
| MAX_MESSAGE_LENGTH | 2000 | Max user message length |
| MAX_HISTORY_MESSAGES | 10 | Context messages for LLM |

---

## Database Setup

### 1. Create Neon Database

1. Go to https://neon.tech and create a free account
2. Create a new project
3. Copy the connection string from the dashboard
4. Add it to your `.env` file as `DATABASE_URL`

### 2. Run Migrations

```bash
cd backend
npm run db:migrate
```

This creates two tables:

**conversations**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| created_at | TIMESTAMPTZ | Creation timestamp |

**messages**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| conversation_id | UUID | Foreign key |
| sender | VARCHAR | 'user' or 'assistant' |
| text | TEXT | Message content |
| created_at | TIMESTAMPTZ | Timestamp |

---

## Architecture Overview

### Project Structure

```
backend/
  src/
    config/        - Environment configuration and validation
    controllers/   - HTTP request handlers
    db/            - Database connection pool and migrations
    middleware/    - Error handling middleware
    routes/        - Express route definitions
    services/      - Business logic (ChatService, LLMService)
    types/         - TypeScript type definitions
    index.ts       - Application entry point

frontend/
  src/
    components/    - React UI components
    context/       - Theme context for dark/light mode
    services/      - API client functions
    types/         - TypeScript types
    App.tsx        - Root component
```

### Backend Layers

1. **Routes** - Define API endpoints and map to controllers
2. **Controllers** - Handle HTTP requests, validate input, call services
3. **Services** - Business logic, database operations, LLM calls
4. **Middleware** - Cross-cutting concerns (error handling, logging)

### Design Decisions

**Layered Architecture**: Clear separation between HTTP handling (controllers) and business logic (services) makes the code testable and maintainable.

**Session-based Conversations**: Using UUIDs for session tracking allows conversation persistence without requiring user authentication.

**localStorage for Session Persistence**: Frontend stores sessionId in localStorage to restore conversations on page reload.

**Singleton Services**: ChatService and LLMService are singletons to reuse database connections and API clients.

**Graceful Error Handling**: All errors are caught and transformed into user-friendly messages. The backend never crashes on bad input.

---

## LLM Integration

### Provider

**Groq** - Chosen for fast inference speed and free tier availability. Uses the `llama-3.3-70b-versatile` model by default.

### Prompting Strategy

The system prompt defines Spur as a fashion/lifestyle e-commerce company. It includes:

- Company description and personality guidelines
- Complete knowledge base (shipping, returns, support hours, payments, promotions)
- Product categories and sizing help
- Order management information
- Response guidelines for the AI

The prompt is structured with clear sections using markdown headers for better LLM comprehension.

### Conversation Context

- Last 10 messages are sent as context (configurable via MAX_HISTORY_MESSAGES)
- Messages are stored in PostgreSQL for persistence
- Full conversation history is loaded when a session is resumed

### Error Handling

All LLM failures are caught and mapped to user-friendly messages:
- Rate limits (429) - "AI service is temporarily busy"
- Timeouts - "AI response timed out"
- Auth errors - "Please contact support"
- Network errors - "Unable to reach AI service"

---

## API Reference

### POST /chat/message

Send a message and receive an AI response.

Request:
```json
{
  "message": "What is your return policy?",
  "sessionId": "optional-uuid"
}
```

Response:
```json
{
  "reply": "We offer a 30-day return window...",
  "sessionId": "uuid"
}
```

### GET /chat/:sessionId

Retrieve conversation history.

Response:
```json
{
  "conversation": {
    "id": "uuid",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "messages": [...]
}
```

### GET /health

Health check endpoint.

---

## Trade-offs and Future Improvements

### Current Trade-offs

**No Authentication**: Simplified for the assignment. In production, would add user auth and tie conversations to accounts.

**localStorage for Sessions**: Simple but means conversations are device-specific. Could use server-side session management.

**Single LLM Provider**: Currently only supports Groq. Could abstract to support multiple providers.

**No Rate Limiting**: The backend doesn't implement rate limiting. Would add express-rate-limit in production.

**No Caching**: LLM responses aren't cached. Could cache common questions to reduce API calls.

### If I Had More Time

1. **User Authentication** - Add login/signup with conversation history tied to accounts

2. **Testing** - Add unit tests for services and integration tests for API

3. **Monitoring** - Add logging, metrics, and alerting for production

---

## Deployment

### Backend Deployment (Render)

1. **Create Render Account**: Go to https://render.com and sign up

2. **Create Web Service**:
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Set the root directory to `backend`

3. **Configure Build Settings**:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Runtime**: Node

4. **Add Environment Variables** in Render Dashboard:
   | Variable | Value |
   |----------|-------|
   | DATABASE_URL | Your Neon PostgreSQL connection string |
   | GROQ_API_KEY | Your Groq API key |
   | NODE_ENV | production |
   | LLM_MODEL | llama-3.3-70b-versatile |
   | LLM_MAX_TOKENS | 500 |
   | LLM_TEMPERATURE | 0.7 |

5. **Deploy**: Render will automatically build and deploy your backend

6. **Copy the URL**: Note your Render URL (e.g., `https://your-app.onrender.com`)

### Frontend Deployment (Vercel)

1. **Create Vercel Account**: Go to https://vercel.com and sign up

2. **Import Project**:
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Set the root directory to `frontend`

3. **Configure Build Settings** (auto-detected for Vite):
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Add Environment Variable**:
   | Variable | Value |
   |----------|-------|
   | VITE_API_URL | Your Render backend URL (e.g., `https://your-app.onrender.com`) |

5. **Deploy**: Vercel will build and deploy your frontend

### Post-Deployment Checklist

- [ ] Backend is running on Render (check `/health` endpoint)
- [ ] Database migrations have been run
- [ ] Frontend can communicate with backend (test chat functionality)
- [ ] CORS is working correctly

### Troubleshooting

**CORS Errors**: The backend uses `cors()` middleware which allows all origins. For production, you may want to restrict this to your Vercel domain.

**Database Connection Issues**: Ensure your Neon database allows connections from Render's IP addresses or has SSL enabled.

**Build Failures**: Check that all dependencies are in `dependencies` (not `devDependencies`) for production builds.

---


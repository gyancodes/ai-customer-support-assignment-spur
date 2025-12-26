# AI Customer Support Chat

A production-quality AI-powered customer support chat application. This application demonstrates a complete full-stack implementation with a React frontend, Express backend, PostgreSQL database, and OpenAI LLM integration.

## 🌟 Features

- **Real-time Chat**: Smooth, responsive chat interface with typing indicators
- **AI-Powered Responses**: OpenAI GPT integration with customizable system prompts
- **Conversation Persistence**: All messages stored in PostgreSQL
- **Robust Error Handling**: Graceful handling of API failures, timeouts, and rate limits
- **Clean Architecture**: Clear separation of concerns with controllers, services, and routes
- **Type Safety**: Full TypeScript implementation on both frontend and backend

## 📁 Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── config/           # Environment configuration
│   │   ├── controllers/      # Request handlers
│   │   ├── db/               # Database setup & migrations
│   │   ├── middleware/       # Error handling middleware
│   │   ├── routes/           # API route definitions
│   │   ├── services/         # Business logic (LLM, chat)
│   │   ├── types/            # TypeScript type definitions
│   │   └── index.ts          # Application entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/         # API client
│   │   ├── types/            # TypeScript types
│   │   ├── App.tsx           # Root component
│   │   └── main.tsx          # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── .env.example
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- OpenAI API key

### 1. Clone and Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example backend/.env

# Edit .env with your values:
# - OPENAI_API_KEY (required)
# - Database credentials
```

### 3. Setup Database

```bash
# Create database
psql -U postgres -c "CREATE DATABASE ai_chat;"

# Run migrations
cd backend
npm run db:migrate
```

### 4. Start Development Servers

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📡 API Documentation

### POST /chat/message

Send a message and receive an AI response.

**Request:**
```json
{
  "message": "What are your shipping options?",
  "sessionId": "optional-uuid"
}
```

**Response:**
```json
{
  "reply": "We offer three shipping options...",
  "sessionId": "uuid"
}
```

### GET /chat/:sessionId

Retrieve conversation history.

**Response:**
```json
{
  "conversation": {
    "id": "uuid",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "messages": [
    {
      "id": "uuid",
      "conversation_id": "uuid",
      "sender": "user",
      "text": "Hello",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z",
  "environment": "development"
}
```

## 🗄️ Data Model

### conversations
| Column     | Type        | Description              |
|------------|-------------|--------------------------|
| id         | UUID        | Primary key              |
| created_at | TIMESTAMPTZ | Creation timestamp       |

### messages
| Column          | Type        | Description                    |
|-----------------|-------------|--------------------------------|
| id              | UUID        | Primary key                    |
| conversation_id | UUID        | Foreign key to conversations   |
| sender          | VARCHAR(20) | 'user' or 'assistant'          |
| text            | TEXT        | Message content                |
| created_at      | TIMESTAMPTZ | Creation timestamp             |

## 🤖 LLM Configuration

The AI assistant is configured as an e-commerce support agent with knowledge about:

- **Shipping**: Standard (5-7 days, free over $50), Express (2-3 days, $9.99), Overnight ($19.99)
- **Returns**: 30-day return policy, 5-7 day refunds
- **Support Hours**: Live chat M-F 9AM-9PM EST, email 24-48h response
- **Payment**: All major cards, PayPal, Apple Pay, Affirm installments

The system prompt can be customized in `backend/src/services/llm.service.ts`.

## 🛡️ Error Handling

The application handles various error scenarios:

- **Empty messages**: Rejected with 400 status
- **Long messages**: Truncated to max length (default 2000 chars)
- **Invalid session**: Returns 404 with helpful message
- **LLM timeouts**: Returns 504 with retry message
- **Rate limits**: Returns 503 with wait message
- **API key issues**: Returns 500 with contact support message
- **Database errors**: Graceful handling with user-friendly messages

## 🔧 Configuration Options

| Variable            | Default         | Description                           |
|---------------------|-----------------|---------------------------------------|
| PORT                | 3001            | Backend server port                   |
| NODE_ENV            | development     | Environment mode                      |
| DB_HOST             | localhost       | PostgreSQL host                       |
| DB_PORT             | 5432            | PostgreSQL port                       |
| DB_NAME             | ai_chat         | Database name                         |
| DB_USER             | postgres        | Database user                         |
| DB_PASSWORD         | -               | Database password                     |
| OPENAI_API_KEY      | -               | OpenAI API key (required)             |
| LLM_MODEL           | gpt-3.5-turbo   | OpenAI model to use                   |
| LLM_MAX_TOKENS      | 500             | Max tokens in response                |
| LLM_TEMPERATURE     | 0.7             | Response creativity (0-1)             |
| MAX_MESSAGE_LENGTH  | 2000            | Max user message length               |
| MAX_HISTORY_MESSAGES| 10              | Context messages sent to LLM          |

## 🚢 Production Deployment

### Build

```bash
# Build backend
cd backend
npm run build

# Build frontend
cd frontend
npm run build
```

### Run

```bash
# Start backend
cd backend
NODE_ENV=production node dist/index.js

# Serve frontend build from dist/ with any static server
```

### Recommended Production Setup

- Use a process manager like PM2 for the backend
- Set up PostgreSQL with proper credentials and SSL
- Use environment variables for all secrets
- Add rate limiting middleware
- Enable CORS only for your domain
- Use a reverse proxy (nginx) for the frontend

## 🔄 Future Extensions

The architecture supports easy extension to other channels:

```typescript
// Example: WhatsApp integration
// backend/src/services/channels/whatsapp.service.ts

import { chatService } from '../chat.service';

export async function handleWhatsAppMessage(from: string, text: string) {
  // Map WhatsApp user to session
  const sessionId = getOrCreateSession(from);
  
  // Use existing chat service
  const response = await chatService.processMessage(text, sessionId);
  
  // Send response via WhatsApp API
  await sendWhatsAppMessage(from, response.reply);
}
```

## 📄 License

MIT License - feel free to use this code for your projects.

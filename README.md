# YooKassa Payment Integration Demo

Full-stack payment integration showcase using YooKassa SBP (Fast Payment System) with React + Fastify + TypeScript.

## 🎯 Purpose

Portfolio project demonstrating:
- **API-First Development** - OpenAPI 3.0.1 specifications before implementation
- **Contract Testing** - jest-openapi validation
- **Claude Code Integration** - Subagents, skills, and slash commands
- **Modern Stack** - React 18, Fastify 5, TypeScript strict mode
- **Professional Patterns** - Type safety, error handling, testing

## 📦 Monorepo Structure

```
showcase-sbp-payment-fullstack/
├── frontend/              # React + Vite + shadcn/ui
├── backend/               # Fastify + YooKassa API
├── specs/                 # OpenAPI specifications
├── .claude/              # Claude Code configuration
└── docs/                  # Documentation
```

## 🚀 Quick Start

### 1. Prerequisites

- Node.js v22+
- npm or yarn
- YooKassa test account (optional - works with mocks)

### 2. Install Dependencies

**⚠️ IMPORTANT:** This is a monorepo - install each workspace separately:

```bash
# Install root dependencies + all workspaces
npm install
npm run install:all
```

Or manually:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure Environment

**Backend** (`backend/.env`):
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your YooKassa test credentials
```

**Frontend** (`frontend/.env`):
```bash
# Optional - defaults work for local development
VITE_API_URL=http://localhost:3000
```

### 4. Run Development Servers

```bash
# Start both frontend and backend concurrently
npm run dev

# Or start separately:
npm run dev:backend    # http://localhost:3000
npm run dev:frontend   # http://localhost:5173
```

### 5. Access Application

Open http://localhost:5173 in your browser.

**Test Mode:** Application works without real YooKassa credentials using mocks.

## 🧪 Testing

```bash
# Run all tests
npm test

# Backend contract tests only
npm run test:backend

# Frontend tests only
npm run test:frontend

# Contract tests only
npm run test:contract
```

## 📚 Documentation

- **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Complete setup guide
- **[CLAUDE.md](./CLAUDE.md)** - Project context for Claude Code
- **[.claude/WORKFLOW.md](./.claude/WORKFLOW.md)** - Development workflow with subagents
- **[backend/README.md](./backend/README.md)** - Backend API documentation
- **[frontend/README.md](./frontend/README.md)** - Frontend component documentation

## 🛠 Available Scripts

```bash
npm run install:all     # Install all dependencies
npm run dev            # Start both frontend and backend
npm run dev:backend    # Start backend only
npm run dev:frontend   # Start frontend only
npm test               # Run all tests
npm run test:contract  # Run contract tests only
npm run build          # Build frontend for production
npm run type-check     # TypeScript type checking
npm run clean          # Remove node_modules and build artifacts
```

## 🎨 Tech Stack

### Frontend
- React 18.3 + TypeScript
- Vite (dev server + build)
- shadcn/ui + Tailwind CSS
- Tanstack Query (data fetching)
- React Hook Form + Zod (validation)

### Backend
- Fastify 5 (web framework)
- TypeScript (strict mode)
- YooKassa API integration
- jest-openapi (contract testing)
- In-memory storage (demo mode)

### Testing
- Vitest (test runner)
- jest-openapi (contract validation)
- React Testing Library (component tests)

## 🔑 YooKassa Integration

**Test Mode Only** - No real payments.

1. Get test credentials from https://yookassa.ru/
2. Add to `backend/.env`:
   ```
   YOOKASSA_SHOP_ID=your_test_shop_id
   YOOKASSA_SECRET_KEY=test_your_secret_key
   ```
3. Application validates that secret key starts with `test_`

**Without credentials:** Application uses mocks for development.

## 📋 Payment Flow

1. User enters amount + description
2. Backend creates payment via YooKassa API
3. Frontend displays QR code
4. User scans QR code in banking app
5. YooKassa sends webhook notification
6. Frontend polls for status updates
7. Display result: succeeded/canceled

## 🤖 Claude Code Features

This project includes comprehensive Claude Code configuration:

- **4 Subagents:** frontend-dev, backend-dev, api-validator, test-engineer
- **3 Skills:** shadcn-ui, openapi-sync, yookassa-test
- **5 Slash Commands:** /dev-setup, /test-payment, /contract-test, /api-validate, /skills-report
- **Hooks:** API-First enforcement, subagent usage reminders
- **Skill Tracking:** Automatic logging of skill invocations

See [.claude/README.md](./.claude/README.md) for details.

## 📝 License

MIT

## 🤝 Contributing

This is a portfolio/demo project. Feel free to fork and adapt for your own use.

## ⚠️ Disclaimer

**TEST MODE ONLY** - This project is for demonstration purposes only. Never use in production with real payment data.

---

**Quick troubleshooting:**
- Error: `EPERM` on Windows → Install dependencies in backend/ and frontend/ separately
- Port 3000 in use → Change `PORT` in backend/.env
- Port 5173 in use → Change in frontend/vite.config.ts
- YooKassa API errors → Check credentials in backend/.env start with `test_`

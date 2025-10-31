# YooKassa Payment Integration Demo - Project Context

## Project Overview

This is a **monorepo** demonstrating professional YooKassa payment system integration for portfolio purposes. The project showcases API-First development, contract testing, and production-ready code patterns.

## Architecture

```
showcase-sbp-payment-fullstack/
├── frontend/              # React + TypeScript + shadcn/ui
├── backend/               # Node.js + Fastify + YooKassa API
├── specs/                 # OpenAPI 3.0.1 specifications
├── docs/                  # Project documentation
└── .claude/              # Claude Code configuration
```

## Technology Stack

### Frontend
- **React** 18.3.1 + TypeScript
- **Vite** dev server (port 5173)
- **shadcn/ui** + Tailwind CSS
- **Tanstack Query** (state management)
- **React Hook Form + Zod** (validation)

### Backend
- **Node.js** v22.18.0 + TypeScript
- **Fastify** web framework (port 3000)
- **In-memory storage** (demo mode)
- **YooKassa API** integration

### Testing
- **Vitest** test runner
- **jest-openapi** for contract testing
- **React Testing Library** for component tests

## API-First Approach

**CRITICAL:** All API contracts are defined in OpenAPI 3.0.1 specifications **BEFORE** implementation.

### Specifications

1. **specs/frontend-backend-api.yaml**
   - POST /api/payments - create payment
   - GET /api/payments/{id} - get payment status

2. **specs/yookassa-webhook-api.yaml**
   - POST /api/webhooks/yookassa - receive notifications

### Contract Testing Requirements

**YOU MUST:**
- Always validate API requests/responses against OpenAPI specs
- Use `jest-openapi` for contract compliance testing
- Never implement API endpoints without corresponding spec
- Run contract tests before committing API changes

## Development Workflow

**🚨 CRITICAL: Always use subagents for implementation!**

See `.claude/WORKFLOW.md` for detailed workflow documentation.

### Using Subagents (REQUIRED)

**Never implement features directly. Always use the Task tool with the appropriate subagent:**

- **Frontend implementation** → Use `frontend-dev` subagent
- **Backend implementation** → Use `backend-dev` subagent
- **API validation** → Use `api-validator` subagent
- **Testing** → Use `test-engineer` subagent

**Example:**
```javascript
Task(
  subagent_type: "frontend-dev",
  prompt: "Implement payment form component with shadcn/ui"
)
```

### Recommended Pattern: API-First TDD

1. **Define Contract** - Update/review OpenAPI spec
2. **Write Contract Tests** - Use `test-engineer` subagent
3. **Implement Feature** - Use appropriate subagent (frontend-dev/backend-dev)
4. **Validate** - Use `api-validator` subagent for contract compliance
5. **Commit** - With clear conventional commit message

### Branch Strategy

- Main branch: `main` (production-ready)
- Feature branches: `claude/feature-name-sessionId`
- **IMPORTANT:** Always develop on designated feature branch
- Create PR when feature is complete

## Code Standards

### Naming Conventions
- Variables/functions: `camelCase`
- Components: `PascalCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Files: `kebab-case.tsx` or `PascalCase.tsx` for components

### TypeScript
- **Strict mode enabled**
- NO `any` types (use `unknown` if necessary)
- Define interfaces for all data structures
- Use Zod for runtime validation

### Testing
- Test files: `*.test.ts` or `*.test.tsx`
- Minimum 80% coverage for business logic
- Contract tests for ALL API endpoints
- E2E tests for critical user flows

## YooKassa Integration

**Test Mode Only** - This is a demo project

### Environment Variables
- `YOOKASSA_SHOP_ID` - Test shop identifier
- `YOOKASSA_SECRET_KEY` - Test secret key (starts with `test_`)

### Payment Flow
1. User enters amount → Frontend POST /api/payments
2. Backend creates payment via YooKassa API
3. Return QR code confirmation URL
4. YooKassa sends webhook → POST /api/webhooks/yookassa
5. Frontend polls GET /api/payments/{id} for status
6. Display result: succeeded/canceled

## Design Guidelines

### Visual Style
- **Colors:** White background, black text, green accents
- **Style:** Minimalist, professional, clean
- **Components:** shadcn/ui components only
- **TEST MODE watermark:** Always visible

### UI/UX Requirements
- Mobile-first responsive design
- Accessible (ARIA labels, keyboard navigation)
- Loading states for async operations
- Error messages clear and actionable

## Common Commands

### Development
```bash
# Frontend
cd frontend && npm run dev

# Backend
cd backend && npm run dev
```

### Testing
```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test

# Contract tests only
npm test -- --grep "contract"
```

### Validation
```bash
# Validate OpenAPI specs
npx @redocly/cli lint specs/*.yaml

# Type checking
npm run type-check
```

## Subagents Available

- **frontend-dev** - React, TypeScript, shadcn/ui specialist
- **backend-dev** - Node.js, Fastify, YooKassa integration expert
- **api-validator** - OpenAPI contract validation specialist
- **test-engineer** - Contract testing with jest-openapi

## Security Considerations

**IMPORTANT:**
- ✅ Only use YooKassa test keys
- ✅ Never commit secrets to git
- ✅ Use .env files (excluded from git)
- ❌ NO real payments in this demo
- ❌ NO production keys

## Performance Guidelines

- Lazy load routes and heavy components
- Optimize images and assets
- Use React.memo for expensive renders
- Implement proper caching headers
- Monitor bundle size

## Accessibility Standards

- WCAG 2.1 Level AA compliance
- Semantic HTML elements
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios ≥ 4.5:1

## Documentation Standards

- Update README.md when adding features
- Document API changes in OpenAPI specs
- Add JSDoc comments for public APIs
- Include usage examples in code comments

## Commit Message Format

Follow Conventional Commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:
```
feat(backend): add YooKassa webhook handler

Implement POST /api/webhooks/yookassa endpoint
- Validate webhook signatures
- Update payment status in memory store
- Return 200 OK to prevent retries

Closes #123
```

## IMPORTANT Reminders

1. **API-First:** Spec → Tests → Implementation
2. **Contract Testing:** Always validate against OpenAPI
3. **Test Mode:** Only test keys, no real payments
4. **TypeScript:** Strict mode, no any types
5. **Commits:** Conventional commits with clear messages
6. **Branch:** Always develop on feature branch
7. **shadcn/ui:** Use only shadcn/ui components for UI

---

When in doubt, ask for clarification. Better to confirm than implement incorrectly!

# Getting Started with YooKassa Payment Integration

Complete guide to start developing with this Claude Code-optimized project.

## 📋 Prerequisites

- **Node.js** v22.18.0 or higher
- **npm** or **yarn**
- **Git** configured
- **Claude Code** CLI installed
- **YooKassa** test account (for API keys)

## 🚀 Quick Start

### 1. Clone and Enter Repository

```bash
git clone <repository-url>
cd showcase-sbp-payment-fullstack
```

### 2. Review Project Context

The project includes comprehensive Claude Code configuration:

```bash
# Read project overview
cat CLAUDE.md

# Explore Claude Code setup
ls .claude/
```

### 3. Install Dependencies

**⚠️ IMPORTANT:** This is a monorepo. Install dependencies for each workspace:

**Option A: Using root scripts (Recommended)**
```bash
npm install              # Installs root dependencies (concurrently)
npm run install:all      # Installs frontend + backend dependencies
```

**Option B: Manual installation**
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

**Option C: Using Claude Code slash command**
```bash
claude
# Then in Claude Code:
/dev-setup frontend
/dev-setup backend
```

### 4. Configure Environment Variables

**Frontend** (`.env`):
```bash
VITE_API_URL=http://localhost:3000
```

**Backend** (`.env`):
```bash
PORT=3000
YOOKASSA_SHOP_ID=your_test_shop_id
YOOKASSA_SECRET_KEY=test_your_secret_key
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 5. Get YooKassa Test Credentials

1. Register at https://yookassa.ru/
2. Navigate to **Integration** → **API**
3. Create test shop
4. Copy `shopId` and `secretKey` (starts with `test_`)
5. Add to `backend/.env`

### 6. Validate Setup

```bash
# In Claude Code
/api-validate
```

Or manually:
```bash
npx @redocly/cli lint specs/frontend-backend-api.yaml
npx @redocly/cli lint specs/yookassa-webhook-api.yaml
```

### 7. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

**Terminal 3 - Claude Code:**
```bash
claude
# Start interacting with Claude
```

## 🤖 Using Claude Code

### Understanding the Setup

This project includes:
- **4 Subagents** - Specialized for frontend, backend, API validation, testing
- **3 Skills** - For shadcn/ui, OpenAPI sync, YooKassa testing
- **4 Slash Commands** - Quick workflows
- **Hooks** - Auto-formatting, validation
- **MCP Servers** - Enhanced capabilities

### Example Interactions

**Create Payment Form (Frontend):**
```
Create a payment form component with:
- Amount input field
- Validation for positive numbers
- Submit button
- Use shadcn/ui components
- Include proper accessibility
```

Claude will:
1. Invoke `frontend-dev` subagent automatically
2. Use `shadcn-ui` skill for components
3. Generate code with TypeScript types
4. Apply auto-formatting via hooks

**Implement Payment Endpoint (Backend):**
```
Implement POST /api/payments endpoint that:
- Validates amount from request
- Creates payment via YooKassa API
- Returns payment details
- Matches the OpenAPI spec exactly
```

Claude will:
1. Invoke `backend-dev` subagent automatically
2. Use `yookassa-test` skill for mocks
3. Generate contract tests
4. Validate against OpenAPI spec

**Validate Everything:**
```
/api-validate
/contract-test
```

## 📚 Development Workflow

### API-First Approach

**Always follow this order:**

1. **Update OpenAPI Spec** (`specs/*.yaml`)
   ```
   Update the OpenAPI spec for POST /api/payments to include a description field
   ```

2. **Validate Spec**
   ```
   /api-validate
   ```

3. **Generate Types**
   ```
   Generate TypeScript types from the updated spec
   ```

4. **Implement Feature**
   ```
   Implement the endpoint according to the spec
   ```

5. **Write Tests**
   ```
   Write contract tests for the new field
   ```

6. **Run Tests**
   ```
   /contract-test
   ```

### Using Subagents

Subagents are invoked automatically, but you can be explicit:

```
Use the frontend-dev subagent to create a QR code display component
```

```
Use the test-engineer subagent to write integration tests for the payment flow
```

```
Use the api-validator subagent to check if my implementation matches the spec
```

### Using Skills

Skills provide reusable knowledge:

```
Use the shadcn-ui skill to add a dialog component
```

```
Use the openapi-sync skill to set up automatic type generation
```

```
Use the yookassa-test skill to create mock webhook data
```

### Using Slash Commands

```
/dev-setup          # Set up environment
/api-validate       # Validate OpenAPI specs
/contract-test      # Run contract tests
/test-payment 100   # Test payment flow with 100 RUB
```

## 🧪 Testing

### Run All Tests

```bash
# Frontend
cd frontend && npm test

# Backend
cd backend && npm test
```

### Run Contract Tests Only

```bash
# Via Claude Code
/contract-test

# Or manually
cd frontend && npm test -- --grep "contract"
cd backend && npm test -- --grep "contract"
```

### Test Payment Flow

```bash
# Via Claude Code
/test-payment 250

# Or manually with curl
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{"amount": 250}'
```

## 🔧 Common Tasks

### Add shadcn/ui Component

```
Add a shadcn/ui card component to the project
```

### Generate Types from Specs

```
Generate TypeScript types from the OpenAPI specifications
```

### Create Mock YooKassa Data

```
Create mock YooKassa webhook data for a successful payment
```

### Validate API Compliance

```
Check if my payment endpoint implementation matches the OpenAPI spec
```

### Fix Failing Tests

```
My contract tests are failing. Help me fix them.
```

## 🐛 Troubleshooting

### Claude Code Issues

**Subagent not invoked:**
- Be more specific: "Use frontend-dev subagent to..."

**Skill not triggering:**
- Explicitly request: "Use shadcn-ui skill to..."

**Hook not running:**
- Check `.claude/settings.json` syntax
- Ensure required tools are installed (prettier, @redocly/cli)

### Development Issues

**Port already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill

# Or use different port
PORT=3001 npm run dev
```

**Type errors after spec change:**
```bash
# Regenerate types
npm run generate:types

# Clear TypeScript cache
rm -rf node_modules/.vite
```

**CORS errors:**
- Check `FRONTEND_URL` in backend `.env`
- Verify CORS configuration in Fastify

**YooKassa API errors:**
- Verify test credentials in `.env`
- Check credentials format (shopId is numeric, secretKey starts with `test_`)
- Review YooKassa API documentation

### Test Failures

**Contract tests failing:**
```
/api-validate    # Check specs are valid
```
Then:
```
Use api-validator to identify the mismatch between spec and implementation
```

**Unit tests failing:**
- Check mocks are properly configured
- Verify test data matches expected format
- Review error messages carefully

## 📖 Documentation

### Project Documentation
- `CLAUDE.md` - Project context for Claude
- `.claude/README.md` - Claude Code configuration guide
- `docs/PROJECT-README.md` - Full project documentation

### API Documentation
- `specs/frontend-backend-api.yaml` - Frontend ↔ Backend API
- `specs/yookassa-webhook-api.yaml` - YooKassa → Backend webhooks

### External Resources
- [YooKassa API Docs](https://yookassa.ru/developers/api)
- [Fastify Documentation](https://fastify.dev)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Vitest Documentation](https://vitest.dev)

## 🎯 Next Steps

1. **Review Documentation**
   - Read `CLAUDE.md` for project context
   - Explore `.claude/README.md` for configuration details

2. **Set Up Webhooks** (for local testing)
   ```bash
   # Install ngrok
   npm install -g ngrok

   # Start tunnel
   ngrok http 3000

   # Configure in YooKassa dashboard:
   # https://abc123.ngrok.io/api/webhooks/yookassa
   ```

3. **Start Building**
   - Use Claude Code to implement features
   - Follow API-First workflow
   - Write tests as you go

4. **Test Thoroughly**
   - Run contract tests frequently
   - Test with mock YooKassa data
   - Verify accessibility

5. **Commit and Push**
   - Use conventional commits
   - Keep commits focused
   - Run tests before committing

## 💡 Pro Tips

1. **Use Claude Code extensively** - It's configured to help!
2. **Start with specs** - API-First prevents integration issues
3. **Test contracts always** - Catches mismatches early
4. **Use mocks for YooKassa** - Faster, safer development
5. **Ask Claude to explain** - The subagents are experts

## 🤝 Getting Help

**From Claude Code:**
```
How do I [task]?
Explain [concept]
Debug [issue]
Review my code for [file]
```

**From Documentation:**
- Check `.claude/README.md` for configuration help
- Review subagent files for specialized guidance
- Read skill files for detailed procedures

**From Community:**
- YooKassa documentation
- GitHub issues
- Stack Overflow

---

**Ready to build!** Start with `/dev-setup` and let Claude Code guide you through the development process. 🚀

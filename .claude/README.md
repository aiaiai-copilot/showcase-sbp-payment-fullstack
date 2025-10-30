# Claude Code Configuration for YooKassa Payment Integration

This directory contains a comprehensive Claude Code setup optimized for developing the YooKassa payment integration project.

## 📁 Directory Structure

```
.claude/
├── README.md              # This file
├── agents/                # Specialized subagents
│   ├── frontend-dev.md    # React/TypeScript/shadcn specialist
│   ├── backend-dev.md     # Fastify/YooKassa specialist
│   ├── api-validator.md   # OpenAPI validation expert
│   └── test-engineer.md   # Contract testing specialist
├── skills/                # Reusable capabilities
│   ├── shadcn-ui/        # shadcn/ui component integration
│   ├── openapi-sync/     # Type generation from OpenAPI
│   └── yookassa-test/    # YooKassa mocking and testing
├── commands/              # Slash commands
│   ├── api-validate.md    # Validate OpenAPI specs
│   ├── contract-test.md   # Run contract tests
│   ├── dev-setup.md       # Set up development environment
│   └── test-payment.md    # Test payment flow
└── settings.json          # Hooks and permissions

../
├── CLAUDE.md             # Root project context
└── .mcp.json            # MCP server configuration
```

## 🤖 Subagents

Subagents are specialized AI assistants for specific tasks. Claude automatically invokes them based on your request.

### frontend-dev
**Use for:** React components, UI implementation, frontend API integration

**Specializes in:**
- React 18.3+ with TypeScript
- shadcn/ui components
- Tailwind CSS
- Tanstack Query
- React Hook Form + Zod
- Frontend contract testing

**Example:** "Create a payment form component with amount validation"

### backend-dev
**Use for:** API endpoints, YooKassa integration, webhook handling

**Specializes in:**
- Node.js + Fastify
- YooKassa API integration
- Webhook processing
- In-memory storage
- Backend contract testing

**Example:** "Implement POST /api/payments endpoint"

### api-validator
**Use for:** OpenAPI spec validation, contract compliance checking

**Specializes in:**
- OpenAPI 3.0.1 validation
- Contract testing setup
- API design review
- Spec linting

**Example:** "Validate the frontend-backend API specification"

### test-engineer
**Use for:** Test strategy, writing tests, ensuring quality

**Specializes in:**
- Contract testing with jest-openapi
- Unit testing with Vitest
- React component testing
- Integration testing
- Test coverage analysis

**Example:** "Write contract tests for the payment API"

## 🎯 Skills

Skills are reusable capabilities that Claude can invoke when needed.

### shadcn-ui
**Purpose:** Add and configure shadcn/ui components

**What it does:**
- Provides installation commands
- Shows usage examples for common components (Button, Card, Input, Form)
- Includes theming and customization guidance
- Troubleshooting tips

**Invoke with:** "Add a shadcn/ui button component" or "How do I use shadcn/ui forms?"

### openapi-sync
**Purpose:** Generate TypeScript types from OpenAPI specifications

**What it does:**
- Sets up openapi-typescript
- Configures type generation scripts
- Shows usage patterns for generated types
- Includes CI/CD integration examples

**Invoke with:** "Generate types from OpenAPI specs" or "Sync API types"

### yookassa-test
**Purpose:** Create YooKassa mock responses and test data

**What it does:**
- Provides mock payment responses
- Generates webhook notification examples
- Includes MSW and Vitest mock setups
- Shows test scenarios

**Invoke with:** "Create YooKassa mock data" or "How do I test YooKassa integration?"

## ⚡ Slash Commands

Quick workflows for common tasks.

### /api-validate
Validate all OpenAPI specifications

**What it does:**
1. Checks for @redocly/cli
2. Lints both API specs
3. Reports validation results
4. Suggests fixes if errors found

**Usage:**
```
/api-validate
```

### /contract-test
Run contract tests for frontend and backend

**What it does:**
1. Runs frontend contract tests
2. Runs backend contract tests
3. Reports compliance status
4. Explains failures if any

**Usage:**
```
/contract-test
```

### /dev-setup
Set up development environment

**What it does:**
1. Initializes frontend and/or backend
2. Installs dependencies
3. Configures TypeScript
4. Generates types from specs
5. Creates .env templates

**Usage:**
```
/dev-setup              # Set up both
/dev-setup frontend     # Frontend only
/dev-setup backend      # Backend only
```

### /test-payment
Test complete payment flow

**What it does:**
1. Creates test payment
2. Polls for status updates
3. Simulates webhook
4. Verifies against spec

**Usage:**
```
/test-payment           # Default 100 RUB
/test-payment 250       # Custom amount
```

## 🪝 Hooks

Automated triggers that run at specific events.

### PostToolUse Hooks

**format-code**
- Triggers: After Edit or Write
- Action: Runs Prettier on TypeScript/JavaScript files
- Purpose: Automatic code formatting

**validate-openapi-changes**
- Triggers: After editing OpenAPI specs
- Action: Runs @redocly/cli lint
- Purpose: Immediate spec validation

### UserPromptSubmit Hooks

**api-first-reminder**
- Triggers: When mentioning API/endpoint/route
- Action: Shows reminder about API-First approach
- Purpose: Reinforce best practices

## 🔧 MCP Servers

Model Context Protocol servers provide additional capabilities.

### filesystem
- **Purpose:** File system access
- **Scope:** Project-level
- **Provides:** Enhanced file operations

### github
- **Purpose:** GitHub integration
- **Scope:** Project-level
- **Requires:** GITHUB_TOKEN environment variable
- **Provides:** Issues, PRs, repository operations

**Setup:**
```bash
export GITHUB_TOKEN=your_github_token
```

## 📋 Permissions

Pre-approved tools for streamlined workflow:
- Read, Write, Edit
- Glob, Grep
- Bash
- WebFetch, WebSearch
- TodoWrite

Pre-approved domains:
- yookassa.ru (API docs)
- ui.shadcn.com (component library)
- react.dev, fastify.dev (framework docs)
- vitest.dev (testing framework)
- And more...

## 🚀 Getting Started

### 1. Review Project Context
The root `CLAUDE.md` file contains essential project information. Claude automatically reads this file.

### 2. Set Up Development Environment
```
/dev-setup
```

### 3. Validate API Specifications
```
/api-validate
```

### 4. Start Development
Use subagents for specialized tasks:
- "Create the payment form UI" → Invokes `frontend-dev`
- "Implement the payment endpoint" → Invokes `backend-dev`
- "Write contract tests" → Invokes `test-engineer`

### 5. Run Tests
```
/contract-test
```

## 💡 Best Practices

### When Working with Frontend
1. Mention "frontend" or "React" in your request
2. `frontend-dev` subagent will be invoked automatically
3. Use shadcn/ui components exclusively
4. Write contract tests for API calls

### When Working with Backend
1. Mention "backend" or "API" in your request
2. `backend-dev` subagent will be invoked automatically
3. Follow OpenAPI specs exactly
4. Test with YooKassa mocks

### When Working with APIs
1. Always update OpenAPI spec first (API-First)
2. Run `/api-validate` after spec changes
3. Generate types with `openapi-sync` skill
4. Write contract tests before implementation

### When Testing
1. Use `/contract-test` frequently
2. Mock YooKassa API (never use real credentials in tests)
3. Maintain 80%+ code coverage
4. Test error scenarios

## 🔍 Troubleshooting

### Subagent not invoked
- Be specific in your request
- Mention the domain explicitly (e.g., "frontend", "backend", "testing")
- Manually specify: "Use the frontend-dev subagent to..."

### Skill not triggering
- Explicitly mention what you need: "Use the shadcn-ui skill to add a button"
- Skills are model-invoked based on context

### Hook not running
- Check `.claude/settings.json` syntax
- Verify commands are executable
- Check that required tools are installed (prettier, @redocly/cli)

### MCP server not working
- Verify MCP server is installed: `npx @modelcontextprotocol/server-filesystem`
- Check environment variables (especially GITHUB_TOKEN)
- Restart Claude Code if needed

## 📚 Resources

### Official Documentation
- [Claude Code Docs](https://docs.claude.com/en/docs/claude-code)
- [Subagents Guide](https://docs.claude.com/en/docs/claude-code/sub-agents)
- [Skills Guide](https://docs.claude.com/en/docs/claude-code/skills)
- [Hooks Guide](https://docs.claude.com/en/docs/claude-code/hooks-guide)
- [MCP Documentation](https://docs.claude.com/en/docs/claude-code/mcp)

### Project Resources
- [YooKassa API Docs](https://yookassa.ru/developers/api)
- [OpenAPI Specification](https://swagger.io/specification/)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Fastify Documentation](https://fastify.dev)

## 🎯 Quick Reference

### Common Workflows

**Start new feature:**
1. Update OpenAPI spec
2. Run `/api-validate`
3. Implement with appropriate subagent
4. Write tests
5. Run `/contract-test`

**Fix failing tests:**
1. "Use test-engineer to fix failing contract tests"
2. Review test output
3. Align implementation with spec
4. Re-run tests

**Add UI component:**
1. "Use shadcn-ui skill to add [component]"
2. Implement component
3. Test accessibility

**Debug API issues:**
1. "Use api-validator to check spec compliance"
2. Review validation results
3. Fix issues
4. Re-validate

## 🤝 Contributing

When adding new configurations:
1. Document in this README
2. Follow existing patterns
3. Test thoroughly
4. Commit with clear messages

## 📝 Notes

- This configuration is optimized for API-First development
- All subagents enforce contract testing
- Hooks automate repetitive tasks
- Skills provide reusable knowledge

---

**Happy coding with Claude Code!** 🚀

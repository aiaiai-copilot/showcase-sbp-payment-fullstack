# Development Workflow

## CRITICAL: Always Use Subagents for Implementation

**RULE:** Never implement features directly. Always use the Task tool with the appropriate subagent.

## When to Use Each Subagent

### Frontend Implementation → `frontend-dev`
**Trigger Keywords:** implement frontend, build component, create UI, add form, frontend feature

**Usage:**
```javascript
Task(
  subagent_type: "frontend-dev",
  prompt: "Implement payment form component with shadcn/ui. Include amount input,
           description field, and submit button. Use React Hook Form + Zod validation."
)
```

**The subagent will:**
- Explicitly state which skills it's using (shadcn-ui, openapi-sync)
- Log skill usage to `.claude/skill-usage.log`
- Follow React + TypeScript + shadcn/ui best practices
- Ensure type safety with generated types

---

### Backend Implementation → `backend-dev`
**Trigger Keywords:** implement backend, build API, create endpoint, add route, backend feature

**Usage:**
```javascript
Task(
  subagent_type: "backend-dev",
  prompt: "Implement POST /api/payments endpoint with YooKassa integration.
           Include request validation, error handling, and contract tests."
)
```

**The subagent will:**
- Explicitly state which skills it's using (yookassa-test, openapi-sync)
- Log skill usage to `.claude/skill-usage.log`
- Follow Fastify + TypeScript best practices
- Ensure OpenAPI contract compliance

---

### API Validation → `api-validator`
**Trigger Keywords:** validate API, check spec, verify contract, OpenAPI validation

**Usage:**
```javascript
Task(
  subagent_type: "api-validator",
  prompt: "Validate all API endpoints against frontend-backend-api.yaml spec.
           Check for contract compliance and report any violations."
)
```

**The subagent will:**
- Use jest-openapi for contract testing
- Validate request/response schemas
- Report spec violations

---

### Testing → `test-engineer`
**Trigger Keywords:** write tests, test coverage, contract tests, E2E tests

**Usage:**
```javascript
Task(
  subagent_type: "test-engineer",
  prompt: "Write comprehensive contract tests for all payment API endpoints.
           Include success cases, error cases, and edge cases."
)
```

**The subagent will:**
- Use yookassa-test skill for mock data
- Write contract tests with jest-openapi
- Ensure 80%+ code coverage

---

## Why This Matters

### ❌ WRONG: Direct Implementation
```
User: "Implement the payment form"
Assistant: *Directly uses Write tool to create components*
```

**Problems:**
- Bypasses skill tracking system
- Misses specialized expertise
- No skill invocation logging
- Breaks accountability chain

### ✅ CORRECT: Subagent Delegation
```
User: "Implement the payment form"
Assistant: *Uses Task tool with frontend-dev subagent*
Subagent: "I will use the shadcn-ui skill to implement the payment form"
Subagent: *Logs skill usage, implements feature*
```

**Benefits:**
- Skill tracking works properly
- Specialized domain expertise applied
- Full accountability and audit trail
- Skills are actually used, not bypassed

---

## Enforcement

**Hooks are configured to remind you:**
- `.claude/settings.json` has `subagent-enforcement` hook
- Triggers on keywords: implement, build, create, add
- Shows required subagent and example usage

**If you see this message:**
```
🤖 REQUIRED: Use Task tool with 'frontend-dev' subagent for frontend implementation
   Example: Task(subagent_type='frontend-dev', prompt='...')
```

**You MUST use the Task tool, not implement directly!**

---

## Skill Tracking Workflow

Each subagent is configured to:

1. **Declare skill usage:** "I will use the [skill-name] skill for [task]"
2. **Log usage:** `echo "$(date -Iseconds): skill-name invoked by subagent-name" >> .claude/skill-usage.log`
3. **Confirm at end:** "✅ Used [skill-name] skill for [task]"

**Audit skill usage:**
```bash
/skills-report
```

---

## Emergency Override

**Only use direct implementation if:**
- Trivial changes (typo fixes, minor adjustments)
- No relevant subagent exists
- Explicit user permission

**For everything else: USE SUBAGENTS!**

---

## Quick Reference

| Task | Subagent | Key Skills |
|------|----------|------------|
| React components | frontend-dev | shadcn-ui, openapi-sync |
| API endpoints | backend-dev | yookassa-test, openapi-sync |
| Contract validation | api-validator | - |
| Testing | test-engineer | yookassa-test |

---

**Remember: Subagents are not optional. They're the designed workflow!**

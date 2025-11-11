# Living Tags PoC - Claude Code Instructions

## Project Overview

AI-powered text tagging system for Russian jokes/anecdotes using Claude API and Supabase. This is a Proof of Concept focused on validating semantic analysis capabilities.

## MANDATORY: Subagent Usage Rules

**CRITICAL:** You MUST use specialized subagents for all implementation work. Never implement features directly.

### When to Use Each Subagent

1. **frontend-specialist**
   - React component implementation
   - UI layouts with shadcn/ui
   - Supabase queries and hooks
   - React Query setup
   - Form handling (react-hook-form + Zod)
   - Routing with React Router
   - State management

2. **claude-integration-specialist**
   - Anthropic SDK setup and configuration
   - Auto-tagging logic implementation
   - Prompt engineering for tag analysis
   - API response parsing and validation
   - Error handling for Claude API calls
   - Rate limiting and retry logic

3. **database-specialist**
   - Supabase schema design
   - Migration file creation
   - Database seeding (initial tags, test jokes)
   - RLS policy implementation
   - Query optimization

**Violation Example:**
❌ Using Edit/Write tools to directly modify React components
✅ Using Task tool with frontend-specialist subagent

## Technology Stack (ENFORCED)

### Required Technologies
- ✅ **React** 18.3.1 + TypeScript 5.8.3
- ✅ **Vite** 7.1.11 (dev server)
- ✅ **shadcn/ui** components ONLY (no other UI libraries)
- ✅ **Tailwind CSS** 3.4.17 for styling
- ✅ **Supabase** 2.74.0 for database
- ✅ **@anthropic-ai/sdk** for Claude API
- ✅ **@tanstack/react-query** 5.83.0 for data fetching
- ✅ **react-hook-form** 7.61.1 + **zod** 3.25.76 for forms
- ✅ **React Router** 6.30.1 for routing

### Forbidden
- ❌ NO other UI component libraries (MUI, Ant Design, etc.)
- ❌ NO other state management (Redux, MobX, Zustand)
- ❌ NO other form libraries
- ❌ NO inline styles (use Tailwind classes)

## Code Standards (ENFORCED)

### TypeScript
- **Strict mode enabled** - NO exceptions
- **NO `any` types** - Use `unknown` if truly needed
- Define interfaces for all data structures
- Use Zod for runtime validation of external data

### Component Structure
```typescript
// Required structure for all components
src/
├── components/
│   ├── layout/       // Header, etc.
│   ├── search/       // SearchBar
│   ├── texts/        // TextList, TextCard, AddTextModal
│   └── tags/         // TagBadge, TagManager, ConfidenceIndicator
├── lib/
│   ├── supabase.ts   // Supabase client
│   ├── claude.ts     // Anthropic SDK client
│   └── utils.ts      // Utilities
├── hooks/
│   ├── useTexts.ts   // Text CRUD operations
│   ├── useTags.ts    // Tag operations
│   └── useAutoTag.ts // Auto-tagging logic
└── types/
    └── index.ts      // TypeScript interfaces
```

### Styling Rules
- Use Tailwind utility classes
- NO inline styles (`style={{ ... }}`)
- Use shadcn/ui variants for component styling
- Mobile-first responsive design

### Async Operations
- **ALWAYS** implement loading states
- **ALWAYS** implement error states
- Use React Query for data fetching
- Show user-friendly error messages

## Skills Usage

### project-setup
Use for first-time project initialization:
- Install dependencies
- Verify Supabase connection
- Run migrations
- Seed initial data
- Create .env.local if missing

### db-reset
Use when database needs reset during development:
- Drop all tables
- Rerun migrations
- Reseed data (tags + test jokes)

## MCP Configuration

### Context7
Configured for accessing official documentation:
- React documentation
- Supabase documentation
- Anthropic SDK documentation
- shadcn/ui component docs

## Security Considerations

### PoC-Specific Allowances
- ⚠️ **API key in frontend is acceptable** (frontend-only architecture)
- ⚠️ This is for TESTING ONLY, not production

### Strict Rules
- ❌ NEVER commit .env.local or .env files
- ❌ NEVER commit API keys or secrets
- ✅ ALWAYS use .env.local.example for documentation
- ✅ ALWAYS add .env* to .gitignore

## Monitoring & Compliance

All tool usage, subagent calls, skill invocations, and MCP usage are logged to:
- Terminal (real-time display)
- `.claude/logs/tool-usage.log` (persistent log)

The monitoring system will flag violations of these rules.

## Development Workflow

1. **Read specification** (docs/poc-specification.md)
2. **Use appropriate subagent** for implementation
3. **Use skills** for setup/reset operations
4. **Use Context7 MCP** for documentation lookup
5. **Follow code standards** strictly
6. **Test thoroughly** before committing

## Common Violations to Avoid

❌ Implementing React components without frontend-specialist
❌ Writing Claude API code without claude-integration-specialist
❌ Creating migrations without database-specialist
❌ Using non-shadcn/ui components
❌ Using `any` types in TypeScript
❌ Writing inline styles
❌ Skipping loading/error states
❌ Committing secrets

## Questions?

When in doubt:
1. Check this CLAUDE.md first
2. Check docs/poc-specification.md
3. Use Context7 MCP for official docs
4. Ask the user for clarification

---

**Remember:** This is a PoC to validate the AI tagging concept. Keep it simple, follow the rules, and use the subagents!

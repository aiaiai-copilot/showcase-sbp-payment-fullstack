# Session Handoff: Living Tags PoC - Ready to Start Development

**Date:** 2025-11-11
**Status:** Configuration Complete ✅
**Next Step:** Start development in NEW SESSION

**IMPORTANT:** The local `/home/user/living-tags-poc/` has the LATEST version with improved hooks. Use this version for the new session. The backup branch is for recovery only.

---

## What Was Accomplished

A complete Claude Code configuration system was created for the living-tags-poc project to ensure you FOLLOW the rules and USE the subagents (unlike previous projects where they were ignored).

### Configuration Files Created

1. **CLAUDE.md** - Mandatory project rules
   - Enforces subagent usage (NEVER edit directly!)
   - Technology constraints (shadcn/ui, Supabase, Anthropic SDK)
   - Code standards (TypeScript strict, no inline styles)
   - Security guidelines

2. **Three Subagents** (`.claude/subagents/`)
   - `frontend-specialist.md` - React, shadcn/ui, Supabase queries, forms
   - `claude-integration-specialist.md` - Anthropic SDK, auto-tagging, prompts
   - `database-specialist.md` - Supabase migrations, schema, seeding

3. **Two Skills** (`.claude/skills/`)
   - `project-setup.md` - First-time initialization workflow
   - `db-reset.md` - Database reset for development iterations

4. **Context7 MCP** (`.claude/mcp/`)
   - `context7-config.md` - Documentation access for 12 libraries

5. **Monitoring System** (`.claude/hooks/`)
   - `logger.sh` - Core logging utility
   - `pre-tool-use.sh` - Logs tool usage, detects violations (improved JSON parsing for subagent detection)
   - `post-tool-use.sh` - Logs results and completion
   - `test-monitoring.sh` - Verification script (ALL TESTS PASSED ✅)
   - Logs to: `.claude/logs/tool-usage.log`
   - **Status:** Fully tested and operational ✅

---

## Where Files Are Located

### Option 1: Local Repository (living-tags-poc)
```
/home/user/living-tags-poc/
```

**Status:**
- Complete configuration exists locally
- Committed: `351e05b` (configuration) + uncommitted improvements
- Includes improved `pre-tool-use.sh` with better subagent detection
- Monitoring system fully tested - all tests passed ✅
- NOT pushed to living-tags-poc (git authentication issue)
- Ready to use immediately in new session

### Option 2: Backup Branch (showcase-sbp-payment-fullstack)
```
Branch: claude/living-tags-poc-config-011CV2RzoXmzQd84psMXH7DX
```

**Status:**
- Pushed successfully (commits: 58a0005, df013ed)
- Files available:
  - `CLAUDE-living-tags-poc.md` (rename to CLAUDE.md when transferring)
  - `.claude/` directory (complete with improved hooks)
  - `SESSION-HANDOFF.md` (this file - for reference)

**Note:** Ignore showcase-sbp-payment-fullstack project - it's old, not relevant.

---

## CRITICAL: Why This Configuration Exists

**Problem from previous projects:**
- Claude Code created subagents but NEVER USED THEM
- CLAUDE.md rules were IGNORED
- Direct code editing instead of using specialists

**Solution - The Monitoring System:**
- Logs EVERY tool call to `.claude/logs/tool-usage.log`
- Shows warnings in terminal when you edit code directly
- Celebrates when you use subagents correctly
- Creates audit trail so violations are visible

**YOU MUST FOLLOW THIS:**
- ❌ NEVER use Edit/Write on React components directly
- ✅ ALWAYS use Task tool with appropriate subagent
- ❌ NEVER ignore the warnings
- ✅ ALWAYS check the terminal feedback

---

## Project Overview: Living Tags PoC

**What it is:**
AI-powered text tagging system for Russian jokes/anecdotes using Claude API.

**Technology Stack:**
- Frontend-only (PoC - API key in browser is OK)
- React 18.3.1 + TypeScript 5.8.3
- Vite dev server
- shadcn/ui components (ONLY these, no other UI libs)
- Supabase for database
- Anthropic SDK for Claude API
- React Query for data fetching

**Key Features:**
1. Add text (jokes/anecdotes)
2. Auto-tag using Claude API semantic analysis
3. Display tags with confidence scores (0.0-1.0)
4. Live search by tag names
5. Tag management (15 pre-populated Russian tags)

**Architecture:**
```
Frontend (React) → Claude API (auto-tagging)
                 ↓
              Supabase (storage)
```

---

## How to Start Development

### Step 1: Verify Configuration
```bash
cd /home/user/living-tags-poc
ls -la .claude/
cat CLAUDE.md
```

### Step 2: Read the Specification
```bash
cat docs/poc-specification.md
```

### Step 3: Understand the Rules
Read `CLAUDE.md` completely. Key rules:
- Use frontend-specialist for UI work
- Use claude-integration-specialist for AI integration
- Use database-specialist for schema/migrations
- NEVER edit code directly without subagent

### Step 4: Start with Database
**Use database-specialist subagent** to:
1. Create Supabase migration files
2. Set up schema (tags, texts, text_tags tables)
3. Create seed data (15 tags, 3 test jokes)

### Step 5: Then Frontend
**Use frontend-specialist subagent** to:
1. Set up project structure
2. Create components (TextCard, SearchBar, etc.)
3. Implement Supabase queries

### Step 6: Then AI Integration
**Use claude-integration-specialist subagent** to:
1. Set up Anthropic SDK
2. Implement auto-tagging function
3. Design prompts for tag analysis

---

## Important Patterns to Follow

### Using Subagents (MANDATORY)
```
❌ WRONG:
Edit src/components/TextCard.tsx directly

✅ CORRECT:
Task tool with subagent_type: "frontend-specialist"
Prompt: "Create TextCard component with tags display"
```

### Using Skills
```
# First time setup
Skill: "project-setup"

# Reset database during development
Skill: "db-reset"
```

### Using Context7 MCP
```
# Look up API documentation
Query Context7: "How do I query nested relations in Supabase?"
Query Context7: "What parameters does Anthropic messages.create accept?"
```

---

## The Monitoring System

### How It Works
1. Before you use any tool → `pre-tool-use.sh` logs it
2. After tool completes → `post-tool-use.sh` logs result
3. All logged to `.claude/logs/tool-usage.log`

### Recent Improvements
The `pre-tool-use.sh` hook was improved with better JSON parsing:
- Now handles multiple JSON format variations
- Detects subagent usage more reliably
- Tries both quoted and unquoted parameter formats
- All monitoring tests passed successfully ✅

### What Gets Logged
- ✅ Tool usage (Read, Edit, Write, Bash, etc.)
- ✅ Subagent calls (frontend-specialist, etc.)
- ✅ Skills execution (project-setup, db-reset)
- ✅ MCP queries (Context7)
- ⚠️ Violations (editing without subagent)

### Terminal Output Colors
- 🔵 BLUE = Tool usage
- 💜 MAGENTA = Subagent call
- 🟢 GREEN = Skill/Good practice
- 🔴 RED = Error
- 🟡 YELLOW = Warning/Violation

### Checking Logs
```bash
# View full log
cat .claude/logs/tool-usage.log

# Follow in real-time
tail -f .claude/logs/tool-usage.log

# Check violations
grep "WARNING" .claude/logs/tool-usage.log
```

---

## Common Mistakes to Avoid

### ❌ DON'T:
1. Edit React components directly without frontend-specialist
2. Edit Claude API code without claude-integration-specialist
3. Create migrations without database-specialist
4. Ignore terminal warnings
5. Use any UI library except shadcn/ui
6. Use `any` types in TypeScript
7. Write inline styles
8. Skip loading/error states

### ✅ DO:
1. Read CLAUDE.md first
2. Use appropriate subagent for every task
3. Watch terminal for feedback
4. Review logs regularly
5. Follow the monitoring system guidance
6. Use Context7 for documentation
7. Keep components small and focused
8. Implement proper TypeScript types

---

## Git Status

### Local Repository (living-tags-poc)
- Configuration committed: `351e05b`
- Not pushed (authentication issue with direct GitHub access)
- Remote URL: `http://local_proxy@127.0.0.1:45272/git/aiaiai-copilot/living-tags-poc`

### Backup Location
- Repository: showcase-sbp-payment-fullstack
- Branch: `claude/living-tags-poc-config-011CV2RzoXmzQd84psMXH7DX`
- Status: Successfully pushed

**User will handle transferring files to living-tags-poc repository.**

---

## Development Branch Information

According to session context, work on:
```
Branch: claude/start-living-tags-project-011CV2RzoXmzQd84psMXH7DX
```

When you commit and push, use this branch name format with session ID.

---

## First Tasks for New Session

1. **Verify you can read CLAUDE.md**
   - It should appear in system context
   - Contains all the rules

2. **Check monitoring is active**
   - Try reading a file
   - Check terminal for log output
   - Verify `.claude/logs/tool-usage.log` exists

3. **Start with database setup**
   - Use database-specialist subagent
   - Create migration files in `supabase/migrations/`
   - Follow the schema from `docs/poc-specification.md`

4. **Monitor yourself**
   - Watch terminal feedback
   - Check if you're using subagents correctly
   - Review logs after each major step

---

## Success Criteria

You're doing it RIGHT when:
- ✅ Terminal shows "✅ SUBAGENT Using [name]" frequently
- ✅ Log file has many SUBAGENT entries
- ✅ Few or no WARNING entries in logs
- ✅ All React code created via frontend-specialist
- ✅ All database code via database-specialist
- ✅ All AI code via claude-integration-specialist

You're doing it WRONG when:
- ❌ Terminal shows "⚠️ REMINDER" warnings
- ❌ You're using Edit/Write directly on components
- ❌ Log shows many WARNING entries
- ❌ No SUBAGENT entries in logs
- ❌ Ignoring the monitoring feedback

---

## Questions to Ask User

If unclear, ask:
1. "Should I use [subagent-name] for this task?" (But you should already know!)
2. "I see a warning about direct editing - should I switch to using the subagent?"
3. "The monitoring system flagged this - should I change my approach?"

**But honestly, the rules are clear in CLAUDE.md - follow them!**

---

## Final Reminders

🔴 **CRITICAL:** The monitoring system exists because in previous projects, Claude Code created subagents and then COMPLETELY IGNORED THEM. Don't make the same mistake!

🟢 **ALWAYS:** Use the Task tool with appropriate subagent_type

🟡 **WATCH:** Terminal feedback and log files

🔵 **READ:** CLAUDE.md before starting any work

---

## Summary

**What you have:**
- Complete Claude Code configuration (tested ✅)
- 3 specialized subagents ready to use
- 2 skills for workflows
- Context7 MCP for docs
- Monitoring system to keep you honest

**What you need to do:**
- Read CLAUDE.md
- Read docs/poc-specification.md
- Use database-specialist to create schema
- Use frontend-specialist to build UI
- Use claude-integration-specialist for AI
- FOLLOW THE RULES!

**The goal:**
Build a working PoC of AI-powered text tagging for Russian jokes using Claude API, while demonstrating proper use of Claude Code's subagent system.

---

Good luck! The monitoring system has your back. Trust it, follow it, and you'll build quality code while using the tools correctly.

**Remember: The subagents exist to be USED, not ignored!**

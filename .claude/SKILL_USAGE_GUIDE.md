# Skill Usage Guide

## Critical Understanding: How Skills Work

Skills in Claude Code are **NOT automatically executed**. They are **knowledge repositories** that must be explicitly loaded into context.

## The Problem That Was Fixed

Previously, the `/dev-setup` command said:
```
4. Set up shadcn/ui (invoke shadcn-ui skill)
```

But Claude **did not invoke the skill**. Why?

### Skills Are NOT Like Functions

Skills don't run automatically when mentioned. They work like this:

**❌ WRONG - Skills don't auto-invoke:**
```markdown
Step 4: Set up shadcn/ui (invoke shadcn-ui skill)
```
Claude reads this, ignores the skill, and just does the work manually.

**✅ CORRECT - Explicitly state skill usage:**
```markdown
Step 4: **Say: "I will use the shadcn-ui skill to set up shadcn/ui"** then follow the skill's procedures
```
Claude reads this, says "I will use the shadcn-ui skill", which triggers loading that skill's knowledge.

## How to Use Skills

### Method 1: In Commands (Recommended)

```markdown
**Say: "I will use the [skill-name] skill to [task]"** then follow the skill's procedures
```

This forces Claude to explicitly mention the skill, which loads it.

### Method 2: In User Prompts

User says:
```
Use the shadcn-ui skill to add a button component
```

Claude responds:
```
I'll use the shadcn-ui skill to add a button component.
[Skill knowledge is now loaded]
```

### Method 3: Automatic Triggering (Unreliable)

Skills *may* auto-trigger if their description matches the current task, but this is not guaranteed.

**Don't rely on automatic triggering for critical workflows.**

## Available Skills in This Project

### 1. shadcn-ui
**Trigger phrase:** "I will use the shadcn-ui skill"

**Use for:**
- Installing shadcn/ui components
- Component configuration
- Theming setup
- Troubleshooting component issues

**Example:**
```
I will use the shadcn-ui skill to add a Card component to the frontend.
```

### 2. openapi-sync
**Trigger phrase:** "I will use the openapi-sync skill"

**Use for:**
- Setting up openapi-typescript
- Configuring type generation scripts
- Generating types from OpenAPI specs
- CI/CD integration for types

**Example:**
```
I will use the openapi-sync skill to configure automatic type generation from the OpenAPI specs.
```

### 3. yookassa-test
**Trigger phrase:** "I will use the yookassa-test skill"

**Use for:**
- Creating YooKassa mock responses
- Generating webhook test data
- Setting up MSW/Vitest mocks
- Testing payment flows

**Example:**
```
I will use the yookassa-test skill to create mock webhook data for payment.succeeded event.
```

## Hooks That Help

The `skill-usage-reminder` hook in `.claude/settings.json` will remind you when a skill might be useful:

**Triggers on these keywords:**
- `shadcn`, `component`, `ui` → Suggests shadcn-ui skill
- `type generation`, `openapi type` → Suggests openapi-sync skill
- `yookassa`, `mock`, `test payment` → Suggests yookassa-test skill

**Hook output:**
```
💡 Skill available: Use 'shadcn-ui' skill for component setup
```

## Updated Slash Commands

All slash commands that need skills now include explicit instructions:

### /dev-setup
```
**Say: "I will use the shadcn-ui skill to set up shadcn/ui"**
**Say: "I will use the openapi-sync skill to configure type generation"**
```

This ensures skills are properly loaded during execution.

## Best Practices

### ✅ DO:
1. **Explicitly state skill usage** - "I will use the [skill] skill"
2. **Follow skill procedures** - Once loaded, reference the skill's steps
3. **Use skills for standardized tasks** - Components, types, mocks
4. **Check hook reminders** - They suggest when skills might help

### ❌ DON'T:
1. **Assume skills auto-invoke** - They don't
2. **Write "invoke skill"** - This doesn't trigger loading
3. **Duplicate skill knowledge** - Use the skill instead
4. **Ignore skill suggestions** - Hooks are there to help

## Testing Skill Invocation

To verify a skill is loaded:

**Test command:**
```
Use the shadcn-ui skill to explain how to add a Button component
```

**Expected behavior:**
1. Claude says: "I'll use the shadcn-ui skill..."
2. Claude references the skill's content
3. Response includes details from `.claude/skills/shadcn-ui/Skill.md`

**If skill NOT loaded:**
1. Claude gives generic answer
2. No reference to skill procedures
3. May miss skill-specific details

## Why This Matters

**Without proper skill loading:**
- ❌ Knowledge duplication
- ❌ Inconsistent procedures
- ❌ Skills become useless
- ❌ READMEs bloated with redundant info

**With proper skill loading:**
- ✅ Single source of truth
- ✅ Reusable procedures
- ✅ Consistent outcomes
- ✅ Efficient documentation

## Summary

**Key takeaway:** Skills are explicit knowledge loading, not automatic function calls.

**To invoke a skill:** Say its name out loud in your response.

**Command pattern:**
```markdown
**Say: "I will use the [skill-name] skill to [task]"** then follow procedures
```

**This ensures the skill's knowledge is loaded and used.**

---

## 🔍 Skill Usage Tracking System

To ensure skills are actually being used (not bypassed), we've implemented a **complete tracking system**.

### How It Works

**1. Automatic Logging in Commands**

Commands that use skills automatically log invocations:
```bash
echo "$(date -Iseconds): shadcn-ui invoked by /dev-setup (frontend)" >> .claude/skill-usage.log
```

**2. Self-Reporting in Subagents**

Subagents are instructed to:
- State explicitly: "I will use the [skill] skill"
- Log usage: `echo "$(date -Iseconds): [skill] used by [subagent] for [task]" >> .claude/skill-usage.log`
- Confirm: "✅ Used [skill] skill for [task]"

**3. Audit with /skills-report**

View skill usage statistics:
```
/skills-report                # Full report
/skills-report shadcn-ui      # Filter by skill
/skills-report 2025-10-30     # Filter by date
```

### What Gets Tracked

**Log Format:**
```
2025-10-30T15:23:45+00:00: shadcn-ui invoked by /dev-setup (frontend)
2025-10-30T15:24:12+00:00: yookassa-test used by test-engineer for mock data
```

**Tracked Information:**
- **When:** ISO 8601 timestamp
- **What:** Skill name
- **How:** "invoked by" (commands) or "used by" (subagents)
- **Who:** Source (command or subagent name)
- **Why:** Context (task description)

### Verification Methods

**Method 1: Check Log Directly**
```bash
cat .claude/skill-usage.log
tail -20 .claude/skill-usage.log
grep "shadcn-ui" .claude/skill-usage.log
```

**Method 2: Use /skills-report**
```
/skills-report
```

Shows:
- Total invocations
- Usage by skill
- Usage by source (commands vs subagents)
- Recent entries
- Insights and patterns

**Method 3: Watch Claude's Response**

Look for:
- ✅ "I will use the [skill] skill..." statement
- ✅ Skill-specific content in response
- ✅ Confirmation: "✅ Used [skill] skill"
- ❌ Missing these = skill was bypassed

### Benefits

**Before Tracking:**
- ❌ No visibility into skill usage
- ❌ Can't verify skills were used
- ❌ Skills could be bypassed silently

**With Tracking:**
- ✅ Full audit trail of skill usage
- ✅ Can verify skills are being used
- ✅ Identify unused skills
- ✅ Measure skill effectiveness
- ✅ Accountability for skill invocation

### Example Workflow

**1. Run command that uses skills:**
```
/dev-setup frontend
```

**2. Claude's response includes:**
```
I will use the shadcn-ui skill to set up shadcn/ui components.

[Logs: 2025-10-30T15:23:45+00:00: shadcn-ui invoked by /dev-setup (frontend)]

[Follows skill procedures...]

✅ Used shadcn-ui skill for component setup.
```

**3. Check tracking:**
```
/skills-report
```

**4. Verify log entry:**
```bash
grep "shadcn-ui" .claude/skill-usage.log
# Output: 2025-10-30T15:23:45+00:00: shadcn-ui invoked by /dev-setup (frontend)
```

### Troubleshooting

**Skill used but not logged?**
- Check `.claude/skill-usage.log` exists
- Verify command/subagent includes logging step
- Ensure echo command has write permissions

**Log file doesn't exist?**
- Created automatically on first skill use
- Or create manually: `touch .claude/skill-usage.log`

**Can't see recent entries?**
- Use: `tail -20 .claude/skill-usage.log`
- Or: `/skills-report`

### Maintenance

**Clearing Old Logs:**
```bash
# Backup old log
cp .claude/skill-usage.log .claude/skill-usage.log.backup

# Start fresh
echo "# Skill Usage Log - Started $(date)" > .claude/skill-usage.log
```

**Analyzing Patterns:**
```bash
# Most used skill
cat .claude/skill-usage.log | grep -o "shadcn-ui\|openapi-sync\|yookassa-test" | sort | uniq -c | sort -rn

# Usage over time
grep "2025-10-30" .claude/skill-usage.log | wc -l
```

---

**Updated:** After implementing complete skill tracking system
**Author:** Claude Code Configuration

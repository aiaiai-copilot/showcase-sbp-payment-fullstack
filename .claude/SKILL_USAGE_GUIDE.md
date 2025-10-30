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

**Updated:** After fixing the /dev-setup command to properly invoke skills
**Author:** Claude Code Configuration

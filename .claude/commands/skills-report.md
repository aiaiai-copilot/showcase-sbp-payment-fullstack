Show skill usage statistics and audit trail.

Arguments: $ARGUMENTS (optional: filter by skill name or date)

Execute the following steps:

1. Check if `.claude/skill-usage.log` exists
   - If not, report: "No skill usage tracked yet. Skills will be logged as they're used."

2. If arguments provided, filter log entries:
   - By skill name: `grep -i "$ARGUMENTS" .claude/skill-usage.log`
   - By date: `grep "$ARGUMENTS" .claude/skill-usage.log`

3. Display recent skill usage (last 20 entries):
   ```bash
   tail -20 .claude/skill-usage.log
   ```

4. Calculate and display statistics:
   - Total skill invocations: `wc -l .claude/skill-usage.log`
   - Usage by skill:
     ```bash
     cat .claude/skill-usage.log | grep -o "shadcn-ui\|openapi-sync\|yookassa-test" | sort | uniq -c | sort -rn
     ```
   - Usage by source (commands vs subagents):
     ```bash
     cat .claude/skill-usage.log | grep -o "invoked by\|used by" | sort | uniq -c
     ```

5. Display summary:
   ```
   📊 Skill Usage Summary
   ━━━━━━━━━━━━━━━━━━━━━━
   Total invocations: [count]

   By Skill:
   • shadcn-ui: [count]
   • openapi-sync: [count]
   • yookassa-test: [count]

   By Context:
   • Commands: [count]
   • Subagents: [count]

   Recent usage (last 20):
   [log entries]
   ```

6. Provide insights:
   - Which skills are most used
   - Which skills are unused (suggest removing or improving)
   - Usage patterns (commands vs interactive)

**Usage examples:**
```
/skills-report                    # Full report
/skills-report shadcn-ui          # Filter by skill
/skills-report 2025-10-30         # Filter by date
```

**Purpose:** Verify skills are being used, not bypassed. Track skill adoption and effectiveness.

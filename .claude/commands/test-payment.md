Test the complete payment flow using mock data.

Arguments: $ARGUMENTS (optional: custom amount in RUB, default 100)

**CRITICAL: Use the yookassa-test skill for creating mock data and webhook notifications.**

Execute the following steps:

1. Check if backend is running, if not, provide instructions to start it
2. Parse amount from arguments or use default 100 RUB
3. Create a test payment via API: `POST /api/payments` with amount
4. Display the payment ID and confirmation URL
5. **Say: "I will use the yookassa-test skill to simulate webhook notification"**
   - Log usage: `echo "$(date -Iseconds): yookassa-test invoked by /test-payment (amount: $ARGUMENTS)" >> .claude/skill-usage.log`
6. Use the skill's webhook examples to create appropriate webhook payload
7. Send webhook to backend: `POST /api/webhooks/yookassa`
8. Poll payment status every 2 seconds for up to 30 seconds: `GET /api/payments/{id}`
9. Report the final payment status (succeeded/canceled/pending)
10. Verify the flow matches the OpenAPI specification
11. Report: "✅ yookassa-test skill was used for webhook simulation"

This command tests the end-to-end payment flow without requiring manual intervention.

**Usage examples:**
```
/test-payment           # Test with 100 RUB
/test-payment 250       # Test with 250 RUB
```

**REMEMBER: Explicitly invoke yookassa-test skill to ensure correct webhook format.**

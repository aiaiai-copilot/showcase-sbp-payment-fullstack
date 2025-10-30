Test the complete payment flow using mock data.

Execute the following steps:

1. Check if backend is running, if not, provide instructions to start it
2. Create a test payment with amount 100 RUB
3. Display the payment ID and confirmation URL
4. Poll payment status every 2 seconds for up to 30 seconds
5. Report the final payment status (succeeded/canceled/pending)
6. If using mocks, simulate webhook notification
7. Verify the flow matches the OpenAPI specification

This command tests the end-to-end payment flow without requiring manual intervention.

You can specify a custom amount as an argument: `/test-payment 250`

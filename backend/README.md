# YooKassa Payment Backend

Node.js + Fastify + TypeScript backend for YooKassa payment integration.

## Tech Stack

- **Node.js** v22.18.0 - Runtime
- **Fastify** - Web framework
- **TypeScript** - Type safety
- **YooKassa API** - Payment processing
- **Vitest** - Testing framework
- **In-memory storage** - Demo mode (no database)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your YooKassa test credentials:

```bash
YOOKASSA_SHOP_ID=your_test_shop_id
YOOKASSA_SECRET_KEY=test_your_secret_key
```

**Important:** Only use test credentials (secret key must start with `test_`).

### 3. Generate Types from OpenAPI

```bash
npm run generate:types
```

This generates TypeScript types from both OpenAPI specs:
- `../specs/frontend-backend-api.yaml` → `src/types/api.ts`
- `../specs/yookassa-webhook-api.yaml` → `src/types/webhook.ts`

### 4. Start Development Server

```bash
npm run dev
```

Backend will be available at http://localhost:3000

## Getting YooKassa Test Credentials

1. Register at https://yookassa.ru/
2. Navigate to **Integration** → **API**
3. Create a test shop
4. Copy:
   - Shop ID (numeric)
   - Secret Key (starts with `test_`)
5. Add to `.env` file

## Project Structure

```
backend/
├── src/
│   ├── routes/
│   │   ├── payments.ts     # Payment endpoints
│   │   └── webhooks.ts     # Webhook handlers
│   ├── services/
│   │   ├── yookassa.ts     # YooKassa API client
│   │   └── storage.ts      # In-memory storage
│   ├── types/
│   │   ├── api.ts          # Generated from frontend-backend API
│   │   ├── webhook.ts      # Generated from webhook API
│   │   └── payment.ts      # Internal types
│   ├── utils/
│   │   └── validators.ts   # Validation helpers
│   ├── tests/
│   │   └── contracts/      # Contract tests
│   ├── config.ts           # Configuration
│   └── server.ts           # Fastify app
├── vitest.config.ts        # Test configuration
├── tsconfig.json           # TypeScript configuration
└── package.json
```

## Development

### Type Checking

```bash
npm run type-check
```

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

### Building

```bash
npm run build
```

Output will be in `dist/` directory.

### Starting Production Build

```bash
npm start
```

## API Endpoints

### Health Check
```
GET /health
Response: { "status": "ok", "timestamp": "..." }
```

### Create Payment
```
POST /api/payments
Body: { "amount": 100 }
Response: {
  "id": "pay_123",
  "status": "pending",
  "confirmationUrl": "https://...",
  "amount": 100,
  "createdAt": "..."
}
```

### Get Payment Status
```
GET /api/payments/:id
Response: {
  "id": "pay_123",
  "status": "succeeded",
  "confirmationUrl": "https://...",
  "amount": 100,
  "createdAt": "..."
}
```

### YooKassa Webhook
```
POST /api/webhooks/yookassa
Body: { "type": "notification", "event": "payment.succeeded", "object": {...} }
Response: 200 OK
```

## Writing Contract Tests

Contract tests ensure the backend matches both OpenAPI specifications:

```typescript
// src/tests/contracts/api.test.ts
import { describe, test, expect } from 'vitest';
import { OpenAPIValidator } from 'jest-openapi';
import frontendSpec from '../../../specs/frontend-backend-api.yaml';
import webhookSpec from '../../../specs/yookassa-webhook-api.yaml';

const frontendValidator = new OpenAPIValidator(frontendSpec);
const webhookValidator = new OpenAPIValidator(webhookSpec);

describe('API Contracts', () => {
  test('POST /api/payments validates', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/payments',
      payload: { amount: 100 }
    });

    expect(frontendValidator.validateResponse(
      response.json(),
      '/api/payments',
      'post',
      201
    )).toBeValid();
  });
});
```

## YooKassa API Integration

### Authentication

```typescript
const auth = Buffer.from(
  `${config.yookassa.shopId}:${config.yookassa.secretKey}`
).toString('base64');

const headers = {
  'Authorization': `Basic ${auth}`,
  'Content-Type': 'application/json',
  'Idempotency-Key': generateUniqueKey(),
};
```

### Create Payment

```typescript
POST https://api.yookassa.ru/v3/payments
Headers:
  Authorization: Basic {base64(shopId:secretKey)}
  Idempotency-Key: {unique-key}
  Content-Type: application/json

Body:
{
  "amount": {
    "value": "100.00",
    "currency": "RUB"
  },
  "confirmation": {
    "type": "qr"
  },
  "capture": true,
  "description": "Payment description"
}
```

### Get Payment

```typescript
GET https://api.yookassa.ru/v3/payments/{payment_id}
Headers:
  Authorization: Basic {base64(shopId:secretKey)}
```

## Webhook Processing

YooKassa sends webhook notifications for payment events:

- `payment.succeeded` - Payment completed successfully
- `payment.canceled` - Payment was canceled
- `payment.waiting_for_capture` - Payment authorized, waiting for capture

**Important:** Always return `200 OK` to acknowledge webhook receipt.

## Setting Up Webhooks (Local Development)

Use ngrok for local webhook testing:

```bash
# Install ngrok
npm install -g ngrok

# Start tunnel
ngrok http 3000

# Copy public URL (e.g., https://abc123.ngrok.io)
```

Configure in YooKassa dashboard:
1. Go to **Integration** → **HTTP Notifications**
2. Set URL: `https://abc123.ngrok.io/api/webhooks/yookassa`
3. Enable events:
   - payment.succeeded
   - payment.canceled
   - payment.waiting_for_capture

## Error Handling

Consistent error response format:

```typescript
{
  "error": {
    "code": "PAYMENT_NOT_FOUND",
    "message": "Payment not found",
    "details": {...}  // optional
  }
}
```

HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error
- 502: YooKassa API error

## Security

**IMPORTANT:**
- ✅ Only use test YooKassa keys (prefix: `test_`)
- ✅ Never commit secrets to git
- ✅ Validate all input data
- ✅ Use CORS with specific origins
- ✅ Never log sensitive data
- ❌ No real payments in this demo
- ❌ No production keys allowed

## Logging

Use Fastify logger:

```typescript
fastify.log.info({ paymentId }, 'Payment created');
fastify.log.error({ error }, 'Payment failed');
```

**Never log:**
- API keys
- Complete YooKassa responses
- Sensitive user data

## Important Reminders

✅ Always validate against BOTH OpenAPI specs
✅ Use TypeScript strict mode, no `any`
✅ Test mode only (test YooKassa keys)
✅ Handle YooKassa API errors gracefully
✅ Return 200 OK for webhooks
✅ Implement idempotency for payment creation

## Troubleshooting

### Port already in use

```bash
lsof -ti:3000 | xargs kill
# or use different port
PORT=3001 npm run dev
```

### YooKassa API errors

- Verify credentials in `.env`
- Check secret key starts with `test_`
- Review YooKassa API documentation
- Check request format matches YooKassa requirements

### Type errors after spec changes

Regenerate types:
```bash
npm run generate:types
```

## Resources

- [Fastify Documentation](https://fastify.dev)
- [YooKassa API Docs](https://yookassa.ru/developers/api)
- [Vitest Documentation](https://vitest.dev)
- [OpenAPI TypeScript](https://github.com/drwpow/openapi-typescript)

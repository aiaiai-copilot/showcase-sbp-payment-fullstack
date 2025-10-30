# Task: Backend for YooKassa Integration Demo

## Project Context

Development of a demo application for portfolio showcasing integration with YooKassa payment system (SBP payment).

**Purpose:** Show potential clients (small businesses, startups) professional mastery of server-side development and external API integration.

**Approach:** API First, monorepo with independent Frontend and Backend development.

## Monorepo Structure

```
/
├── frontend/           (developed separately)
├── backend/            ← YOUR CODE HERE
└── specs/              (OpenAPI specifications)
    ├── frontend-backend-api.yaml
    └── yookassa-webhook-api.yaml
```

## Tech Stack

### Required
- **Node.js**: v22.18.0
- **Fastify**: latest stable version compatible with Node v22.18.0
- **TypeScript**: latest stable version

### Additional Libraries
- **@fastify/cors** - for CORS
- **@fastify/env** - for environment variables (optional)
- **axios** or **undici** - for HTTP requests to YooKassa API
- **uuid** - for ID generation (if needed)
- **dotenv** - for .env files

### Testing
- **Vitest** - test runner
- **jest-openapi** - for contract testing (REQUIRED)
- **supertest** or similar - for HTTP tests

### Data Storage
**In-memory storage** (Map or simple object) for payments.

**Data Format:**
```typescript
interface Payment {
  id: string;
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled';
  amount: {
    value: string;  // "100.00"
    currency: 'RUB';
  };
  confirmation?: {
    type: 'qr';
    confirmation_url: string;
  };
  description?: string;
  test: boolean;
  created_at: string;  // ISO 8601
  paid_at?: string;    // ISO 8601
  yookassa_id?: string; // Payment ID in YooKassa
}
```

## API Contracts

### 1. Frontend → Backend API
**Specification:** `specs/frontend-backend-api.yaml` (OpenAPI 3.0.1)

**Endpoints:**

#### POST /api/payments
Create new payment in YooKassa.

**Request:**
```json
{
  "amount": 100.00,
  "description": "Test payment"  // optional
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "status": "pending",
  "amount": {
    "value": "100.00",
    "currency": "RUB"
  },
  "confirmation": {
    "type": "qr",
    "confirmation_url": "https://yoomoney.ru/checkout/payments/v2/contract?orderId=..."
  },
  "description": "Test payment",
  "test": true,
  "created_at": "2025-10-30T10:30:00.000Z"
}
```

**Logic:**
1. Validate input data (amount > 0)
2. Create payment in YooKassa API (test mode)
3. Save payment in in-memory storage
4. Return data to client

**Errors:**
- 400: invalid data
- 500: YooKassa payment creation error

#### GET /api/payments/:id
Get payment status.

**Response 200:**
```json
{
  "id": "uuid",
  "status": "succeeded",
  "amount": {
    "value": "100.00",
    "currency": "RUB"
  },
  "description": "Test payment",
  "test": true,
  "created_at": "2025-10-30T10:30:00.000Z",
  "paid_at": "2025-10-30T10:32:15.000Z"
}
```

**Logic:**
1. Find payment in storage by ID
2. Return current data

**Errors:**
- 404: payment not found
- 500: internal error

### 2. YooKassa → Backend Webhook API
**Specification:** `specs/yookassa-webhook-api.yaml` (OpenAPI 3.0.1)

#### POST /api/webhooks/yookassa
Receive notifications from YooKassa about payment events.

**Request from YooKassa:**
```json
{
  "type": "notification",
  "event": "payment.succeeded",
  "object": {
    "id": "2c0b3e86-000f-5000-8000-18db351245c7",
    "status": "succeeded",
    "paid": true,
    "amount": {
      "value": "100.00",
      "currency": "RUB"
    },
    "created_at": "2025-10-30T10:30:00.000Z",
    "captured_at": "2025-10-30T10:32:15.000Z",
    "test": true,
    "payment_method": {
      "type": "sbp",
      "id": "...",
      "title": "SBP"
    }
  }
}
```

**Response 200:**
```json
{
  "success": true
}
```

**Logic:**
1. Receive notification from YooKassa
2. Find payment in storage by `object.id` (this is yookassa_id)
3. Update payment status and other fields
4. Return HTTP 200 (REQUIRED, otherwise YooKassa will retry)

**Events:**
- `payment.succeeded` → status = 'succeeded', save paid_at
- `payment.canceled` → status = 'canceled'
- `payment.waiting_for_capture` → status = 'waiting_for_capture'

## YooKassa API Integration

### Authentication
**Basic Auth** using:
- **Username:** `shopId` (from environment variables)
- **Password:** `secretKey` (from environment variables)

**Header:**
```
Authorization: Basic <base64(shopId:secretKey)>
```

### API Endpoint
**Base URL:** `https://api.yookassa.ru/v3`

### Create Payment

**Documentation:** https://yookassa.ru/developers/api#create_payment

**Endpoint:**
```
POST https://api.yookassa.ru/v3/payments
```

**Headers:**
```
Authorization: Basic <credentials>
Content-Type: application/json
Idempotence-Key: <unique_key>  // UUID for idempotency
```

**Request Body:**
```json
{
  "amount": {
    "value": "100.00",
    "currency": "RUB"
  },
  "confirmation": {
    "type": "qr"
  },
  "capture": true,
  "description": "Test payment",
  "test": true
}
```

**Response 200:**
```json
{
  "id": "2c0b3e86-000f-5000-8000-18db351245c7",
  "status": "pending",
  "amount": {
    "value": "100.00",
    "currency": "RUB"
  },
  "confirmation": {
    "type": "qr",
    "confirmation_url": "https://yoomoney.ru/checkout/payments/v2/contract?orderId=..."
  },
  "created_at": "2025-10-30T10:30:00.000Z",
  "test": true,
  "paid": false,
  "refundable": false
}
```

### Get Payment Information (optional)

**Endpoint:**
```
GET https://api.yookassa.ru/v3/payments/{payment_id}
```

Can be used for status synchronization, but main method is via webhooks.

## Project Setup

### Environment Variables
Create `.env` in `backend/`:
```env
# Server
PORT=3000
NODE_ENV=development

# YooKassa
YOOKASSA_SHOP_ID=your_test_shop_id
YOOKASSA_SECRET_KEY=test_your_secret_key

# Webhook
YOOKASSA_WEBHOOK_URL=https://your-domain.com/api/webhooks/yookassa

# CORS
FRONTEND_URL=http://localhost:5173
```

**IMPORTANT:** For test mode, `YOOKASSA_SECRET_KEY` must start with `test_`

### Development Port
Backend: **3000**

### CORS Configuration
Allow requests from `http://localhost:5173` (Frontend URL)

```typescript
import cors from '@fastify/cors';

await fastify.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
});
```

## Code Structure

### Recommended Organization
```
backend/
├── src/
│   ├── routes/
│   │   ├── payments.ts          // POST /api/payments, GET /api/payments/:id
│   │   └── webhooks.ts          // POST /api/webhooks/yookassa
│   ├── services/
│   │   ├── yookassa.service.ts  // YooKassa API integration
│   │   └── payment.service.ts   // Payment business logic
│   ├── storage/
│   │   └── payments.storage.ts  // In-memory storage
│   ├── types/
│   │   ├── payment.ts           // TypeScript types
│   │   └── yookassa.ts          // YooKassa API types
│   ├── utils/
│   │   ├── logger.ts            // Logging
│   │   └── errors.ts            // Error handling
│   ├── config/
│   │   └── env.ts               // Environment configuration
│   ├── app.ts                   // Fastify app
│   └── server.ts                // Entry point
├── tests/
│   ├── contracts/
│   │   ├── frontend-backend.contract.test.ts
│   │   └── yookassa-webhook.contract.test.ts
│   ├── integration/
│   │   ├── payments.test.ts
│   │   └── webhooks.test.ts
│   └── unit/
│       ├── yookassa.service.test.ts
│       └── payment.service.test.ts
├── .env
├── .env.example
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## Testing

### Contract Testing (REQUIRED)
Use **jest-openapi** to verify compliance with BOTH API contracts.

**Installation:**
```bash
npm install --save-dev jest-openapi
```

**Test Example for Frontend-Backend Contract:**
```typescript
import jestOpenAPI from 'jest-openapi';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { build } from '../src/app';

const spec = readFileSync(
  resolve(__dirname, '../../specs/frontend-backend-api.yaml'),
  'utf8'
);
jestOpenAPI(spec);

describe('Frontend-Backend API Contract', () => {
  let app;

  beforeAll(async () => {
    app = await build();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/payments satisfies spec', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/payments',
      payload: {
        amount: 100.00,
        description: 'Test payment'
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toSatisfyApiSpec();
  });

  it('GET /api/payments/{id} satisfies spec', async () => {
    // First create payment
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/payments',
      payload: { amount: 100.00 }
    });
    const { id } = createResponse.json();

    // Get status
    const response = await app.inject({
      method: 'GET',
      url: `/api/payments/${id}`
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toSatisfyApiSpec();
  });

  it('GET /api/payments/{id} returns 404 for non-existent payment', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/payments/non-existent-id'
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toSatisfyApiSpec();
  });
});
```

**Test Example for YooKassa Webhook Contract:**
```typescript
import jestOpenAPI from 'jest-openapi';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { build } from '../src/app';

const spec = readFileSync(
  resolve(__dirname, '../../specs/yookassa-webhook-api.yaml'),
  'utf8'
);
jestOpenAPI(spec);

describe('YooKassa Webhook API Contract', () => {
  let app;

  beforeAll(async () => {
    app = await build();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/webhooks/yookassa accepts payment.succeeded', async () => {
    const webhookPayload = {
      type: 'notification',
      event: 'payment.succeeded',
      object: {
        id: '2c0b3e86-000f-5000-8000-18db351245c7',
        status: 'succeeded',
        paid: true,
        amount: {
          value: '100.00',
          currency: 'RUB'
        },
        created_at: '2025-10-30T10:30:00.000Z',
        captured_at: '2025-10-30T10:32:15.000Z',
        test: true,
        payment_method: {
          type: 'sbp',
          id: '2c0b3e86-000f-5000-8000-1d1b379523c8',
          saved: false,
          title: 'SBP'
        }
      }
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/webhooks/yookassa',
      payload: webhookPayload
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toSatisfyApiSpec();
  });
});
```

### Integration Tests
- Test interaction between routes → services → storage
- Mock external APIs (YooKassa)
- Verify correct data processing

### Unit Tests
- Test services in isolation
- Test utilities
- High coverage of critical logic

## Error Handling

### Standard Error Format
```json
{
  "error": {
    "code": "error_code",
    "message": "Error description"
  }
}
```

### Error Types
- **400 Bad Request:** invalid input data
- **404 Not Found:** payment not found
- **500 Internal Server Error:** server error or YooKassa API error

### Logging
- Log all incoming requests
- Log YooKassa API requests
- Log errors with stack trace
- Use levels: info, warn, error

## Security

### Data Validation
- Validate all incoming data
- Use JSON Schema or Zod
- String sanitization

### Webhook Security
Optional: verify sender IP addresses (YooKassa).

**YooKassa IP List:**
```
185.71.76.0/27
185.71.77.0/27
77.75.153.0/25
77.75.154.128/25
```

### Secrets
- Don't commit .env files
- Use .env.example with placeholder values
- Store secrets in environment variables

## Additional Requirements

### TypeScript
- Strict mode (`strict: true`)
- Type all functions, parameters, responses
- Use interfaces for API models

### Code Quality
- ESLint configuration
- Prettier for formatting
- Clear variable and function names
- Comments for complex business logic

### README
Create `backend/README.md` with:
- Project description
- Architecture (components, data flows)
- Dependency installation instructions
- Environment variable setup
- Dev server startup commands
- Test execution commands
- API request examples (curl or httpie)

### Health Check
Add endpoint:
```
GET /health

Response 200:
{
  "status": "ok",
  "timestamp": "2025-10-30T10:30:00.000Z"
}
```

## Acceptance Criteria

### Functionality
- ✅ POST /api/payments creates payment in YooKassa
- ✅ GET /api/payments/:id returns status
- ✅ POST /api/webhooks/yookassa processes notifications
- ✅ In-memory storage works correctly
- ✅ Error handling implemented
- ✅ CORS configured for Frontend

### Testing
- ✅ Contract tests for both APIs work
- ✅ Integration tests cover main flows
- ✅ Unit tests for services
- ✅ All tests pass (`npm test`)
- ✅ Minimum 70% code coverage

### Documentation
- ✅ README.md created and up-to-date
- ✅ .env.example with variable descriptions
- ✅ Code with comments
- ✅ API endpoints documented (JSDoc possible)

### Code
- ✅ TypeScript without errors (`npm run build`)
- ✅ ESLint without errors
- ✅ Readable project structure
- ✅ Proper async/await handling

## Important Reminders

1. **Monorepo:** Backend code must be in `backend/` directory
2. **API First:** Strictly follow BOTH specifications
3. **Contract Testing:** Must verify contract compliance
4. **Test Mode:** Use YooKassa test keys (start with `test_`)
5. **Webhook:** Always return HTTP 200 when receiving notification
6. **In-memory:** Data lives only while server runs (normal for demo)
7. **Security:** Don't commit real secrets

## Useful Links

- [YooKassa API Documentation](https://yookassa.ru/developers/api)
- [YooKassa Webhooks](https://yookassa.ru/developers/using-api/webhooks)
- [Fastify Documentation](https://fastify.dev/)
- [jest-openapi GitHub](https://github.com/openapi-library/OpenAPIValidators/tree/master/packages/jest-openapi)

## Example .env.example

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# YooKassa API Configuration
# Get test data in YooKassa dashboard after registration
# https://yookassa.ru/
YOOKASSA_SHOP_ID=your_test_shop_id
YOOKASSA_SECRET_KEY=test_your_secret_key_here

# Webhook Configuration
# URL where YooKassa will send notifications
# For local development use ngrok or similar service
YOOKASSA_WEBHOOK_URL=https://your-domain.com/api/webhooks/yookassa

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Logging
LOG_LEVEL=info
```

## Recommended Development Order

1. **Environment Setup:**
   - Project initialization
   - Install dependencies
   - Configure TypeScript, ESLint
   - Create .env files

2. **Types and Models:**
   - Create TypeScript interfaces for Payment
   - Create types for YooKassa API
   - Create types for all API endpoints

3. **In-memory Storage:**
   - Implement payments.storage.ts
   - Methods: create, findById, update

4. **YooKassa Service:**
   - Implement yookassa.service.ts
   - createPayment() method
   - Configure authentication

5. **Routes:**
   - POST /api/payments
   - GET /api/payments/:id
   - POST /api/webhooks/yookassa
   - GET /health

6. **Testing:**
   - Contract tests for both contracts
   - Integration tests
   - Service unit tests

7. **Documentation:**
   - README.md
   - Code comments
   - .env.example

---

**Start by studying both OpenAPI specifications, then set up the project and implement functionality step by step.**

Good luck! 🚀

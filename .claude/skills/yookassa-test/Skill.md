---
name: yookassa-test
description: Generate YooKassa API mock responses and test data for development and testing
---

# YooKassa Test Data and Mocking Skill

This skill helps you create mock YooKassa API responses and test data for development without making real API calls.

## Usage

Invoke this skill when you need to:
- Mock YooKassa API responses for testing
- Generate test payment data
- Set up YooKassa API stubs
- Create webhook notification examples
- Test payment flows without real API calls

## YooKassa API Overview

### Authentication
```
Authorization: Basic base64(shopId:secretKey)
```

Test credentials format:
- Shop ID: numeric (e.g., `123456`)
- Secret Key: starts with `test_` (e.g., `test_abc123xyz`)

### Base URL
```
https://api.yookassa.ru/v3
```

## Mock Responses

### 1. Create Payment Response

**Successful Payment Creation:**
```typescript
const createPaymentMock = {
  id: '2d8fa86c-000f-5000-9000-1b8e7e1c79e9',
  status: 'pending',
  paid: false,
  amount: {
    value: '100.00',
    currency: 'RUB'
  },
  confirmation: {
    type: 'qr',
    confirmation_url: 'https://yoomoney.ru/payments/external/confirmation?orderId=2d8fa86c-000f-5000-9000-1b8e7e1c79e9'
  },
  created_at: new Date().toISOString(),
  description: 'Payment for order',
  metadata: {},
  recipient: {
    account_id: '123456',
    gateway_id: '123456'
  },
  refundable: false,
  test: true
};
```

**Error Response (Validation Error):**
```typescript
const validationErrorMock = {
  type: 'error',
  id: 'request_id',
  code: 'invalid_request',
  description: 'Amount value is too small',
  parameter: 'amount.value'
};
```

**Error Response (Authentication Error):**
```typescript
const authErrorMock = {
  type: 'error',
  id: 'request_id',
  code: 'invalid_credentials',
  description: 'Invalid authentication credentials'
};
```

### 2. Get Payment Response

**Pending Payment:**
```typescript
const pendingPaymentMock = {
  id: '2d8fa86c-000f-5000-9000-1b8e7e1c79e9',
  status: 'pending',
  paid: false,
  amount: {
    value: '100.00',
    currency: 'RUB'
  },
  confirmation: {
    type: 'qr',
    confirmation_url: 'https://yoomoney.ru/payments/external/confirmation?orderId=2d8fa86c-000f-5000-9000-1b8e7e1c79e9'
  },
  created_at: '2025-01-15T10:00:00.000Z',
  description: 'Payment for order',
  metadata: {},
  test: true
};
```

**Succeeded Payment:**
```typescript
const succeededPaymentMock = {
  id: '2d8fa86c-000f-5000-9000-1b8e7e1c79e9',
  status: 'succeeded',
  paid: true,
  amount: {
    value: '100.00',
    currency: 'RUB'
  },
  income_amount: {
    value: '98.00',
    currency: 'RUB'
  },
  confirmation: {
    type: 'qr',
    confirmation_url: 'https://yoomoney.ru/payments/external/confirmation?orderId=2d8fa86c-000f-5000-9000-1b8e7e1c79e9'
  },
  created_at: '2025-01-15T10:00:00.000Z',
  captured_at: '2025-01-15T10:05:00.000Z',
  description: 'Payment for order',
  metadata: {},
  payment_method: {
    type: 'sbp',
    id: '2d8fa86c-000f-5000-9000-1b8e7e1c79e9',
    saved: false
  },
  test: true
};
```

**Canceled Payment:**
```typescript
const canceledPaymentMock = {
  id: '2d8fa86c-000f-5000-9000-1b8e7e1c79e9',
  status: 'canceled',
  paid: false,
  amount: {
    value: '100.00',
    currency: 'RUB'
  },
  created_at: '2025-01-15T10:00:00.000Z',
  description: 'Payment for order',
  cancellation_details: {
    party: 'yoo_money',
    reason: 'expired_on_confirmation'
  },
  metadata: {},
  test: true
};
```

### 3. Webhook Notifications

**payment.succeeded Event:**
```typescript
const paymentSucceededWebhook = {
  type: 'notification',
  event: 'payment.succeeded',
  object: {
    id: '2d8fa86c-000f-5000-9000-1b8e7e1c79e9',
    status: 'succeeded',
    paid: true,
    amount: {
      value: '100.00',
      currency: 'RUB'
    },
    income_amount: {
      value: '98.00',
      currency: 'RUB'
    },
    created_at: '2025-01-15T10:00:00.000Z',
    captured_at: '2025-01-15T10:05:00.000Z',
    description: 'Payment for order',
    metadata: {},
    payment_method: {
      type: 'sbp',
      id: '2d8fa86c-000f-5000-9000-1b8e7e1c79e9',
      saved: false
    },
    test: true
  }
};
```

**payment.canceled Event:**
```typescript
const paymentCanceledWebhook = {
  type: 'notification',
  event: 'payment.canceled',
  object: {
    id: '2d8fa86c-000f-5000-9000-1b8e7e1c79e9',
    status: 'canceled',
    paid: false,
    amount: {
      value: '100.00',
      currency: 'RUB'
    },
    created_at: '2025-01-15T10:00:00.000Z',
    description: 'Payment for order',
    cancellation_details: {
      party: 'yoo_money',
      reason: 'expired_on_confirmation'
    },
    metadata: {},
    test: true
  }
};
```

**payment.waiting_for_capture Event:**
```typescript
const paymentWaitingWebhook = {
  type: 'notification',
  event: 'payment.waiting_for_capture',
  object: {
    id: '2d8fa86c-000f-5000-9000-1b8e7e1c79e9',
    status: 'waiting_for_capture',
    paid: true,
    amount: {
      value: '100.00',
      currency: 'RUB'
    },
    created_at: '2025-01-15T10:00:00.000Z',
    expires_at: '2025-01-15T11:00:00.000Z',
    description: 'Payment for order',
    metadata: {},
    test: true
  }
};
```

## Mock Implementation

### Backend Mock Service

**File:** `backend/src/services/yookassa-mock.ts`

```typescript
import { randomUUID } from 'crypto';

export class YooKassaMock {
  private payments = new Map<string, any>();

  async createPayment(data: { amount: number; description?: string }) {
    const paymentId = randomUUID();

    const payment = {
      id: paymentId,
      status: 'pending',
      paid: false,
      amount: {
        value: data.amount.toFixed(2),
        currency: 'RUB'
      },
      confirmation: {
        type: 'qr',
        confirmation_url: `https://yoomoney.ru/payments/external/confirmation?orderId=${paymentId}`
      },
      created_at: new Date().toISOString(),
      description: data.description || 'Payment',
      metadata: {},
      test: true
    };

    this.payments.set(paymentId, payment);

    // Simulate webhook after 5 seconds (for testing)
    setTimeout(() => this.simulateWebhook(paymentId), 5000);

    return payment;
  }

  async getPayment(paymentId: string) {
    const payment = this.payments.get(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }
    return payment;
  }

  private simulateWebhook(paymentId: string) {
    const payment = this.payments.get(paymentId);
    if (!payment) return;

    // Randomly succeed or cancel (for testing)
    const succeeded = Math.random() > 0.2; // 80% success rate

    if (succeeded) {
      payment.status = 'succeeded';
      payment.paid = true;
      payment.captured_at = new Date().toISOString();
    } else {
      payment.status = 'canceled';
      payment.cancellation_details = {
        party: 'yoo_money',
        reason: 'expired_on_confirmation'
      };
    }

    this.payments.set(paymentId, payment);

    // In real app, this would call your webhook endpoint
    console.log('Simulated webhook:', { paymentId, status: payment.status });
  }
}
```

### Vitest Mocks

**File:** `backend/src/tests/mocks/yookassa.ts`

```typescript
import { vi } from 'vitest';

export const mockYooKassaClient = {
  createPayment: vi.fn().mockResolvedValue({
    id: '2d8fa86c-000f-5000-9000-1b8e7e1c79e9',
    status: 'pending',
    amount: { value: '100.00', currency: 'RUB' },
    confirmation: {
      type: 'qr',
      confirmation_url: 'https://yoomoney.ru/test-qr'
    },
    created_at: new Date().toISOString(),
    test: true
  }),

  getPayment: vi.fn().mockResolvedValue({
    id: '2d8fa86c-000f-5000-9000-1b8e7e1c79e9',
    status: 'succeeded',
    paid: true,
    amount: { value: '100.00', currency: 'RUB' },
    test: true
  })
};
```

### MSW Mocks (Frontend)

**File:** `frontend/src/mocks/handlers.ts`

```typescript
import { rest } from 'msw';

export const handlers = [
  // Mock backend API
  rest.post('/api/payments', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: 'pay_123',
        status: 'pending',
        confirmationUrl: 'https://yoomoney.ru/test-qr',
        amount: 100,
        createdAt: new Date().toISOString()
      })
    );
  }),

  rest.get('/api/payments/:id', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: req.params.id,
        status: 'succeeded',
        confirmationUrl: 'https://yoomoney.ru/test-qr',
        amount: 100,
        createdAt: new Date().toISOString()
      })
    );
  })
];
```

## Test Scenarios

### Happy Path
1. Create payment → pending
2. Show QR code
3. Wait for webhook → succeeded
4. Show success message

### Cancellation Flow
1. Create payment → pending
2. Show QR code
3. Wait for webhook → canceled
4. Show cancellation message

### Error Handling
1. Invalid amount → validation error
2. Network error → retry logic
3. Timeout → show timeout message

## Environment Setup

```bash
# .env.test
YOOKASSA_SHOP_ID=123456
YOOKASSA_SECRET_KEY=test_mock_key_for_testing
MOCK_YOOKASSA=true  # Enable mock mode
```

## Best Practices

1. **Use mocks in tests** - Never make real API calls in tests
2. **Simulate delays** - Add realistic delays to mocks
3. **Test error scenarios** - Mock error responses
4. **Verify webhooks** - Test webhook handling with mocks
5. **Isolate tests** - Each test should have independent mock data

## Resources

- [YooKassa API Documentation](https://yookassa.ru/developers/api)
- [YooKassa Test Environment](https://yookassa.ru/developers/using-api/testing)
- [MSW Documentation](https://mswjs.io/)

Always test with mocks before using real YooKassa API!

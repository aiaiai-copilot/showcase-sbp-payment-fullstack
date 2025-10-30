---
name: openapi-sync
description: Generate TypeScript types from OpenAPI specifications and sync them to frontend/backend code
---

# OpenAPI Type Generation and Sync Skill

This skill helps you generate TypeScript types from OpenAPI specifications and keep them in sync with your codebase.

## Usage

Invoke this skill when you need to:
- Generate TypeScript types from OpenAPI specs
- Sync types after updating API specifications
- Set up automatic type generation
- Fix type mismatches between spec and code

## Tools

### openapi-typescript
Generate TypeScript types from OpenAPI specs.

```bash
npm install -D openapi-typescript
```

## Setup

### 1. Install Dependencies

```bash
# Frontend
cd frontend
npm install -D openapi-typescript

# Backend
cd backend
npm install -D openapi-typescript
```

### 2. Add Scripts to package.json

**Frontend:**
```json
{
  "scripts": {
    "generate:types": "openapi-typescript ../specs/frontend-backend-api.yaml -o src/types/api.ts",
    "dev": "npm run generate:types && vite",
    "build": "npm run generate:types && tsc && vite build"
  }
}
```

**Backend:**
```json
{
  "scripts": {
    "generate:types": "npm run generate:types:frontend && npm run generate:types:webhook",
    "generate:types:frontend": "openapi-typescript ../specs/frontend-backend-api.yaml -o src/types/api.ts",
    "generate:types:webhook": "openapi-typescript ../specs/yookassa-webhook-api.yaml -o src/types/webhook.ts",
    "dev": "npm run generate:types && tsx watch src/server.ts",
    "build": "npm run generate:types && tsc"
  }
}
```

## Generated Types Usage

### Frontend Example

After running `npm run generate:types`, use generated types:

```typescript
// src/types/api.ts is auto-generated
import type { paths, components } from '@/types/api';

// Extract types for specific operations
type PaymentCreateRequest = paths['/api/payments']['post']['requestBody']['content']['application/json'];
type PaymentCreateResponse = paths['/api/payments']['post']['responses']['201']['content']['application/json'];
type PaymentStatusResponse = paths['/api/payments/{id}']['get']['responses']['200']['content']['application/json'];

// Use in API client
async function createPayment(data: PaymentCreateRequest): Promise<PaymentCreateResponse> {
  const response = await fetch('/api/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Payment creation failed');

  return response.json();
}

// Use in components
function PaymentStatus({ paymentId }: { paymentId: string }) {
  const { data } = useQuery<PaymentStatusResponse>({
    queryKey: ['payment', paymentId],
    queryFn: () => getPaymentStatus(paymentId),
  });

  return <div>Status: {data?.status}</div>;
}
```

### Backend Example

```typescript
// src/types/api.ts (frontend-backend API)
// src/types/webhook.ts (YooKassa webhook API)
import type { paths as FrontendPaths } from './types/api';
import type { paths as WebhookPaths } from './types/webhook';

// Extract request/response types
type CreatePaymentBody = FrontendPaths['/api/payments']['post']['requestBody']['content']['application/json'];
type CreatePaymentResponse = FrontendPaths['/api/payments']['post']['responses']['201']['content']['application/json'];

type WebhookPayload = WebhookPaths['/api/webhooks/yookassa']['post']['requestBody']['content']['application/json'];

// Use in Fastify routes
app.post<{
  Body: CreatePaymentBody;
  Reply: CreatePaymentResponse;
}>('/api/payments', async (request, reply) => {
  const { amount } = request.body;

  const payment: CreatePaymentResponse = {
    id: generateId(),
    amount,
    status: 'pending',
    confirmationUrl: 'https://...',
    createdAt: new Date().toISOString(),
  };

  reply.code(201).send(payment);
});

// Use in webhook handler
app.post<{ Body: WebhookPayload }>('/api/webhooks/yookassa', async (request, reply) => {
  const { event, object } = request.body;

  if (event === 'payment.succeeded') {
    // Handle success
  }

  reply.code(200).send({});
});
```

## Advanced Configuration

### Custom Type Transformations

Create `openapi-ts.config.ts`:

```typescript
export default {
  // Transform operation IDs to function names
  postfixServices: '_Service',

  // Format options
  formatter: 'prettier',

  // Additional options
  arrayLength: true,
  exportType: true,
};
```

### Watch Mode for Development

```bash
# Terminal 1 - Watch specs and regenerate types
npx openapi-typescript ../specs/frontend-backend-api.yaml -o src/types/api.ts --watch

# Terminal 2 - Run dev server
npm run dev
```

## Validation with Generated Types

### Runtime Validation with Zod

Combine generated types with Zod for runtime validation:

```typescript
import { z } from 'zod';
import type { paths } from '@/types/api';

type PaymentCreateRequest = paths['/api/payments']['post']['requestBody']['content']['application/json'];

// Define Zod schema matching the type
const paymentCreateSchema = z.object({
  amount: z.number().positive(),
}) satisfies z.ZodType<PaymentCreateRequest>;

// Use for validation
const validatedData = paymentCreateSchema.parse(userInput);
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Type Check

on: [push, pull_request]

jobs:
  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - name: Generate types
        run: |
          cd frontend && npm run generate:types
          cd ../backend && npm run generate:types

      - name: Type check frontend
        run: cd frontend && npm run type-check

      - name: Type check backend
        run: cd backend && npm run type-check
```

## Best Practices

1. **Generate types before build** - Always regenerate types in build scripts
2. **Commit generated types** - Check generated types into git for easier review
3. **Version control specs** - Keep OpenAPI specs in version control
4. **Automate generation** - Use pre-commit hooks or CI to ensure types are fresh
5. **Use strict types** - Enable TypeScript strict mode to catch type issues

## Pre-commit Hook

Add to `.claude/hooks` (or git hooks):

```bash
#!/bin/bash
# Regenerate types before commit

cd frontend && npm run generate:types
cd ../backend && npm run generate:types

# Add generated files to commit
git add frontend/src/types/api.ts
git add backend/src/types/api.ts
git add backend/src/types/webhook.ts
```

## Troubleshooting

### Types not updating
```bash
# Clear cache and regenerate
rm -rf src/types
npm run generate:types
```

### TypeScript errors after generation
```bash
# Check spec validity first
npx @redocly/cli lint ../specs/frontend-backend-api.yaml

# Then regenerate
npm run generate:types
```

### Import errors
Make sure `tsconfig.json` has correct paths:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Benefits

✅ **Type safety** - Catch API mismatches at compile time
✅ **Auto-completion** - IDE suggestions for API types
✅ **Single source of truth** - Types derived from specs
✅ **Refactoring safety** - Breaking changes caught immediately
✅ **Documentation** - Types serve as inline documentation

## Resources

- [openapi-typescript](https://github.com/drwpow/openapi-typescript)
- [OpenAPI TypeScript Codegen](https://github.com/ferdikoomen/openapi-typescript-codegen)

Always regenerate types after updating OpenAPI specifications!

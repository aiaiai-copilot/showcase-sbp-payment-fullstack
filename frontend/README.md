# YooKassa Payment Frontend

React + TypeScript + shadcn/ui frontend for YooKassa payment integration.

## Tech Stack

- **React** 18.3.1 - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Tanstack Query** - State management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Vitest** - Testing framework

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Tailwind CSS

```bash
npm install -D tailwindcss postcss autoprefixer
```

### 3. Set Up Environment

```bash
cp .env.example .env
```

Edit `.env` if needed (default values should work for local development).

### 4. Generate Types from OpenAPI

```bash
npm run generate:types
```

This generates TypeScript types from `../specs/frontend-backend-api.yaml`.

### 5. Start Development Server

```bash
npm run dev
```

Frontend will be available at http://localhost:5173

## Adding shadcn/ui Components

Initialize shadcn/ui (first time only):

```bash
npx shadcn-ui@latest init
```

Add components as needed:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add form
npx shadcn-ui@latest add alert
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/           # shadcn/ui components
│   │   └── features/     # Feature components
│   ├── lib/
│   │   ├── api.ts        # API client
│   │   └── utils.ts      # Utilities
│   ├── hooks/            # Custom hooks
│   ├── types/
│   │   └── api.ts        # Generated from OpenAPI
│   ├── tests/
│   │   ├── setup.ts      # Test configuration
│   │   └── contracts/    # Contract tests
│   ├── App.tsx           # Main component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── index.html            # HTML template
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
├── tailwind.config.js    # Tailwind configuration
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

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

### Building

```bash
npm run build
```

Output will be in `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Writing Contract Tests

Contract tests ensure the frontend matches the OpenAPI specification:

```typescript
// src/tests/contracts/payment-api.test.ts
import { describe, test, expect } from 'vitest';
import { OpenAPIValidator } from 'jest-openapi';
import spec from '../../../specs/frontend-backend-api.yaml';

const validator = new OpenAPIValidator(spec);

describe('Payment API Contracts', () => {
  test('POST /api/payments response validates', () => {
    const response = {
      id: 'pay_123',
      status: 'pending',
      confirmationUrl: 'https://...',
      amount: 100,
      createdAt: new Date().toISOString(),
    };

    expect(validator.validateResponse(
      response,
      '/api/payments',
      'post',
      201
    )).toBeValid();
  });
});
```

## API Integration

The API client should use generated types:

```typescript
// src/lib/api.ts
import type { paths } from '@/types/api';

type CreatePaymentRequest = paths['/api/payments']['post']['requestBody']['content']['application/json'];
type CreatePaymentResponse = paths['/api/payments']['post']['responses']['201']['content']['application/json'];

export async function createPayment(
  data: CreatePaymentRequest
): Promise<CreatePaymentResponse> {
  const response = await fetch('/api/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Payment creation failed');
  return response.json();
}
```

## Design Guidelines

### Colors
- Background: White
- Text: Black
- Primary: Green (green-600)
- Always show "TEST MODE" watermark

### Components
- Use only shadcn/ui components
- Mobile-first responsive design
- Proper accessibility (ARIA labels, keyboard navigation)
- Loading states for async operations
- Clear error messages

### TypeScript
- Strict mode enabled
- No `any` types
- Define interfaces for all props
- Use Zod for validation

## Important Reminders

✅ Always validate against OpenAPI spec with contract tests
✅ Use only shadcn/ui components (no custom UI primitives)
✅ Generate types after updating specs
✅ Write tests before implementation
✅ Ensure accessibility
✅ Show TEST MODE watermark

## Troubleshooting

### Import errors with @ alias

Make sure both `tsconfig.json` and `vite.config.ts` have the path alias configured.

### TypeScript errors after spec changes

Regenerate types:
```bash
npm run generate:types
```

### Tests not finding imports

Check `src/tests/setup.ts` is configured in `vite.config.ts`.

## Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tanstack Query](https://tanstack.com/query)
- [Vitest](https://vitest.dev)

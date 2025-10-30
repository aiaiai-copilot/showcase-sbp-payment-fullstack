# Task: Frontend for YooKassa Integration Demo

## Project Context

Development of a demo application for portfolio showcasing integration with YooKassa payment system (SBP payment).

**Purpose:** Show potential clients (small businesses, startups) professional mastery of payment system integration.

**Approach:** API First, monorepo with independent Frontend and Backend development.

## Monorepo Structure

```
/
├── frontend/           ← YOUR CODE HERE
├── backend/            (developed separately)
└── specs/              (OpenAPI specifications)
    └── frontend-backend-api.yaml
```

## Tech Stack

### Required Dependencies
- **React**: 18.3.1
- **TypeScript**: 5.8.3
- **Node.js**: v22.18.0 (for development)
- **Vite**: 5.4.19
- **Tailwind CSS**: 3.4.17

### UI Libraries (already installed)
- shadcn/ui components (Radix UI)
- Lucide React (icons)
- Tailwind CSS with plugins

### State Management and Forms
- Tanstack Query (React Query) 5.83.0
- React Hook Form 7.61.1
- Zod 3.25.76

### Testing
- Vitest (setup required)
- React Testing Library (setup required)
- **jest-openapi** (install required) - for contract testing

## API Contract

**Specification:** `specs/frontend-backend-api.yaml` (OpenAPI 3.0.1)

**Backend URL:** `http://localhost:3000` (development)

### Endpoints

**1. Create Payment**
```
POST /api/payments
Content-Type: application/json

Request:
{
  "amount": 100.00,
  "description": "Test payment" // optional
}

Response 201:
{
  "id": "uuid",
  "status": "pending",
  "amount": {
    "value": "100.00",
    "currency": "RUB"
  },
  "confirmation": {
    "type": "qr",
    "confirmation_url": "https://..."
  },
  "description": "Test payment",
  "test": true,
  "created_at": "2025-10-30T10:30:00.000Z"
}
```

**2. Get Payment Status**
```
GET /api/payments/{id}

Response 200:
{
  "id": "uuid",
  "status": "succeeded" | "pending" | "canceled" | "waiting_for_capture",
  "amount": {
    "value": "100.00",
    "currency": "RUB"
  },
  "description": "Test payment",
  "test": true,
  "created_at": "2025-10-30T10:30:00.000Z",
  "paid_at": "2025-10-30T10:32:15.000Z" // if succeeded
}
```

## Design Requirements

### Color Scheme
- **Background:** White (`#FFFFFF`)
- **Text:** Black (`#000000`)
- **Accents:** Green (e.g., `#10b981` from Tailwind)
- **Strict, professional style**

### UI Elements

**Required:**
- **"TEST MODE"** watermark (always visible, semi-transparent)
- No excessive animations (only standard transitions)
- Minimalist design
- Responsive layout

### Interface Components

**1. Payment Form** (initial state)
- Amount input field (100₽ default, min: 1, max: 100000)
- "Pay via SBP" button (green)
- Clear typography

**2. QR Code** (after payment creation)
- QR code for scanning (generate from `confirmation_url`)
- Status: "Awaiting Payment"
- Ability to cancel (return to form)

**3. Result**
- Success ✓: green indicator, message
- Canceled ✗: red indicator, message
- "Create New Payment" button

**IMPORTANT:** Show only **one current payment**. NO payment history.

## Functional Requirements

### Main Flow
1. User enters amount → clicks "Pay via SBP"
2. App creates payment (POST /api/payments)
3. QR code displayed
4. App polls status (GET /api/payments/{id}) every 3 seconds
5. On status change → display result

### Status Handling
- `pending` → "Awaiting Payment" (show QR)
- `waiting_for_capture` → "Processing Payment" (show loader)
- `succeeded` → "Success" (green, checkmark)
- `canceled` → "Canceled" (red, cross)

### Error Handling
- Network errors → "Check your connection" message
- API errors (4xx, 5xx) → show message from `error.message`
- Use Toast notifications (sonner)

## Project Setup

### Environment Variables
Create `.env` in `frontend/`:
```
VITE_API_BASE_URL=http://localhost:3000
```

### Development Port
Frontend: **5173** (standard Vite)

### CORS
Backend will configure CORS for `http://localhost:5173`

## Code Structure

### Recommended Organization
```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              (shadcn components)
│   │   ├── PaymentForm.tsx
│   │   ├── PaymentQRCode.tsx
│   │   └── PaymentResult.tsx
│   ├── api/
│   │   └── payments.ts      (API client with Tanstack Query)
│   ├── types/
│   │   └── payment.ts       (TypeScript types)
│   ├── lib/
│   │   └── utils.ts
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   ├── api/
│   │   └── payments.contract.test.ts  (contract tests)
│   └── components/
│       └── PaymentForm.test.tsx
├── .env
├── .env.example
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Testing

### Contract Testing (REQUIRED)
Use **jest-openapi** to verify API contract compliance.

**Installation:**
```bash
npm install --save-dev jest-openapi
```

**Test Example:**
```typescript
import jestOpenAPI from 'jest-openapi';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load specification
const spec = readFileSync(
  resolve(__dirname, '../../../specs/frontend-backend-api.yaml'),
  'utf8'
);
jestOpenAPI(spec);

describe('Payments API Contract', () => {
  it('POST /api/payments satisfies spec', async () => {
    const response = await fetch('http://localhost:3000/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 100.00 })
    });
    
    expect(response).toSatisfyApiSpec();
  });
  
  it('GET /api/payments/{id} satisfies spec', async () => {
    // First create payment
    const createResponse = await fetch('http://localhost:3000/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 100.00 })
    });
    const { id } = await createResponse.json();
    
    // Check status retrieval
    const response = await fetch(`http://localhost:3000/api/payments/${id}`);
    expect(response).toSatisfyApiSpec();
  });
});
```

### Component Unit Tests
- Test component logic
- Mock API calls
- Verify different states display

## Additional Requirements

### TypeScript
- Strict mode (`strict: true`)
- Type all props, state, API responses
- Use Zod for form validation

### Code Quality
- ESLint configuration (already exists)
- Formatting with Prettier (setup required)
- Clear variable names
- Comments for complex logic

### README
Create `frontend/README.md` with:
- Project description
- Dependency installation instructions
- Dev server startup commands
- Test execution commands
- Environment variables

## QR Code Generation

For generating QR code from `confirmation_url`, use library:
```bash
npm install qrcode.react
```

```tsx
import { QRCodeSVG } from 'qrcode.react';

<QRCodeSVG value={confirmationUrl} size={256} />
```

## Acceptance Criteria

### Functionality
- ✅ Form with amount input works correctly
- ✅ Payment creation sends correct request
- ✅ QR code generates and displays
- ✅ Status polling works (request every 3 sec)
- ✅ Statuses display correctly
- ✅ Error handling implemented

### Design
- ✅ "TEST MODE" watermark visible
- ✅ White background, black text, green accents
- ✅ Strict professional appearance
- ✅ Responsive (mobile + desktop)

### Testing
- ✅ Contract tests with jest-openapi work
- ✅ Component unit tests cover main scenarios
- ✅ All tests pass (`npm test`)

### Documentation
- ✅ README.md created and up-to-date
- ✅ .env.example with variable examples
- ✅ Readable code with comments

## Important Reminders

1. **Monorepo:** Frontend code must be in `frontend/` directory
2. **API First:** Strictly follow `frontend-backend-api.yaml` specification
3. **Contract Testing:** Must verify contract compliance
4. **Test Mode:** Always display "TEST MODE" watermark
5. **Simplicity:** No excessive features, only main flow
6. **Professionalism:** Strict design, quality code

## Useful Links

- [YooKassa API Documentation](https://yookassa.ru/developers/api)
- [Tanstack Query Docs](https://tanstack.com/query/latest)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [jest-openapi GitHub](https://github.com/openapi-library/OpenAPIValidators/tree/master/packages/jest-openapi)

---

**Start with environment setup, create types based on API specification, then implement components and API client.**

Good luck! 🚀

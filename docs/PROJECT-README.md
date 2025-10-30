# YooKassa Integration Demo (SBP)

Demo application for portfolio showcasing professional YooKassa payment system integration.

## 🎯 Project Goal

Demonstrate to potential clients (small businesses, startups) the ability to work with payment systems:
- External API integration
- API-First approach
- Contract Testing
- Professional UI/UX
- Test mode for safe demonstration

## 🏗️ Architecture

**Monorepo** with independent component development:

```
yookassa-payment-demo/
├── frontend/              # React + TypeScript + shadcn/ui
│   ├── src/
│   ├── tests/
│   ├── package.json
│   └── README.md
│
├── backend/               # Node.js + Fastify + TypeScript
│   ├── src/
│   ├── tests/
│   ├── package.json
│   └── README.md
│
├── specs/                 # OpenAPI 3.0.1 specifications
│   ├── frontend-backend-api.yaml
│   └── yookassa-webhook-api.yaml
│
└── README.md             # This file
```

## 🔧 Technology Stack

### Frontend
- **React** 18.3.1 + **TypeScript**
- **Vite** (dev server, port 5173)
- **shadcn/ui** (UI components)
- **Tailwind CSS** (styling)
- **Tanstack Query** (state)
- **React Hook Form + Zod** (validation)

### Backend
- **Node.js** v22.18.0 + **TypeScript**
- **Fastify** (web framework, port 3000)
- **In-memory** storage (for demo)
- **YooKassa API** (payment integration)

### Testing
- **Vitest** (test runner)
- **jest-openapi** (contract testing)
- **React Testing Library** (frontend unit tests)

## 📋 Functionality

### User Flow
1. User enters payment amount
2. Clicks "Pay via SBP"
3. Sees QR code for payment
4. App tracks payment status
5. Shows result: "Success" or "Canceled"

### Technical Features
- ✅ YooKassa test mode (no real payments)
- ✅ SBP payment (Fast Payment System)
- ✅ Webhook notifications from YooKassa
- ✅ Real-time status updates
- ✅ Professional minimalist design
- ✅ Contract testing (API specification compliance)

## 🚀 Quick Start

### Prerequisites
- Node.js v22.18.0
- npm or yarn
- YooKassa account (for test mode)

### Installation

**1. Clone repository**
```bash
git clone <repository-url>
cd yookassa-payment-demo
```

**2. Install Frontend dependencies**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env if needed
```

**3. Install Backend dependencies**
```bash
cd ../backend
npm install
cp .env.example .env
# IMPORTANT: Set YooKassa test keys in .env
```

**4. Start Backend**
```bash
cd backend
npm run dev
# Server starts at http://localhost:3000
```

**5. Start Frontend**
```bash
cd frontend
npm run dev
# App opens at http://localhost:5173
```

### Getting YooKassa Test Keys

1. Register at https://yookassa.ru/
2. In dashboard go to **Integration** → **API**
3. Create test shop
4. Copy:
   - `shopId` (shop identifier)
   - `secretKey` (secret key, starts with `test_`)
5. Set these values in `backend/.env`

### Webhook Setup (for testing notifications)

For local development use **ngrok** or **localtunnel**:

```bash
# Install ngrok
npm install -g ngrok

# Start tunnel
ngrok http 3000

# Copy public URL (e.g., https://abc123.ngrok.io)
```

In YooKassa dashboard:
1. **Integration** → **HTTP Notifications**
2. Set URL: `https://abc123.ngrok.io/api/webhooks/yookassa`
3. Enable events:
   - payment.succeeded
   - payment.canceled
   - payment.waiting_for_capture

## 📝 API Specifications

Project follows **API First** approach. All contracts described in OpenAPI 3.0.1:

### Frontend ↔ Backend API
**File:** `specs/frontend-backend-api.yaml`

**Endpoints:**
- `POST /api/payments` - create payment
- `GET /api/payments/{id}` - get status

### YooKassa → Backend Webhook API
**File:** `specs/yookassa-webhook-api.yaml`

**Endpoint:**
- `POST /api/webhooks/yookassa` - receive notifications

## 🧪 Testing

### Run All Tests

**Frontend:**
```bash
cd frontend
npm test
```

**Backend:**
```bash
cd backend
npm test
```

### Contract Testing
Both components verify OpenAPI specification compliance using **jest-openapi**.

**What's Checked:**
- Request/response format
- HTTP status codes
- Data types
- Required fields

## 🎨 Design

### Color Scheme
- **Background:** White
- **Text:** Black
- **Accents:** Green
- **Style:** Strict, professional, minimalist

### UI Features
- "TEST MODE" watermark (always visible)
- Simple amount input form
- QR code for scanning
- Clear status indicators
- Responsive layout

## 📖 Documentation

Detailed documentation for each component:

- **[Frontend README](./frontend/README.md)** - installation, development, testing
- **[Backend README](./backend/README.md)** - architecture, API, deployment
- **[OpenAPI Specifications](./specs/)** - complete API contract description

## 🔒 Security

### Test Mode
- Only YooKassa test keys used
- NO real payments processed
- Payment data stored in-memory (not persistent)

### Production Recommendations
For production use, you need:
- Use real YooKassa keys
- Add persistent storage (PostgreSQL, MongoDB)
- Configure HTTPS
- Add user authentication
- Implement logging and monitoring
- Set up CI/CD

## 🛠️ Development

### Code Structure
- **API First:** specification first, then code
- **TypeScript:** strict typing
- **Contract Testing:** verify contract compliance
- **Independent Components:** Frontend and Backend developed independently

### Conventions
- Naming: camelCase for variables, PascalCase for components
- Formatting: Prettier
- Linting: ESLint
- Commits: conventional commits

## 📦 Deployment

### Frontend
Can be deployed on:
- Vercel
- Netlify
- GitHub Pages

```bash
cd frontend
npm run build
# Static files in dist/
```

### Backend
Can be deployed on:
- Railway
- Render
- Heroku
- VPS

```bash
cd backend
npm run build
npm start
```

## 🤝 Contributing

This is a demo project for portfolio. Pull requests are welcome!

## 📄 License

MIT License

## 📞 Contact

If you have questions about the project or want to discuss collaboration:

- GitHub: [your profile]
- Email: [your email]
- Telegram: [your telegram]

---

**Made with ❤️ to demonstrate Full-stack development skills**

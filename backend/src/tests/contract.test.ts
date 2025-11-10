import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import jestOpenAPI from 'jest-openapi';
import path from 'path';
import Fastify, { FastifyInstance, LightMyRequestResponse } from 'fastify';
import cors from '@fastify/cors';
import { PaymentStorage } from '../types/payment.js';
import { YooKassaService } from '../services/yookassa.js';
import { paymentRoutes } from '../routes/payments.js';
import { webhookRoutes } from '../routes/webhooks.js';
import { randomUUID } from 'crypto';

// Load OpenAPI specs for contract testing
const frontendBackendSpec = path.resolve(
  __dirname,
  '../../../specs/frontend-backend-api.yaml'
);
const webhookSpec = path.resolve(
  __dirname,
  '../../../specs/yookassa-webhook-api.yaml'
);

jestOpenAPI(frontendBackendSpec);

/**
 * Transform Fastify inject response to format expected by jest-openapi
 */
function toOpenAPIResponse(fastifyResponse: LightMyRequestResponse) {
  return {
    status: fastifyResponse.statusCode,
    req: {
      method: fastifyResponse.raw.req.method,
      path: fastifyResponse.raw.req.url,
    },
    body: fastifyResponse.payload ? JSON.parse(fastifyResponse.payload) : {},
  };
}

// Mock YooKassa service
vi.mock('../services/yookassa.js', () => {
  return {
    YooKassaService: vi.fn().mockImplementation(() => ({
      createPayment: vi.fn().mockImplementation(async (amount: number, description?: string) => {
        // Generate unique YooKassa ID for each payment
        const yookassaId = randomUUID();
        return {
          id: yookassaId,
          status: 'pending',
          paid: false,
          amount: {
            value: amount.toFixed(2),
            currency: 'RUB',
          },
          confirmation: {
            type: 'qr',
            confirmation_url:
              `https://yoomoney.ru/payments/external/confirmation?orderId=${yookassaId}`,
          },
          created_at: new Date().toISOString(),
          description: description || 'Test payment',
          test: true,
        };
      }),
      getPayment: vi.fn().mockResolvedValue({
        id: randomUUID(),
        status: 'succeeded',
        paid: true,
        amount: {
          value: '100.00',
          currency: 'RUB',
        },
        created_at: new Date().toISOString(),
        captured_at: new Date().toISOString(),
        test: true,
      }),
    })),
  };
});

describe('Contract Tests - Frontend-Backend API', () => {
  let app: FastifyInstance;
  let storage: PaymentStorage;

  beforeAll(async () => {
    // Create test Fastify instance
    app = Fastify({ logger: false });

    // Register CORS
    await app.register(cors, {
      origin: 'http://localhost:5173',
      credentials: true,
    });

    // Initialize services
    storage = new PaymentStorage();
    const yookassaService = new YooKassaService();

    // Register routes with /api prefix to match OpenAPI spec
    await app.register(async (instance) => {
      await paymentRoutes(instance, storage, yookassaService);
    }, { prefix: '/api' });

    await app.register(async (instance) => {
      await webhookRoutes(instance, storage);
    }, { prefix: '/api' });

    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/payments - Create Payment', () => {
    it('should create payment and match OpenAPI spec (201)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/payments',
        payload: {
          amount: 100,
          description: 'Test payment',
        },
      });

      expect(response.statusCode).toBe(201);

      const body = response.json();

      // Contract validation
      expect(toOpenAPIResponse(response)).toSatisfyApiSpec();

      // Additional assertions
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('status', 'pending');
      expect(body).toHaveProperty('amount');
      expect(body.amount).toHaveProperty('value', '100.00');
      expect(body.amount).toHaveProperty('currency', 'RUB');
      expect(body).toHaveProperty('confirmation');
      expect(body.confirmation).toHaveProperty('type', 'qr');
      expect(body.confirmation).toHaveProperty('confirmation_url');
      expect(body).toHaveProperty('test', true);
      expect(body).toHaveProperty('created_at');
    });

    it('should reject invalid amount and match OpenAPI spec (400)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/payments',
        payload: {
          amount: 0,
          description: 'Invalid amount',
        },
      });

      expect(response.statusCode).toBe(400);

      const body = response.json();

      // Contract validation
      expect(toOpenAPIResponse(response)).toSatisfyApiSpec();

      // Additional assertions
      expect(body).toHaveProperty('error');
      expect(body.error).toHaveProperty('code', 'invalid_request');
      expect(body.error).toHaveProperty('message');
    });

    it('should reject amount too high (400)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/payments',
        payload: {
          amount: 200000,
          description: 'Amount too high',
        },
      });

      expect(response.statusCode).toBe(400);
      expect(toOpenAPIResponse(response)).toSatisfyApiSpec();

      const body = response.json();
      expect(body.error.code).toBe('invalid_request');
    });

    it('should accept payment without description', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/payments',
        payload: {
          amount: 50,
        },
      });

      expect(response.statusCode).toBe(201);
      expect(toOpenAPIResponse(response)).toSatisfyApiSpec();
    });
  });

  describe('GET /api/payments/:id - Get Payment Status', () => {
    it('should get payment status and match OpenAPI spec (200)', async () => {
      // First create a payment
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/payments',
        payload: {
          amount: 150,
          description: 'Payment for status check',
        },
      });

      const { id } = createResponse.json();

      // Now get the payment
      const response = await app.inject({
        method: 'GET',
        url: `/api/payments/${id}`,
      });

      expect(response.statusCode).toBe(200);

      const body = response.json();

      // Contract validation
      expect(toOpenAPIResponse(response)).toSatisfyApiSpec();

      // Additional assertions
      expect(body).toHaveProperty('id', id);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('amount');
      expect(body.amount).toHaveProperty('value', '150.00');
      expect(body.amount).toHaveProperty('currency', 'RUB');
      expect(body).toHaveProperty('created_at');
      expect(body).toHaveProperty('test', true);
    });

    it('should return 404 for non-existent payment', async () => {
      const fakeId = randomUUID();

      const response = await app.inject({
        method: 'GET',
        url: `/api/payments/${fakeId}`,
      });

      expect(response.statusCode).toBe(404);

      const body = response.json();

      // Contract validation
      expect(toOpenAPIResponse(response)).toSatisfyApiSpec();

      // Additional assertions
      expect(body).toHaveProperty('error');
      expect(body.error).toHaveProperty('code', 'not_found');
      expect(body.error).toHaveProperty('message');
    });

    it('should include paid_at for succeeded payments', async () => {
      // Create payment
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/payments',
        payload: { amount: 200 },
      });

      const { id } = createResponse.json();

      // Get payment from storage and update status
      const payment = storage.findById(id);
      if (payment) {
        storage.updateStatus(id, 'succeeded');
      }

      // Get payment status
      const response = await app.inject({
        method: 'GET',
        url: `/api/payments/${id}`,
      });

      expect(response.statusCode).toBe(200);
      expect(toOpenAPIResponse(response)).toSatisfyApiSpec();

      const body = response.json();
      expect(body.status).toBe('succeeded');
      expect(body).toHaveProperty('paid_at');
    });
  });

  describe('POST /api/webhooks/yookassa - Webhook Handler', () => {
    // Load webhook spec
    beforeAll(() => {
      jestOpenAPI(webhookSpec);
    });

    // Restore frontend-backend spec for other tests
    afterAll(() => {
      jestOpenAPI(frontendBackendSpec);
    });

    it('should handle payment.succeeded webhook (200)', async () => {
      // Create payment first
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/payments',
        payload: { amount: 300 },
      });

      const payment = createResponse.json();
      const storedPayment = storage.findById(payment.id);

      // Send webhook notification
      const webhookPayload = {
        type: 'notification',
        event: 'payment.succeeded',
        object: {
          id: storedPayment!.yookassaId,
          status: 'succeeded',
          paid: true,
          amount: {
            value: '300.00',
            currency: 'RUB',
          },
          created_at: storedPayment!.createdAt,
          captured_at: new Date().toISOString(),
          test: true,
          payment_method: {
            type: 'sbp',
            id: '2d8fa86c-000f-5000-9000-1b8e7e1c79e9',
          },
        },
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/webhooks/yookassa',
        payload: webhookPayload,
      });

      expect(response.statusCode).toBe(200);

      const body = response.json();

      // Contract validation
      expect(toOpenAPIResponse(response)).toSatisfyApiSpec();

      // Verify webhook processed correctly
      expect(body).toHaveProperty('success', true);

      // Verify payment status updated
      const updatedPayment = storage.findById(payment.id);
      expect(updatedPayment!.status).toBe('succeeded');
    });

    it('should handle payment.canceled webhook (200)', async () => {
      // Create payment
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/payments',
        payload: { amount: 400 },
      });

      const payment = createResponse.json();
      const storedPayment = storage.findById(payment.id);

      // Send canceled webhook
      const webhookPayload = {
        type: 'notification',
        event: 'payment.canceled',
        object: {
          id: storedPayment!.yookassaId,
          status: 'canceled',
          paid: false,
          amount: {
            value: '400.00',
            currency: 'RUB',
          },
          created_at: storedPayment!.createdAt,
          test: true,
        },
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/webhooks/yookassa',
        payload: webhookPayload,
      });

      expect(response.statusCode).toBe(200);
      expect(toOpenAPIResponse(response)).toSatisfyApiSpec();

      // Verify payment status updated
      const updatedPayment = storage.findById(payment.id);
      expect(updatedPayment!.status).toBe('canceled');
    });

    it('should handle payment.waiting_for_capture webhook (200)', async () => {
      // Create payment
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/payments',
        payload: { amount: 500 },
      });

      const payment = createResponse.json();
      const storedPayment = storage.findById(payment.id);

      // Send waiting_for_capture webhook
      const webhookPayload = {
        type: 'notification',
        event: 'payment.waiting_for_capture',
        object: {
          id: storedPayment!.yookassaId,
          status: 'waiting_for_capture',
          paid: true,
          amount: {
            value: '500.00',
            currency: 'RUB',
          },
          created_at: storedPayment!.createdAt,
          expires_at: new Date(Date.now() + 3600000).toISOString(),
          test: true,
        },
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/webhooks/yookassa',
        payload: webhookPayload,
      });

      expect(response.statusCode).toBe(200);
      expect(toOpenAPIResponse(response)).toSatisfyApiSpec();

      // Verify payment status updated
      const updatedPayment = storage.findById(payment.id);
      expect(updatedPayment!.status).toBe('waiting_for_capture');
    });

    it('should return 400 for invalid webhook structure', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/webhooks/yookassa',
        payload: {
          type: 'invalid',
          // Missing required fields
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 200 even for unknown payment ID', async () => {
      // YooKassa expects 200 to prevent retries
      const response = await app.inject({
        method: 'POST',
        url: '/api/webhooks/yookassa',
        payload: {
          type: 'notification',
          event: 'payment.succeeded',
          object: {
            id: 'unknown-yookassa-id',
            status: 'succeeded',
            paid: true,
            amount: {
              value: '100.00',
              currency: 'RUB',
            },
            created_at: new Date().toISOString(),
            test: true,
          },
        },
      });

      expect(response.statusCode).toBe(200);
      expect(toOpenAPIResponse(response)).toSatisfyApiSpec();
    });
  });
});

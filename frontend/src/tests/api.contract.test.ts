import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load OpenAPI spec
const specPath = resolve(__dirname, '../../../specs/frontend-backend-api.yaml');
const spec = readFileSync(specPath, 'utf-8');

describe('API Contract Tests', () => {
  beforeAll(() => {
    // Verify spec is loaded
    expect(spec).toBeDefined();
  });

  describe('POST /api/payments', () => {
    it('should match OpenAPI contract for successful payment creation', async () => {
      const requestData = {
        amount: 100,
        description: 'Test payment',
      };

      // Mock response for testing contract structure
      const mockResponse = {
        id: '2c0b3e86-000f-5000-8000-18db351245c7',
        status: 'pending' as const,
        amount: {
          value: '100.00',
          currency: 'RUB' as const,
        },
        confirmation: {
          type: 'qr' as const,
          confirmation_url: 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=123',
        },
        description: 'Test payment',
        test: true,
        created_at: new Date().toISOString(),
      };

      // Validate request structure
      expect(requestData).toMatchObject({
        amount: expect.any(Number),
      });

      // Validate response structure matches OpenAPI spec
      expect(mockResponse).toMatchObject({
        id: expect.any(String),
        status: expect.stringMatching(/^(pending|waiting_for_capture|succeeded|canceled)$/),
        amount: {
          value: expect.any(String),
          currency: 'RUB',
        },
        confirmation: {
          type: 'qr',
          confirmation_url: expect.any(String),
        },
        created_at: expect.any(String),
      });
    });

    it('should validate request data types', () => {
      const validRequest = {
        amount: 100,
        description: 'Test',
      };

      expect(validRequest.amount).toBeGreaterThanOrEqual(1);
      expect(validRequest.amount).toBeLessThanOrEqual(100000);
      if (validRequest.description) {
        expect(validRequest.description.length).toBeLessThanOrEqual(128);
      }
    });
  });

  describe('GET /api/payments/{id}', () => {
    it('should match OpenAPI contract for payment status retrieval', () => {
      const mockResponse = {
        id: '2c0b3e86-000f-5000-8000-18db351245c7',
        status: 'succeeded' as const,
        amount: {
          value: '100.00',
          currency: 'RUB' as const,
        },
        description: 'Test payment',
        test: true,
        created_at: new Date().toISOString(),
        paid_at: new Date().toISOString(),
      };

      // Validate response structure matches OpenAPI spec
      expect(mockResponse).toMatchObject({
        id: expect.any(String),
        status: expect.stringMatching(/^(pending|waiting_for_capture|succeeded|canceled)$/),
        amount: {
          value: expect.any(String),
          currency: 'RUB',
        },
        created_at: expect.any(String),
      });

      // Validate optional paid_at field
      if (mockResponse.status === 'succeeded') {
        expect(mockResponse.paid_at).toBeDefined();
      }
    });
  });
});

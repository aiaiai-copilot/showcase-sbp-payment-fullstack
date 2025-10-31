import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';
import { PaymentStorage } from '../types/payment.js';
import { YooKassaService } from '../services/yookassa.js';
import type { operations } from '../types/api.js';

// Type definitions from OpenAPI spec
type CreatePaymentRequest = operations['createPayment']['requestBody']['content']['application/json'];
type CreatePaymentResponse = operations['createPayment']['responses']['201']['content']['application/json'];
type GetPaymentResponse = operations['getPaymentStatus']['responses']['200']['content']['application/json'];
type ErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

/**
 * Payment routes plugin
 */
export async function paymentRoutes(
  fastify: FastifyInstance,
  storage: PaymentStorage,
  yookassaService: YooKassaService
) {
  /**
   * POST /api/payments - Create new payment
   */
  fastify.post<{
    Body: CreatePaymentRequest;
    Reply: CreatePaymentResponse | ErrorResponse;
  }>('/api/payments', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { amount, description } = request.body as CreatePaymentRequest;

      // Validate amount
      if (!amount || amount < 1 || amount > 100000) {
        return reply.status(400).send({
          error: {
            code: 'invalid_request',
            message: 'Payment amount must be between 1 and 100000 rubles',
          },
        });
      }

      // Create payment in YooKassa
      const yookassaPayment = await yookassaService.createPayment(
        amount,
        description
      );

      // Generate internal payment ID
      const paymentId = randomUUID();

      // Store payment locally
      storage.save({
        id: paymentId,
        yookassaId: yookassaPayment.id,
        amount,
        status: yookassaPayment.status,
        confirmationUrl: yookassaPayment.confirmation?.confirmation_url,
        createdAt: yookassaPayment.created_at,
        updatedAt: yookassaPayment.created_at,
      });

      // Return response matching OpenAPI spec
      const response: CreatePaymentResponse = {
        id: paymentId,
        status: yookassaPayment.status,
        amount: {
          value: yookassaPayment.amount.value,
          currency: 'RUB',
        },
        confirmation: {
          type: 'qr',
          confirmation_url: yookassaPayment.confirmation!.confirmation_url,
        },
        description: yookassaPayment.description,
        test: yookassaPayment.test,
        created_at: yookassaPayment.created_at,
      };

      return reply.status(201).send(response);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: {
          code: 'internal_error',
          message: 'Failed to create payment',
        },
      });
    }
  });

  /**
   * GET /api/payments/:id - Get payment status
   */
  fastify.get<{
    Params: { id: string };
    Reply: GetPaymentResponse | ErrorResponse;
  }>('/api/payments/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };

      // Find payment in storage
      const payment = storage.findById(id);

      if (!payment) {
        return reply.status(404).send({
          error: {
            code: 'not_found',
            message: 'Payment with specified ID not found',
          },
        });
      }

      // Build response matching OpenAPI spec
      const response: GetPaymentResponse = {
        id: payment.id,
        status: payment.status,
        amount: {
          value: payment.amount.toFixed(2),
          currency: 'RUB',
        },
        created_at: payment.createdAt,
        test: true,
      };

      // Add paid_at if payment succeeded
      if (payment.status === 'succeeded') {
        response.paid_at = payment.updatedAt;
      }

      return reply.status(200).send(response);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: {
          code: 'internal_error',
          message: 'Failed to retrieve payment status',
        },
      });
    }
  });
}

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PaymentStorage, PaymentStatus } from '../types/payment.js';
import type { operations } from '../types/webhook.js';

// Type definitions from OpenAPI spec
type WebhookRequest = operations['receiveYooKassaWebhook']['requestBody']['content']['application/json'];
type WebhookResponse = operations['receiveYooKassaWebhook']['responses']['200']['content']['application/json'];

/**
 * Webhook routes plugin
 */
export async function webhookRoutes(
  fastify: FastifyInstance,
  storage: PaymentStorage
) {
  /**
   * POST /api/webhooks/yookassa - Receive YooKassa webhook notification
   */
  fastify.post<{
    Body: WebhookRequest;
    Reply: WebhookResponse;
  }>(
    '/api/webhooks/yookassa',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const webhook = request.body as WebhookRequest;

        // Validate webhook structure early (before accessing nested properties)
        if (!webhook || !webhook.type || webhook.type !== 'notification') {
          return reply.status(400).send();
        }

        if (!webhook.event || !webhook.object || !webhook.object.id) {
          return reply.status(400).send();
        }

        fastify.log.info(
          `Received webhook: ${webhook.event} for payment ${webhook.object.id}`
        );

        // Find payment by YooKassa ID
        const payment = storage.findByYookassaId(webhook.object.id);

        if (!payment) {
          fastify.log.warn(
            `Payment with YooKassa ID ${webhook.object.id} not found in storage`
          );
          // Still return 200 to prevent YooKassa retries
          return reply.status(200).send({ success: true });
        }

        // Update payment status based on webhook event
        let newStatus: PaymentStatus;

        switch (webhook.event) {
          case 'payment.succeeded':
            newStatus = 'succeeded';
            break;
          case 'payment.canceled':
            newStatus = 'canceled';
            break;
          case 'payment.waiting_for_capture':
            newStatus = 'waiting_for_capture';
            break;
          default:
            fastify.log.warn(`Unknown webhook event: ${webhook.event}`);
            return reply.status(200).send({ success: true });
        }

        // Update payment status in storage
        const updatedPayment = storage.updateStatus(payment.id, newStatus);

        if (updatedPayment) {
          fastify.log.info(
            `Updated payment ${payment.id} status to ${newStatus}`
          );
        }

        // Return 200 to confirm receipt
        return reply.status(200).send({ success: true });
      } catch (error) {
        fastify.log.error(error);
        // Return 500 to trigger YooKassa retry mechanism
        return reply.status(500).send();
      }
    }
  );
}

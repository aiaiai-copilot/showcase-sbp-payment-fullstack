import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config.js';
import { PaymentStorage } from './types/payment.js';
import { YooKassaService } from './services/yookassa.js';
import { paymentRoutes } from './routes/payments.js';
import { webhookRoutes } from './routes/webhooks.js';

const fastify = Fastify({
  logger: {
    level: config.logLevel,
  },
});

// CORS configuration
await fastify.register(cors, {
  origin: config.frontendUrl,
  credentials: true,
});

// Initialize services
const storage = new PaymentStorage();
const yookassaService = new YooKassaService();

// Health check endpoint
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Test endpoint
fastify.get('/', async () => {
  return {
    message: 'YooKassa Payment Backend',
    version: '0.0.1',
    environment: config.nodeEnv,
  };
});

// Register routes with /api prefix to match OpenAPI spec
await fastify.register(async (app) => {
  await paymentRoutes(app, storage, yookassaService);
}, { prefix: '/api' });

await fastify.register(async (app) => {
  await webhookRoutes(app, storage);
}, { prefix: '/api' });

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: config.port, host: '0.0.0.0' });
    fastify.log.info(`Server listening on port ${config.port}`);
    fastify.log.info(`Environment: ${config.nodeEnv}`);
    fastify.log.info(`Frontend URL: ${config.frontendUrl}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

export default fastify;

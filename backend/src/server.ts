import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config.js';

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

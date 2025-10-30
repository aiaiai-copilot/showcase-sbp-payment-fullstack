import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // YooKassa API
  yookassa: {
    shopId: process.env.YOOKASSA_SHOP_ID || '',
    secretKey: process.env.YOOKASSA_SECRET_KEY || '',
    apiUrl: 'https://api.yookassa.ru/v3',
  },

  // CORS
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
} as const;

// Validation
if (!config.yookassa.shopId) {
  console.warn('Warning: YOOKASSA_SHOP_ID is not set');
}

if (!config.yookassa.secretKey) {
  console.warn('Warning: YOOKASSA_SECRET_KEY is not set');
}

if (config.yookassa.secretKey && !config.yookassa.secretKey.startsWith('test_')) {
  console.error('ERROR: Only test YooKassa keys are allowed!');
  process.exit(1);
}

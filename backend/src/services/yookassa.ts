import { config } from '../config.js';

/**
 * YooKassa API response for payment creation
 */
export interface YooKassaPaymentResponse {
  id: string;
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled';
  amount: {
    value: string;
    currency: string;
  };
  description?: string;
  confirmation?: {
    type: string;
    confirmation_url: string;
  };
  created_at: string;
  test: boolean;
  paid: boolean;
  refundable: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Payment creation request payload for YooKassa API
 */
export interface CreateYooKassaPaymentRequest {
  amount: {
    value: string;
    currency: string;
  };
  confirmation: {
    type: string;
    return_url?: string;
  };
  description?: string;
  capture?: boolean;
  test?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * YooKassa API client
 */
export class YooKassaService {
  private readonly apiUrl: string;
  private readonly shopId: string;
  private readonly secretKey: string;

  constructor() {
    this.apiUrl = config.yookassa.apiUrl;
    this.shopId = config.yookassa.shopId;
    this.secretKey = config.yookassa.secretKey;

    if (!this.shopId || !this.secretKey) {
      throw new Error('YooKassa credentials not configured');
    }
  }

  /**
   * Create a new payment in YooKassa
   */
  async createPayment(
    amount: number,
    description?: string
  ): Promise<YooKassaPaymentResponse> {
    const payload: CreateYooKassaPaymentRequest = {
      amount: {
        value: amount.toFixed(2),
        currency: 'RUB',
      },
      confirmation: {
        type: 'redirect',
        return_url: config.frontendUrl,
      },
      description: description || 'Payment via demo app',
      capture: true,
      test: true,
    };

    const response = await fetch(`${this.apiUrl}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': this.generateIdempotenceKey(),
        Authorization: `Basic ${this.getAuthHeader()}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `YooKassa API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return response.json();
  }

  /**
   * Get payment status from YooKassa
   */
  async getPayment(paymentId: string): Promise<YooKassaPaymentResponse> {
    const response = await fetch(`${this.apiUrl}/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${this.getAuthHeader()}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `YooKassa API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return response.json();
  }

  /**
   * Generate Basic Auth header value
   */
  private getAuthHeader(): string {
    const credentials = `${this.shopId}:${this.secretKey}`;
    return Buffer.from(credentials).toString('base64');
  }

  /**
   * Generate unique idempotence key for payment creation
   */
  private generateIdempotenceKey(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}

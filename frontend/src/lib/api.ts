import type { operations } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export type CreatePaymentRequest = operations['createPayment']['requestBody']['content']['application/json'];
export type CreatePaymentResponse = operations['createPayment']['responses']['201']['content']['application/json'];
export type GetPaymentResponse = operations['getPaymentStatus']['responses']['200']['content']['application/json'];
export type ApiError = {
  error: {
    code: string;
    message: string;
  };
};

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async createPayment(data: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    const response = await fetch(`${this.baseUrl}/api/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error.message);
    }

    return response.json();
  }

  async getPaymentStatus(id: string): Promise<GetPaymentResponse> {
    const response = await fetch(`${this.baseUrl}/api/payments/${id}`);

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error.message);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

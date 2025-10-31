import { useMutation } from '@tanstack/react-query';
import { apiClient, type CreatePaymentRequest, type CreatePaymentResponse } from '@/lib/api';

export function useCreatePayment() {
  return useMutation<CreatePaymentResponse, Error, CreatePaymentRequest>({
    mutationFn: (data: CreatePaymentRequest) => apiClient.createPayment(data),
  });
}

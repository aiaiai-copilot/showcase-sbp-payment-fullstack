import { useQuery } from '@tanstack/react-query';
import { apiClient, type GetPaymentResponse } from '@/lib/api';

export function usePaymentStatus(paymentId: string | null, enabled: boolean = true) {
  return useQuery<GetPaymentResponse, Error>({
    queryKey: ['payment', paymentId],
    queryFn: () => {
      if (!paymentId) {
        throw new Error('Payment ID is required');
      }
      return apiClient.getPaymentStatus(paymentId);
    },
    enabled: enabled && !!paymentId,
    refetchInterval: 3000, // Poll every 3 seconds
    refetchIntervalInBackground: true,
  });
}

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCreatePayment } from '@/hooks/useCreatePayment';
import type { CreatePaymentResponse } from '@/lib/api';

const paymentSchema = z.object({
  amount: z
    .number()
    .min(1, 'Amount must be at least 1 ruble')
    .max(100000, 'Amount must not exceed 100,000 rubles'),
  description: z
    .string()
    .max(128, 'Description must not exceed 128 characters')
    .optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  onSuccess: (payment: CreatePaymentResponse) => void;
}

export function PaymentForm({ onSuccess }: PaymentFormProps) {
  const createPayment = useCreatePayment();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 100,
      description: '',
    },
  });

  const onSubmit = async (data: PaymentFormData) => {
    try {
      const payment = await createPayment.mutateAsync(data);
      onSuccess(payment);
      reset();
    } catch (error) {
      // Error is already handled by mutation
      console.error('Payment creation failed:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Payment</CardTitle>
        <CardDescription>
          Enter payment details to generate a QR code for SBP payment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">
              Amount (RUB) <span className="text-red-600">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="100.00"
              aria-label="Payment amount in rubles"
              aria-required="true"
              aria-invalid={!!errors.amount}
              aria-describedby={errors.amount ? 'amount-error' : undefined}
              {...register('amount', { valueAsNumber: true })}
            />
            {errors.amount && (
              <p id="amount-error" className="text-sm text-red-600" role="alert">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              type="text"
              placeholder="e.g., Test payment"
              maxLength={128}
              aria-label="Payment description"
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'description-error' : undefined}
              {...register('description')}
            />
            {errors.description && (
              <p id="description-error" className="text-sm text-red-600" role="alert">
                {errors.description.message}
              </p>
            )}
          </div>

          {createPayment.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {createPayment.error?.message || 'Failed to create payment. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={createPayment.isPending}
            aria-busy={createPayment.isPending}
          >
            {createPayment.isPending ? 'Creating...' : 'Create Payment'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

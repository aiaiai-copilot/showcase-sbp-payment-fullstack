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
    watch,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 100,
      description: '',
    },
  });

  const amount = watch('amount');

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
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl text-center">Pay via SBP</CardTitle>
        <CardDescription className="text-base">
          Enter payment details to generate a QR code for SBP payment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-semibold">
              Amount (RUB) <span className="text-red-600">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="100.00"
              className="h-12 text-lg border-2 focus:border-green-600 focus:ring-green-600"
              aria-label="Payment amount in rubles"
              aria-required="true"
              aria-invalid={!!errors.amount}
              aria-describedby={errors.amount ? 'amount-error' : undefined}
              {...register('amount', { valueAsNumber: true })}
            />
            {errors.amount && (
              <p id="amount-error" className="text-sm text-red-600 font-medium" role="alert">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">
              Description (optional)
            </Label>
            <Input
              id="description"
              type="text"
              placeholder="e.g., Test payment"
              maxLength={128}
              className="h-12 text-lg border-2 focus:border-green-600 focus:ring-green-600"
              aria-label="Payment description"
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'description-error' : undefined}
              {...register('description')}
            />
            {errors.description && (
              <p id="description-error" className="text-sm text-red-600 font-medium" role="alert">
                {errors.description.message}
              </p>
            )}
          </div>

          {createPayment.isError && (
            <Alert variant="destructive" className="border-2">
              <AlertDescription className="font-medium">
                {createPayment.error?.message || 'Failed to create payment. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-200"
            disabled={createPayment.isPending}
            aria-busy={createPayment.isPending}
          >
            {createPayment.isPending ? 'Creating...' : `Pay ${amount || 100} ₽`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

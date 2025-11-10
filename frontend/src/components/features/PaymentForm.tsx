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

// Form input schema (before transformation)
const paymentFormSchema = z.object({
  amount: z.string().min(1, 'Amount is required'),
  description: z
    .string()
    .max(128, 'Description must not exceed 128 characters')
    .optional(),
});

// Transformed schema for API (after transformation)
const paymentSchema = z.object({
  amount: z
    .string()
    .transform((val) => {
      // Replace comma with dot for locales that use comma as decimal separator
      const normalized = val.replace(',', '.');
      const num = parseFloat(normalized);
      if (isNaN(num)) {
        throw new Error('Invalid number');
      }
      return num;
    })
    .pipe(
      z
        .number()
        .min(1, 'Amount must be at least 1 ruble')
        .max(100000, 'Amount must not exceed 100,000 rubles')
    ),
  description: z
    .string()
    .max(128, 'Description must not exceed 128 characters')
    .optional(),
});

type PaymentFormInput = z.infer<typeof paymentFormSchema>;

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
  } = useForm<PaymentFormInput>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: '100',
      description: '',
    },
  });

  const amount = watch('amount');
  // Parse amount for display, handling both comma and dot
  const displayAmount = amount ? parseFloat(String(amount).replace(',', '.')) : 100;

  const onSubmit = async (formData: PaymentFormInput) => {
    try {
      // Transform and validate with the full schema
      const validatedData = await paymentSchema.parseAsync(formData);
      const payment = await createPayment.mutateAsync(validatedData);
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
        <CardDescription className="text-base text-center">
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
              type="text"
              inputMode="decimal"
              pattern="[0-9]+([.,][0-9]{1,2})?"
              placeholder="100"
              className="h-12 text-lg border-2 focus:border-green-600 focus:ring-green-600"
              aria-label="Payment amount in rubles"
              aria-required="true"
              aria-invalid={!!errors.amount}
              aria-describedby={errors.amount ? 'amount-error' : undefined}
              {...register('amount')}
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
            {createPayment.isPending ? 'Creating...' : `Pay ${displayAmount} ₽`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

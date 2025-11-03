import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import { usePaymentStatus } from '@/hooks/usePaymentStatus';

interface PaymentStatusProps {
  paymentId: string;
  onCreateNew: () => void;
}

export function PaymentStatus({ paymentId, onCreateNew }: PaymentStatusProps) {
  const { data: payment, isLoading, error, refetch } = usePaymentStatus(paymentId, true);

  useEffect(() => {
    // Stop polling when payment is in final state
    if (payment?.status === 'succeeded' || payment?.status === 'canceled') {
      return;
    }
  }, [payment?.status]);

  const getStatusIcon = () => {
    if (isLoading) return <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />;

    switch (payment?.status) {
      case 'succeeded':
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case 'canceled':
        return <XCircle className="h-8 w-8 text-red-600" />;
      case 'pending':
      case 'waiting_for_capture':
        return <Clock className="h-8 w-8 text-yellow-600" />;
      default:
        return <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />;
    }
  };

  const getStatusMessage = () => {
    if (isLoading) return 'Loading payment status...';

    switch (payment?.status) {
      case 'succeeded':
        return 'Payment completed successfully!';
      case 'canceled':
        return 'Payment was canceled';
      case 'pending':
        return 'Waiting for payment...';
      case 'waiting_for_capture':
        return 'Payment authorized, waiting for capture...';
      default:
        return 'Checking payment status...';
    }
  };

  const getAlertVariant = () => {
    switch (payment?.status) {
      case 'succeeded':
        return 'success';
      case 'canceled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const isFinalState = payment?.status === 'succeeded' || payment?.status === 'canceled';

  const getStatusColor = () => {
    switch (payment?.status) {
      case 'succeeded':
        return 'border-t-green-600';
      case 'canceled':
        return 'border-t-red-600';
      case 'pending':
      case 'waiting_for_capture':
        return 'border-t-yellow-600';
      default:
        return 'border-t-neutral-400';
    }
  };

  return (
    <Card className={`w-full max-w-md mx-auto border-t-4 ${getStatusColor()}`}>
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl">Payment Status</CardTitle>
        <CardDescription className="text-base">
          {isFinalState
            ? 'Payment process completed'
            : 'Monitoring payment status (updates every 3 seconds)'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center py-6 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl" aria-live="polite" aria-atomic="true">
          {getStatusIcon()}
        </div>

        <Alert variant={getAlertVariant()} className="border-2">
          <AlertTitle className="text-center text-lg font-semibold">{getStatusMessage()}</AlertTitle>
          {payment && (
            <AlertDescription>
              <div className="space-y-2 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-700 font-medium">Payment ID:</span>
                  <span className="font-mono text-xs bg-neutral-100 px-2 py-1 rounded">{payment.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-700 font-medium">Amount:</span>
                  <span className="font-bold text-lg">
                    {payment.amount.value} {payment.amount.currency}
                  </span>
                </div>
                {payment.description && (
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-700 font-medium">Description:</span>
                    <span className="font-semibold text-neutral-900">{payment.description}</span>
                  </div>
                )}
                {payment.paid_at && (
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-700 font-medium">Paid at:</span>
                    <span className="font-semibold text-neutral-900">
                      {new Date(payment.paid_at).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </AlertDescription>
          )}
        </Alert>

        {error && (
          <Alert variant="destructive" className="border-2">
            <AlertDescription className="font-medium">
              {error.message || 'Failed to fetch payment status'}
            </AlertDescription>
          </Alert>
        )}

        {!isFinalState && (
          <p className="text-sm text-neutral-700 text-center bg-neutral-50 p-3 rounded-lg border-2 border-neutral-200">
            This page will automatically update when the payment status changes.
          </p>
        )}
      </CardContent>
      <CardFooter className="flex gap-3 pt-2">
        {!isFinalState && (
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="flex-1 h-11 border-2 hover:bg-neutral-50"
            disabled={isLoading}
            aria-label="Manually refresh payment status"
          >
            Refresh
          </Button>
        )}
        <Button
          onClick={onCreateNew}
          className={`${isFinalState ? 'w-full' : 'flex-1'} h-11 bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-200`}
          aria-label="Create new payment"
        >
          Create New Payment
        </Button>
      </CardFooter>
    </Card>
  );
}

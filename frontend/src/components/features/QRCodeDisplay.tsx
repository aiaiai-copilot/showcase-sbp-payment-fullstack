import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { CreatePaymentResponse } from '@/lib/api';

interface QRCodeDisplayProps {
  payment: CreatePaymentResponse;
  onCancel: () => void;
  onProceedToStatus: () => void;
}

export function QRCodeDisplay({ payment, onCancel, onProceedToStatus }: QRCodeDisplayProps) {
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    payment.confirmation.confirmation_url
  )}`;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Scan QR Code to Pay</CardTitle>
        <CardDescription>
          Use your banking app with SBP support to scan this QR code
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <img
            src={qrCodeUrl}
            alt="Payment QR Code"
            className="w-64 h-64 border border-neutral-200 rounded-lg"
          />
        </div>

        <Alert>
          <AlertTitle>Payment Details</AlertTitle>
          <AlertDescription>
            <div className="space-y-1 mt-2">
              <div className="flex justify-between">
                <span className="text-neutral-600">Amount:</span>
                <span className="font-semibold">
                  {payment.amount.value} {payment.amount.currency}
                </span>
              </div>
              {payment.description && (
                <div className="flex justify-between">
                  <span className="text-neutral-600">Description:</span>
                  <span className="font-semibold">{payment.description}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-600">Status:</span>
                <span className="font-semibold capitalize">{payment.status}</span>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <div className="text-sm text-neutral-600 text-center">
          <p>1. Open your banking app</p>
          <p>2. Find the "Pay by QR" or "SBP" option</p>
          <p>3. Scan the QR code above</p>
          <p>4. Confirm the payment</p>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          aria-label="Cancel payment and return to form"
        >
          Cancel
        </Button>
        <Button
          onClick={onProceedToStatus}
          className="flex-1 bg-green-600 hover:bg-green-700"
          aria-label="Check payment status"
        >
          Check Status
        </Button>
      </CardFooter>
    </Card>
  );
}

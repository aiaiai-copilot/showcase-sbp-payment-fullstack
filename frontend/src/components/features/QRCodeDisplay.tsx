import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { CreatePaymentResponse } from '@/lib/api';
import sbpLogo from '@/assets/images/sbp-logo.svg';

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
    <Card className="w-full max-w-md mx-auto border-t-4 border-t-green-600">
      <CardHeader className="space-y-3 text-center">
        <div className="flex justify-center">
          <img
            src={sbpLogo}
            alt="СБП"
            className="h-12"
          />
        </div>
        <CardDescription className="text-base">
          Use your banking app with SBP support to scan this QR code
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center p-4 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl">
          <img
            src={qrCodeUrl}
            alt="Payment QR Code"
            className="w-64 h-64 border-4 border-white shadow-lg rounded-lg"
          />
        </div>

        <Alert className="border-2 border-green-200 bg-green-50">
          <AlertTitle className="text-green-900 font-semibold">Payment Details</AlertTitle>
          <AlertDescription>
            <div className="space-y-2 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-neutral-700 font-medium">Amount:</span>
                <span className="font-bold text-green-700 text-lg">
                  {payment.amount.value} {payment.amount.currency}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-700 font-medium">Status:</span>
                <span className="font-semibold text-neutral-900 capitalize">{payment.status}</span>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter className="flex gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1 h-11 border-2 hover:bg-neutral-50"
          aria-label="Cancel payment and return to form"
        >
          Cancel
        </Button>
        <Button
          onClick={onProceedToStatus}
          className="flex-1 h-11 bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-200"
          aria-label="Check payment status"
        >
          Check Status
        </Button>
      </CardFooter>
    </Card>
  );
}

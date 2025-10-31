import { useState } from 'react';
import { PaymentForm } from '@/components/features/PaymentForm';
import { QRCodeDisplay } from '@/components/features/QRCodeDisplay';
import { PaymentStatus } from '@/components/features/PaymentStatus';
import type { CreatePaymentResponse } from '@/lib/api';

type PaymentFlowState = 'form' | 'qr' | 'status';

function App() {
  const [flowState, setFlowState] = useState<PaymentFlowState>('form');
  const [currentPayment, setCurrentPayment] = useState<CreatePaymentResponse | null>(null);

  const handlePaymentCreated = (payment: CreatePaymentResponse) => {
    setCurrentPayment(payment);
    setFlowState('qr');
  };

  const handleCancelPayment = () => {
    setCurrentPayment(null);
    setFlowState('form');
  };

  const handleCheckStatus = () => {
    setFlowState('status');
  };

  const handleCreateNew = () => {
    setCurrentPayment(null);
    setFlowState('form');
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded font-bold text-sm shadow-lg z-50">
        TEST MODE
      </div>

      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">YooKassa Payment Demo</h1>
          <p className="text-neutral-600">
            Secure SBP payment integration with QR code
          </p>
        </header>

        <main className="max-w-2xl mx-auto">
          {flowState === 'form' && (
            <PaymentForm onSuccess={handlePaymentCreated} />
          )}

          {flowState === 'qr' && currentPayment && (
            <QRCodeDisplay
              payment={currentPayment}
              onCancel={handleCancelPayment}
              onProceedToStatus={handleCheckStatus}
            />
          )}

          {flowState === 'status' && currentPayment && (
            <PaymentStatus
              paymentId={currentPayment.id}
              onCreateNew={handleCreateNew}
            />
          )}
        </main>

        <footer className="text-center mt-8 text-sm text-neutral-500">
          <p>This is a demo application. No real payments will be processed.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;

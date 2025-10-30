/**
 * Payment status from YooKassa
 */
export type PaymentStatus =
  | 'pending'
  | 'waiting_for_capture'
  | 'succeeded'
  | 'canceled';

/**
 * Internal payment record
 */
export interface Payment {
  id: string;
  yookassaId?: string;
  amount: number;
  status: PaymentStatus;
  confirmationUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * In-memory storage for demo
 */
export class PaymentStorage {
  private payments = new Map<string, Payment>();

  save(payment: Payment): void {
    this.payments.set(payment.id, payment);
  }

  findById(id: string): Payment | undefined {
    return this.payments.get(id);
  }

  findByYookassaId(yookassaId: string): Payment | undefined {
    return Array.from(this.payments.values()).find(
      (p) => p.yookassaId === yookassaId
    );
  }

  updateStatus(id: string, status: PaymentStatus): Payment | undefined {
    const payment = this.payments.get(id);
    if (payment) {
      payment.status = status;
      payment.updatedAt = new Date().toISOString();
      this.payments.set(id, payment);
    }
    return payment;
  }

  getAll(): Payment[] {
    return Array.from(this.payments.values());
  }
}

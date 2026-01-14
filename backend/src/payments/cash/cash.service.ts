import { Injectable } from '@nestjs/common';

@Injectable()
export class CashService {
  async createCashPayment(dto: { payment_id: string; amount: number }) {
    const { payment_id, amount } = dto;

    return {
      transaction_id: `CASH-${Date.now()}`,
      payment_url: null,
      qr_code: null,
      message: 'Please collect cash from customer',
      amount_to_collect: amount,
    };
  }

  calculateChange(received: number, total: number): number {
    if (received < total) {
      throw new Error('Received amount is less than total');
    }
    return received - total;
  }

  suggestChange(changeAmount: number): { [key: string]: number } {
    const denominations = [
      500000, 200000, 100000, 50000, 20000, 10000, 5000, 2000, 1000,
    ];
    const result: { [key: string]: number } = {};
    let remaining = changeAmount;

    for (const denom of denominations) {
      if (remaining >= denom) {
        const count = Math.floor(remaining / denom);
        result[`${denom}đ`] = count;
        remaining -= count * denom;
      }
    }

    return result;
  }
}

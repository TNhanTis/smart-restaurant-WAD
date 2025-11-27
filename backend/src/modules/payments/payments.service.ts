import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument, PaymentStatus } from './schemas/payment.schema';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {}

  async create(paymentData: Partial<Payment>): Promise<Payment> {
    const transactionId = this.generateTransactionId();
    const createdPayment = new this.paymentModel({
      ...paymentData,
      transactionId,
    });
    return createdPayment.save();
  }

  async findByOrderId(orderId: string): Promise<Payment | null> {
    return this.paymentModel.findOne({ orderId }).exec();
  }

  async updateStatus(id: string, status: PaymentStatus): Promise<Payment> {
    return this.paymentModel
      .findByIdAndUpdate(
        id,
        {
          status,
          ...(status === PaymentStatus.COMPLETED && { paidAt: new Date() }),
        },
        { new: true },
      )
      .exec();
  }

  private generateTransactionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9).toUpperCase();
    return `TXN-${timestamp}-${random}`;
  }
}

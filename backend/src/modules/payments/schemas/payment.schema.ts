import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  ONLINE = 'ONLINE',
  MOMO = 'MOMO',
  STRIPE = 'STRIPE',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true, unique: true })
  transactionId: string;

  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  orderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ type: String, enum: PaymentMethod, required: true })
  method: PaymentMethod;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Prop()
  stripePaymentIntentId: string;

  @Prop()
  stripeChargeId: string;

  @Prop({ type: Object })
  metadata: Record<string, any>;

  @Prop()
  paidAt: Date;

  @Prop()
  refundedAt: Date;

  @Prop()
  failureReason: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// Indexes
PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ tenantId: 1, createdAt: -1 });
PaymentSchema.index({ transactionId: 1 });

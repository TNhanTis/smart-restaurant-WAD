import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TenantDocument = Tenant & Document;

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

@Schema({ timestamps: true })
export class Tenant {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  phone: string;

  @Prop()
  address: string;

  @Prop()
  description: string;

  @Prop()
  logo: string;

  @Prop({ type: String, enum: TenantStatus, default: TenantStatus.ACTIVE })
  status: TenantStatus;

  @Prop({ type: Object })
  settings: {
    currency: string;
    timezone: string;
    language: string;
    taxRate: number;
  };

  @Prop()
  subscriptionPlan: string;

  @Prop()
  subscriptionExpiry: Date;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);

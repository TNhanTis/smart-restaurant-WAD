import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MenuDocument = Menu & Document;

export enum MenuStatus {
  AVAILABLE = 'AVAILABLE',
  UNAVAILABLE = 'UNAVAILABLE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

@Schema({ timestamps: true })
export class Menu {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  image: string;

  @Prop({ required: true })
  category: string;

  @Prop({ type: String, enum: MenuStatus, default: MenuStatus.AVAILABLE })
  status: MenuStatus;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: 0 })
  preparationTime: number; // in minutes

  @Prop({ default: false })
  isVegetarian: boolean;

  @Prop({ default: false })
  isSpicy: boolean;

  @Prop()
  allergens: string[];

  @Prop({ default: 0 })
  calories: number;

  @Prop({ default: 0 })
  discount: number; // percentage
}

export const MenuSchema = SchemaFactory.createForClass(Menu);

// Indexes
MenuSchema.index({ tenantId: 1, category: 1 });
MenuSchema.index({ tenantId: 1, status: 1 });

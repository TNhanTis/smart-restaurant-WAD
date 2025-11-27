import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TableDocument = Table & Document;

export enum TableStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
  CLEANING = 'CLEANING',
}

@Schema({ timestamps: true })
export class Table {
  @Prop({ required: true })
  tableNumber: string;

  @Prop()
  tableName: string;

  @Prop({ required: true })
  capacity: number;

  @Prop({ type: String, enum: TableStatus, default: TableStatus.AVAILABLE })
  status: TableStatus;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  qrCode: string;

  @Prop()
  qrCodeUrl: string;

  @Prop()
  location: string; // e.g., "Floor 1", "Outdoor", "VIP Room"

  @Prop({ default: true })
  isActive: boolean;
}

export const TableSchema = SchemaFactory.createForClass(Table);

// Indexes
TableSchema.index({ tenantId: 1, tableNumber: 1 }, { unique: true });
TableSchema.index({ qrCode: 1 });

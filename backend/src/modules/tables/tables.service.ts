import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Table, TableDocument } from './schemas/table.schema';
import * as QRCode from 'qrcode';
import { randomBytes } from 'crypto';

@Injectable()
export class TablesService {
  constructor(
    @InjectModel(Table.name) private tableModel: Model<TableDocument>,
  ) {}

  async create(tenantId: string, tableNumber: string, capacity: number): Promise<Table> {
    const qrCode = randomBytes(16).toString('hex');
    const qrCodeUrl = await this.generateQRCode(qrCode);

    const createdTable = new this.tableModel({
      tenantId,
      tableNumber,
      capacity,
      qrCode,
      qrCodeUrl,
    });

    return createdTable.save();
  }

  async findAll(tenantId: string): Promise<Table[]> {
    return this.tableModel.find({ tenantId }).sort({ tableNumber: 1 }).exec();
  }

  async findOne(id: string): Promise<Table> {
    const table = await this.tableModel.findById(id).exec();
    if (!table) {
      throw new NotFoundException('Table not found');
    }
    return table;
  }

  async findByQRCode(qrCode: string): Promise<Table> {
    const table = await this.tableModel
      .findOne({ qrCode })
      .populate('tenantId')
      .exec();

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    return table;
  }

  private async generateQRCode(data: string): Promise<string> {
    try {
      return await QRCode.toDataURL(data);
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }
}

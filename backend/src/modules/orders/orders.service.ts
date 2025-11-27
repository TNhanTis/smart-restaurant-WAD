import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const orderNumber = await this.generateOrderNumber(createOrderDto.tenantId);

    // Calculate totals
    const subtotal = createOrderDto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax - (createOrderDto.discount || 0);

    const createdOrder = new this.orderModel({
      ...createOrderDto,
      orderNumber,
      subtotal,
      tax,
      total,
    });

    const savedOrder = await createdOrder.save();

    // TODO: Emit socket event for real-time updates
    // this.socketGateway.emitOrderCreated(savedOrder);

    return savedOrder;
  }

  async findAll(tenantId: string, status?: string): Promise<Order[]> {
    const filter: any = { tenantId };
    if (status) filter.status = status;

    return this.orderModel
      .find(filter)
      .populate('tableId')
      .populate('customerId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel
      .findById(id)
      .populate('tableId')
      .populate('customerId')
      .populate('assignedStaffId')
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.orderModel
      .findByIdAndUpdate(
        id,
        {
          status: updateStatusDto.status,
          ...(updateStatusDto.status === OrderStatus.COMPLETED && {
            completedAt: new Date(),
          }),
        },
        { new: true },
      )
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // TODO: Emit socket event
    // this.socketGateway.emitOrderUpdated(order);

    return order;
  }

  private async generateOrderNumber(tenantId: string): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    
    const count = await this.orderModel.countDocuments({
      tenantId,
      createdAt: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999)),
      },
    });

    return `ORD-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }
}

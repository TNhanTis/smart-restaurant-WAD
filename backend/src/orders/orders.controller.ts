import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ValidationPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * POST /api/orders
   * Create a new order from cart
   */
  @Post()
  async create(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createDto: CreateOrderDto,
  ) {
    return this.ordersService.create(createDto);
  }

  /**
   * GET /api/orders/:id
   * Get order details
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ordersService.getOrderDetails(id);
  }
}

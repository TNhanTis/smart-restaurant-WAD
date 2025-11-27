import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create payment' })
  create(@Body() paymentData: any) {
    return this.paymentsService.create(paymentData);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get payment by order ID' })
  findByOrderId(@Param('orderId') orderId: string) {
    return this.paymentsService.findByOrderId(orderId);
  }
}

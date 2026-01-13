import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { MomoService } from './momo/momo.service';
import { ZalopayService } from './zalopay/zalopay.service';
import { VnpayService } from './vnpay/vnpay.service';
import { CashService } from './cash/cash.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, MomoService, ZalopayService, VnpayService, CashService]
})
export class PaymentsModule {}

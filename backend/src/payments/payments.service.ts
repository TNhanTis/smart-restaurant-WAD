import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MomoService } from './momo/momo.service';
import { ZalopayService } from './zalopay/zalopay.service';
import { VnpayService } from './vnpay/vnpay.service';
import { CashService } from './cash/cash.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly momoService: MomoService,
    private readonly zalopayService: ZalopayService,
    private readonly vnpayService: VnpayService,
    private readonly cashService: CashService,
  ) {}
}

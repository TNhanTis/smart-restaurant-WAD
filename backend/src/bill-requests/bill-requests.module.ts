import { Module } from '@nestjs/common';
import { BillRequestsController } from './bill-requests.controller';
import { BillRequestsService } from './bill-requests.service';

@Module({
  controllers: [BillRequestsController],
  providers: [BillRequestsService]
})
export class BillRequestsModule {}

import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BillRequestsService } from './bill-requests.service';
import { CreateBillRequestDto } from './dto/create-bill-request.dto';
import {
  BillRequestResponseDto,
  AcceptBillRequestResponseDto,
} from './dto/bill-request-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Bill Requests')
@Controller('bill-requests')
export class BillRequestsController {
  constructor(private readonly billRequestsService: BillRequestsService) {}

  @Post()
  @ApiOperation({
    summary: 'Tạo bill request (Customer)',
    description: 'Customer bấm "Request Bill" để yêu cầu thanh toán',
  })
  @ApiResponse({ status: 201, type: BillRequestResponseDto })
  async create(@Body() dto: CreateBillRequestDto) {
    return this.billRequestsService.createBillRequest(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('waiter', 'admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lấy danh sách bill requests (Waiter)',
    description: 'Waiter xem tất cả bill requests của restaurant',
  })
  async findAll(@Request() req, @Query('status') status?: string) {
    // TODO: Get restaurant_id from user
    const restaurantId = 'xxx'; // Placeholder
    return this.billRequestsService.getBillRequestsByRestaurant(
      restaurantId,
      status,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết bill request' })
  async findOne(@Param('id') id: string) {
    return this.billRequestsService.getBillRequestById(id);
  }

  @Get(':id/status')
  @ApiOperation({
    summary: 'Kiểm tra trạng thái bill request (Customer)',
    description: 'Customer polling để xem waiter đã accept chưa',
  })
  async getStatus(@Param('id') id: string) {
    const billRequest = await this.billRequestsService.getBillRequestById(id);
    return {
      id: billRequest.id,
      status: billRequest.status,
      waiter_name: billRequest.waiter?.full_name,
      accepted_at: billRequest.accepted_at,
    };
  }

  @Post(':id/accept')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('waiter')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Accept bill request (Waiter)',
    description: 'Waiter chấp nhận và tạo payment',
  })
  @ApiResponse({ status: 200, type: AcceptBillRequestResponseDto })
  async accept(@Param('id') id: string, @Request() req) {
    return this.billRequestsService.acceptBillRequest(id, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hủy bill request' })
  async cancel(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.billRequestsService.cancelBillRequest(id, reason);
  }
}

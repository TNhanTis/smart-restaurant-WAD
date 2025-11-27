import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TablesService } from './tables.service';

@ApiTags('tables')
@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post()
  @ApiOperation({ summary: 'Create new table with QR code' })
  create(
    @Body('tenantId') tenantId: string,
    @Body('tableNumber') tableNumber: string,
    @Body('capacity') capacity: number,
  ) {
    return this.tablesService.create(tenantId, tableNumber, capacity);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tables for tenant' })
  findAll(@Query('tenantId') tenantId: string) {
    return this.tablesService.findAll(tenantId);
  }

  @Get('qr/:qrCode')
  @ApiOperation({ summary: 'Get table by QR code' })
  findByQRCode(@Param('qrCode') qrCode: string) {
    return this.tablesService.findByQRCode(qrCode);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get table by ID' })
  findOne(@Param('id') id: string) {
    return this.tablesService.findOne(id);
  }
}

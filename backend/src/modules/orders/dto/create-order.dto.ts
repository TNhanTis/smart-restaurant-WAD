import { IsString, IsArray, IsOptional, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class OrderItemDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  menuId: string;

  @ApiProperty({ example: 'Phở Bò' })
  @IsString()
  name: string;

  @ApiProperty({ example: 65000 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 'No onions', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateOrderDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  tenantId: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012' })
  @IsString()
  tableId: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439013', required: false })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiProperty({ example: 'Nguyễn Văn A', required: false })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ example: 0, required: false })
  @IsNumber()
  @IsOptional()
  discount?: number;

  @ApiProperty({ example: 'No ice in drinks', required: false })
  @IsString()
  @IsOptional()
  specialInstructions?: string;
}

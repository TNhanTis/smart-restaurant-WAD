import {
  IsUUID,
  IsString,
  IsIn,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBillRequestDto {
  @ApiProperty({
    description: 'ID của bàn',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  table_id: string;

  @ApiProperty({
    description: 'Phương thức thanh toán',
    enum: ['momo', 'zalopay', 'vnpay', 'cash'],
    example: 'momo',
  })
  @IsString()
  @IsIn(['momo', 'zalopay', 'vnpay', 'cash'])
  payment_method: string;

  @ApiPropertyOptional({
    description: 'Tiền tips (VND)',
    default: 0,
    example: 50000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tips_amount?: number = 0;

  @ApiPropertyOptional({
    description: 'Ghi chú của khách',
    example: 'Cảm ơn nhà hàng!',
  })
  @IsOptional()
  @IsString()
  customer_note?: string;
}

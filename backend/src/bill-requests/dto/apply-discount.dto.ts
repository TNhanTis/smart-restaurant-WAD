import { IsString, IsNumber, IsEnum, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
  NONE = 'none',
}

export class ApplyDiscountDto {
  @ApiProperty({
    enum: DiscountType,
    example: 'percentage',
    description: 'Type of discount: percentage, fixed, or none',
  })
  @IsEnum(DiscountType)
  discount_type: DiscountType;

  @ApiProperty({
    example: 10,
    description: 'Discount value (10 for 10% or 50000 for 50,000đ)',
  })
  @IsNumber()
  @Min(0)
  discount_value: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Tax rate in percentage (optional, default 0)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  tax_rate?: number;
}

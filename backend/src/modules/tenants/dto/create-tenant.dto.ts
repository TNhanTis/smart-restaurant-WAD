import { IsString, IsEmail, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({ example: 'Nhà hàng ABC' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'nha-hang-abc' })
  @IsString()
  slug: string;

  @ApiProperty({ example: 'contact@abc-restaurant.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '0901234567', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: '123 Nguyen Hue, Q1, HCMC', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'Fine dining restaurant', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  settings?: {
    currency?: string;
    timezone?: string;
    language?: string;
    taxRate?: number;
  };
}

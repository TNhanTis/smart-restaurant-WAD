import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MenuStatus } from '../schemas/menu.schema';

export class CreateMenuDto {
  @ApiProperty({ example: 'Phở Bò' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Phở bò truyền thống Hà Nội' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 65000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'https://example.com/pho.jpg', required: false })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ example: 'Món chính' })
  @IsString()
  category: string;

  @ApiProperty({ enum: MenuStatus, default: MenuStatus.AVAILABLE })
  @IsEnum(MenuStatus)
  @IsOptional()
  status?: MenuStatus;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  tenantId: string;

  @ApiProperty({ example: ['noodles', 'beef'], required: false })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({ example: 15, required: false })
  @IsNumber()
  @IsOptional()
  preparationTime?: number;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isVegetarian?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isSpicy?: boolean;

  @ApiProperty({ example: ['peanuts'], required: false })
  @IsArray()
  @IsOptional()
  allergens?: string[];

  @ApiProperty({ example: 450, required: false })
  @IsNumber()
  @IsOptional()
  calories?: number;

  @ApiProperty({ example: 10, required: false })
  @IsNumber()
  @IsOptional()
  discount?: number;
}

import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Nhà hàng ABC' })
  @IsString()
  tenantName: string;

  @ApiProperty({ example: 'nha-hang-abc' })
  @IsString()
  tenantSlug: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'admin@abc-restaurant.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;
}

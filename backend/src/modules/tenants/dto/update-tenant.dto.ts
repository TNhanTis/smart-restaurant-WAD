import { PartialType } from '@nestjs/swagger';
import { CreateTenantDto } from './create-tenant.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { TenantStatus } from '../schemas/tenant.schema';

export class UpdateTenantDto extends PartialType(CreateTenantDto) {
  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatus;
}

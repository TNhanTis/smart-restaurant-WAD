import { IsOptional, IsUUID } from 'class-validator';

export class KitchenOrdersFilterDto {
  @IsOptional()
  @IsUUID()
  table_id?: string;
}

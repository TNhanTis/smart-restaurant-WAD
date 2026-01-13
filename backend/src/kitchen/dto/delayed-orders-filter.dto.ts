import { IsOptional, IsString, IsNumber, Min } from 'class-validator';

/**
 * DTO for filtering delayed orders
 */
export class DelayedOrdersFilterDto {
  @IsOptional()
  @IsString()
  table_id?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  delay_threshold_minutes?: number; // Orders delayed by more than this threshold
}

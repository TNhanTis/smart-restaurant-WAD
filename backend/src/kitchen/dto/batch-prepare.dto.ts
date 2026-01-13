import { IsArray, IsNotEmpty, IsString, ArrayMinSize } from 'class-validator';

/**
 * DTO for batch order preparation
 * Allows kitchen to start preparing multiple orders at once
 */
export class BatchPrepareDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one order ID is required' })
  @IsString({ each: true })
  order_ids: string[];

  @IsNotEmpty()
  @IsString()
  restaurant_id: string;
}

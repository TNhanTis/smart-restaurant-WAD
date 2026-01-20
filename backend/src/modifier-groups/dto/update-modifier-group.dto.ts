import {
  IsString,
  IsIn,
  IsBoolean,
  IsInt,
  IsOptional,
  IsUUID,
  Length,
  Min,
  Max,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// DTO for updating existing modifier options
export class UpdateModifierOptionDto {
  @IsOptional()
  @IsUUID()
  id?: string; // Allow id for existing options

  @IsOptional()
  @IsUUID()
  group_id?: string; // Allow group_id

  @IsString()
  @Length(1, 100)
  name: string;

  @IsOptional()
  @Min(0)
  price_adjustment?: number;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;

  @IsOptional()
  created_at?: Date; // Allow created_at to be passed but ignored
}

export class UpdateModifierGroupDto {
  @IsOptional()
  @IsUUID()
  restaurant_id?: string; // Allow but will be ignored in update

  @IsOptional()
  @IsString()
  @Length(2, 80)
  name?: string;

  @IsOptional()
  @IsIn(['single', 'multiple'])
  selection_type?: string;

  @IsOptional()
  @IsBoolean()
  is_required?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  min_selections?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  max_selections?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  display_order?: number;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateModifierOptionDto)
  initialOptions?: UpdateModifierOptionDto[];
}

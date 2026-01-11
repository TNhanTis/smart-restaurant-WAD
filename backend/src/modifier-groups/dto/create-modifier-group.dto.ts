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
  Type,
} from 'class-validator';

export class CreateModifierOptionDto {
  @IsString()
  @Length(1, 100)
  name: string;

  @IsOptional()
  @Min(0)
  price_adjustment?: number;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;
}

export class CreateModifierGroupDto {
  @IsUUID()
  restaurant_id: string;

  @IsString()
  @Length(2, 80)
  name: string;
  @IsIn(['single', 'multiple'])
  selection_type: string;
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
  @Type(() => CreateModifierOptionDto)
  initialOptions?: CreateModifierOptionDto[];
}

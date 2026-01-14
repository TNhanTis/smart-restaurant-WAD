import { IsUUID, IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class CashConfirmDto {
  @IsUUID()
  payment_id: string;

  @IsNumber()
  @Min(0)
  cash_amount: number; // Tiền khách đưa

  @IsString()
  @IsOptional()
  notes?: string; // Ghi chú (optional)
}

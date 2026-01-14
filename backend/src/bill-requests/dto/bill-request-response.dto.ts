import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BillRequestResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  table_number: string;

  @ApiProperty({ example: 350000 })
  subtotal: number;

  @ApiProperty({ example: 50000 })
  tips_amount: number;

  @ApiProperty({ example: 400000 })
  total_amount: number;

  @ApiProperty({ example: 3 })
  order_count: number;

  @ApiProperty({ example: 'momo' })
  payment_method: string;

  @ApiProperty({ enum: ['pending', 'accepted', 'completed', 'cancelled'] })
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';

  @ApiPropertyOptional()
  customer_note?: string;

  @ApiProperty()
  created_at: Date;
}

export class AcceptBillRequestResponseDto {
  @ApiProperty()
  bill_request_id: string;

  @ApiProperty()
  payment_id: string;

  @ApiProperty()
  payment_method: string;

  @ApiProperty({ example: 400000 })
  total_amount: number;

  // For online payments (MoMo/ZaloPay/VNPay)
  @ApiPropertyOptional({
    description: 'URL của ảnh QR code',
    example: 'https://api.vietqr.io/image/...',
  })
  qr_code_url?: string;

  @ApiPropertyOptional({
    description: 'Raw QR code data (EMVCo format)',
    example:
      '00020101021238570010A00000072701270006970436011599988800208QRIBFTTA53037045802VN...',
  })
  qr_code_data?: string;

  @ApiPropertyOptional({
    description: 'Deep link để mở app',
    example: 'momo://app?action=pay&amount=400000',
  })
  pay_url?: string;

  @ApiPropertyOptional()
  expires_at?: Date;

  // For cash payment
  @ApiPropertyOptional({
    description: 'True nếu đang chờ waiter confirm cash',
    example: true,
  })
  awaiting_cash_confirmation?: boolean;
}

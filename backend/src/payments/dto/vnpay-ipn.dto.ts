export class VNPayIPNDto {
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_BankTranNo: string;
  vnp_CardType: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  vnp_ResponseCode: string; // '00' = success
  vnp_TmnCode: string;
  vnp_TransactionNo: string; // VNPay transaction ID
  vnp_TransactionStatus: string;
  vnp_TxnRef: string; // Our payment ID
  vnp_SecureHash: string; // Signature
}

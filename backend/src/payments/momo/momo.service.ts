import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MomoService {
  private readonly partnerCode: string;
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly endpoint: string;
  private readonly ipnUrl: string;
  private readonly redirectUrl: string;

  constructor(private configService: ConfigService) {
    this.partnerCode =
      this.configService.getOrThrow<string>('MOMO_PARTNER_CODE');
    this.accessKey = this.configService.getOrThrow<string>('MOMO_ACCESS_KEY');
    this.secretKey = this.configService.getOrThrow<string>('MOMO_SECRET_KEY');
    this.endpoint = this.configService.getOrThrow<string>('MOMO_ENDPOINT');
    this.ipnUrl = this.configService.getOrThrow<string>('MOMO_IPN_URL');
    this.redirectUrl =
      this.configService.getOrThrow<string>('MOMO_REDIRECT_URL');
  }

  private createSignature(rawData: string): string {
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(rawData)
      .digest('hex');
  }

  async createPayment(dto: {
    payment_id: string;
    amount: number;
    order_info: string;
    restaurant_id: string;
  }) {
    const { payment_id, amount, order_info } = dto;
    const requestId = `${payment_id}-${Date.now()}`;
    const orderId = payment_id;
    const requestType = 'captureWallet';
    const extraData = '';

    const rawSignature = `accessKey=${this.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${this.ipnUrl}&orderId=${orderId}&orderInfo=${order_info}&partnerCode=${this.partnerCode}&redirectUrl=${this.redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    const signature = this.createSignature(rawSignature);

    const requestBody = {
      partnerCode: this.partnerCode,
      accessKey: this.accessKey,
      requestId,
      amount,
      orderId,
      orderInfo: order_info,
      redirectUrl: this.redirectUrl,
      ipnUrl: this.ipnUrl,
      requestType,
      extraData,
      lang: 'vi',
      signature,
    };

    try {
      const response = await axios.post(this.endpoint, requestBody);

      if (response.data.resultCode !== 0) {
        throw new Error(`MoMo error: ${response.data.message}`);
      }

      return {
        transaction_id: response.data.requestId,
        qr_code: response.data.qrCodeUrl || null,
        payment_url: response.data.payUrl,
      };
    } catch (error) {
      throw new Error(`MoMo API error: ${error.message}`);
    }
  }

  verifySignature(data: any): boolean {
    const {
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = data;

    const rawSignature = `accessKey=${this.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${this.partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

    const expectedSignature = this.createSignature(rawSignature);
    return signature === expectedSignature;
  }
}

import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ZaloPayService {
  private readonly appId: string;
  private readonly key1: string;
  private readonly key2: string;
  private readonly endpoint: string;
  private readonly callbackUrl: string;

  constructor(private configService: ConfigService) {
    this.appId = this.configService.getOrThrow<string>('ZALOPAY_APP_ID');
    this.key1 = this.configService.getOrThrow<string>('ZALOPAY_KEY1');
    this.key2 = this.configService.getOrThrow<string>('ZALOPAY_KEY2');
    this.endpoint = this.configService.getOrThrow<string>('ZALOPAY_ENDPOINT');
    this.callbackUrl = this.configService.getOrThrow<string>(
      'ZALOPAY_CALLBACK_URL',
    );
  }

  private createMAC(data: string, key: string): string {
    return crypto.createHmac('sha256', key).update(data).digest('hex');
  }

  async createOrder(dto: {
    payment_id: string;
    amount: number;
    description: string;
    restaurant_id: string;
  }) {
    const { payment_id, amount, description } = dto;
    const app_trans_id = `${Date.now()}_${payment_id}`;
    const app_time = Date.now();
    const embed_data = JSON.stringify({ payment_id });

    const order = {
      app_id: this.appId,
      app_user: 'customer',
      app_time,
      amount,
      app_trans_id,
      embed_data,
      item: JSON.stringify([{ name: description }]),
      description,
      callback_url: this.callbackUrl,
    };

    const data = `${order.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
    const mac = this.createMAC(data, this.key1);

    const requestBody = { ...order, mac };

    try {
      const response = await axios.post(this.endpoint, null, {
        params: requestBody,
      });

      if (response.data.return_code !== 1) {
        throw new Error(`ZaloPay error: ${response.data.return_message}`);
      }

      return {
        transaction_id: app_trans_id,
        payment_url: response.data.order_url,
        qr_code: null,
      };
    } catch (error) {
      throw new Error(`ZaloPay API error: ${error.message}`);
    }
  }

  verifyMAC(data: any): boolean {
    const {
      app_id,
      app_trans_id,
      app_time,
      app_user,
      amount,
      embed_data,
      item,
      mac,
    } = data;
    const rawData = `${app_id}|${app_trans_id}|${app_user}|${amount}|${app_time}|${embed_data}|${item}`;
    const expectedMAC = this.createMAC(rawData, this.key2);
    return mac === expectedMAC;
  }
}

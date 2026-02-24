import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ZaloPayUtils } from './zalopay.utils';
import {
  ZaloPayConfig,
  ZaloPayOrderParams,
  ZaloPayEmbedData,
  ZaloPayResponse,
} from './zalopay.interface';

@Injectable()
export class ZaloPayService {
  private readonly logger = new Logger(ZaloPayService.name);
  private readonly config: ZaloPayConfig;

  constructor(private configService: ConfigService) {
    this.config = {
      app_id: this.configService.get<string>('ZALOPAY_APP_ID')!,
      key1: this.configService.get<string>('ZALOPAY_KEY1')!,
      key2: this.configService.get<string>('ZALOPAY_KEY2')!,
      endpoint: this.configService.get<string>('ZALOPAY_ENDPOINT')!,
      callback_url: this.configService.get<string>('ZALOPAY_CALLBACK_URL')!,
    };
  }

  /**
   * Create ZaloPay payment order
   */
  async createPaymentOrder(
    amount: number,
    userEmail: string,
    transactionId: string,
    items: any[],
    embedData?: Partial<ZaloPayEmbedData>,
  ): Promise<ZaloPayResponse> {
    try {
      // Generate app_trans_id
      const appTransId = ZaloPayUtils.generateAppTransId();
      const appTime = Date.now();

      // Build embed data
      const redirectUrl = this.configService.get<string>('ZALOPAY_REDIRECT_URL')!;
      const fullEmbedData: ZaloPayEmbedData = {
        redirecturl: redirectUrl,
        transactionId,
        ...embedData,
      };

      // Build order params
      const orderParams: Partial<ZaloPayOrderParams> = {
        app_id: this.config.app_id,
        app_trans_id: appTransId,
        app_user: userEmail,
        app_time: appTime,
        item: JSON.stringify(items),
        embed_data: JSON.stringify(fullEmbedData),
        amount,
        description: `Payment for transaction ${transactionId}`,
        bank_code: '',
        callback_url: "https://bicycle-marketplace.onrender.com/api/v1/payment/zalopay/callback",
      };

      // Create MAC signature
      const macData = ZaloPayUtils.buildOrderMacData(
        orderParams.app_id!,
        orderParams.app_trans_id!,
        orderParams.app_user!,
        orderParams.amount!,
        orderParams.app_time!,
        orderParams.embed_data!,
        orderParams.item!,
      );

      orderParams.mac = ZaloPayUtils.createMac(macData, this.config.key1);

      // Call ZaloPay API
      this.logger.log(`Creating ZaloPay order: ${appTransId}`);
      const response = await axios.post<ZaloPayResponse>(
        this.config.endpoint,
        null,
        {
          params: orderParams,
        },
      );

      this.logger.log(`ZaloPay response: ${JSON.stringify(response.data)}`);

      return response.data;
    } catch (error) {
      this.logger.error(`ZaloPay payment creation failed: ${error.message}`);
      throw new BadRequestException('Failed to create ZaloPay payment');
    }
  }

  /**
   * Verify callback from ZaloPay
   */
  verifyCallback(dataStr: string, receivedMac: string): {
    isValid: boolean;
    data?: any;
  } {
    // Verify MAC
    const isValid = ZaloPayUtils.verifyCallbackMac(
      dataStr,
      receivedMac,
      this.config.key2,
    );

    if (!isValid) {
      this.logger.warn('Invalid MAC in ZaloPay callback');
      return { isValid: false };
    }

    // Parse data
    const dataJson = JSON.parse(dataStr);

    return {
      isValid: true,
      data: dataJson,
    };
  }

  /**
   * Check order status (optional - for debugging)
   */
  async checkOrderStatus(appTransId: string): Promise<any> {
    try {
      const timestamp = Date.now();
      const data = `${this.config.app_id}|${appTransId}|${this.config.key1}`;
      const mac = ZaloPayUtils.createMac(data, this.config.key1);

      const response = await axios.post(
        'https://sb-openapi.zalopay.vn/v2/query',
        null,
        {
          params: {
            app_id: this.config.app_id,
            app_trans_id: appTransId,
            mac,
          },
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to check order status: ${error.message}`);
      return null;
    }
  }
}
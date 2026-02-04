import * as CryptoJS from 'crypto-js';
import moment from 'moment';

export class ZaloPayUtils {
  /**
   * Generate app_trans_id in format: YYMMDD_xxxxxx
   */
  static generateAppTransId(): string {
    const transID = Math.floor(Math.random() * 1000000);
    const appTransId = `${moment().format('YYMMDD')}_${transID}`;
    return appTransId;
  }

  /**
   * Create HMAC SHA256 signature for ZaloPay
   */
  static createMac(data: string, key: string): string {
    return CryptoJS.HmacSHA256(data, key).toString();
  }

  /**
   * Build data string for MAC generation (order creation)
   */
  static buildOrderMacData(
    appId: string,
    appTransId: string,
    appUser: string,
    amount: number,
    appTime: number,
    embedData: string,
    item: string,
  ): string {
    return `${appId}|${appTransId}|${appUser}|${amount}|${appTime}|${embedData}|${item}`;
  }

  /**
   * Verify callback MAC
   */
  static verifyCallbackMac(dataStr: string, receivedMac: string, key: string): boolean {
    const calculatedMac = this.createMac(dataStr, key);
    return receivedMac === calculatedMac;
  }
}
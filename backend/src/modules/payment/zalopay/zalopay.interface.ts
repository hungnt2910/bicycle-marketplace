export interface ZaloPayConfig {
  app_id: string;
  key1: string;
  key2: string;
  endpoint: string;
  callback_url: string;
}

export interface ZaloPayOrderParams {
  app_id: string;
  app_trans_id: string;
  app_user: string;
  app_time: number;
  item: string;
  embed_data: string;
  amount: number;
  description: string;
  bank_code: string;
  callback_url: string;
  mac: string;
}

export interface ZaloPayEmbedData {
  redirecturl: string;
  transactionId: string;
  bicycleId?: string;
  userId?: string;
}

export interface ZaloPayCallbackData {
  data: string;
  mac: string;
}

export interface ZaloPayResponse {
  return_code: number;
  return_message: string;
  sub_return_code?: number;
  sub_return_message?: string;
  order_url?: string;
  zp_trans_token?: string;
}
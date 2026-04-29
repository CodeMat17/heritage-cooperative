// Squad widget constructor config
export interface SquadConfig {
  key: string;
  email: string;
  amount: number;
  currency_code: "NGN" | "USD";
  transaction_ref?: string;
  customer_name?: string;
  phone_number?: string;
  callback_url?: string;
  payment_channels?: Array<"card" | "bank" | "ussd" | "transfer">;
  pass_charge?: boolean;
  metadata?: Record<string, unknown>;
  onSuccess: (data: SquadSuccessData) => void;
  onClose: () => void;
  onLoad: () => void;
}

// What Squad passes to onSuccess
export interface SquadSuccessData {
  transaction_ref: string;
  gateway_ref?: string;
  [key: string]: unknown;
}

// Squad widget instance
export interface SquadInstance {
  setup: () => void;
  open: () => void;
}

// Your /api/squad/verify response shape (mirrors Squad's API)
export interface SquadVerifyResponse {
  status: number;
  success: boolean;
  message: string;
  data?: {
    transaction_ref: string;
    merchant_amount: number;
    amount: number;
    fee: number;
    full_name: string;
    gateway_ref: string;
    transaction_status: "success" | "failed" | "pending";
    transaction_type: string;
    currency: "NGN" | "USD";
    email: string;
    meta?: Record<string, unknown>;
    [key: string]: unknown;
  };
}

// Squad webhook body shape
export interface SquadWebhookBody {
  Event: string;
  TransactionRef: string;
  Body: SquadWebhookTransaction;
}

export interface SquadWebhookTransaction {
  email: string;
  amount: number;
  merchant_amount?: number;
  currency?: string;
  transaction_status?: string;
  transaction_type?: string;
  gateway_ref?: string;
  customer_mobile?: string;
  is_recurring?: boolean;
  metadata?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  merchant_id?: string;
  created_at?: string;
  payment_information?: {
    payment_type?: string;
    card_type?: string;
    pan?: string;
    token_id?: string;
  };
}

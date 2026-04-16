export interface QPayBankAccount {
  default: boolean;
  account_bank_code: string;
  account_number: string;
  account_name: string;
  is_default: boolean;
}

export interface QPayUrl {
  name: string;
  description: string;
  logo: string;
  link: string;
}

export type QPayInvoiceStatus = "OPEN" | "PAID" | "EXPIRED" | "CANCELLED";

export interface QPayInvoiceResponse {
  id: string;
  terminal_id: string;
  amount: string;
  qr_code: string;
  qr_image: string;
  qr_text?: string;
  description: string;
  invoice_status: QPayInvoiceStatus;
  invoice_status_date: string;
  callback_url: string;
  customer_name: string;
  customer_logo: string;
  currency: string;
  mcc_code: string;
  legacy_id: string;
  vendor_id: string;
  process_code_id: string;
  invoice_bank_accounts: QPayBankAccount[];
  urls: QPayUrl[];
  enable_expiry: boolean;
  expiry_date: string;
}

export interface QPayPaymentItem {
  id: string;
  terminal_id: string;
  wallet_customer_id: string;
  amount: string;
  currency: string;
  payment_name: string;
  payment_description: string;
  paid_by: string;
  note: string | null;
  payment_status: "SUCCESS" | "FAILED";
  payment_status_date: string;
  transactions: unknown[];
  ebarimt_customer_no: string | null;
}

export interface QPayCheckResponse {
  id: string;
  invoice_status: QPayInvoiceStatus;
  invoice_status_date: string;
  payments?: QPayPaymentItem[];
}

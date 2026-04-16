import axios from "axios";

export const QPAY_BASE =
  process.env.QPAY_BASE_URL ?? "https://quickqr.qpay.mn/v2";

const QPAY_USERNAME = process.env.QPAY_USERNAME ?? "";
const QPAY_PASSWORD = process.env.QPAY_PASSWORD ?? "";
const QPAY_TERMINAL_ID = process.env.QPAY_TERMINAL_ID ?? "";

export async function getQpayToken(): Promise<string> {
  const res = await axios.post(
    `${QPAY_BASE}/auth/token`,
    {
      terminal_id: QPAY_TERMINAL_ID,
    },
    {
      auth: { username: QPAY_USERNAME, password: QPAY_PASSWORD },
    },
  );
  return res.data.access_token;
}

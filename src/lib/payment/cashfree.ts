/**
 * Cashfree Payment Gateway Service (API v2023-08-01)
 * Official modern REST integration for Indian Payments (Cards, UPI, NetBanking, Wallets)
 */

export interface CashfreeCustomerDetails {
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
}

export interface CreateCashfreeOrderParams {
  orderId: string;
  orderAmount: number;
  orderCurrency?: string;
  customer: CashfreeCustomerDetails;
  returnUrl?: string;
  orderNote?: string;
}

export interface CashfreeOrderResponse {
  cf_order_id: string;
  order_id: string;
  order_status: "ACTIVE" | "PAID" | "EXPIRED" | "TERMINATED";
  payment_session_id: string;
  order_amount: number;
  order_currency: string;
  entity: string;
}

export interface CashfreePaymentItem {
  cf_payment_id: number | string;
  payment_status: "SUCCESS" | "FAILED" | "PENDING" | "USER_DROPPED" | "CANCELLED";
  payment_amount: number;
  payment_currency: string;
  payment_message: string;
  payment_time: string;
  payment_method: Record<string, unknown>;
}

export class CashfreeService {
  private appId: string;
  private secretKey: string;
  private baseUrl: string;
  private apiVersion: string;

  constructor() {
    this.appId = process.env.CASHFREE_APP_ID || process.env.NEXT_PUBLIC_CASHFREE_APP_ID || "";
    this.secretKey = process.env.CASHFREE_SECRET_KEY || "";
    const env = (process.env.CASHFREE_ENV || process.env.NEXT_PUBLIC_CASHFREE_ENV || "sandbox").toLowerCase();
    this.baseUrl = env === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";
    this.apiVersion = "2023-08-01";
  }

  public isConfigured(): boolean {
    return Boolean(this.appId && this.secretKey);
  }

  private getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      "x-client-id": this.appId,
      "x-client-secret": this.secretKey,
      "x-api-version": this.apiVersion,
    };
  }

  /**
   * Create an order on Cashfree PG and obtain payment_session_id
   */
  async createOrder(params: CreateCashfreeOrderParams): Promise<CashfreeOrderResponse> {
    if (!this.isConfigured()) {
      // In development when credentials are yet to be filled in .env
      console.warn("Cashfree is missing CASHFREE_APP_ID or CASHFREE_SECRET_KEY. Check .env.local.");
      return {
        cf_order_id: `mock_cf_${Date.now()}`,
        order_id: params.orderId,
        order_status: "ACTIVE",
        payment_session_id: `mock_session_${Date.now()}`,
        order_amount: params.orderAmount,
        order_currency: params.orderCurrency || "INR",
        entity: "order",
      };
    }

    // Phone validation for Cashfree (must be 10 digits without country code or with valid format)
    let cleanPhone = params.customer.customer_phone.replace(/\D/g, "");
    if (cleanPhone.length > 10 && cleanPhone.startsWith("91")) {
      cleanPhone = cleanPhone.slice(2);
    }
    if (cleanPhone.length !== 10) {
      cleanPhone = "9999999999";
    }

    const payload = {
      order_id: params.orderId,
      order_amount: Math.round(params.orderAmount * 100) / 100,
      order_currency: params.orderCurrency || "INR",
      customer_details: {
        customer_id: params.customer.customer_id || `cust_${Date.now()}`,
        customer_name: params.customer.customer_name || "Valued Customer",
        customer_email: params.customer.customer_email || "guest@glimglee.com",
        customer_phone: cleanPhone,
      },
      order_meta: {
        return_url: params.returnUrl || `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/checkout/status?order_id={order_id}`,
      },
      order_note: params.orderNote || `Glimglee Gifting Order #${params.orderId}`,
    };

    const res = await fetch(`${this.baseUrl}/orders`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Cashfree order creation error:", data);
      throw new Error(data.message || "Failed to initialize payment with Cashfree");
    }

    return data as CashfreeOrderResponse;
  }

  /**
   * Fetch order details directly from Cashfree
   */
  async getOrder(orderId: string): Promise<CashfreeOrderResponse> {
    if (!this.isConfigured()) {
      return {
        cf_order_id: `mock_cf_${orderId}`,
        order_id: orderId,
        order_status: "PAID",
        payment_session_id: "mock_session",
        order_amount: 100,
        order_currency: "INR",
        entity: "order",
      };
    }

    const res = await fetch(`${this.baseUrl}/orders/${encodeURIComponent(orderId)}`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to retrieve order status from Cashfree");
    }

    return data as CashfreeOrderResponse;
  }

  /**
   * Fetch payment attempts for an order from Cashfree
   */
  async getPayments(orderId: string): Promise<CashfreePaymentItem[]> {
    if (!this.isConfigured()) {
      return [
        {
          cf_payment_id: `mock_pay_${Date.now()}`,
          payment_status: "SUCCESS",
          payment_amount: 100,
          payment_currency: "INR",
          payment_message: "Simulated Success (Dev mode)",
          payment_time: new Date().toISOString(),
          payment_method: { upi: { channel: "upi_intent" } },
        },
      ];
    }

    const res = await fetch(`${this.baseUrl}/orders/${encodeURIComponent(orderId)}/payments`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to retrieve payment attempts from Cashfree");
    }

    return Array.isArray(data) ? data : [];
  }

  /**
   * Complete verification helper checking order status & payment success
   */
  async verifyOrderPayment(orderId: string): Promise<{
    isPaid: boolean;
    order: CashfreeOrderResponse | null;
    payment: CashfreePaymentItem | null;
    message: string;
  }> {
    try {
      const order = await this.getOrder(orderId);
      const payments = await this.getPayments(orderId);
      const successfulPayment = payments.find((p) => p.payment_status === "SUCCESS");

      if (order.order_status === "PAID" || successfulPayment) {
        return {
          isPaid: true,
          order,
          payment: successfulPayment || payments[0] || null,
          message: "Payment successfully verified.",
        };
      }

      return {
        isPaid: false,
        order,
        payment: payments[0] || null,
        message: order.order_status === "ACTIVE" ? "Payment pending or cancelled by user." : `Order status: ${order.order_status}`,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment verification error";
      return {
        isPaid: false,
        order: null,
        payment: null,
        message: msg,
      };
    }
  }
}

export const cashfreeService = new CashfreeService();

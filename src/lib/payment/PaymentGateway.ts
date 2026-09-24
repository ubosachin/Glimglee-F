import { cashfreeService, CreateCashfreeOrderParams } from "./cashfree";

export interface PaymentInitiationParams {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  method: "cashfree" | "upi" | "card" | "cod";
}

export interface PaymentVerificationResult {
  success: boolean;
  paymentId: string;
  transactionRef: string;
  method: string;
  message: string;
  paymentSessionId?: string;
  rawResponse?: Record<string, unknown>;
}

export interface IPaymentGateway {
  initiatePayment(params: PaymentInitiationParams): Promise<{
    paymentSessionId?: string;
    orderRef: string;
    checkoutUrl?: string;
    meta?: Record<string, unknown>;
  }>;
  verifyPayment(orderId: string): Promise<PaymentVerificationResult>;
}

/**
 * Cashfree Adapter (Direct PG for Cards, UPI, NetBanking, Wallets across India)
 */
export class CashfreeGateway implements IPaymentGateway {
  async initiatePayment(params: PaymentInitiationParams) {
    const cfOrder = await cashfreeService.createOrder({
      orderId: params.orderId,
      orderAmount: params.amount,
      orderCurrency: params.currency,
      customer: {
        customer_id: params.customerEmail.replace(/[^a-zA-Z0-9]/g, "_") || `cust_${Date.now()}`,
        customer_name: params.customerName,
        customer_email: params.customerEmail,
        customer_phone: params.customerPhone,
      },
      orderNote: `Glimglee Order #${params.orderNumber}`,
    });

    return {
      orderRef: cfOrder.order_id,
      paymentSessionId: cfOrder.payment_session_id,
      meta: {
        cfOrderId: cfOrder.cf_order_id,
        orderStatus: cfOrder.order_status,
      },
    };
  }

  async verifyPayment(orderId: string): Promise<PaymentVerificationResult> {
    const result = await cashfreeService.verifyOrderPayment(orderId);

    return {
      success: result.isPaid,
      paymentId: result.payment ? String(result.payment.cf_payment_id) : `cf_pending_${orderId}`,
      transactionRef: orderId,
      method: "cashfree",
      message: result.message,
      rawResponse: result.order ? (result.order as unknown as Record<string, unknown>) : undefined,
    };
  }
}

/**
 * Universal Gifting Payment Service orchestrator
 */
export class GlimgleePaymentService {
  private gateway: IPaymentGateway;

  constructor(gateway?: IPaymentGateway) {
    this.gateway = gateway || new CashfreeGateway();
  }

  async processCheckoutPayment(params: PaymentInitiationParams): Promise<PaymentVerificationResult> {
    if (params.method === "cod") {
      return {
        success: true,
        paymentId: `cod_${Date.now()}`,
        transactionRef: `cod_ref_${params.orderNumber}`,
        method: "cod",
        message: "Cash on delivery selected. Payment due upon arrival.",
      };
    }

    // Initiate Cashfree PG session
    const init = await this.gateway.initiatePayment(params);
    return {
      success: true,
      paymentId: init.orderRef,
      transactionRef: init.orderRef,
      paymentSessionId: init.paymentSessionId,
      method: "cashfree",
      message: "Cashfree payment session generated.",
    };
  }
}

export const paymentService = new GlimgleePaymentService();

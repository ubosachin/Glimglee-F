/**
 * Client-side loader and runner for Cashfree Web Checkout SDK v3
 */

export async function loadCashfreeCheckout(
  paymentSessionId: string,
  mode: "sandbox" | "production" = "sandbox"
): Promise<void> {
  if (typeof window === "undefined") return;

  const getCashfreeInstance = (): any => (window as any).Cashfree;

  if (!getCashfreeInstance()) {
    await new Promise<void>((resolve, reject) => {
      const existingScript = document.getElementById("cashfree-sdk-script");
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve());
        return;
      }

      const script = document.createElement("script");
      script.id = "cashfree-sdk-script";
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Cashfree checkout SDK"));
      document.body.appendChild(script);
    });
  }

  const Cashfree = getCashfreeInstance();
  if (!Cashfree) {
    throw new Error("Cashfree SDK could not be initialized");
  }

  const cashfree = Cashfree({ mode });
  return cashfree.checkout({
    paymentSessionId,
    redirectTarget: "_self",
  });
}

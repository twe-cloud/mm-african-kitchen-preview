const IS_CLOUDFLARE_PAGES = (window.location.hostname || '').endsWith('pages.dev');

window.MM_ORDERING_CONFIG = {
  mode: "mock",
  currency: "usd",
  checkoutEndpoint: IS_CLOUDFLARE_PAGES ? "/create-checkout-session" : "/.netlify/functions/create-checkout-session",
  orderEndpoint: IS_CLOUDFLARE_PAGES ? "/orders" : "/.netlify/functions/orders",
  transportQuoteEndpoint: IS_CLOUDFLARE_PAGES ? "/transport-quote" : "/.netlify/functions/transport-quote",
  backendSync: true,
  successUrl: "/order.html?checkout=success",
  cancelUrl: "/order.html?checkout=cancel",
  kitchenHandoffMode: "tablet-printer-new-pos",
  testLaneLabel: "Payment API credentials are still pending. Keep this lane in shadow/mock mode; first paid food-order transaction testing is now targeted for June 15."
};

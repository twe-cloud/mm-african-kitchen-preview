(function exposeOrderRuntime() {
  const STORAGE_KEY = "mm_order_bridge_v1";
  const CHANNEL_NAME = "mm-order-bridge";
  const config = window.MM_ORDERING_CONFIG || {};
  const orderEndpoint = config.orderEndpoint || "/orders";
  const backendSync = Boolean(config.backendSync);

  function read() {
    try {
      const payload = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!payload || typeof payload !== "object") return { orders: [] };
      if (!Array.isArray(payload.orders)) payload.orders = [];
      return payload;
    } catch {
      return { orders: [] };
    }
  }

  function write(payload) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    notify(payload);
    return payload;
  }

  function notify(payload) {
    window.dispatchEvent(new CustomEvent("mm-orders-updated", { detail: payload }));
    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage(payload);
      channel.close();
    }
  }

  function createOrder(input) {
    const payload = read();
    const order = {
      id: `MM-${Date.now().toString().slice(-6)}`,
      source: input.source || "website",
      paymentStatus: input.paymentStatus || "paid",
      status: "new",
      fulfillmentType: input.fulfillmentType || "pickup",
      customer: input.customer || { name: "Guest", phone: "", email: "" },
      totals: input.totals || { subtotal: 0 },
      items: input.items || [],
      createdAt: new Date().toISOString(),
      acceptedAt: null,
      readyAt: null,
      completedAt: null,
      kitchenStation: input.kitchenStation || "expo",
      ticketMode: input.ticketMode || "tablet-printer-bridge",
      printStatus: "not_requested",
      lastPrintedAt: null,
      audit: [
        {
          at: new Date().toISOString(),
          state: "new",
          note: "Order captured from website lane"
        }
      ]
    };

    payload.orders.unshift(order);
    write(payload);
    if (backendSync) {
      postOrder({ ...input, providerOrderId: order.id }).catch(() => {});
    }
    return order;
  }

  function updateOrderStatus(orderId, status, note) {
    const payload = read();
    const order = payload.orders.find((entry) => entry.id === orderId);
    if (!order) return null;

    order.status = status;
    const stamp = new Date().toISOString();
    if (status === "accepted") order.acceptedAt = stamp;
    if (status === "ready") order.readyAt = stamp;
    if (status === "completed") order.completedAt = stamp;
    order.audit.push({ at: stamp, state: status, note: note || "" });

    write(payload);
    if (backendSync) {
      patchOrder({ orderId, status, note }).catch(() => {});
    }
    return order;
  }

  function requestPrint(orderId) {
    const payload = read();
    const order = payload.orders.find((entry) => entry.id === orderId);
    if (!order) return null;

    const stamp = new Date().toISOString();
    order.printStatus = "requested";
    order.lastPrintedAt = stamp;
    order.audit.push({ at: stamp, state: "print_requested", note: "Printer bridge requested" });

    write(payload);
    if (backendSync) {
      patchOrder({ orderId, action: "print" }).catch(() => {});
    }
    return order;
  }

  function clearOrders() {
    write({ orders: [] });
    if (backendSync) {
      patchOrder({ action: "clear" }).catch(() => {});
    }
  }

  async function syncFromServer() {
    if (!backendSync) return read();
    const local = read();
    const response = await fetch(orderEndpoint, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("Order backend did not respond.");
    const payload = await response.json();
    if (Array.isArray(payload.orders)) {
      if (payload.orders.length === 0 && local.orders.length) {
        return local;
      }
      return write({ orders: payload.orders });
    }
    return local;
  }

  async function postOrder(input) {
    const response = await fetch(orderEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
    if (!response.ok) throw new Error("Order backend create failed.");
    return response.json();
  }

  async function patchOrder(input) {
    const response = await fetch(orderEndpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
    if (!response.ok) throw new Error("Order backend update failed.");
    return response.json();
  }

  function subscribe(callback) {
    const listener = (event) => callback(event.detail || read());
    window.addEventListener("mm-orders-updated", listener);

    let channel;
    if ("BroadcastChannel" in window) {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (event) => callback(event.data || read());
    }

    return function unsubscribe() {
      window.removeEventListener("mm-orders-updated", listener);
      channel?.close();
    };
  }

  window.MMOrderRuntime = {
    read,
    write,
    createOrder,
    updateOrderStatus,
    requestPrint,
    clearOrders,
    syncFromServer,
    subscribe
  };

  if (backendSync) {
    syncFromServer().catch(() => {});
    window.setInterval(() => syncFromServer().catch(() => {}), 10000);
  }
})();

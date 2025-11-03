type BuyNowPayload = {
    variantId: number;
    quantity: number;
    paymentMethod: "vnpay" | "cod";
    shippingAddress: string;
};

type FromCartPayload = {
    paymentMethod: "vnpay" | "cod";
    shippingAddress: string;
};

const API_BASE = "http://localhost:3000/api/v1";

const authHeaders = (token: string) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
});

export async function buyNow(
    token: string,
    payload: BuyNowPayload
): Promise<{ order: any; payUrl?: string }> {
    const res = await fetch(`${API_BASE}/orders/buy-now`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function checkoutFromCart(
    token: string,
    payload: FromCartPayload
): Promise<{ order: any; payUrl?: string }> {
    const res = await fetch(`${API_BASE}/orders/from-cart`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}
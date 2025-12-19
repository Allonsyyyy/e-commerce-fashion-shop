const API_BASE = "http://localhost:3000/api/v1";

export type DiscountApplyResponse = {
	code: string;
	discountPercent: number;
	discountAmount: number;
	newTotal: number;
};

export async function applyDiscount(code: string, totalAmount: number) {
	const res = await fetch(`${API_BASE}/discounts/apply`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ code, totalAmount }),
	});
	if (!res.ok) {
		throw new Error(await res.text());
	}
	return (await res.json()) as DiscountApplyResponse;
}

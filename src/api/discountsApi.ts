const API_BASE = "http://localhost:3000/api/v1";

export type DiscountValidationResponse = {
    valid: boolean;
    discount?: {
        id: number;
        code: string;
        description: string;
        discountPercent: string;
        startDate: string;
        endDate: string;
        usageLimit: number;
        usedCount: number;
    };
    message?: string;
};

export async function validateDiscountCode(
    code: string
): Promise<DiscountValidationResponse> {
    const res = await fetch(`${API_BASE}/discounts/validate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}


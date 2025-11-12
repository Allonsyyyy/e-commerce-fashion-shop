const API_BASE = "http://localhost:3000/api/v1/admin";

const authHeaders = (token: string) => ({
    Authorization: `Bearer ${token}`,
});

export type RevenueStats = {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    revenueByMonth: Array<{
        month: string;
        revenue: number;
        orders: number;
    }>;
    revenueByCategory: Array<{
        categoryName: string;
        revenue: number;
        quantity: number;
    }>;
};

export type BestSellingProduct = {
    productId: number;
    productName: string;
    totalSold: number;
    revenue: number;
    imageUrl: string;
};

export async function getRevenueStats(token: string, params?: {
    startDate?: string;
    endDate?: string;
}): Promise<RevenueStats> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);

    const url = `${API_BASE}/analytics/revenue${queryParams.toString() ? `?${queryParams}` : ""}`;
    const res = await fetch(url, {
        headers: authHeaders(token),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function getBestSellingProducts(token: string, params?: {
    limit?: number;
    startDate?: string;
    endDate?: string;
}): Promise<BestSellingProduct[]> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);

    const url = `${API_BASE}/analytics/best-selling${queryParams.toString() ? `?${queryParams}` : ""}`;
    const res = await fetch(url, {
        headers: authHeaders(token),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}


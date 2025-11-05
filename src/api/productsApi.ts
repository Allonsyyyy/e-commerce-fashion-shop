import type { Product } from "../types/product";

const API_BASE = "http://localhost:3000/api/v1";

export interface ProductsListResponse {
    data: Product[];
    total: number;
    page: number;
    limit: number;
}

export interface ProductsListParams {
    page?: number;
    limit?: number;
    sort?: string;
}

/**
 * Get all products with pagination
 */
export async function getAllProducts(params?: ProductsListParams): Promise<ProductsListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.sort) queryParams.append("sort", params.sort);

    const url = `${API_BASE}/products${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    
    const res = await fetch(url, {
        method: "GET",
        headers: {
            "accept": "application/json"
        }
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to fetch products" }));
        throw new Error(error.message || "Failed to fetch products");
    }

    return res.json();
}

/**
 * Get product by ID
 */
export async function getProductById(id: string | number): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
        method: "GET",
        headers: {
            "accept": "application/json"
        }
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to fetch product" }));
        throw new Error(error.message || "Failed to fetch product");
    }

    return res.json();
}

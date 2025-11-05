import type { Category } from "../types/category";

const API_BASE = "http://localhost:3000/api/v1";

export interface CategoriesListResponse {
    data: Category[];
    total: number;
    page: number;
    limit: number;
}

export interface CategoriesListParams {
    page?: number;
    limit?: number;
    sort?: string;
}

/**
 * Get all categories with pagination
 */
export async function getAllCategories(params?: CategoriesListParams): Promise<CategoriesListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.sort) queryParams.append("sort", params.sort);

    const url = `${API_BASE}/categories${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    
    const res = await fetch(url, {
        method: "GET",
        headers: {
            "accept": "*/*"
        }
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to fetch categories" }));
        throw new Error(error.message || "Failed to fetch categories");
    }

    return res.json();
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: string | number): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
        method: "GET",
        headers: {
            "accept": "application/json"
        }
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to fetch category" }));
        throw new Error(error.message || "Failed to fetch category");
    }

    return res.json();
}

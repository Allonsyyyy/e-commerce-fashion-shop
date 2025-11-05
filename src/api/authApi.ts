const API_BASE = "http://localhost:3000/api/v1";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
}

export interface RegisterResponse {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProfileResponse {
    sub: number;
    email: string;
    role: string;
    iat: number;
    exp: number;
}

/**
 * Login user
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "accept": "*/*"
        },
        body: JSON.stringify(credentials)
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Login failed" }));
        throw new Error(error.message || "Login failed");
    }

    return res.json();
}

/**
 * Register new user
 */
export async function register(data: RegisterRequest): Promise<RegisterResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "accept": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Registration failed" }));
        throw new Error(error.message || "Registration failed");
    }

    return res.json();
}

/**
 * Get user profile (requires authentication)
 */
export async function getProfile(token: string): Promise<ProfileResponse> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "accept": "application/json"
        }
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to get profile" }));
        throw new Error(error.message || "Failed to get profile");
    }

    return res.json();
}

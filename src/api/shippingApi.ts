const API_BASE = "http://localhost:3000/api/v1/shipping/ghn";

type ApiResponse<T> = {
	success?: boolean;
	data?: T;
	message?: string;
} & T;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(`${API_BASE}${path}`, {
		headers: {
			"Content-Type": "application/json",
			...(init?.headers || {}),
		},
		...init,
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || `Request failed: ${res.status}`);
	}

	return res.json();
}

export interface Province {
	ProvinceID: number;
	ProvinceName: string;
	Code?: string;
}

export interface District {
	DistrictID: number;
	DistrictName: string;
	ProvinceID: number;
}

export interface Ward {
	WardCode: string;
	WardName: string;
	DistrictID: number;
}

export interface ShippingFeePayload {
	toDistrictId: number;
	toWardCode: string;
	weight: number;
	length?: number;
	width?: number;
	height?: number;
	insuranceValue?: number;
}

export interface ShippingFeeQuote {
	success: boolean;
	total: number;
	service_fee: number;
	insurance_fee: number;
	pick_station_fee: number;
	coupon_value: number;
	r2s_fee: number;
	return_again: number;
	document_return: number;
	double_check: number;
	cod_fee: number;
	pick_remote_areas_fee: number;
	deliver_remote_areas_fee: number;
	pick_remote_areas_fee_return: number;
	deliver_remote_areas_fee_return: number;
	message?: string;
}

export async function fetchProvinces(): Promise<Province[]> {
	const data = await request<ApiResponse<Province[]>>("/provinces", { method: "GET" });
	return data.data ?? (data as Province[]);
}

export async function fetchDistricts(provinceId: number): Promise<District[]> {
	const data = await request<ApiResponse<District[]>>(`/districts?provinceId=${provinceId}`, {
		method: "GET",
	});
	return data.data ?? (data as District[]);
}

export async function fetchWards(districtId: number): Promise<Ward[]> {
	const data = await request<ApiResponse<Ward[]>>(`/wards?districtId=${districtId}`, {
		method: "GET",
	});
	return data.data ?? (data as Ward[]);
}

export async function calculateShippingFee(payload: ShippingFeePayload): Promise<ShippingFeeQuote> {
	const data = await request<ShippingFeeQuote>("/calculate-fee", {
		method: "POST",
		body: JSON.stringify(payload),
	});
	return data;
}

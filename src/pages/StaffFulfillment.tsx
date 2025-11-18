import { useEffect, useMemo, useState } from "react";
import Container from "../components/Container";
import { getOrders, type Order } from "../api/admin/ordersApi";
import {
	createShippingOrder,
	cancelShippingOrder,
	fetchDistricts,
	fetchProvinces,
	fetchWards,
	type CreateShippingOrderPayload,
	type District,
	type Province,
	type Ward,
} from "../api/shippingApi";

type TabKey = "pending" | "shipping" | "cancelled";

const DEFAULT_DIMENSIONS = {
	weight: 200,
	length: 20,
	width: 15,
	height: 10,
};

type ParsedAddress = {
	street: string;
	ward?: string;
	district?: string;
	province?: string;
	phone?: string;
};

export default function StaffFulfillmentPage() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<TabKey>("pending");
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [parsedAddress, setParsedAddress] = useState<ParsedAddress | null>(null);
	const [form, setForm] = useState<CreateShippingOrderPayload | null>(null);
	const [matchedNames, setMatchedNames] = useState<{
		province?: string;
		district?: string;
		ward?: string;
	}>({});
	const [provinceId, setProvinceId] = useState<number | null>(null);
	const [districtId, setDistrictId] = useState<number | null>(null);
	const [districtName, setDistrictName] = useState("");
	const [wardName, setWardName] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [cancellingCode, setCancellingCode] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [provinces, setProvinces] = useState<Province[]>([]);
	const [districtCache, setDistrictCache] = useState<Record<number, District[]>>({});
	const [wardCache, setWardCache] = useState<Record<number, Ward[]>>({});

	useEffect(() => {
		loadOrders();
	}, []);

	useEffect(() => {
		fetchProvinces()
			.then(setProvinces)
			.catch((err) => console.error("Không thể tải danh sách tỉnh/thành", err));
	}, []);

const normalizeText = (value?: string | null) =>
	value?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() ?? "";

const ADMIN_PREFIXES = [
	"xa",
	"phuong",
	"thi tran",
	"thi xa",
	"huyen",
	"quan",
	"thanh pho",
	"tp",
	"tinh",
];

const stripPrefixes = (value: string) => {
	let stripped = value;
	for (const prefix of ADMIN_PREFIXES) {
		if (stripped.startsWith(prefix + " ")) {
			stripped = stripped.slice(prefix.length + 1);
			break;
		}
	}
	return stripped;
};

const compareNames = (a: string, b: string) => {
	const normA = normalizeText(a);
	const normB = normalizeText(b);
	const stripA = stripPrefixes(normA);
	const stripB = stripPrefixes(normB);
	return (
		normA === normB ||
		normA === stripB ||
		stripA === normB ||
		stripA === stripB ||
		normA.includes(stripB) ||
		normB.includes(stripA) ||
		stripA.includes(stripB) ||
		stripB.includes(stripA)
	);
};

const isNameMatch = (keyword: string, target: string, extensions?: string[]) => {
	if (compareNames(keyword, target)) return true;
	if (extensions?.length) {
		return extensions.some((ext) => compareNames(keyword, ext));
	}
	return false;
};

	const parseShippingAddress = (raw: string): ParsedAddress => {
		const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
		const [contact, ...rest] = parts;
		const province = rest.pop();
		const district = rest.pop();
		const ward = rest.pop();
		const street = rest.join(", ");
		const phoneMatch = contact?.split("-").map((p) => p.trim());
		return {
			street: street || rest.join(", ") || raw,
			ward,
			district,
			province,
			phone: phoneMatch && phoneMatch.length > 1 ? phoneMatch[1] : undefined,
		};
	};

	const getDistrictsForProvince = async (provinceId: number) => {
		if (districtCache[provinceId]) return districtCache[provinceId];
		try {
			const list = await fetchDistricts(provinceId);
			setDistrictCache((prev) => ({ ...prev, [provinceId]: list }));
			return list;
		} catch (err) {
			console.error("Không thể tải quận/huyện", err);
			return [];
		}
	};

	const getWardsForDistrict = async (districtId: number) => {
		if (wardCache[districtId]) return wardCache[districtId];
		try {
			const list = await fetchWards(districtId);
			setWardCache((prev) => ({ ...prev, [districtId]: list }));
			return list;
		} catch (err) {
			console.error("Không thể tải phường/xã", err);
			return [];
		}
	};

	const ensureProvinceMatch = async (name?: string | null) => {
		const sourceName = name || form?.toProvinceName || parsedAddress?.province;
		if (!sourceName) return null;

		if (provinceId && form?.toProvinceName && isNameMatch(sourceName, form.toProvinceName)) {
			return provinceId;
		}

		let provinceList = provinces;
		if (!provinceList.length) {
			try {
				provinceList = await fetchProvinces();
				setProvinces(provinceList);
			} catch (err) {
				console.error("Không thể tải danh sách tỉnh", err);
				return null;
			}
		}

		const match = provinceList.find((p) => isNameMatch(sourceName, p.ProvinceName, p.NameExtension));
		if (match) {
			setProvinceId(match.ProvinceID);
			setForm((prev) => (prev ? { ...prev, toProvinceName: match.ProvinceName } : prev));
			setMatchedNames((prev) => ({ ...prev, province: match.ProvinceName }));
			return match.ProvinceID;
		}
		return null;
	};

	const handleProvinceInputChange = async (value: string) => {
		setForm((prev) => (prev ? { ...prev, toProvinceName: value } : prev));
		setProvinceId(null);
		setDistrictId(null);
		setMatchedNames((prev) => ({ ...prev, province: undefined }));
		if (!value.trim()) return;
		await ensureProvinceMatch(value);
	};

	const handleDistrictInputChange = async (value: string) => {
		setDistrictName(value);
		setForm((prev) => (prev ? { ...prev, toDistrictId: 0 } : prev));
		setMatchedNames((prev) => ({ ...prev, district: undefined }));
		if (!value.trim()) {
			setDistrictId(null);
			setWardName("");
			setForm((prev) => (prev ? { ...prev, toWardCode: "" } : prev));
			return;
		}

		const provinceMatch = await ensureProvinceMatch();
		if (!provinceMatch) return;

		const districts = await getDistrictsForProvince(provinceMatch);
		const match = districts.find((d) => isNameMatch(value, d.DistrictName, d.NameExtension));

		if (match) {
			setDistrictId(match.DistrictID);
			setForm((prev) => (prev ? { ...prev, toDistrictId: match.DistrictID } : prev));
			setMatchedNames((prev) => ({ ...prev, district: match.DistrictName }));
			await handleWardInputChange(wardName, match.DistrictID, false);
		} else {
			setDistrictId(null);
		}
	};

	const handleWardInputChange = async (value: string, districtOverride?: number, updateInput = true) => {
		if (updateInput) setWardName(value);
		setForm((prev) => (prev ? { ...prev, toWardCode: "" } : prev));
		setMatchedNames((prev) => ({ ...prev, ward: undefined }));
		if (!value.trim()) return;
		const districtRef = districtOverride ?? districtId;
		if (!districtRef) return;

		const wards = await getWardsForDistrict(districtRef);
		const match = wards.find((w) => isNameMatch(value, w.WardName, w.NameExtension));

		if (match) {
			if (updateInput) setWardName(match.WardName);
			setForm((prev) => (prev ? { ...prev, toWardCode: match.WardCode } : prev));
			setMatchedNames((prev) => ({ ...prev, ward: match.WardName }));
		}
	};

	const loadOrders = async () => {
		const token = localStorage.getItem("token");
		if (!token) return;

		setLoading(true);
		try {
			const res = await getOrders(token, { limit: 200, sort: "-createdAt" });
			setOrders(res.data);
		} catch (err) {
			console.error(err);
			setError("Không thể tải danh sách đơn hàng.");
		} finally {
			setLoading(false);
		}
	};

	const filteredOrders = useMemo(() => {
		if (activeTab === "pending") {
			return orders.filter((order) => {
				const isCancelled =
					order.orderStatus?.toLowerCase() === "cancelled" || order.shipmentStatus?.toLowerCase() === "returned";
				return (
					!isCancelled &&
					!order.ghnOrderCode &&
					(order.shipmentStatus === "not_shipped" || order.shipmentStatus === "pending" || !order.shipmentStatus)
				);
			});
		}
		if (activeTab === "shipping") {
			return orders.filter(
				(order) =>
					order.shipmentStatus === "shipping" ||
					order.shipmentStatus === "shipped" ||
					order.shipmentStatus === "delivered" ||
					!!order.ghnOrderCode,
			);
		}
		return orders.filter(
			(order) =>
				order.orderStatus?.toLowerCase() === "cancelled" ||
				order.shipmentStatus?.toLowerCase() === "returned" ||
				order.shipmentStatus?.toLowerCase() === "cancelled",
		);
	}, [orders, activeTab]);

	const isOrderCancelled = (order: Order) =>
		order.orderStatus?.toLowerCase() === "cancelled" || order.shipmentStatus?.toLowerCase() === "returned";

	const resolveAddressCodes = async (parsed: ParsedAddress) => {
		let provinceList = provinces.length ? provinces : null;
		if (!provinceList) {
			try {
				provinceList = await fetchProvinces();
				setProvinces(provinceList);
			} catch (err) {
				console.error("Không thể tải danh sách tỉnh", err);
				return { provinceMatch: undefined, districtMatch: undefined, wardMatch: undefined };
			}
		}

		const provinceMatch = parsed.province
			? provinceList.find((p) => isNameMatch(parsed.province!, p.ProvinceName, p.NameExtension))
			: undefined;

		let districtMatch: District | undefined;
		if (provinceMatch && parsed.district) {
			const districts = await getDistrictsForProvince(provinceMatch.ProvinceID);
			districtMatch = districts.find((d) => isNameMatch(parsed.district!, d.DistrictName, d.NameExtension));
		}

		let wardMatch: Ward | undefined;
		if (districtMatch && parsed.ward) {
			const wards = await getWardsForDistrict(districtMatch.DistrictID);
			wardMatch = wards.find((w) => isNameMatch(parsed.ward!, w.WardName, w.NameExtension));
		}

		return { provinceMatch, districtMatch, wardMatch };
	};

	const openCreateForm = (order: Order) => {
		const parsed = parseShippingAddress(order.shippingAddress);
		const baseForm: CreateShippingOrderPayload = {
			orderId: order.id,
			toName: order.user?.name || "",
			toPhone: order.user?.phone || parsed.phone || "",
			toAddress: parsed.street || order.shippingAddress,
			toWardCode: "",
			toDistrictId: 0,
			toProvinceName: parsed.province || "",
			note: "",
			codAmount: Number(order.totalAmount) || 0,
			weight: DEFAULT_DIMENSIONS.weight,
			length: DEFAULT_DIMENSIONS.length,
			width: DEFAULT_DIMENSIONS.width,
			height: DEFAULT_DIMENSIONS.height,
			serviceId: 0,
			serviceTypeId: 2,
			insuranceValue: Number(order.totalAmount) || 0,
			pickStationId: null,
			deliverStationId: null,
			pickShift: [2],
			content: `Đơn hàng #${order.id}`,
			returnPhone: "",
			returnAddress: "",
			returnDistrictId: null,
			returnWardCode: "",
			items:
				order.items?.map((item) => ({
					name: item.variant?.product?.name || "Sản phẩm",
					code: item.variant?.sku,
					quantity: item.quantity,
					price: Number(item.variant?.price || item.price || 0),
					weight: DEFAULT_DIMENSIONS.weight,
				})) || [],
		};

		setSelectedOrder(order);
		setParsedAddress(parsed);
		setForm(baseForm);
		setMatchedNames({});
		setProvinceId(null);
		setDistrictId(null);
		setDistrictName(parsed.district || "");
		setWardName(parsed.ward || "");
		setError(null);

		if (parsed.province || parsed.district || parsed.ward) {
			(resolveAddressCodes(parsed) as Promise<{
				provinceMatch?: Province;
				districtMatch?: District;
				wardMatch?: Ward;
			}>).then(({ provinceMatch, districtMatch, wardMatch }) => {
				if (provinceMatch || districtMatch || wardMatch) {
					setForm((prev) =>
						prev
							? {
									...prev,
									toProvinceName: provinceMatch?.ProvinceName || prev.toProvinceName,
									toDistrictId: districtMatch?.DistrictID ?? prev.toDistrictId,
									toWardCode: wardMatch?.WardCode ?? prev.toWardCode,
							  }
							: prev,
					);
					setProvinceId(provinceMatch?.ProvinceID ?? null);
					setDistrictId(districtMatch?.DistrictID ?? null);
					setMatchedNames({
						province: provinceMatch?.ProvinceName,
						district: districtMatch?.DistrictName,
						ward: wardMatch?.WardName,
					});
				}
			});
		}
	};

	const closeForm = () => {
		setSelectedOrder(null);
		setParsedAddress(null);
		setForm(null);
		setMatchedNames({});
		setError(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form) return;
		if (!form.toWardCode || !form.toDistrictId) {
			setError("Vui lòng điền WardCode và ID quận/huyện chính xác.");
			return;
		}

		setSubmitting(true);
		try {
			await createShippingOrder({
				...form,
				toDistrictId: Number(form.toDistrictId),
				codAmount: Number(form.codAmount) || 0,
				weight: Number(form.weight) || DEFAULT_DIMENSIONS.weight,
				length: Number(form.length) || DEFAULT_DIMENSIONS.length,
				width: Number(form.width) || DEFAULT_DIMENSIONS.width,
				height: Number(form.height) || DEFAULT_DIMENSIONS.height,
				insuranceValue: Number(form.insuranceValue) || 0,
				pickStationId: form.pickStationId ? Number(form.pickStationId) : null,
				deliverStationId: form.deliverStationId ? Number(form.deliverStationId) : null,
			});

			alert("Tạo vận đơn GHN thành công!");
			closeForm();
			await loadOrders();
		} catch (err: any) {
			console.error(err);
			setError(err?.message || "Tạo vận đơn thất bại.");
		} finally {
			setSubmitting(false);
		}
	};

	const handleCancelShipping = async (order: Order) => {
		if (!order.ghnOrderCode) return;
		if (!window.confirm("Bạn có chắc muốn hủy vận đơn GHN này?")) return;
		setCancellingCode(order.ghnOrderCode);
		try {
			await cancelShippingOrder(order.ghnOrderCode);
			alert("Đã gửi yêu cầu hủy vận đơn.");
			await loadOrders();
		} catch (err: any) {
			console.error(err);
			alert(err?.message || "Hủy vận đơn thất bại.");
		} finally {
			setCancellingCode(null);
		}
	};

	return (
		<main className="py-10">
			<Container>
				<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
					<div>
						<h1 className="heading-3">Trang nhân viên giao hàng</h1>
						<p className="text-sm text-neutral-500">
							Theo dõi toàn bộ đơn hàng của hệ thống và tạo vận đơn GHN.
						</p>
					</div>
					<div className="flex gap-2 bg-neutral-100 rounded-xl p-1">
						{[
							{ id: "pending", label: "Đơn cần xử lý" },
							{ id: "shipping", label: "Đang/Đã giao" },
							{ id: "cancelled", label: "Đã hủy giao" },
						].map((tab) => (
							<button
								key={tab.id}
								className={`px-4 py-2 rounded-lg text-sm font-medium ${
									activeTab === tab.id ? "bg-white shadow text-neutral-900" : "text-neutral-500"
								}`}
								onClick={() => setActiveTab(tab.id as TabKey)}
							>
								{tab.label}
							</button>
						))}
					</div>
				</div>

				{loading ? (
					<div className="text-center py-12">Đang tải danh sách...</div>
				) : filteredOrders.length === 0 ? (
					<div className="text-neutral-600">Không có đơn hàng trong mục này.</div>
				) : (
					<div className="space-y-4">
						{filteredOrders.map((order) => (
							<div key={order.id} className="card space-y-3">
								<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
									<div>
										<p className="font-semibold">Đơn #{order.id}</p>
										<p className="text-sm text-neutral-500">
											Khách: {order.user?.name} · {order.user?.phone}
										</p>
										<p className="text-sm text-neutral-500">Trạng thái: {order.orderStatus}</p>
										{order.ghnOrderCode && (
											<p className="text-sm text-neutral-500">Mã GHN: {order.ghnOrderCode}</p>
										)}
									</div>
									<div className="text-lg font-semibold text-neutral-900">
										{Number(order.totalAmount).toLocaleString()}₫
									</div>
								</div>
								<p className="text-sm text-neutral-600">Địa chỉ: {order.shippingAddress}</p>
								<div className="text-sm text-neutral-600">
									{order.items?.slice(0, 2).map((item) => (
										<div key={item.id}>
											{item.variant?.product?.name} x {item.quantity}
										</div>
									))}
									{(order.items?.length || 0) > 2 && <div>...và {order.items!.length - 2} sản phẩm khác</div>}
								</div>

								{activeTab === "pending" ? (
									isOrderCancelled(order) ? (
										<div className="text-right text-sm text-neutral-500">Đơn đã bị hủy</div>
									) : (
										<div className="flex justify-end">
											<button className="btn-primary" onClick={() => openCreateForm(order)}>
												Tạo đơn GHN
											</button>
										</div>
									)
								) : activeTab === "shipping" ? (
									order.ghnOrderCode ? (
										<div className="flex justify-end">
											<button
												className="btn-secondary text-red-600 border-red-300 hover:bg-red-50"
												disabled={cancellingCode === order.ghnOrderCode}
												onClick={() => handleCancelShipping(order)}
											>
												{cancellingCode === order.ghnOrderCode ? "Đang hủy..." : "Hủy giao hàng"}
											</button>
										</div>
									) : (
										<div className="text-right text-sm text-neutral-500">Chưa có mã GHN</div>
									)
								) : (
									<div className="text-right text-sm text-red-500 font-semibold">
										Đã hủy giao hàng
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</Container>

			{selectedOrder && form && (
				<div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
					<div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto">
						<div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
							<div>
								<h2 className="heading-4">Tạo vận đơn GHN cho #{selectedOrder.id}</h2>
								<p className="text-sm text-neutral-500">Điền thông tin đầy đủ trước khi gửi.</p>
							</div>
							<button className="text-neutral-500 hover:text-neutral-900" onClick={closeForm}>
								✕
							</button>
						</div>
						<form onSubmit={handleSubmit} className="p-6 space-y-4">
							<div className="grid md:grid-cols-2 gap-4">
								<input
									className="input"
									placeholder="Tên người nhận"
									value={form.toName}
									onChange={(e) => setForm({ ...form, toName: e.target.value })}
									required
								/>
								<input
									className="input"
									placeholder="Số điện thoại"
									value={form.toPhone}
									onChange={(e) => setForm({ ...form, toPhone: e.target.value })}
									required
								/>
							</div>
							<textarea
								className="input"
								placeholder="Địa chỉ chi tiết"
								value={form.toAddress}
								onChange={(e) => setForm({ ...form, toAddress: e.target.value })}
								required
							/>
							<div className="grid md:grid-cols-3 gap-4">
								<input
									className="input"
									placeholder="Phường / Xã"
									value={wardName}
									onChange={(e) => handleWardInputChange(e.target.value)}
								/>
								<input
									className="input"
									placeholder="Quận / Huyện"
									value={districtName}
									onChange={(e) => handleDistrictInputChange(e.target.value)}
								/>
								<input
									className="input"
									placeholder="Tỉnh / Thành phố"
									value={form.toProvinceName || ""}
									onChange={(e) => handleProvinceInputChange(e.target.value)}
								/>
							</div>
							{Boolean(parsedAddress || matchedNames.ward || matchedNames.district || matchedNames.province) && (
								<div className="text-xs text-neutral-500 space-y-1">
									<p>
										Khách nhập: {parsedAddress?.ward || "?"}, {parsedAddress?.district || "?"},{" "}
										{parsedAddress?.province || "?"}
									</p>
									<p>
										Đã khớp: {matchedNames.ward || "?"}, {matchedNames.district || "?"}, {matchedNames.province || "?"}
									</p>
									<p>
										Mã GHN: {form.toWardCode || "Chưa xác định"} · ID Quận:{" "}
										{form.toDistrictId ? form.toDistrictId : "Chưa xác định"}
									</p>
								</div>
							)}
							{parsedAddress && (
								<p className="text-xs text-neutral-500">
									Gợi ý: {parsedAddress.ward || "?"}, {parsedAddress.district || "?"}, {parsedAddress.province || "?"}
								</p>
							)}
							<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
								{(["weight", "length", "width", "height"] as const).map((field) => (
									<input
										key={field}
										className="input"
										type="number"
										placeholder={field}
										value={form[field]}
										onChange={(e) =>
											setForm({
												...form,
												[field]: Number(e.target.value),
											})
										}
									/>
								))}
							</div>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
								<input
									className="input"
									type="number"
									placeholder="COD Amount"
									value={form.codAmount}
									onChange={(e) => setForm({ ...form, codAmount: Number(e.target.value) })}
								/>
								<input
									className="input"
									type="number"
									placeholder="Giá trị bảo hiểm"
									value={form.insuranceValue}
									onChange={(e) => setForm({ ...form, insuranceValue: Number(e.target.value) })}
								/>
								<input
									className="input"
									placeholder="Ghi chú"
									value={form.note || ""}
									onChange={(e) => setForm({ ...form, note: e.target.value })}
								/>
							</div>

							{error && <p className="text-sm text-red-500">{error}</p>}

							<div className="flex justify-end gap-3">
								<button type="button" className="btn-secondary" onClick={closeForm} disabled={submitting}>
									Hủy
								</button>
								<button type="submit" className="btn-primary" disabled={submitting}>
									{submitting ? "Đang tạo..." : "Tạo vận đơn"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</main>
	);
}

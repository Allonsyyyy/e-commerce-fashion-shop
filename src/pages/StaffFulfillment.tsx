import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Container from "../components/Container";
import { getOrders, type Order } from "../api/admin/ordersApi";
import { getAdminReviews, replyReview, type AdminReview } from "../api/admin/reviewsApi";
import {
	approveReturnRequest,
	completeReturnRequest,
	getAdminReturns,
	receiveReturnRequest,
	rejectReturnRequest,
	type AdminReturnRequest,
} from "../api/admin/returnsApi";
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
import {
	Package,
	Truck,
	XCircle,
	MapPin,
	User,
	Phone,
	Calendar,
	FileText,
	CheckCircle2,
	AlertCircle,
	Loader2,
	X,
	Box,
	Ruler,
	Weight,
	DollarSign,
	Shield,
	MessageSquare,
	RefreshCw,
	Star,
} from "lucide-react";

type TabKey = "pending" | "shipping" | "cancelled";
type ReturnAction = "approve" | "reject" | "receive" | "complete";

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
	const [sectionTab, setSectionTab] = useState<"shipping" | "reviews" | "returns">("shipping");
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
	const [reviews, setReviews] = useState<AdminReview[]>([]);
	const [reviewsLoading, setReviewsLoading] = useState(false);
	const [reviewsError, setReviewsError] = useState<string | null>(null);
	const [reviewTotal, setReviewTotal] = useState(0);
	const [reviewSearchInput, setReviewSearchInput] = useState("");
	const [reviewSearch, setReviewSearch] = useState("");
	const [replyingReview, setReplyingReview] = useState<AdminReview | null>(null);
	const [replyMessage, setReplyMessage] = useState("");
	const [replySubmitting, setReplySubmitting] = useState(false);
	const [returns, setReturns] = useState<AdminReturnRequest[]>([]);
	const [returnsLoading, setReturnsLoading] = useState(false);
	const [returnsError, setReturnsError] = useState<string | null>(null);
	const [returnsTotal, setReturnsTotal] = useState(0);
	const [returnSearchInput, setReturnSearchInput] = useState("");
	const [returnSearch, setReturnSearch] = useState("");
	const [returnActionLoading, setReturnActionLoading] = useState<number | null>(null);

	useEffect(() => {
		loadOrders();
	}, []);

	useEffect(() => {
		fetchProvinces()
			.then(setProvinces)
			.catch((err) => console.error("Failed to load provinces list", err));
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
			console.error("Failed to load districts", err);
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
			console.error("Failed to load wards", err);
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
				console.error("Failed to load provinces list", err);
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
			setError("Failed to load orders list.");
		} finally {
			setLoading(false);
		}
	};

	const loadReviews = useCallback(async () => {
		const token = localStorage.getItem("token");
		if (!token) {
			setReviewsError("Please log in as an admin to load reviews.");
			setReviews([]);
			return;
		}

		setReviewsLoading(true);
		setReviewsError(null);
		try {
			const res = await getAdminReviews(token, { limit: 50, sort: "-createdAt", q: reviewSearch || undefined });
			const list = Array.isArray(res.data) ? res.data : [];
			setReviews(list);
			setReviewTotal(typeof res.total === "number" ? res.total : list.length);
		} catch (err) {
			console.error(err);
			setReviewsError("Failed to load reviews.");
		} finally {
			setReviewsLoading(false);
		}
	}, [reviewSearch]);

	const extractReturnList = (payload: any): { list: AdminReturnRequest[]; total: number } => {
		if (!payload) return { list: [], total: 0 };
		if (Array.isArray(payload)) {
			return { list: payload, total: payload.length };
		}
		if (Array.isArray(payload.data)) {
			return { list: payload.data, total: typeof payload.total === "number" ? payload.total : payload.data.length };
		}
		if (Array.isArray(payload.data?.data)) {
			const list = payload.data.data;
			const total = payload.data.total ?? payload.total ?? list.length;
			return { list, total };
		}
		return { list: [], total: 0 };
	};

	const loadReturns = useCallback(async () => {
		const token = localStorage.getItem("token");
		if (!token) {
			setReturnsError("Please log in as an admin to load return requests.");
			setReturns([]);
			return;
		}

		setReturnsLoading(true);
		setReturnsError(null);
		try {
			const res = await getAdminReturns(token, {
				limit: 50,
				sort: "-createdAt",
				q: returnSearch || undefined,
			});
			const { list, total } = extractReturnList(res);
			setReturns(list);
			setReturnsTotal(total);
		} catch (err) {
			console.error(err);
			setReturnsError("Failed to load return requests.");
		} finally {
			setReturnsLoading(false);
		}
	}, [returnSearch]);

	useEffect(() => {
		if (sectionTab === "reviews") {
			loadReviews();
		}
	}, [sectionTab, loadReviews]);

	useEffect(() => {
		if (sectionTab === "returns") {
			loadReturns();
		}
	}, [sectionTab, loadReturns]);

	const openReplyModal = (review: AdminReview) => {
		setReplyingReview(review);
		setReplyMessage(review.reply || review.sellerReply || "");
	};

	const closeReplyModal = () => {
		setReplyingReview(null);
		setReplyMessage("");
		setReplySubmitting(false);
	};

	const handleSubmitReply = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!replyingReview) return;
		if (!replyMessage.trim()) {
			alert("Please enter a reply before submitting.");
			return;
		}

		const token = localStorage.getItem("token");
		if (!token) {
			alert("Please log in as an admin to reply.");
			return;
		}

		setReplySubmitting(true);
		try {
			await replyReview(token, replyingReview.id, replyMessage.trim());
			await loadReviews();
			closeReplyModal();
		} catch (err) {
			console.error(err);
			alert("Failed to send reply. Please try again.");
		} finally {
			setReplySubmitting(false);
		}
	};

	const formatReturnStatus = (status?: string | null) => {
		if (!status) return "Unknown";
		return status
			.split("_")
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
			.join(" ");
	};

	const getReturnStatusStyle = (status?: string | null) => {
		const normalized = status?.toLowerCase();
		if (normalized === "pending") return "bg-amber-50 text-amber-700 border border-amber-100";
		if (normalized === "approved" || normalized === "shipping_new")
			return "bg-blue-50 text-blue-700 border border-blue-100";
		if (normalized === "receiving" || normalized === "received")
			return "bg-purple-50 text-purple-700 border border-purple-100";
		if (normalized === "completed") return "bg-emerald-50 text-emerald-700 border border-emerald-100";
		if (normalized === "rejected") return "bg-error-50 text-error-700 border border-error-100";
		return "bg-neutral-100 text-neutral-600 border border-neutral-200";
	};

	const getReturnActions = (status?: string | null): ReturnAction[] => {
		const normalized = status?.toLowerCase();
		if (normalized === "pending") return ["approve", "reject"];
		if (normalized === "approved" || normalized === "shipping_new") return ["receive", "reject"];
		if (normalized === "receiving" || normalized === "received") return ["complete"];
		return [];
	};

	const baseReturnActionClass =
		"px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border";
	const getReturnActionClass = (action: ReturnAction) => {
		switch (action) {
			case "approve":
				return `${baseReturnActionClass} bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800`;
			case "reject":
				return `${baseReturnActionClass} bg-white text-error-600 border-error-300 hover:bg-error-50`;
			case "receive":
				return `${baseReturnActionClass} bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50`;
			case "complete":
				return `${baseReturnActionClass} bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-500`;
			default:
				return baseReturnActionClass;
		}
	};

	const actionLabels: Record<ReturnAction, string> = {
		approve: "Chấp nhận yêu cầu",
		reject: "Từ chối",
		receive: "Đã nhận được hàng",
		complete: "Hoàn tất đổi trả",
	};

	const handleReturnAction = async (request: AdminReturnRequest, action: ReturnAction) => {
		const token = localStorage.getItem("token");
		if (!token) {
			alert("Please log in as an admin to update returns.");
			return;
		}

		setReturnActionLoading(request.id);
		try {
			if (action === "approve") {
				await approveReturnRequest(token, request.id);
			} else if (action === "reject") {
				const reason = window.prompt("Enter a rejection reason (optional)")?.trim();
				await rejectReturnRequest(token, request.id, reason || undefined);
			} else if (action === "receive") {
				await receiveReturnRequest(token, request.id);
			} else if (action === "complete") {
				await completeReturnRequest(token, request.id);
			}
			await loadReturns();
		} catch (err) {
			console.error(err);
			alert("Failed to update the return request. Please try again.");
		} finally {
			setReturnActionLoading(null);
		}
	};

	const normalizeShipmentStatus = (status?: string | null) => status?.toLowerCase() ?? "";
	const isPendingShipmentStatus = (status?: string | null) => {
		const normalized = normalizeShipmentStatus(status);
		return normalized === "not_shipped" || normalized === "pending" || normalized === "ready_to_pick";
	};
	const isShippingShipmentStatus = (status?: string | null) => {
		const normalized = normalizeShipmentStatus(status);
		return normalized === "shipping" || normalized === "shipped" || normalized === "delivered";
	};
	const isCancelledShipmentStatus = (status?: string | null) => {
		const normalized = normalizeShipmentStatus(status);
		return normalized === "cancelled" || normalized === "returned";
	};

	const filteredOrders = useMemo(() => {
		if (activeTab === "pending") {
			return orders.filter((order) => {
				const isCancelled =
					order.orderStatus?.toLowerCase() === "cancelled" || isCancelledShipmentStatus(order.shipmentStatus);
				return (
					!isCancelled &&
					!order.ghnOrderCode &&
					(isPendingShipmentStatus(order.shipmentStatus) || !order.shipmentStatus)
				);
			});
		}
		if (activeTab === "shipping") {
			return orders.filter(
				(order) =>
					isShippingShipmentStatus(order.shipmentStatus) ||
					!!order.ghnOrderCode,
			);
		}
		return orders.filter(
			(order) =>
				order.orderStatus?.toLowerCase() === "cancelled" ||
				isCancelledShipmentStatus(order.shipmentStatus),
		);
	}, [orders, activeTab]);

	const isOrderCancelled = (order: Order) =>
		order.orderStatus?.toLowerCase() === "cancelled" || isCancelledShipmentStatus(order.shipmentStatus);

	const resolveAddressCodes = async (parsed: ParsedAddress) => {
		let provinceList = provinces.length ? provinces : null;
		if (!provinceList) {
			try {
				provinceList = await fetchProvinces();
				setProvinces(provinceList);
			} catch (err) {
				console.error("Failed to load provinces list", err);
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
			content: `Order #${order.id}`,
			returnPhone: "",
			returnAddress: "",
			returnDistrictId: null,
			returnWardCode: "",
			items:
				order.items?.map((item) => ({
					name: item.variant?.product?.name || "Product",
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
			setError("Please fill in WardCode and District ID accurately.");
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

			alert("GHN shipping order created successfully!");
			closeForm();
			await loadOrders();
		} catch (err: any) {
			console.error(err);
			setError(err?.message || "Failed to create shipping order.");
		} finally {
			setSubmitting(false);
		}
	};

	const handleCancelShipping = async (order: Order) => {
		if (!order.ghnOrderCode) return;
		if (!window.confirm("Are you sure you want to cancel this GHN shipping order?")) return;
		setCancellingCode(order.ghnOrderCode);
		try {
			await cancelShippingOrder(order.ghnOrderCode);
			alert("Cancel request sent successfully.");
			await loadOrders();
		} catch (err: any) {
			console.error(err);
			alert(err?.message || "Failed to cancel shipping order.");
		} finally {
			setCancellingCode(null);
		}
	};

	const getTabCount = (tabId: TabKey) => {
		if (tabId === "pending") {
			return orders.filter((order) => {
				const isCancelled =
					order.orderStatus?.toLowerCase() === "cancelled" || isCancelledShipmentStatus(order.shipmentStatus);
				return (
					!isCancelled &&
					!order.ghnOrderCode &&
					(isPendingShipmentStatus(order.shipmentStatus) || !order.shipmentStatus)
				);
			}).length;
		}
		if (tabId === "shipping") {
			return orders.filter(
				(order) =>
					isShippingShipmentStatus(order.shipmentStatus) ||
					!!order.ghnOrderCode,
			).length;
		}
		return orders.filter(
			(order) =>
				order.orderStatus?.toLowerCase() === "cancelled" ||
				isCancelledShipmentStatus(order.shipmentStatus),
		).length;
	};

	const tabs = [
		{ id: "pending" as TabKey, label: "Pending Orders", icon: Package },
		{ id: "shipping" as TabKey, label: "Shipping/Delivered", icon: Truck },
		{ id: "cancelled" as TabKey, label: "Cancelled", icon: XCircle },
	];
	const safeReviews = Array.isArray(reviews) ? reviews : [];
	const safeReturns = Array.isArray(returns) ? returns : [];

	const renderMainContent = () => {
		if (sectionTab === "reviews") {
			return (
				<>
					<div className="mb-8">
						<div className="flex items-center gap-3 mb-2">
							<div className="p-3 bg-neutral-900 rounded-xl">
								<MessageSquare className="w-6 h-6 text-white" />
							</div>
							<div>
								<h1 className="heading-3">Review Management</h1>
								<p className="text-sm text-neutral-600 mt-1">
									Monitor customer reviews and send timely replies.
								</p>
							</div>
						</div>
					</div>

					<form
						className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6"
						onSubmit={(e) => {
							e.preventDefault();
							setReviewSearch(reviewSearchInput.trim());
						}}
					>
						<p className="text-sm text-neutral-500">Total reviews: {reviewTotal}</p>
						<div className="flex gap-2 w-full md:w-auto">
							<input
								className="input w-full md:w-72"
								placeholder="Search by product or customer"
								value={reviewSearchInput}
								onChange={(e) => setReviewSearchInput(e.target.value)}
							/>
							<button type="submit" className="btn-secondary whitespace-nowrap">
								Search
							</button>
							{reviewSearch && (
								<button
									type="button"
									className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-neutral-50"
									onClick={() => {
										setReviewSearch("");
										setReviewSearchInput("");
									}}
								>
									Clear
								</button>
							)}
						</div>
					</form>

					{reviewsLoading ? (
						<div className="flex flex-col items-center justify-center py-16">
							<Loader2 className="w-8 h-8 text-neutral-400 animate-spin mb-4" />
							<p className="text-neutral-600">Loading reviews...</p>
						</div>
					) : reviewsError ? (
						<div className="bg-error-50 border border-error-200 rounded-lg p-4">
							<p className="text-sm font-medium text-error-900">{reviewsError}</p>
						</div>
					) : safeReviews.length === 0 ? (
						<div className="card text-center py-16">
							<div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 rounded-full mb-4">
								<MessageSquare className="w-8 h-8 text-neutral-400" />
							</div>
							<h3 className="text-lg font-semibold text-neutral-900 mb-2">No Reviews</h3>
							<p className="text-neutral-600">There are no reviews matching your filters.</p>
						</div>
					) : (
						<div className="space-y-4">
							{safeReviews.map((review) => {
								const starCount = Math.max(0, Math.min(5, Math.round(review.rating ?? 0)));
								return (
									<div key={review.id} className="card space-y-4">
										<div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
											<div>
												<p className="font-semibold text-neutral-900">
													{review.product?.name || "Product"} • Review #{review.id}
												</p>
												<p className="text-sm text-neutral-500">
													{review.user?.name || "Customer"} •{" "}
													{review.createdAt
														? new Date(review.createdAt).toLocaleString()
														: "Unknown date"}
												</p>
											</div>
											<div className="flex items-center gap-1 text-amber-500">
												{Array.from({ length: starCount }).map((_, idx) => (
													<Star key={idx} className="w-4 h-4 fill-current" />
												))}
												<span className="text-sm text-neutral-600 ml-2">{review.rating}/5</span>
											</div>
										</div>

										<p className="text-sm text-neutral-700 whitespace-pre-line">{review.comment}</p>

										{(review.reply || review.sellerReply) && (
											<div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
												<p className="text-xs font-semibold text-neutral-500 mb-1">Your reply</p>
												<p className="text-sm text-neutral-700">
													{review.reply || review.sellerReply}
												</p>
												{review.sellerRepliedAt && (
													<p className="text-xs text-neutral-500 mt-1">
														Updated {new Date(review.sellerRepliedAt).toLocaleString()}
													</p>
												)}
											</div>
										)}

										<div className="flex justify-end">
											<button
												type="button"
												className="btn-primary"
												onClick={() => openReplyModal(review)}
											>
												{review.reply || review.sellerReply ? "Edit Reply" : "Reply"}
											</button>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</>
			);
		}

		if (sectionTab === "returns") {
			return (
				<>
					<div className="mb-8">
						<div className="flex items-center gap-3 mb-2">
							<div className="p-3 bg-neutral-900 rounded-xl">
								<RefreshCw className="w-6 h-6 text-white" />
							</div>
							<div>
								<h1 className="heading-3">Return Management</h1>
								<p className="text-sm text-neutral-600 mt-1">
									Review and process customer return requests.
								</p>
							</div>
						</div>
					</div>

					<form
						className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6"
						onSubmit={(e) => {
							e.preventDefault();
							setReturnSearch(returnSearchInput.trim());
						}}
					>
						<p className="text-sm text-neutral-500">Total requests: {returnsTotal}</p>
						<div className="flex gap-2 w-full md:w-auto">
							<input
								className="input w-full md:w-72"
								placeholder="Search by order, user, SKU..."
								value={returnSearchInput}
								onChange={(e) => setReturnSearchInput(e.target.value)}
							/>
							<button type="submit" className="btn-secondary whitespace-nowrap">
								Search
							</button>
							{returnSearch && (
								<button
									type="button"
									className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-neutral-50"
									onClick={() => {
										setReturnSearch("");
										setReturnSearchInput("");
									}}
								>
									Clear
								</button>
							)}
						</div>
					</form>

					{returnsLoading ? (
						<div className="flex flex-col items-center justify-center py-16">
							<Loader2 className="w-8 h-8 text-neutral-400 animate-spin mb-4" />
							<p className="text-neutral-600">Loading return requests...</p>
						</div>
					) : returnsError ? (
						<div className="bg-error-50 border border-error-200 rounded-lg p-4">
							<p className="text-sm font-medium text-error-900">{returnsError}</p>
						</div>
					) : safeReturns.length === 0 ? (
						<div className="card text-center py-16">
							<div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 rounded-full mb-4">
								<RefreshCw className="w-8 h-8 text-neutral-400" />
							</div>
							<h3 className="text-lg font-semibold text-neutral-900 mb-2">No Return Requests</h3>
							<p className="text-neutral-600">There are no return requests matching your filters.</p>
						</div>
					) : (
						<div className="space-y-4">
							{safeReturns.map((request) => {
								const actions = getReturnActions(request.status);
								return (
									<div key={request.id} className="card space-y-4">
										<div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
											<div>
												<p className="font-semibold text-neutral-900">
													Order #{request.orderItem?.order?.id ?? "N/A"} • Item #{request.orderItemId}
												</p>
												<p className="text-sm text-neutral-500">
													{request.orderItem?.order?.user?.name || "Customer"} •{" "}
													{request.createdAt
														? new Date(request.createdAt).toLocaleString()
														: "Unknown date"}
												</p>
											</div>
											<div className="flex flex-col gap-1 items-start md:items-end">
												<span
													className={`px-3 py-1 rounded-full text-xs font-semibold ${getReturnStatusStyle(request.status)}`}
												>
													{formatReturnStatus(request.status)}
												</span>
												{request.rejectReason && (
													<span className="text-xs text-error-600">
														Rejected: {request.rejectReason}
													</span>
												)}
											</div>
										</div>

										<div className="grid gap-3 md:grid-cols-2">
											<div>
												<p className="text-xs font-semibold text-neutral-500">Product</p>
												<p className="text-sm text-neutral-800">
													{request.orderItem?.variant?.product?.name || "N/A"}
												</p>
												{request.orderItem?.variant?.sku && (
													<p className="text-xs text-neutral-500">
														SKU: {request.orderItem.variant.sku}
													</p>
												)}
											</div>
											<div>
												<p className="text-xs font-semibold text-neutral-500">Quantity & Price</p>
												<p className="text-sm text-neutral-800">
													Qty {request.orderItem?.quantity || 0} •{" "}
													{Number(request.orderItem?.price || 0).toLocaleString("en-US")}
												</p>
											</div>
											<div className="md:col-span-2">
												<p className="text-xs font-semibold text-neutral-500">Customer Reason</p>
												<p className="text-sm text-neutral-700">{request.reason || "Not provided."}</p>
											</div>
										</div>

										{request.images?.length ? (
											<div className="flex flex-wrap gap-2">
												{request.images.slice(0, 4).map((image, idx) => (
													<img
														key={`${request.id}-${idx}`}
														src={image}
														alt={`Return ${request.id} evidence ${idx + 1}`}
														className="h-16 w-16 rounded-lg object-cover border"
													/>
												))}
											</div>
										) : null}

										<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between pt-4 border-t border-neutral-200">
											<span className="text-xs text-neutral-500">Request #{request.id}</span>
											{actions.length === 0 ? (
												<p className="text-sm text-neutral-500">No further actions available.</p>
											) : (
												<div className="flex flex-wrap gap-2">
													{actions.map((action) => (
														<button
															key={action}
															type="button"
															className={getReturnActionClass(action)}
															disabled={returnActionLoading === request.id}
															onClick={() => handleReturnAction(request, action)}
														>
															{returnActionLoading === request.id ? (
																<>
																	<Loader2 className="w-4 h-4 animate-spin" />
																	Updating...
																</>
															) : (
																actionLabels[action]
															)}
														</button>
													))}
												</div>
											)}
										</div>
									</div>
								);
							})}
						</div>
					)}
				</>
			);
		}

		return (
			<>
				<div className="mb-8">
					<div className="flex items-center gap-3 mb-2">
						<div className="p-3 bg-neutral-900 rounded-xl">
							<Truck className="w-6 h-6 text-white" />
						</div>
						<div>
							<h1 className="heading-3">Shipping Management</h1>
							<p className="text-sm text-neutral-600 mt-1">
								Track and process orders, create GHN shipping orders
							</p>
						</div>
					</div>
				</div>

				<div className="flex flex-wrap gap-3 mb-8">
					{tabs.map((tab) => {
						const Icon = tab.icon;
						const isActive = activeTab === tab.id;
						return (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`group flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all ${
									isActive
										? "bg-neutral-900 text-white shadow-lg shadow-neutral-900/20"
										: "bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
								}`}
							>
								<Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-neutral-500"}`} />
								<span>{tab.label}</span>
								{getTabCount(tab.id) > 0 && (
									<span
										className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
											isActive ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-600"
										}`}
									>
										{getTabCount(tab.id)}
									</span>
								)}
							</button>
						);
					})}
				</div>

				{loading ? (
					<div className="flex flex-col items-center justify-center py-16">
						<Loader2 className="w-8 h-8 text-neutral-400 animate-spin mb-4" />
						<p className="text-neutral-600">Loading orders list...</p>
					</div>
				) : filteredOrders.length === 0 ? (
					<div className="card text-center py-16">
						<div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 rounded-full mb-4">
							<Package className="w-8 h-8 text-neutral-400" />
						</div>
						<h3 className="text-lg font-semibold text-neutral-900 mb-2">No Orders</h3>
						<p className="text-neutral-600">There are currently no orders in this section.</p>
					</div>
				) : (
					<div className="space-y-4">
						{filteredOrders.map((order) => {
							return (
								<div key={order.id} className="card hover:shadow-md transition-shadow">
									<div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
										<div className="flex-1">
											<div className="flex items-center gap-3 mb-3">
												<div className="p-2 bg-neutral-100 rounded-lg">
													<FileText className="w-5 h-5 text-neutral-600" />
												</div>
												<div>
													<h3 className="font-semibold text-lg text-neutral-900">Order #{order.id}</h3>
													{order.ghnOrderCode && (
														<div className="flex items-center gap-1 mt-1">
															<Truck className="w-3 h-3 text-neutral-500" />
															<span className="text-xs text-neutral-600 font-mono">
																GHN: {order.ghnOrderCode}
															</span>
														</div>
													)}
												</div>
											</div>

											<div className="flex flex-wrap items-center gap-4 mb-3 text-sm">
												<div className="flex items-center gap-2 text-neutral-600">
													<User className="w-4 h-4 text-neutral-400" />
													<span className="font-medium">{order.user?.name || "N/A"}</span>
												</div>
												<div className="flex items-center gap-2 text-neutral-600">
													<Phone className="w-4 h-4 text-neutral-400" />
													<span>{order.user?.phone || "N/A"}</span>
												</div>
												<div className="flex items-center gap-2 text-neutral-600">
													<Calendar className="w-4 h-4 text-neutral-400" />
													<span>
														{order.createdAt
															? new Date(order.createdAt).toLocaleDateString("en-US")
															: "N/A"}
													</span>
												</div>
											</div>

											<div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-medium mb-3">
												{order.shipmentStatus === "delivered" ? (
													<CheckCircle2 className="w-3 h-3" />
												) : order.shipmentStatus === "cancelled" ||
												  order.orderStatus?.toLowerCase() === "cancelled" ? (
													<XCircle className="w-3 h-3" />
												) : (
													<AlertCircle className="w-3 h-3" />
												)}
												<span>
													{order.shipmentStatus === "delivered"
														? "Delivered"
														: order.shipmentStatus === "shipping" || order.shipmentStatus === "shipped"
															? "Shipping"
															: order.shipmentStatus === "cancelled" ||
																	order.orderStatus?.toLowerCase() === "cancelled"
																? "Cancelled"
																: "Pending"}
												</span>
											</div>
										</div>

										<div className="lg:text-right">
											<p className="text-xs text-neutral-500 mb-1">Total Amount</p>
											<p className="text-2xl font-bold text-neutral-900">
												{Number(order.totalAmount).toLocaleString("en-US")}
											</p>
										</div>
									</div>

									<div className="bg-neutral-50 rounded-lg p-3 mb-4">
										<div className="flex items-start gap-2">
											<MapPin className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" />
											<p className="text-sm text-neutral-700">{order.shippingAddress}</p>
										</div>
									</div>

									<div className="mb-4">
										<p className="text-xs font-medium text-neutral-500 mb-2">Products</p>
										<div className="space-y-1">
											{order.items?.slice(0, 3).map((item) => (
												<div key={item.id} className="flex items-center justify-between text-sm">
													<span className="text-neutral-700">
														{item.variant?.product?.name || "Product"}
													</span>
													<span className="text-neutral-500 font-medium">x{item.quantity}</span>
												</div>
											))}
											{(order.items?.length || 0) > 3 && (
												<p className="text-xs text-neutral-500 mt-2">
													...and {order.items!.length - 3} more products
												</p>
											)}
										</div>
									</div>

									<div className="flex justify-end gap-2 pt-4 border-t border-neutral-200">
										{activeTab === "pending" ? (
											isOrderCancelled(order) ? (
												<div className="flex items-center gap-2 text-sm text-error-600">
													<XCircle className="w-4 h-4" />
													<span>Order Cancelled</span>
												</div>
											) : (
												<button
													className="btn-primary flex items-center gap-2"
													onClick={() => openCreateForm(order)}
												>
													<Truck className="w-4 h-4" />
													Create GHN Order
												</button>
											)
										) : activeTab === "shipping" ? (
											order.ghnOrderCode ? (
												<button
													className="btn-secondary flex items-center gap-2 text-error-600 border-error-300 hover:bg-error-50"
													disabled={cancellingCode === order.ghnOrderCode}
													onClick={() => handleCancelShipping(order)}
												>
													{cancellingCode === order.ghnOrderCode ? (
														<>
															<Loader2 className="w-4 h-4 animate-spin" />
															Cancelling...
														</>
													) : (
														<>
															<XCircle className="w-4 h-4" />
															Cancel Shipping
														</>
													)}
												</button>
											) : (
												<div className="flex items-center gap-2 text-sm text-neutral-500">
													<AlertCircle className="w-4 h-4" />
													<span>No GHN Code</span>
												</div>
											)
										) : (
											<div className="flex items-center gap-2 text-sm text-error-600 font-medium">
												<XCircle className="w-4 h-4" />
												<span>Shipping Cancelled</span>
											</div>
										)}
									</div>
								</div>
							);
						})}
					</div>
				)}
			</>
		);
	};

	return (
		<main className="min-h-screen bg-gradient-to-br from-neutral-50 to-white">
			<div className="flex">
				<aside className="hidden lg:flex flex-col gap-2 w-64 bg-neutral-900 text-white min-h-screen p-6">
					<div className="mb-4">
						<p className="text-sm text-neutral-400">Bảng điều khiển</p>
						<h2 className="text-2xl font-bold">Thao tác</h2>
					</div>
					<button
						className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
							sectionTab === "shipping" ? "bg-white/10" : "hover:bg-white/5"
						}`}
						onClick={() => setSectionTab("shipping")}
					>
						<Truck className="w-5 h-5" />
						Tạo đơn giao hàng
					</button>
					<button
						className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
							sectionTab === "reviews" ? "bg-white/10" : "hover:bg-white/5"
						}`}
						onClick={() => setSectionTab("reviews")}
					>
						<MessageSquare className="w-5 h-5" />
						Quản lý bình luận
					</button>
					<button
						className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
							sectionTab === "returns" ? "bg-white/10" : "hover:bg-white/5"
						}`}
						onClick={() => setSectionTab("returns")}
					>
						<RefreshCw className="w-5 h-5" />
						Quản lý đổi trả
					</button>
				</aside>

				<div className="flex-1">
					<Container>{renderMainContent()}</Container>
				</div>
			</div>

	{selectedOrder && form && (
				<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
					<div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
						{/* Header */}
						<div className="px-6 py-5 border-b border-neutral-200 flex items-center justify-between bg-gradient-to-r from-neutral-50 to-white">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-neutral-900 rounded-lg">
									<Truck className="w-5 h-5 text-white" />
								</div>
								<div>
									<h2 className="heading-4">Create GHN Shipping Order</h2>
									<p className="text-sm text-neutral-600">Order #{selectedOrder.id}</p>
								</div>
							</div>
							<button
								className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
								onClick={closeForm}
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						{/* Form Content */}
						<form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
							{/* Customer Information */}
							<div className="space-y-4">
								<h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
									<User className="w-4 h-4" />
									Recipient Information
								</h3>
								<div className="grid md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-neutral-700 mb-1.5">
											Recipient Name <span className="text-error-500">*</span>
										</label>
										<input
											className="input"
											placeholder="Enter recipient name"
											value={form.toName}
											onChange={(e) => setForm({ ...form, toName: e.target.value })}
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-neutral-700 mb-1.5">
											Phone Number <span className="text-error-500">*</span>
										</label>
										<input
											className="input"
											placeholder="Enter phone number"
											value={form.toPhone}
											onChange={(e) => setForm({ ...form, toPhone: e.target.value })}
											required
										/>
									</div>
								</div>
							</div>

							{/* Address Information */}
							<div className="space-y-4">
								<h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
									<MapPin className="w-4 h-4" />
									Shipping Address
								</h3>
								<div>
									<label className="block text-sm font-medium text-neutral-700 mb-1.5">
										Detailed Address <span className="text-error-500">*</span>
									</label>
									<textarea
										className="input min-h-[80px] resize-none"
										placeholder="House number, street name..."
										value={form.toAddress}
										onChange={(e) => setForm({ ...form, toAddress: e.target.value })}
										required
									/>
								</div>
								<div className="grid md:grid-cols-3 gap-4">
									<div>
										<label className="block text-sm font-medium text-neutral-700 mb-1.5">
											Ward
										</label>
										<input
											className="input"
											placeholder="Enter ward"
											value={wardName}
											onChange={(e) => handleWardInputChange(e.target.value)}
										/>
										{matchedNames.ward && (
											<p className="text-xs text-success-600 mt-1 flex items-center gap-1">
												<CheckCircle2 className="w-3 h-3" />
												Matched: {matchedNames.ward}
											</p>
										)}
									</div>
									<div>
										<label className="block text-sm font-medium text-neutral-700 mb-1.5">
											District
										</label>
										<input
											className="input"
											placeholder="Enter district"
											value={districtName}
											onChange={(e) => handleDistrictInputChange(e.target.value)}
										/>
										{matchedNames.district && (
											<p className="text-xs text-success-600 mt-1 flex items-center gap-1">
												<CheckCircle2 className="w-3 h-3" />
												Matched: {matchedNames.district}
											</p>
										)}
									</div>
									<div>
										<label className="block text-sm font-medium text-neutral-700 mb-1.5">
											Province / City
										</label>
										<input
											className="input"
											placeholder="Enter province/city"
											value={form.toProvinceName || ""}
											onChange={(e) => handleProvinceInputChange(e.target.value)}
										/>
										{matchedNames.province && (
											<p className="text-xs text-success-600 mt-1 flex items-center gap-1">
												<CheckCircle2 className="w-3 h-3" />
												Matched: {matchedNames.province}
											</p>
										)}
									</div>
								</div>
							</div>
							{/* Debug Info (Collapsible) */}
							{Boolean(parsedAddress || matchedNames.ward || matchedNames.district || matchedNames.province) && (
								<div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
									<p className="text-xs font-semibold text-neutral-700 mb-2">Address Matching Info</p>
									<div className="space-y-1.5 text-xs">
										<div className="flex items-center gap-2">
											<span className="text-neutral-500">Customer entered:</span>
											<span className="text-neutral-700 font-mono">
												{parsedAddress?.ward || "?"}, {parsedAddress?.district || "?"},{" "}
												{parsedAddress?.province || "?"}
											</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="text-neutral-500">Matched:</span>
											<span className="text-success-600 font-medium">
												{matchedNames.ward || "?"}, {matchedNames.district || "?"}, {matchedNames.province || "?"}
											</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="text-neutral-500">GHN Code:</span>
											<span className="font-mono text-neutral-700">
												{form.toWardCode || "Not determined"}
											</span>
											<span className="text-neutral-400">·</span>
											<span className="text-neutral-500">District ID:</span>
											<span className="font-mono text-neutral-700">
												{form.toDistrictId ? form.toDistrictId : "Not determined"}
											</span>
										</div>
									</div>
								</div>
							)}

							{/* Package Dimensions */}
							<div className="space-y-4">
								<h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
									<Box className="w-4 h-4" />
									Dimensions & Weight
								</h3>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
									{([
										{ field: "weight" as const, label: "Weight (g)", icon: Weight },
										{ field: "length" as const, label: "Length (cm)", icon: Ruler },
										{ field: "width" as const, label: "Width (cm)", icon: Ruler },
										{ field: "height" as const, label: "Height (cm)", icon: Ruler },
									] as const).map(({ field, label, icon: Icon }) => (
										<div key={field}>
											<label className="block text-sm font-medium text-neutral-700 mb-1.5">
												{label}
											</label>
											<div className="relative">
												<Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
												<input
													className="input pl-10"
													type="number"
													placeholder="0"
													value={form[field]}
													onChange={(e) =>
														setForm({
															...form,
															[field]: Number(e.target.value),
														})
													}
												/>
											</div>
										</div>
									))}
								</div>
							</div>

							{/* Financial Information */}
							<div className="space-y-4">
								<h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
									<DollarSign className="w-4 h-4" />
									Payment Information
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-neutral-700 mb-1.5">
											COD Amount (₫)
										</label>
										<input
											className="input"
											type="number"
											placeholder="0"
											value={form.codAmount}
											onChange={(e) => setForm({ ...form, codAmount: Number(e.target.value) })}
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-neutral-700 mb-1.5 flex items-center gap-2">
											<Shield className="w-4 h-4" />
											Insurance Value (₫)
										</label>
										<input
											className="input"
											type="number"
											placeholder="0"
											value={form.insuranceValue}
											onChange={(e) => setForm({ ...form, insuranceValue: Number(e.target.value) })}
										/>
									</div>
								</div>
								<div>
									<label className="block text-sm font-medium text-neutral-700 mb-1.5 flex items-center gap-2">
										<MessageSquare className="w-4 h-4" />
										Note
									</label>
									<textarea
										className="input min-h-[80px] resize-none"
										placeholder="Enter note (optional)..."
										value={form.note || ""}
										onChange={(e) => setForm({ ...form, note: e.target.value })}
									/>
								</div>
							</div>

							{/* Error Message */}
							{error && (
								<div className="bg-error-50 border border-error-200 rounded-lg p-4 flex items-start gap-3">
									<AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
									<div>
										<p className="text-sm font-medium text-error-900">An error occurred</p>
										<p className="text-sm text-error-700 mt-1">{error}</p>
									</div>
								</div>
							)}

							{/* Form Actions */}
							<div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
								<button
									type="button"
									className="btn-secondary flex items-center gap-2"
									onClick={closeForm}
									disabled={submitting}
								>
									<X className="w-4 h-4" />
									Cancel
								</button>
								<button
									type="submit"
									className="btn-primary flex items-center gap-2"
									disabled={submitting}
								>
									{submitting ? (
										<>
											<Loader2 className="w-4 h-4 animate-spin" />
											Creating...
										</>
									) : (
										<>
											<CheckCircle2 className="w-4 h-4" />
											Create Shipping Order
										</>
									)}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
			{replyingReview && (
				<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
					<div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
						<div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
							<div>
								<p className="text-xs text-neutral-500">Responding to review #{replyingReview.id}</p>
								<h3 className="text-lg font-semibold text-neutral-900">
									{replyingReview.user?.name || "Customer"}
								</h3>
							</div>
							<button
								className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
								onClick={closeReplyModal}
							>
								<X className="w-5 h-5" />
							</button>
						</div>
						<form onSubmit={handleSubmitReply} className="p-6 space-y-4">
							<div className="space-y-1">
								<p className="text-xs font-semibold text-neutral-500">Customer comment</p>
								<div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-sm text-neutral-700">
									{replyingReview.comment}
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium text-neutral-700 mb-1.5">
									Your reply <span className="text-error-500">*</span>
								</label>
								<textarea
									className="input min-h-[120px] resize-none"
									placeholder="Type your reply..."
									value={replyMessage}
									onChange={(e) => setReplyMessage(e.target.value)}
									required
								/>
							</div>
							<div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
								<button
									type="button"
									className="btn-secondary"
									onClick={closeReplyModal}
									disabled={replySubmitting}
								>
									Cancel
								</button>
								<button type="submit" className="btn-primary flex items-center gap-2" disabled={replySubmitting}>
									{replySubmitting ? (
										<>
											<Loader2 className="w-4 h-4 animate-spin" />
											Sending...
										</>
									) : (
										<>
											<CheckCircle2 className="w-4 h-4" />
											Send Reply
										</>
									)}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</main>
	);
}

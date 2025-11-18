import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "../components/Container";

type Order = {
    id: number;
    totalAmount: number;
    orderStatus?: string;
    createdAt?: string;
    items?: Array<{
        id: number;
        quantity: number;
        variant?: { product?: { name?: string } };
    }>;
};

export default function MyOrdersPage() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [page, setPage] = useState(1);
	const [displayPage, setDisplayPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const navigate = useNavigate();
	const PAGE_SIZE = 5;

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("Please log in to view your orders.");
            setLoading(false);
            return;
        }

        fetch(`http://localhost:3000/api/v1/orders?page=${page}&limit=${PAGE_SIZE}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
			.then((data) => {
				const list = data?.items || data?.data || data;
				setOrders(Array.isArray(list) ? list : []);
				const totalFromServer = Number(data?.meta?.total ?? data?.total);
				const safeTotal =
					Number.isFinite(totalFromServer) && totalFromServer > 0
						? totalFromServer
						: Array.isArray(list) && list.length < PAGE_SIZE
							? (page - 1) * PAGE_SIZE + list.length
							: page * PAGE_SIZE;

				const serverPage = Number(data?.meta?.currentPage ?? data?.meta?.page);
				setDisplayPage(Number.isFinite(serverPage) && serverPage > 0 ? serverPage : page);

				const serverTotalPages = Number(data?.meta?.totalPages);
				setTotalPages(
					Number.isFinite(serverTotalPages) && serverTotalPages > 0
						? serverTotalPages
						: Math.max(1, Math.ceil(safeTotal / PAGE_SIZE)),
				);
			})
            .catch(() => setError("Unable to load orders."))
            .finally(() => setLoading(false));
    }, [page]);

    if (loading) {
        return <div className="py-20 text-center">Loading your orders...</div>;
    }

    if (error) {
        return (
            <main className="py-12">
                <Container>
                    <h1 className="heading-3 mb-4">My orders</h1>
                    <p className="text-neutral-600">{error}</p>
                </Container>
            </main>
        );
    }

	return (
		<main className="py-12">
			<Container>
                <h1 className="heading-3 mb-6">My orders</h1>
                {orders.length === 0 ? (
                    <p className="text-neutral-600">You have not placed any orders yet.</p>
                ) : (
                    <>
                        <div className="space-y-4">
                            {orders.map((order) => {
                                const canTrack = order.orderStatus?.toLowerCase() !== "cancelled";
                                return (
                                    <div key={order.id} className="card space-y-3">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div>
                                                <p className="font-semibold">Order #{order.id}</p>
                                                <p className="text-sm text-neutral-500">
                                                    {order.orderStatus || "Pending"} {" "}
                                                    {order.createdAt
                                                        ? new Date(order.createdAt).toLocaleDateString()
                                                        : ""}
                                                </p>
                                            </div>
                                            <p className="font-semibold">{Number(order.totalAmount).toLocaleString()}</p>
                                        </div>
                                        <ul className="text-sm text-neutral-600 space-y-1">
                                            {order.items?.map((item) => (
                                                <li key={item.id}>
                                                    {item.variant?.product?.name} x {item.quantity}
                                                </li>
                                            ))}
                                        </ul>
                                        <button
                                            className={`btn-secondary mt-2 ${!canTrack ? "opacity-60 cursor-not-allowed" : ""}`}
                                            disabled={!canTrack}
                                            onClick={() => canTrack && navigate(`/orders/${order.id}`)}
                                        >
                                            Theo dõi đơn hàng
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

						<div className="mt-6 flex items-center justify-between text-sm text-neutral-600">
							<span>
								Page {displayPage} / {totalPages}
							</span>
							<div className="flex gap-2">
								<button
									className="btn-secondary"
									disabled={page === 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                >
                                    Truớc
                                </button>
								<button
									className="btn-secondary"
									disabled={page >= totalPages}
									onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
								>
									Sau
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </Container>
        </main>
    );
}

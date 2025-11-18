import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Container from "../components/Container";

export default function OrderSuccess() {
    const [params] = useSearchParams();

    const txnRef = params.get("vnp_TxnRef");
    const orderId = txnRef ? txnRef.split("_")[0] : null;

    const statusCode = params.get("vnp_ResponseCode");
    const isSuccess = statusCode === "00";

    const [order, setOrder] = useState<any>(null);

    useEffect(() => {
        if (!isSuccess) return;

        const token = localStorage.getItem("token");
        if (!orderId || !token) return;

        fetch(`http://localhost:3000/api/v1/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setOrder(data))
            .catch(err => console.error(err));
    }, [orderId, isSuccess]);

    if (!isSuccess) {
        return (
            <main className="py-12">
                <Container>
                    <h1 className="heading-3 mb-4 text-red-600">Payment Failed</h1>
                    <p className="mb-4">An error occurred during payment processing.</p>
                    <a href="/cart" className="btn-primary">Try Again</a>
                </Container>
            </main>
        );
    }

    if (!order) return <div className="py-20 text-center">Loading...</div>;

    return (
        <main className="py-12">
            <Container>
                <h1 className="heading-3 mb-6 text-green-600">Payment Successful 🎉</h1>
                <p>Order ID: <strong>#{order.id}</strong></p>
                <p>Total Amount: <strong>{Number(order.totalAmount).toLocaleString()}₫</strong></p>
                <p>Status: <strong>{order.orderStatus}</strong></p>

                <div className="mt-6">
                    <h2 className="heading-4 mb-2">Products</h2>
                    <ul className="space-y-3">
                        {order.items.map((item: any) => (
                            <li key={item.id} className="border p-3 rounded-md">
                                {item.variant.product.name} x {item.quantity}
                            </li>
                        ))}
                    </ul>
                </div>

                <a href="/shop" className="btn-primary mt-8 inline-block">
                    Continue Shopping
                </a>
            </Container>
        </main>
    );
}

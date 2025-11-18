import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Container from "../components/Container";

export default function OrderSuccess() {
    const [params] = useSearchParams();

    const orderId = params.get("orderId");
    const status = params.get("status");
    const isSuccess = status === "success";

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
                    <h1 className="heading-3 mb-4 text-red-600">Thanh toán thất bại </h1>
                    <p className="mb-4">Có lỗi xảy ra trong quá trình thanh toán.</p>
                    <a href="/cart" className="btn-primary">Thử lại</a>
                </Container>
            </main>
        );
    }

    if (!order) return <div className="py-20 text-center">Loading...</div>;

    return (
        <main className="py-12">
            <Container>
                <h1 className="heading-3 mb-6 text-green-600">Thanh toán thành công 🎉</h1>
                <p>Mã đơn hàng: <strong>#{order.id}</strong></p>
                <p>Tổng tiền: <strong>{Number(order.totalAmount).toLocaleString()}₫</strong></p>
                {/*<p>Trạng thái: <strong>{order.orderStatus}</strong></p>*/}

                <div className="mt-6">
                    <h2 className="heading-4 mb-2">Sản phẩm</h2>
                    <ul className="space-y-3">
                        {order.items.map((item: any) => (
                            <li key={item.id} className="border p-3 rounded-md">
                                {item.variant.product.name} x {item.quantity}
                            </li>
                        ))}
                    </ul>
                </div>

                <a href="/shop" className="btn-primary mt-8 inline-block">
                    Tiếp tục mua sắm
                </a>
            </Container>
        </main>
    );
}

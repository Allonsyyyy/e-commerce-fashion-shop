import { useEffect, useState } from "react";
import { subscribeToast, type ToastPayload } from "../utils/toast";

type ToastItem = ToastPayload & { timeoutId: number };

const typeStyles: Record<string, string> = {
	success: "bg-emerald-600",
	error: "bg-red-600",
	info: "bg-neutral-900",
};

export default function ToastHost() {
	const [toasts, setToasts] = useState<ToastItem[]>([]);

	useEffect(() => {
		const unsubscribe = subscribeToast((toast) => {
			const timeoutId = window.setTimeout(() => {
				setToasts((prev) => prev.filter((item) => item.id !== toast.id));
			}, 3500);
			setToasts((prev) => [...prev, { ...toast, timeoutId }]);
		});

		return () => {
			unsubscribe();
			setToasts((prev) => {
				prev.forEach((item) => window.clearTimeout(item.timeoutId));
				return [];
			});
		};
	}, []);

	return (
		<div className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-[min(92vw,420px)]">
			{toasts.map((toastItem) => (
				<div
					key={toastItem.id}
					className={`px-4 py-3 rounded-lg shadow-lg text-white text-sm text-center ${typeStyles[toastItem.type]}`}
				>
					{toastItem.message}
				</div>
			))}
		</div>
	);
}

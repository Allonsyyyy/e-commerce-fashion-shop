import { ReactNode, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Tag,
    FolderTree,
    Users,
    Warehouse,
    Truck,
    TrendingUp,
    DollarSign,
    LogOut,
} from "lucide-react";
import { getProfile } from "../../api/authApi";

export default function AdminLayout({ children }: { children: ReactNode }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [userRole, setUserRole] = useState<string>("");

    useEffect(() => {
        const loadUserRole = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const profile = await getProfile(token);
                setUserRole(profile.role);
            } catch (err) {
                console.error("Failed to load user profile:", err);
                navigate("/login");
            }
        };

        loadUserRole();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    // Menu items for Staff
    const staffMenuItems = [
        { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
        { path: "/admin/categories", icon: FolderTree, label: "Quản lý danh mục" },
        { path: "/admin/products", icon: Package, label: "Quản lý sản phẩm" },
        { path: "/admin/users", icon: Users, label: "Quản lý user" },
        { path: "/admin/inventory", icon: Warehouse, label: "Quản lý kho" },
        { path: "/admin/discounts", icon: Tag, label: "Mã giảm giá" },
        { path: "/admin/shipping", icon: Truck, label: "Quản lý giao hàng" },
        { path: "/admin/best-selling", icon: TrendingUp, label: "Sản phẩm bán chạy" },
    ];

    // Menu items for Admin (includes all staff items + revenue)
    const adminMenuItems = [
        ...staffMenuItems,
        { path: "/admin/revenue", icon: DollarSign, label: "Thống kê doanh thu" },
    ];

    const menuItems = userRole === "admin" ? adminMenuItems : staffMenuItems;

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 bg-neutral-900 text-white min-h-screen">
                <div className="p-6">
                    <h1 className="text-2xl font-bold">
                        {userRole === "admin" ? "Admin Panel" : "Staff Panel"}
                    </h1>
                    <p className="text-sm text-neutral-400 mt-1">
                        {userRole === "admin" ? "Quản trị viên" : "Nhân viên"}
                    </p>
                </div>
                <nav className="px-4">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                                    isActive ? "bg-blue-600" : "hover:bg-neutral-800"
                                }`}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="px-4 mt-8">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-neutral-800 w-full text-left"
                    >
                        <LogOut size={20} />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-neutral-50">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}


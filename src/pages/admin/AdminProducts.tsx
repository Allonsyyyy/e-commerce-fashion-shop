import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { getProducts } from "../../api/productsApi";
import { createProduct, updateProduct, deleteProduct } from "../../api/admin/productsApi";
import { getCategories } from "../../api/categoriesApi";
import type { Product } from "../../types/product";
import type { Category } from "../../types/category";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        discount: "",
        stock: "",
        categoryId: "",
        mainImageUrl: "",
    });
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const [productsRes, categoriesRes] = await Promise.all([
                getProducts({ page: 1, limit: 100 }),
                getCategories({ page: 1, limit: 100 }),
            ]);
            setProducts(productsRes.data);
            setCategories(categoriesRes.data);
        } catch (err) {
            console.error("Failed to load data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const payload = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                discount: parseFloat(formData.discount),
                stock: parseInt(formData.stock),
                categoryId: parseInt(formData.categoryId),
                mainImageUrl: formData.mainImageUrl,
            };

            if (editingProduct) {
                await updateProduct(token, { id: editingProduct.id, ...payload });
            } else {
                await createProduct(token, payload);
            }

            setShowModal(false);
            resetForm();
            loadData();
            alert("Success!");
        } catch (err: any) {
            alert(err.message || "An error occurred!");
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            discount: product.discount,
            stock: product.stock.toString(),
            categoryId: product.categoryId.toString(),
            mainImageUrl: product.mainImageUrl || "",
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            await deleteProduct(token, id);
            loadData();
            alert("Deleted successfully!");
        } catch (err: any) {
            alert(err.message || "An error occurred!");
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            price: "",
            discount: "",
            stock: "",
            categoryId: "",
            mainImageUrl: "",
        });
        setEditingProduct(null);
    };

    return (
        <AdminLayout>
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Products Management</h1>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        <Plus size={20} />
                        Add Product
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-neutral-100">
                                <tr>
                                    <th className="px-6 py-3 text-left">ID</th>
                                    <th className="px-6 py-3 text-left">Tên</th>
                                    <th className="px-6 py-3 text-left">Giá</th>
                                    <th className="px-6 py-3 text-left">Giảm giá</th>
                                    <th className="px-6 py-3 text-left">Tồn kho</th>
                                    <th className="px-6 py-3 text-left">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id} className="border-t">
                                        <td className="px-6 py-4">{product.id}</td>
                                        <td className="px-6 py-4">{product.name}</td>
                                        <td className="px-6 py-4">{parseFloat(product.price).toLocaleString()}đ</td>
                                        <td className="px-6 py-4">{product.discount}%</td>
                                        <td className="px-6 py-4">{product.stock}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h2 className="text-2xl font-bold mb-4">
                                {editingProduct ? "Edit Product" : "Add Product"}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Product Name"
                                    className="w-full border px-3 py-2 rounded"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                                <textarea
                                    placeholder="Description"
                                    className="w-full border px-3 py-2 rounded"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Price"
                                    className="w-full border px-3 py-2 rounded"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Discount (%)"
                                    className="w-full border px-3 py-2 rounded"
                                    value={formData.discount}
                                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Stock"
                                    className="w-full border px-3 py-2 rounded"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    required
                                />
                                <select
                                    className="w-full border px-3 py-2 rounded"
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="url"
                                    placeholder="URL hình ảnh chính"
                                    className="w-full border px-3 py-2 rounded"
                                    value={formData.mainImageUrl}
                                    onChange={(e) => setFormData({ ...formData, mainImageUrl: e.target.value })}
                                    required
                                />
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                                    >
                                        {editingProduct ? "Cập nhật" : "Tạo mới"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            resetForm();
                                        }}
                                        className="flex-1 bg-neutral-200 text-neutral-800 py-2 rounded hover:bg-neutral-300"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}


import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Container from "../components/Container";
import ProductCard from "../components/ProductCard";
import type { Product } from "../types/product";
import type {Category} from "../types/category.ts";

export default function CategoryPage() {
    const { id } = useParams<{ id: string }>();
    const [category, setCategory] = useState<Category | null>(null);
    const [rootCategories, setRootCategories] = useState<Category[]>([]);
    const [tabCategories, setTabCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!id) return;
        setLoading(true);

        (async () => {
            try {
                const res = await fetch(`http://localhost:3000/api/v1/categories/${id}`);
                const data: Category = await res.json();
                setCategory(data);

                const rootRes = await fetch("http://localhost:3000/api/v1/categories?page=1&limit=50&sort=id");
                const rootList = await rootRes.json();
                setRootCategories(rootList.data.filter((c: Category) => !c.parent));

                if (data.parent) {
                    // Fetch parent to get all siblings
                    const parentRes = await fetch(`http://localhost:3000/api/v1/categories/${data.parent.id}`);
                    const parentData: Category = await parentRes.json();
                    setTabCategories(parentData.children || []);
                } else {
                    // Parent level → show its children
                    setTabCategories(data.children || []);
                }

                // Merge products if category has children
                if (data.children?.length) {
                    let merged = [...data.products];
                    for (const child of data.children) {
                        const childRes = await fetch(`http://localhost:3000/api/v1/categories/${child.id}`);
                        const childData = await childRes.json();
                        merged = [...merged, ...childData.products];
                    }
                    setProducts(merged);
                } else {
                    setProducts(data.products);
                }

                setLoading(false);
            } catch {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) return <div className="py-20 text-center text-neutral-500">Loading category...</div>;
    if (!category) return <div className="py-20 text-center text-red-500">Category not found.</div>;

    return (
        <main className="py-12">
            <Container>

                {/* ROOT NAV - Main Categories with refined styling */}
                <div className="mb-8">
                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                        {rootCategories.map((root) => {
                            const isActive = root.id == (category.parent?.id ?? category.id);
                            return (
                                <Link
                                    key={root.id}
                                    to={`/category/${root.id}`}
                                    className={`px-6 py-3 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-300 shadow-sm
                                        ${isActive
                                        ? "bg-neutral-900 text-white shadow-md scale-105"
                                        : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 hover:shadow-md hover:-translate-y-0.5"
                                    }`}
                                >
                                    {root.name}
                                </Link>
                            );
                        })}
                    </div>
                    {/* Elegant divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent mt-4"></div>
                </div>

                {/* SUB-CATEGORIES - Secondary level with subtle styling */}
                {tabCategories.length > 0 && (
                    <div className="mb-10">
                        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                            {tabCategories.map((cat) => {
                                const isActive = cat.id == category.id;
                                return (
                                    <Link
                                        key={cat.id}
                                        to={`/category/${cat.id}`}
                                        className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300
                                            ${isActive
                                            ? "bg-neutral-100 text-neutral-900 border-2 border-neutral-300 shadow-sm"
                                            : "bg-transparent text-neutral-600 border border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900 hover:border-neutral-300"
                                        }`}
                                    >
                                        {cat.name}
                                    </Link>
                                );
                            })}
                        </div>
                        {/* Subtle divider */}
                        <div className="h-px bg-gradient-to-r from-transparent via-neutral-100 to-transparent mt-4"></div>
                    </div>
                )}

                {/* TITLE */}
                <div className="mb-8">
                    <h1 className="heading-3 mb-2">{category.name}</h1>
                    {category.description && (
                        <p className="body-text text-neutral-600">{category.description}</p>
                    )}
                </div>

                {/* PRODUCT GRID */}
                {products.length === 0 ? (
                    <div className="py-20 text-center text-neutral-500">
                        No products found in this category.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((p) => (
                            <ProductCard
                                key={p.id}
                                title={p.name}
                                price={p.price}
                                discount={p.discount}
                                image={p.mainImageUrl}
                                to={`/product/${p.id}`}
                            />
                        ))}
                    </div>
                )}

            </Container>
        </main>
    );
}

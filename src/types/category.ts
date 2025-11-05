import type {Product} from "./product.ts";

export type CategoryCardProps = {
    label: string;
    to: string;
};

export type Category = {
    id: number;
    name: string;
    description: string;
    parent?: Category | null;
    children?: Category[];
    products: Product[];
};
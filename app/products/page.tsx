import type { Metadata } from "next";
import { Product } from "./Product";

export const metadata: Metadata = {
  title: "ARGO — Product",
  description:
    "Meet ARGO: an autonomous, silent, intelligent robot designed for goods movement in hotels, restaurants, cafes, retail, and live events.",
};

export default function ProductsPage() {
  return <Product />;
}

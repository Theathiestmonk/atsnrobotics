import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Products",
  description: "Explore autonomous robots for hospitality, retail, stadiums, and more.",
};

export default function ProductsPage() {
  return (
    <main className="productsPage">
      <div className="productsPage__inner">
        <p className="productsPage__eyebrow">Products</p>
        <h1 className="productsPage__title">Our fleet</h1>
        <p className="productsPage__lead">
          Explore autonomous robots built for hospitality, retail, stadiums, and
          more. Full details are coming soon.
        </p>
        <Link className="productsPage__back" href="/">
          ← Back to home
        </Link>
      </div>
    </main>
  );
}

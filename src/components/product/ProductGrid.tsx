"use client";

import React from "react";
import { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { ProductGridSkeleton } from "@/components/ui/LoadingSkeletons";
import { EmptyState } from "@/components/ui/EmptyState";
import { Search } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  onQuickView?: (product: Product) => void;
  className?: string;
  columns?: 2 | 3 | 4;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
  emptyTitle = "No gifts found",
  emptyMessage = "Try adjusting your search criteria, category filters, or price range.",
  onQuickView,
  className = "",
  columns = 3,
}) => {
  if (loading) {
    return <ProductGridSkeleton count={8} columns={columns} />;
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title={emptyTitle}
        description={emptyMessage}
        actionText="Browse All Gifts"
        actionHref="/shop"
      />
    );
  }

  // Generous, large product containers for high-end boutique display:
  // - columns = 3 (Catalog with sidebar): 2 cols on mobile/tablet, 3 cols on desktop (lg/xl), 4 cols on extra-wide (2xl)
  // - columns = 4 (Full-width sections): 2 cols on mobile, 3 cols on tablet, 4 cols on desktop
  const gridColsClass =
    columns === 3
      ? "grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4"
      : columns === 2
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2"
      : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4";

  return (
    <div
      className={`grid ${gridColsClass} gap-3.5 sm:gap-6 lg:gap-7 ${className}`}
    >
      {products.map((product, idx) => (
        <ProductCard
          key={product.id}
          product={product}
          onQuickView={onQuickView}
          priority={idx < 4}
        />
      ))}
    </div>
  );
};

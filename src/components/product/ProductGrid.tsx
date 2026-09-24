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
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
  emptyTitle = "No gifts found",
  emptyMessage = "Try adjusting your search criteria, category filters, or price range.",
  onQuickView,
  className = "",
}) => {
  if (loading) {
    return <ProductGridSkeleton count={8} />;
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

  return (
    <div
      className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 ${className}`}
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

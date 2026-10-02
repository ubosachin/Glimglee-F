"use client";

import React, { useMemo } from "react";
import { formatDescriptionHtml, stripHtml } from "@/lib/utils/text";

interface ProductDescriptionProps {
  content?: string;
  className?: string;
  clampLines?: number;
  emptyFallback?: string;
}

export function ProductDescription({
  content = "",
  className = "",
  clampLines,
  emptyFallback = "No description available.",
}: ProductDescriptionProps) {
  const formattedHtml = useMemo(() => {
    return formatDescriptionHtml(content || "");
  }, [content]);

  if (!content || !content.trim()) {
    return (
      <p className={`text-stone-400 italic text-xs ${className}`}>
        {emptyFallback}
      </p>
    );
  }

  // Clamped preview mode (e.g. quick view modal or card snippets)
  if (clampLines && clampLines > 0) {
    const plain = stripHtml(content);
    return (
      <p
        className={`text-xs text-stone-600 leading-relaxed ${className}`}
        style={{
          display: "-webkit-box",
          WebkitLineClamp: clampLines,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {plain}
      </p>
    );
  }

  return (
    <div
      className={`prose-glimglee ${className}`}
      dangerouslySetInnerHTML={{ __html: formattedHtml }}
    />
  );
}

export default ProductDescription;

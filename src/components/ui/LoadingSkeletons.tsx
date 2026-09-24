import React from "react";

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200/80 overflow-hidden shadow-2xs animate-pulse flex flex-col justify-between h-full">
      <div className="w-full aspect-[4/5] bg-stone-200/70" />
      <div className="p-3 sm:p-4 space-y-2.5 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <div className="h-2.5 w-16 bg-stone-200 rounded-full" />
          <div className="h-3.5 sm:h-4 w-4/5 bg-stone-200 rounded-md" />
          <div className="h-3 sm:h-3.5 w-3/5 bg-stone-200 rounded-md" />
        </div>
        <div className="pt-2 flex items-center justify-between border-t border-stone-100">
          <div className="h-4 w-20 bg-stone-200 rounded-md" />
          <div className="h-8 w-8 sm:w-20 bg-stone-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const CategorySkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="flex sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 scrollbar-none">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-28 sm:w-auto text-center space-y-2 animate-pulse flex flex-col items-center">
          <div className="w-28 h-28 sm:w-full sm:aspect-square mx-auto rounded-2xl sm:rounded-3xl bg-stone-200/80" />
          <div className="h-3 w-16 mx-auto bg-stone-200 rounded-full" />
          <div className="h-2.5 w-10 mx-auto bg-stone-100 rounded-full" />
        </div>
      ))}
    </div>
  );
};

export const ProductPageSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Gallery skeleton */}
        <div className="lg:col-span-5 space-y-4">
          <div className="w-full max-w-[340px] sm:max-w-[400px] lg:max-w-none mx-auto aspect-square rounded-2xl sm:rounded-3xl bg-stone-200" />
          <div className="flex gap-2 sm:gap-2.5 justify-center lg:justify-start">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-stone-200" />
            ))}
          </div>
        </div>

        {/* Details skeleton */}
        <div className="lg:col-span-7 space-y-6">
          <div className="h-4 w-24 bg-stone-200 rounded-full" />
          <div className="h-8 w-4/5 bg-stone-200 rounded-lg" />
          <div className="h-6 w-32 bg-stone-200 rounded-lg" />
          <div className="h-20 w-full bg-stone-200 rounded-2xl" />
          <div className="h-48 w-full bg-stone-200 rounded-2xl" />
          <div className="h-12 w-full bg-stone-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full bg-white rounded-3xl border border-stone-200 overflow-hidden animate-pulse">
      <div className="h-12 bg-stone-100 border-b border-stone-200" />
      <div className="divide-y divide-stone-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="h-4 w-1/4 bg-stone-200 rounded-md" />
            <div className="h-4 w-1/6 bg-stone-200 rounded-md" />
            <div className="h-4 w-1/6 bg-stone-200 rounded-md" />
            <div className="h-8 w-16 bg-stone-200 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
};

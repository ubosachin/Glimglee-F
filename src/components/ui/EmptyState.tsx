import React from "react";
import Link from "next/link";
import { LucideIcon, Gift } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Gift,
  title,
  description,
  actionText,
  actionHref,
  onAction,
  className = "",
}) => {
  return (
    <div
      className={`w-full bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-14 text-center space-y-4 shadow-sm ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
        <Icon className="w-8 h-8" />
      </div>

      <div className="max-w-md mx-auto space-y-1.5">
        <h3 className="text-base sm:text-lg font-bold text-stone-900">{title}</h3>
        <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">{description}</p>
      </div>

      {(actionText && (actionHref || onAction)) && (
        <div className="pt-2">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors shadow-sm"
            >
              {actionText}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors shadow-sm"
            >
              {actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

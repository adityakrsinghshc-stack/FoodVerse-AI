import React from 'react';

export function SkeletonLine({ className = 'h-4 w-full' }) {
  return <div className={`animate-pulse bg-slate-200/80 rounded-md ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl animate-pulse bg-slate-200" />
        <div className="space-y-2 flex-1">
          <SkeletonLine className="h-4 w-1/3" />
          <SkeletonLine className="h-3 w-1/2" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <SkeletonLine className="h-3 w-full" />
        <SkeletonLine className="h-3 w-5/6" />
        <SkeletonLine className="h-3 w-4/6" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center space-x-4 p-4 border-b border-slate-100 animate-pulse">
      <div className="w-10 h-10 rounded-lg bg-slate-200" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-1/4" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
      </div>
      <div className="w-20 h-6 bg-slate-200 rounded-full" />
    </div>
  );
}

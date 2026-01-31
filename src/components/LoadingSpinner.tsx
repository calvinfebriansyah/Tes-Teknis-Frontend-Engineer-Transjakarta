export function LoadingSpinner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`inline-block h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-amber-500 ${className}`}
      role="status"
      aria-label="Memuat"
    >
      <span className="sr-only">Memuat…</span>
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-5 rounded-xl border border-slate-200 bg-white py-16 shadow-sm">
      <LoadingSpinner className="h-12 w-12 border-t-amber-500" />
      <div className="text-center">
        <p className="text-sm font-medium text-slate-700">Memuat data kendaraan</p>
        <p className="mt-1 text-xs text-slate-500">Mohon tunggu sebentar…</p>
      </div>
    </div>
  );
}

interface PaginationProps {
  total: number;
  pageSize: number;
  pageIndex: number;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export function Pagination({
  total,
  pageSize,
  pageIndex,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, total);

  const navBtn =
    'inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:border-slate-300 disabled:pointer-events-none disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2';

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
      role="navigation"
      aria-label="Pagination"
    >
      <p className="text-sm text-slate-600">
        Menampilkan <strong className="font-semibold text-slate-800">{start}</strong>–
        <strong className="font-semibold text-slate-800">{end}</strong> dari{' '}
        <strong className="font-semibold text-slate-800">{total}</strong> data
      </p>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <span>Per halaman</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            aria-label="Jumlah data per halaman"
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <span className="text-sm text-slate-600">
          Halaman <strong>{pageIndex + 1}</strong> dari <strong>{totalPages}</strong>
        </span>

        <div className="flex gap-1.5" role="group" aria-label="Navigasi halaman">
          <button
            type="button"
            onClick={() => onPageChange(0)}
            disabled={pageIndex === 0}
            className={navBtn}
            aria-label="Halaman pertama"
          >
            ««
          </button>
          <button
            type="button"
            onClick={() => onPageChange(pageIndex - 1)}
            disabled={pageIndex === 0}
            className={navBtn}
            aria-label="Halaman sebelumnya"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => onPageChange(pageIndex + 1)}
            disabled={pageIndex >= totalPages - 1}
            className={navBtn}
            aria-label="Halaman berikutnya"
          >
            ›
          </button>
          <button
            type="button"
            onClick={() => onPageChange(totalPages - 1)}
            disabled={pageIndex >= totalPages - 1}
            className={navBtn}
            aria-label="Halaman terakhir"
          >
            »»
          </button>
        </div>
      </div>
    </div>
  );
}

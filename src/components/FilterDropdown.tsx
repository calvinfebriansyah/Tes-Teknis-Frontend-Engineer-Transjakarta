import { useRef, useEffect, useState, useMemo } from 'react';

export interface FilterOption {
  id: string;
  label: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  error: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emptyStateMessage?: string;
  /** Jika true, tampilkan input search dan filter opsi by label. */
  searchable?: boolean;
}

const LOAD_MORE_THRESHOLD = 80;

export function FilterDropdown({
  label,
  options,
  selectedIds,
  onToggle,
  loading,
  hasMore,
  onLoadMore,
  error,
  open,
  onOpenChange,
  emptyStateMessage,
  searchable = false,
}: FilterDropdownProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!open) setSearchQuery('');
  }, [open]);

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return options;
    const q = searchQuery.trim().toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, searchable, searchQuery]);

  useEffect(() => {
    if (!open || !scrollRef.current || !hasMore || loading) return;
    const el = scrollRef.current;
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (scrollHeight - scrollTop - clientHeight < LOAD_MORE_THRESHOLD) {
        onLoadMore();
      }
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [open, hasMore, loading, onLoadMore]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onOpenChange(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [onOpenChange]);

  const selectedSet = new Set(selectedIds);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="flex min-w-[200px] items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-left text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Filter ${label}`}
      >
        <span className="truncate">
          {label}: {selectedIds.length ? `${selectedIds.length} dipilih` : 'Semua'}
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-20 mt-2 w-80 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
          role="listbox"
        >
          <div className="border-b border-slate-100 bg-slate-50 px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-500">
            Pilih {label}
          </div>
          {searchable && (
            <div className="border-b border-slate-100 p-2">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Cari ${label.toLowerCase()}…`}
                  className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  aria-label={`Cari ${label}`}
                  autoComplete="off"
                />
              </div>
            </div>
          )}
          <div ref={scrollRef} className="max-h-60 overflow-y-auto p-1">
            {emptyStateMessage && options.length === 0 && !loading && (
              <div className="px-3 py-4 text-center text-sm text-slate-500">
                {emptyStateMessage}
              </div>
            )}
            {searchable && searchQuery.trim() && filteredOptions.length === 0 && !loading && (
              <div className="px-3 py-4 text-center text-sm text-slate-500">
                Tidak ada hasil untuk &quot;{searchQuery.trim()}&quot;. Coba kata kunci lain atau muat lebih banyak.
              </div>
            )}
            {filteredOptions.map((opt) => (
              <label
                key={opt.id}
                className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 hover:bg-slate-50"
                role="option"
                aria-selected={selectedSet.has(opt.id)}
              >
                <input
                  type="checkbox"
                  checked={selectedSet.has(opt.id)}
                  onChange={() => onToggle(opt.id)}
                  className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="truncate text-sm text-slate-700">{opt.label}</span>
              </label>
            ))}
            {loading && (
              <div className="flex items-center justify-center gap-2 py-3 text-sm text-slate-500">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-r-transparent" />
                Memuat…
              </div>
            )}
            {error && (
              <div className="px-3 py-2 text-sm text-red-600">{error}</div>
            )}
            {!loading && hasMore && options.length > 0 && (
              <button
                type="button"
                onClick={onLoadMore}
                className="w-full py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              >
                Muat lebih banyak
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

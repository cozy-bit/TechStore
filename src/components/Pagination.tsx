type Props = {
  page: number
  totalPages: number
  onChange: (p: number) => void
}

export function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null

  const pages: number[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - 1 && i <= page + 1)
    ) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== -1) {
      pages.push(-1)
    }
  }

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
      aria-label="Страницы"
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="rounded-full border border-surface-muted px-4 py-2 text-sm font-medium text-ink transition enabled:hover:border-accent enabled:hover:text-accent disabled:opacity-40"
      >
        Назад
      </button>
      {pages.map((p, idx) =>
        p === -1 ? (
          <span key={`e-${idx}`} className="px-2 text-ink-muted">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`min-w-[2.5rem] rounded-full px-3 py-2 text-sm font-medium transition ${
              p === page
                ? 'bg-ink text-white dark:bg-accent dark:text-slate-950'
                : 'border border-surface-muted text-ink hover:border-accent hover:text-accent'
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="rounded-full border border-surface-muted px-4 py-2 text-sm font-medium text-ink transition enabled:hover:border-accent enabled:hover:text-accent disabled:opacity-40"
      >
        Вперёд
      </button>
    </nav>
  )
}

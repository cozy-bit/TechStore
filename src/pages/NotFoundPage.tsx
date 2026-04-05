import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-24 text-center md:px-6">
      <p className="text-6xl font-bold text-ink-muted">404</p>
      <h1 className="mt-4 text-xl font-semibold text-ink">Страница не найдена</h1>
      <Link
        to="/"
        className="mt-8 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white dark:bg-accent dark:text-slate-950"
      >
        На главную
      </Link>
    </div>
  )
}

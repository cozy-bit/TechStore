import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Banner } from '@/components/Banner'
import { ProductCard } from '@/components/ProductCard'
import { fetchCategories } from '@/api/client'
import { mockProducts } from '@/data/mockData'
import type { Category } from '@/types'

export function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ok = true
    fetchCategories().then((c) => {
      if (ok) setCategories(c)
      if (ok) setLoading(false)
    })
    return () => {
      ok = false
    }
  }, [])

  const popular = useMemo(() => {
    return [...mockProducts]
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 6)
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <Banner />

      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          Категории
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Выберите раздел — фильтры подставятся в каталоге.
        </p>
        {loading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl bg-surface-muted"
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/catalog?category=${encodeURIComponent(c.id)}`}
                className="group rounded-2xl border border-surface-muted bg-surface p-6 transition hover:border-accent/40 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-ink group-hover:text-accent">
                  {c.name}
                </h3>
                {c.description && (
                  <p className="mt-2 text-sm text-ink-muted">{c.description}</p>
                )}
                <span className="mt-4 inline-flex text-sm font-medium text-accent">
                  Смотреть →
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              Популярное
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Самые востребованные позиции по версии мок-данных.
            </p>
          </div>
          <Link
            to="/catalog"
            className="text-sm font-medium text-accent hover:underline"
          >
            Весь каталог
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

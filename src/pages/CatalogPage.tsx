import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { ProductCard } from '@/components/ProductCard'
import { ProductGridSkeleton } from '@/components/ProductGridSkeleton'
import { Pagination } from '@/components/Pagination'
import {
  fetchCategories,
  fetchProducts,
  type PaginatedProducts,
} from '@/api/client'
import type { Category, SortOption } from '@/types'

const PAGE_SIZE = 6

function parseSort(v: string | null): SortOption {
  if (v === 'price-asc' || v === 'price-desc' || v === 'name' || v === 'popular')
    return v
  return 'popular'
}

export function CatalogPage() {
  const [params, setParams] = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [data, setData] = useState<PaginatedProducts | null>(null)
  const [loading, setLoading] = useState(true)

  const categoryId = params.get('category') || null
  const brand = params.get('brand') || null
  const minPrice = params.get('min') ? Number(params.get('min')) : null
  const maxPrice = params.get('max') ? Number(params.get('max')) : null
  const search = params.get('search') || ''
  const sort = parseSort(params.get('sort'))
  const page = Math.max(1, Number(params.get('page') || '1') || 1)

  const [searchDraft, setSearchDraft] = useState(search)
  useEffect(() => {
    setSearchDraft(search)
  }, [search])
  const debouncedSearch = useDebouncedValue(searchDraft, 400)

  const setFilter = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(params)
      Object.entries(patch).forEach(([k, val]) => {
        if (val === null || val === '') next.delete(k)
        else next.set(k, val)
      })
      if (!('page' in patch)) next.delete('page')
      setParams(next, { replace: true })
    },
    [params, setParams]
  )

  useEffect(() => {
    let ok = true
    fetchCategories().then((c) => {
      if (ok) setCategories(c)
    })
    return () => {
      ok = false
    }
  }, [])

  useEffect(() => {
    let ok = true
    setLoading(true)
    fetchProducts({
      categoryId,
      brand,
      minPrice: Number.isFinite(minPrice as number) ? minPrice : null,
      maxPrice: Number.isFinite(maxPrice as number) ? maxPrice : null,
      search,
      sort,
      page,
      pageSize: PAGE_SIZE,
    }).then((res) => {
      if (ok) {
        setData(res)
        setLoading(false)
      }
    })
    return () => {
      ok = false
    }
  }, [categoryId, brand, minPrice, maxPrice, search, sort, page])

  useEffect(() => {
    if (debouncedSearch === search) return
    setFilter({ search: debouncedSearch.trim() || null })
  }, [debouncedSearch, search, setFilter])

  const brands = useMemo(() => {
    const s = new Set<string>()
    // from mock we could expose brands via API later; quick client list:
    ;[
      'Apple',
      'Lenovo',
      'ASUS',
      'Samsung',
      'Google',
      'Xiaomi',
      'HP',
    ].forEach((b) => s.add(b))
    return [...s].sort()
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">
        Каталог
      </h1>
      <p className="mt-1 text-sm text-ink-muted">
        Фильтры, сортировка и пагинация — на мок-API с задержкой.
      </p>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-64 lg:shrink-0">
          <div className="space-y-6 rounded-2xl border border-surface-muted bg-surface p-5 shadow-sm">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Категория
              </label>
              <select
                className="mt-2 w-full rounded-xl border border-surface-muted bg-surface-muted/40 px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-accent/30"
                value={categoryId ?? ''}
                onChange={(e) =>
                  setFilter({
                    category: e.target.value || null,
                  })
                }
              >
                <option value="">Все</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Бренд
              </label>
              <select
                className="mt-2 w-full rounded-xl border border-surface-muted bg-surface-muted/40 px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-accent/30"
                value={brand ?? ''}
                onChange={(e) =>
                  setFilter({ brand: e.target.value || null })
                }
              >
                <option value="">Все</option>
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Цена от
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="mt-2 w-full rounded-xl border border-surface-muted bg-surface-muted/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30"
                  defaultValue={params.get('min') ?? ''}
                  onBlur={(e) =>
                    setFilter({
                      min: e.target.value || null,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  До
                </label>
                <input
                  type="number"
                  placeholder="∞"
                  className="mt-2 w-full rounded-xl border border-surface-muted bg-surface-muted/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30"
                  defaultValue={params.get('max') ?? ''}
                  onBlur={(e) =>
                    setFilter({
                      max: e.target.value || null,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-6">
            <label className="sr-only" htmlFor="catalog-search">
              Поиск по названию
            </label>
            <input
              id="catalog-search"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Поиск по названию товара..."
              className="w-full rounded-2xl border border-surface-muted bg-surface-muted/40 px-4 py-3 text-sm outline-none ring-accent/20 transition focus:ring-2"
            />
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-ink-muted">
              {loading
                ? 'Загрузка...'
                : data
                  ? `Найдено: ${data.total}`
                  : null}
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm text-ink-muted">
                Сортировка
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) =>
                  setFilter({ sort: e.target.value || 'popular' })
                }
                className="rounded-xl border border-surface-muted bg-surface-muted/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30"
              >
                <option value="popular">По популярности</option>
                <option value="price-asc">Цена: по возрастанию</option>
                <option value="price-desc">Цена: по убыванию</option>
                <option value="name">По названию</option>
              </select>
            </div>
          </div>

          {loading || !data ? (
            <div className="mt-8">
              <ProductGridSkeleton count={6} />
            </div>
          ) : data.items.length === 0 ? (
            <p className="mt-12 text-center text-ink-muted">
              Ничего не найдено — измените фильтры.
            </p>
          ) : (
            <>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {data.items.map((p, i) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    style={{ animationDelay: `${i * 50}ms` }}
                  />
                ))}
              </div>
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                onChange={(p) => setFilter({ page: String(p) })}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchProductById } from '@/api/client'
import type { Product } from '@/types'
import { formatPrice } from '@/utils/priceFormat'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { usePreferencesStore } from '@/store/preferencesStore'
import { useAuthStore } from '@/store/authStore'
import { deleteProductRequest, updateProductRequest } from '@/api/productsApi'

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const [product, setProduct] = useState<Product | null | undefined>(undefined)
  const add = useCartStore((s) => s.add)
  const { toggle, has } = useWishlistStore()
  const { currency, ratesFromRub, language } = usePreferencesStore()
  const { role, token } = useAuthStore()
  const [editPrice, setEditPrice] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const liked = product ? has(product.id) : false

  useEffect(() => {
    if (!slug) {
      setProduct(null)
      return
    }
    let ok = true
    setProduct(undefined)
    fetchProductById(slug).then((p) => {
      if (ok) setProduct(p)
    })
    return () => {
      ok = false
    }
  }, [slug])

  if (product === undefined) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-3xl bg-surface-muted" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded bg-surface-muted" />
            <div className="h-10 w-1/3 animate-pulse rounded bg-surface-muted" />
            <div className="h-24 animate-pulse rounded-xl bg-surface-muted" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center md:px-6">
        <h1 className="text-xl font-semibold text-ink">Товар не найден</h1>
        <Link to="/catalog" className="mt-4 inline-block text-accent hover:underline">
          В каталог
        </Link>
      </div>
    )
  }

  async function onAdminSave() {
    if (!token || role !== 'admin') return
    if (!product.id.startsWith('srv-')) return
    const updated = await updateProductRequest(
      product.id,
      {
        description: editDescription || product.description,
        price: Number(editPrice) || product.price,
      },
      token
    )
    setProduct(updated)
  }

  async function onAdminDelete() {
    if (!token || role !== 'admin') return
    if (!product.id.startsWith('srv-')) return
    await deleteProductRequest(product.id, token)
    window.location.href = '/catalog'
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <nav className="text-sm text-ink-muted">
        <Link to="/" className="hover:text-accent">
          Главная
        </Link>
        <span className="mx-2">/</span>
        <Link to="/catalog" className="hover:text-accent">
          Каталог
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-start">
        <div className="overflow-hidden rounded-3xl border border-surface-muted bg-surface-muted/30 shadow-sm">
          <img
            src={product.image}
            alt=""
            loading="lazy"
            className="aspect-square w-full object-cover"
          />
        </div>
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-ink-muted">
            {product.brand}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            {product.name}
          </h1>
          <p className="mt-6 text-3xl font-semibold text-ink">
            {formatPrice(product.price, currency, ratesFromRub[currency], language)}
          </p>
          <p className="mt-6 leading-relaxed text-ink-muted">{product.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => add(product)}
              className="rounded-full bg-ink px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-ink/90 active:scale-[0.98] dark:bg-accent dark:text-slate-950 dark:hover:bg-accent-hover"
            >
              Добавить в корзину
            </button>
            <button
              type="button"
              onClick={() => toggle(product)}
              className={`rounded-full border px-8 py-3 text-sm font-semibold transition ${
                liked
                  ? 'border-red-400/50 text-red-500'
                  : 'border-surface-muted text-ink hover:border-accent hover:text-accent'
              }`}
            >
              {liked ? 'В избранном' : 'В избранное'}
            </button>
          </div>
          {role === 'admin' && product.id.startsWith('srv-') && (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50/60 p-4 dark:border-red-900/50 dark:bg-red-950/20">
              <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                Admin tools
              </p>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <input
                  placeholder="Новая цена"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm outline-none dark:border-red-900/50 dark:bg-slate-900"
                />
                <input
                  placeholder="Новое описание"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm outline-none dark:border-red-900/50 dark:bg-slate-900"
                />
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={onAdminSave}
                  className="rounded-full border border-red-400 px-4 py-2 text-sm font-semibold text-red-700"
                >
                  Сохранить
                </button>
                <button
                  type="button"
                  onClick={onAdminDelete}
                  className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Удалить товар
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

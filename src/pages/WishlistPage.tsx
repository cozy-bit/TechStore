import { Link } from 'react-router-dom'
import { mockProducts } from '@/data/mockData'
import { useWishlistStore } from '@/store/wishlistStore'
import { ProductCard } from '@/components/ProductCard'

export function WishlistPage() {
  const ids = useWishlistStore((s) => s.ids)
  const products = mockProducts.filter((p) => ids.includes(p.id))

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center md:px-6">
        <h1 className="text-2xl font-semibold text-ink">Избранное пусто</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Нажмите на сердечко на карточке товара.
        </p>
        <Link
          to="/catalog"
          className="mt-8 inline-flex rounded-full border border-accent px-6 py-3 text-sm font-semibold text-accent"
        >
          В каталог
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">
        Избранное
      </h1>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p, i) => (
          <ProductCard
            key={p.id}
            product={p}
            style={{ animationDelay: `${i * 50}ms` }}
          />
        ))}
      </div>
    </div>
  )
}

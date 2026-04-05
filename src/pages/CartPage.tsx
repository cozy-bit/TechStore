import { Link } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/utils/priceFormat'

export function CartPage() {
  const { items, remove, setQuantity, total } = useCartStore()
  const rows = Object.values(items)
  const sum = total()

  if (rows.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center md:px-6">
        <h1 className="text-2xl font-semibold text-ink">Корзина пуста</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Добавьте товары из каталога или карточки на главной.
        </p>
        <Link
          to="/catalog"
          className="mt-8 inline-flex rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white dark:bg-accent dark:text-slate-950"
        >
          В каталог
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">
        Корзина
      </h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-3 lg:items-start">
        <ul className="space-y-4 lg:col-span-2">
          {rows.map(({ product, quantity }) => (
            <li
              key={product.id}
              className="flex gap-4 rounded-2xl border border-surface-muted bg-surface p-4 shadow-sm"
            >
              <Link
                to={`/product/${product.slug}`}
                className="h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-surface-muted"
              >
                <img
                  src={product.image}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  to={`/product/${product.slug}`}
                  className="font-semibold text-ink hover:text-accent"
                >
                  {product.name}
                </Link>
                <p className="mt-1 text-sm text-ink-muted">{product.brand}</p>
                <p className="mt-2 font-medium text-ink">
                  {formatPrice(product.price, product.currency)}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center rounded-full border border-surface-muted">
                    <button
                      type="button"
                      aria-label="Меньше"
                      className="px-3 py-1 text-lg leading-none text-ink hover:bg-surface-muted"
                      onClick={() => setQuantity(product.id, quantity - 1)}
                    >
                      −
                    </button>
                    <span className="min-w-[2rem] text-center text-sm font-medium">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Больше"
                      className="px-3 py-1 text-lg leading-none text-ink hover:bg-surface-muted"
                      onClick={() => setQuantity(product.id, quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(product.id)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <aside className="rounded-2xl border border-surface-muted bg-surface-muted/40 p-6">
          <p className="text-sm text-ink-muted">Итого</p>
          <p className="mt-2 text-2xl font-semibold text-ink">
            {formatPrice(sum, rows[0]?.product.currency ?? 'RUB')}
          </p>
          <button
            type="button"
            className="mt-6 w-full rounded-full bg-ink py-3 text-sm font-semibold text-white opacity-90 dark:bg-accent dark:text-slate-950"
          >
            Оформить (скоро)
          </button>
          <p className="mt-3 text-center text-xs text-ink-muted">
            Демо: оплата не подключена.
          </p>
        </aside>
      </div>
    </div>
  )
}

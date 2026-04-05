import { Link } from 'react-router-dom'
import type { Product } from '@/types'
import { formatPrice } from '@/utils/priceFormat'
import { useWishlistStore } from '@/store/wishlistStore'

type Props = {
  product: Product
  style?: React.CSSProperties
}

export function ProductCard({ product, style }: Props) {
  const { toggle, has } = useWishlistStore()
  const liked = has(product.id)

  return (
    <article
      style={style}
      className="group stagger-fade flex flex-col overflow-hidden rounded-2xl border border-surface-muted bg-surface shadow-sm transition hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-md dark:border-slate-700/80 dark:bg-surface-muted/20"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
        <Link to={`/product/${product.slug}`} className="block h-full w-full">
          <img
            src={product.image}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </Link>
        <button
          type="button"
          onClick={() => toggle(product)}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur transition hover:scale-105 hover:bg-black/50 ${
            liked ? 'text-red-400' : ''
          }`}
          aria-label={liked ? 'Убрать из избранного' : 'В избранное'}
        >
          <HeartIcon filled={liked} className="h-5 w-5" />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          {product.brand}
        </p>
        <Link
          to={`/product/${product.slug}`}
          className="mt-1 line-clamp-2 text-base font-semibold text-ink transition group-hover:text-accent"
        >
          {product.name}
        </Link>
        <p className="mt-3 text-lg font-semibold tracking-tight text-ink">
          {formatPrice(product.price, product.currency)}
        </p>
        <div className="mt-auto flex gap-2 pt-4">
          <Link
            to={`/product/${product.slug}`}
            className="flex-1 rounded-xl border border-surface-muted py-2.5 text-center text-sm font-medium text-ink transition hover:border-accent hover:text-accent"
          >
            Подробнее
          </Link>
          <Link
            to={`/product/${product.slug}`}
            className="flex-1 rounded-xl bg-ink py-2.5 text-center text-sm font-semibold text-white transition hover:bg-ink/90 active:scale-[0.98] dark:bg-accent dark:text-slate-950 dark:hover:bg-accent-hover"
          >
            Купить
          </Link>
        </div>
      </div>
    </article>
  )
}

function HeartIcon({
  filled,
  ...props
}: React.SVGProps<SVGSVGElement> & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} {...props}>
      <path
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
        d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
      />
    </svg>
  )
}

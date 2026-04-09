import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { usePreferencesStore } from '@/store/preferencesStore'
import { t } from '@/i18n/dictionary'
import type { CurrencyCode, LanguageCode } from '@/types'

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-surface-muted text-ink'
      : 'text-ink-muted hover:bg-surface-muted hover:text-ink'
  }`

export function Header() {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const cartCount = useCartStore((s) => s.count())
  const wishCount = useWishlistStore((s) => s.ids.length)
  const { email, logout, role } = useAuthStore()
  const { dark, toggle } = useThemeStore()
  const { currency, setCurrency, language, setLanguage } = usePreferencesStore()

  function onSearch(e: React.FormEvent) {
    e.preventDefault()
    const v = q.trim()
    navigate(v ? `/catalog?search=${encodeURIComponent(v)}` : '/catalog')
    setOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-surface-muted/80 bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 md:px-6">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 font-semibold tracking-tight text-ink"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-sm text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]">
            TS
          </span>
          <span className="hidden sm:inline">TechStore</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" end className={navClass}>
            {t(language, 'home')}
          </NavLink>
          <NavLink to="/catalog" className={navClass}>
            {t(language, 'catalog')}
          </NavLink>
          <NavLink to="/wishlist" className={navClass}>
            {t(language, 'wishlist')}
            {wishCount > 0 && (
              <span className="ml-1 rounded-full bg-accent/15 px-1.5 text-xs text-accent">
                {wishCount}
              </span>
            )}
          </NavLink>
          {email && (
            <NavLink to="/add-product" className={navClass}>
              {t(language, 'addProduct')}
            </NavLink>
          )}
        </nav>

        <form
          onSubmit={onSearch}
          className="mx-auto hidden min-w-0 flex-1 max-w-md md:block"
        >
          <label className="sr-only" htmlFor="header-search">
            {t(language, 'searchPlaceholder')}
          </label>
          <input
            id="header-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t(language, 'searchPlaceholder')}
            className="w-full rounded-full border border-surface-muted bg-surface-muted/60 px-4 py-2 text-sm text-ink placeholder:text-ink-muted outline-none ring-accent/30 transition focus:border-accent focus:ring-2 dark:bg-surface-muted/40"
          />
        </form>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            className="hidden rounded-full border border-surface-muted bg-surface px-2 py-1 text-xs text-ink-muted outline-none sm:block"
            aria-label="Currency"
          >
            <option value="RUB">RUB</option>
            <option value="USD">USD</option>
            <option value="TJS">TJS</option>
          </select>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageCode)}
            className="hidden rounded-full border border-surface-muted bg-surface px-2 py-1 text-xs text-ink-muted outline-none sm:block"
            aria-label="Language"
          >
            <option value="ru">RU</option>
            <option value="en">EN</option>
          </select>
          <button
            type="button"
            onClick={toggle}
            className="rounded-full p-2 text-ink-muted transition hover:bg-surface-muted hover:text-ink"
            aria-label={dark ? 'Светлая тема' : 'Тёмная тема'}
          >
            {dark ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>

          <Link
            to="/cart"
            className="relative rounded-full p-2 text-ink-muted transition hover:bg-surface-muted hover:text-ink"
            aria-label="Корзина"
          >
            <CartIcon className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>

          {email ? (
            <div className="hidden items-center gap-2 sm:flex">
              <span className="max-w-[120px] truncate text-xs text-ink-muted">
                {email} ({role ?? 'user'})
              </span>
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-full border border-surface-muted px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:border-accent hover:text-accent"
              >
                {t(language, 'logout')}
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden rounded-full bg-ink px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-ink/90 active:scale-[0.98] dark:bg-accent dark:text-slate-950 dark:hover:bg-accent-hover sm:inline-flex"
            >
              {t(language, 'login')}
            </Link>
          )}

          <button
            type="button"
            className="rounded-lg p-2 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Меню"
          >
            <MenuIcon className="h-6 w-6 text-ink" />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-surface-muted bg-surface px-4 py-4 md:hidden">
          <form onSubmit={onSearch} className="mb-4">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t(language, 'searchPlaceholder')}
              className="w-full rounded-xl border border-surface-muted bg-surface-muted/50 px-3 py-2 text-sm outline-none ring-accent/20 focus:ring-2"
            />
          </form>
          <div className="mb-3 flex gap-2">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="rounded-lg border border-surface-muted bg-surface px-2 py-1 text-xs text-ink-muted outline-none"
            >
              <option value="RUB">RUB</option>
              <option value="USD">USD</option>
              <option value="TJS">TJS</option>
            </select>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageCode)}
              className="rounded-lg border border-surface-muted bg-surface px-2 py-1 text-xs text-ink-muted outline-none"
            >
              <option value="ru">RU</option>
              <option value="en">EN</option>
            </select>
          </div>
          <nav className="flex flex-col gap-1">
            <MobileNavLink to="/" onNavigate={() => setOpen(false)}>
              {t(language, 'home')}
            </MobileNavLink>
            <MobileNavLink to="/catalog" onNavigate={() => setOpen(false)}>
              {t(language, 'catalog')}
            </MobileNavLink>
            <MobileNavLink to="/wishlist" onNavigate={() => setOpen(false)}>
              {t(language, 'wishlist')} ({wishCount})
            </MobileNavLink>
            <MobileNavLink to="/cart" onNavigate={() => setOpen(false)}>
              {t(language, 'cart')} ({cartCount})
            </MobileNavLink>
            {email && (
              <MobileNavLink to="/add-product" onNavigate={() => setOpen(false)}>
                {t(language, 'addProduct')}
              </MobileNavLink>
            )}
            {!email && (
              <MobileNavLink to="/login" onNavigate={() => setOpen(false)}>
                {t(language, 'login')}
              </MobileNavLink>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

function MobileNavLink({
  to,
  children,
  onNavigate,
}: {
  to: string
  children: React.ReactNode
  onNavigate: () => void
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className="rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-surface-muted"
    >
      {children}
    </Link>
  )
}

function CartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 6h15l-1.5 9h-12L6 6zm0 0L5 3H2"
      />
      <circle cx="9" cy="20" r="1" fill="currentColor" stroke="none" />
      <circle cx="18" cy="20" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeWidth="2"
        strokeLinecap="round"
        d="M4 7h16M4 12h16M4 17h16"
      />
    </svg>
  )
}

function MoonIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
      />
    </svg>
  )
}

function SunIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle cx="12" cy="12" r="4" strokeWidth="1.75" />
      <path
        strokeWidth="1.75"
        strokeLinecap="round"
        d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
      />
    </svg>
  )
}

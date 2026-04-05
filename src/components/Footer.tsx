import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="mt-16 border-t border-surface-muted bg-surface-muted/30">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3 md:px-6">
        <div>
          <p className="font-semibold text-ink">TechStore</p>
          <p className="mt-2 text-sm text-ink-muted">
            Техника с доставкой. Макет лендинга и витрины для портфолио.
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-ink">Разделы</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            <li>
              <Link className="hover:text-accent" to="/catalog">
                Каталог
              </Link>
            </li>
            <li>
              <Link className="hover:text-accent" to="/wishlist">
                Избранное
              </Link>
            </li>
            <li>
              <Link className="hover:text-accent" to="/cart">
                Корзина
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium text-ink">Контакты</p>
          <p className="mt-3 text-sm text-ink-muted">
            support@techstore.example
            <br />
            +7 (800) 000-00-00
          </p>
        </div>
      </div>
      <div className="border-t border-surface-muted py-4 text-center text-xs text-ink-muted">
        © {new Date().getFullYear()} TechStore. Демо-данные.
      </div>
    </footer>
  )
}

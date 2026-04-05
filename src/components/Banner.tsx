import { Link } from 'react-router-dom'

export function Banner() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 px-6 py-14 text-white shadow-xl md:px-12 md:py-20 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="relative max-w-xl">
        <p className="text-sm font-medium uppercase tracking-widest text-blue-200/90">
          Новая коллекция
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight md:text-4xl lg:text-5xl">
          Техника, которая работает на вас
        </h1>
        <p className="mt-4 text-base text-slate-300 md:text-lg">
          Ноутбуки, смартфоны и планшеты — подборка популярных моделей с
          прозрачными ценами и быстрым оформлением.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/catalog"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100 active:scale-[0.98]"
          >
            В каталог
          </Link>
          <Link
            to="/catalog?category=cat-laptops"
            className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/5 px-6 py-3 text-sm font-medium text-white backdrop-blur transition hover:bg-white/10"
          >
            Ноутбуки
          </Link>
        </div>
      </div>
    </section>
  )
}

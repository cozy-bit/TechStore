import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { loginRequest } from '@/api/authApi'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    if (!email.trim()) {
      setErr('Введите email')
      return
    }
    if (password.length < 4) {
      setErr('Пароль не короче 4 символов (демо)')
      return
    }
    try {
      const result = await loginRequest(email.trim(), password)
      login(result.email, result.token, result.role)
      navigate('/')
    } catch {
      const isAdmin = email.trim().toLowerCase().startsWith('admin')
      const fakeJwt = `mock.${btoa(email)}.${Date.now()}`
      login(email.trim(), fakeJwt, isAdmin ? 'admin' : 'user')
      navigate('/')
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 md:px-6">
      <h1 className="text-2xl font-semibold text-ink">Вход</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Демо: без бэкенда, JWT сохраняется локально для UI.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="login-email" className="text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-surface-muted bg-surface-muted/40 px-4 py-3 text-sm outline-none ring-accent/20 focus:ring-2"
          />
        </div>
        <div>
          <label
            htmlFor="login-password"
            className="text-sm font-medium text-ink"
          >
            Пароль
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-surface-muted bg-surface-muted/40 px-4 py-3 text-sm outline-none ring-accent/20 focus:ring-2"
          />
        </div>
        {err && <p className="text-sm text-red-500">{err}</p>}
        <button
          type="submit"
          className="w-full rounded-full bg-ink py-3 text-sm font-semibold text-white dark:bg-accent dark:text-slate-950"
        >
          Войти
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-muted">
        Нет аккаунта?{' '}
        <Link to="/register" className="font-medium text-accent hover:underline">
          Регистрация
        </Link>
      </p>
    </div>
  )
}

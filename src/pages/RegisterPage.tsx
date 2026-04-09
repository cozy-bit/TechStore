import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { registerRequest } from '@/api/authApi'
import type { UserRole } from '@/types'

export function RegisterPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('user')
  const [err, setErr] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    if (!email.trim()) {
      setErr('Введите email')
      return
    }
    if (password.length < 6) {
      setErr('Пароль не короче 6 символов')
      return
    }
    try {
      const result = await registerRequest(email.trim(), password, role)
      login(result.email, result.token, result.role)
      navigate('/')
    } catch {
      const fakeJwt = `mock.${btoa(email)}.reg.${Date.now()}`
      login(email.trim(), fakeJwt, role)
      navigate('/')
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 md:px-6">
      <h1 className="text-2xl font-semibold text-ink">Регистрация</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Демо-форма: создаёт локальную сессию без сервера.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="reg-email" className="text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-surface-muted bg-surface-muted/40 px-4 py-3 text-sm outline-none ring-accent/20 focus:ring-2"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink">Роль</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="mt-2 w-full rounded-xl border border-surface-muted bg-surface-muted/40 px-4 py-3 text-sm outline-none ring-accent/20 focus:ring-2"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="reg-password"
            className="text-sm font-medium text-ink"
          >
            Пароль
          </label>
          <input
            id="reg-password"
            type="password"
            autoComplete="new-password"
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
          Создать аккаунт
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-muted">
        Уже есть аккаунт?{' '}
        <Link to="/login" className="font-medium text-accent hover:underline">
          Войти
        </Link>
      </p>
    </div>
  )
}

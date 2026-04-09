import { axiosClient } from '@/lib/axiosClient'
import type { UserRole } from '@/types'

export type AuthResult = {
  token: string
  email: string
  role: UserRole
}

export async function loginRequest(email: string, password: string) {
  const res = await axiosClient.post<AuthResult>('/login', { email, password })
  return res.data
}

export async function registerRequest(
  email: string,
  password: string,
  role: UserRole
) {
  const res = await axiosClient.post<AuthResult>('/register', {
    email,
    password,
    role,
  })
  return res.data
}


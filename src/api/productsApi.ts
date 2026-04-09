import { axiosClient } from '@/lib/axiosClient'
import type { Product } from '@/types'

export type CreateProductPayload = {
  name: string
  description: string
  price: number
  categoryId: string
  brand?: string
  specs?: string
  status?: 'published' | 'pending'
  image: File
}

export async function createProductRequest(
  payload: CreateProductPayload,
  token: string
) {
  const form = new FormData()
  form.append('name', payload.name)
  form.append('description', payload.description)
  form.append('price', String(payload.price))
  form.append('categoryId', payload.categoryId)
  if (payload.brand) form.append('brand', payload.brand)
  if (payload.specs) form.append('specs', payload.specs)
  form.append('status', payload.status ?? 'published')
  form.append('image', payload.image)

  const res = await axiosClient.post<Product>('/products', form, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  })
  return res.data
}

export async function updateProductRequest(
  id: string,
  body: { name?: string; description?: string; price?: number; brand?: string; status?: string },
  token: string
) {
  const res = await axiosClient.put<Product>(`/products/${id}`, body, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export async function deleteProductRequest(id: string, token: string) {
  await axiosClient.delete(`/products/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}


import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockCategories } from '@/data/mockData'
import { createProductRequest } from '@/api/productsApi'
import { appendRuntimeProduct } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import type { Product } from '@/types'

const IMG_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export function AddProductPage() {
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState(mockCategories[0]?.id ?? '')
  const [brand, setBrand] = useState('')
  const [specs, setSpecs] = useState('')
  const [status, setStatus] = useState<'published' | 'pending'>('published')
  const [image, setImage] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const canSubmit = useMemo(
    () =>
      !!name.trim() &&
      !!description.trim() &&
      Number(price) > 0 &&
      !!categoryId &&
      !!image,
    [categoryId, description, image, name, price]
  )

  function onImageChange(file: File | undefined) {
    if (!file) return
    if (!IMG_TYPES.includes(file.type)) {
      setError('Только изображения (jpg, png, webp, gif)')
      setImage(null)
      return
    }
    setImage(file)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!canSubmit || !image || !token) {
      setError('Заполните обязательные поля')
      return
    }

    setLoading(true)
    try {
      const created = await createProductRequest(
        {
          name: name.trim(),
          description: description.trim(),
          price: Number(price),
          categoryId,
          brand: brand.trim(),
          specs: specs.trim(),
          image,
          status,
        },
        token
      )
      appendRuntimeProduct(created)
      navigate('/catalog')
    } catch {
      // fallback to local portfolio mode if backend unavailable
      const id = `local-${Date.now()}`
      const slug = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
      const localProduct: Product = {
        id,
        slug,
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        categoryId,
        brand: brand.trim() || 'Custom',
        image: URL.createObjectURL(image),
        currency: 'RUB',
        popularity: 1,
        specs: specs.trim(),
        status,
      }
      appendRuntimeProduct(localProduct)
      navigate('/catalog')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">
        Добавить товар
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Обязательные поля: название, описание, цена, категория и фото.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-8 space-y-4 rounded-2xl border border-surface-muted bg-surface p-5 shadow-sm md:p-6"
      >
        <div>
          <label className="text-sm font-medium text-ink">Название *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-xl border border-surface-muted bg-surface-muted/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-ink">Описание *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-2 w-full rounded-xl border border-surface-muted bg-surface-muted/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-ink">Цена (RUB) *</label>
            <input
              type="number"
              min={1}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-2 w-full rounded-xl border border-surface-muted bg-surface-muted/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Категория *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-2 w-full rounded-xl border border-surface-muted bg-surface-muted/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30"
            >
              {mockCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-ink">Бренд</label>
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="mt-2 w-full rounded-xl border border-surface-muted bg-surface-muted/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Статус</label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as 'published' | 'pending')
              }
              className="mt-2 w-full rounded-xl border border-surface-muted bg-surface-muted/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="published">Опубликован</option>
              <option value="pending">На модерации</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-ink">Характеристики</label>
          <textarea
            value={specs}
            onChange={(e) => setSpecs(e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-xl border border-surface-muted bg-surface-muted/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-ink">Фото *</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onImageChange(e.target.files?.[0])}
            className="mt-2 block w-full rounded-xl border border-surface-muted bg-surface-muted/40 px-3 py-2 text-sm outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={!canSubmit || loading}
          className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 dark:bg-accent dark:text-slate-950"
        >
          {loading ? 'Публикация...' : 'Опубликовать'}
        </button>
      </form>
    </div>
  )
}


import { mockCategories, mockProducts } from '../data/mockData'
import type { Category, Product, ProductFilters } from '../types'
import { axiosClient } from '@/lib/axiosClient'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

function filterAndSortProducts(filters: ProductFilters): Product[] {
  let list = [...mockProducts, ...extraProducts]

  if (filters.categoryId) {
    list = list.filter((p) => p.categoryId === filters.categoryId)
  }
  if (filters.brand) {
    const b = filters.brand.toLowerCase()
    list = list.filter((p) => p.brand.toLowerCase() === b)
  }
  if (filters.minPrice != null) {
    list = list.filter((p) => p.price >= filters.minPrice!)
  }
  if (filters.maxPrice != null) {
    list = list.filter((p) => p.price <= filters.maxPrice!)
  }
  const q = filters.search.trim().toLowerCase()
  if (q) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    )
  }

  switch (filters.sort) {
    case 'price-asc':
      list.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      list.sort((a, b) => b.price - a.price)
      break
    case 'name':
      list.sort((a, b) => a.name.localeCompare(b.name, 'ru'))
      break
    case 'popular':
    default:
      list.sort((a, b) => b.popularity - a.popularity)
  }

  return list
}

export type PaginatedProducts = {
  items: Product[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export async function fetchCategories(): Promise<Category[]> {
  await delay(280)
  return [...mockCategories]
}

export async function fetchProducts(
  filters: ProductFilters
): Promise<PaginatedProducts> {
  await delay(400)
  const fromServer = await fetchServerProducts()
  fromServer.forEach(appendRuntimeProduct)
  const all = filterAndSortProducts(filters)
  const total = all.length
  const start = (filters.page - 1) * filters.pageSize
  const items = all.slice(start, start + filters.pageSize)
  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize))
  return {
    items,
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages,
  }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  await delay(320)
  let p = [...mockProducts, ...extraProducts].find(
    (x) => x.id === id || x.slug === id
  )
  if (!p) {
    const fromServer = await fetchServerProducts()
    fromServer.forEach(appendRuntimeProduct)
    p = [...mockProducts, ...extraProducts].find((x) => x.id === id || x.slug === id)
  }
  return p ?? null
}

let extraProducts: Product[] = []

export function appendRuntimeProduct(product: Product) {
  if (!extraProducts.find((p) => p.id === product.id)) {
    extraProducts = [product, ...extraProducts]
  }
}

export async function fetchServerProducts(): Promise<Product[]> {
  try {
    const res = await axiosClient.get<Product[]>('/products')
    return res.data
  } catch {
    return []
  }
}

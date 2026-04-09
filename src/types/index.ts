export type Category = {
  id: string
  slug: string
  name: string
  description?: string
}

export type Product = {
  id: string
  name: string
  slug: string
  price: number
  currency: string
  description: string
  image: string
  categoryId: string
  brand: string
  popularity: number
  status?: 'published' | 'pending'
  specs?: string
}

export type CartItem = {
  product: Product
  quantity: number
}

export type SortOption = 'popular' | 'price-asc' | 'price-desc' | 'name'

export type UserRole = 'user' | 'admin'
export type CurrencyCode = 'RUB' | 'USD' | 'TJS'
export type LanguageCode = 'ru' | 'en'

export type ProductFilters = {
  categoryId: string | null
  minPrice: number | null
  maxPrice: number | null
  brand: string | null
  search: string
  sort: SortOption
  page: number
  pageSize: number
}

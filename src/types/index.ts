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
}

export type CartItem = {
  product: Product
  quantity: number
}

export type SortOption = 'popular' | 'price-asc' | 'price-desc' | 'name'

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

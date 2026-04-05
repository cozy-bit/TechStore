import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '../types'

type WishlistState = {
  ids: string[]
  toggle: (product: Product) => void
  has: (productId: string) => boolean
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (product) => {
        const id = product.id
        set((s) =>
          s.ids.includes(id)
            ? { ids: s.ids.filter((x) => x !== id) }
            : { ids: [...s.ids, id] }
        )
      },
      has: (productId) => get().ids.includes(productId),
    }),
    { name: 'tech-store-wishlist' }
  )
)

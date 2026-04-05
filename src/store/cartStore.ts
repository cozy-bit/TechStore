import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '../types'

type CartState = {
  items: Record<string, { product: Product; quantity: number }>
  add: (product: Product, qty?: number) => void
  remove: (productId: string) => void
  setQuantity: (productId: string, quantity: number) => void
  clear: () => void
  total: () => number
  count: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: {},
      add: (product, qty = 1) => {
        const id = product.id
        set((s) => {
          const cur = s.items[id]?.quantity ?? 0
          return {
            items: {
              ...s.items,
              [id]: { product, quantity: cur + qty },
            },
          }
        })
      },
      remove: (productId) =>
        set((s) => {
          const next = { ...s.items }
          delete next[productId]
          return { items: next }
        }),
      setQuantity: (productId, quantity) => {
        if (quantity < 1) {
          get().remove(productId)
          return
        }
        set((s) => {
          const row = s.items[productId]
          if (!row) return s
          return {
            items: {
              ...s.items,
              [productId]: { ...row, quantity },
            },
          }
        })
      },
      clear: () => set({ items: {} }),
      total: () =>
        Object.values(get().items).reduce(
          (sum, { product, quantity }) => sum + product.price * quantity,
          0
        ),
      count: () =>
        Object.values(get().items).reduce((n, { quantity }) => n + quantity, 0),
    }),
    { name: 'tech-store-cart' }
  )
)

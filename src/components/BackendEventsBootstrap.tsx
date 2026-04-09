import { useEffect } from 'react'
import { appendRuntimeProduct } from '@/api/client'
import type { Product } from '@/types'

export function BackendEventsBootstrap() {
  useEffect(() => {
    const wsBase = (import.meta.env.VITE_WS_URL as string | undefined) ?? ''
    const inferred = wsBase || inferWSUrl(import.meta.env.VITE_API_URL as string)
    if (!inferred) return

    let ws: WebSocket | null = null
    try {
      ws = new WebSocket(`${inferred}/ws/products`)
      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(String(ev.data)) as {
            event?: string
            payload?: Product
          }
          if (data.event === 'new_product' && data.payload) {
            appendRuntimeProduct(data.payload)
          }
        } catch {
          // ignore malformed messages
        }
      }
    } catch {
      // backend not started
    }
    return () => ws?.close()
  }, [])

  return null
}

function inferWSUrl(apiUrl?: string): string | null {
  if (!apiUrl) return 'ws://localhost:8080'
  if (apiUrl.startsWith('http://')) return `ws://${apiUrl.slice(7)}`
  if (apiUrl.startsWith('https://')) return `wss://${apiUrl.slice(8)}`
  return null
}


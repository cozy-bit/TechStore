export function formatPrice(amount: number, currency: string): string {
  if (currency === 'RUB' || currency === '₽') {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(amount)
  }
  return `${amount} ${currency}`
}

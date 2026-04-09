import type { CurrencyCode, LanguageCode } from '@/types'

const mapToIntl: Record<CurrencyCode, string> = {
  RUB: 'RUB',
  USD: 'USD',
  TJS: 'TJS',
}

export function formatPrice(
  amountInRub: number,
  currency: CurrencyCode,
  rateFromRub: number,
  language: LanguageCode
): string {
  const value = amountInRub * rateFromRub
  const locale = language === 'ru' ? 'ru-RU' : 'en-US'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: mapToIntl[currency],
    maximumFractionDigits: 2,
  }).format(value)
}

import { CURRENCIES } from '@/constants/currencies'

/**
 * @param {number} amount 
 * @param {string} currency 
 * @returns {string} 
 */

export const formatCurrency = (amount, currency = CURRENCIES.UAH) => {
  if (amount == null) return ''

  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * @param {string|Date} dateString 
 * @returns {string} 
 */
export const formatDate = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  return new Intl.DateTimeFormat('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

import { CURRENCIES } from '@/constants/currencies'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Europe/Kyiv')

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
 * @param {string} format
 * @returns {string}
 */
export const formatDate = (dateString, format = 'DD.MM.YYYY HH:mm') => {
  if (!dateString) return ''

  return dayjs.utc(dateString).tz('Europe/Kyiv').format(format)
}

export const PURCHASE_STATUSES = {
  DRAFT: 'draft',
  APPROVED: 'approved',
  PARTIAL: 'partial',
  PAID: 'paid', 
  RECEIVED: 'received',
  CANCELLED: 'cancelled',
  RETAIL: 'retail',
  RETURNED: 'returned',
}

export const PURCHASE_STATUS_LABELS = {
  [PURCHASE_STATUSES.DRAFT]: 'Чернетка',
  [PURCHASE_STATUSES.APPROVED]: 'Затверджено',
  [PURCHASE_STATUSES.PARTIAL]: 'Частково оплачено',
  [PURCHASE_STATUSES.PAID]: 'Оплачено',
  [PURCHASE_STATUSES.RECEIVED]: 'Отримано',
  [PURCHASE_STATUSES.CANCELLED]: 'Скасовано',
  [PURCHASE_STATUSES.RETAIL]: 'Роздріб',
  [PURCHASE_STATUSES.RETURNED]: 'Повернено',
}

export const PURCHASE_STATUS_CLASSES = {
  [PURCHASE_STATUSES.DRAFT]: 'status-draft',
  [PURCHASE_STATUSES.APPROVED]: 'status-approved',
  [PURCHASE_STATUSES.PARTIAL]: 'status-waiting',
  [PURCHASE_STATUSES.PAID]: 'status-approved',
  [PURCHASE_STATUSES.RECEIVED]: 'status-received',
  [PURCHASE_STATUSES.CANCELLED]: 'status-draft',
  [PURCHASE_STATUSES.RETAIL]: 'status-approved',
  [PURCHASE_STATUSES.RETURNED]: 'status-draft',
}

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Спочатку нові' },
  { value: 'oldest', label: 'Спочатку старі' },
]

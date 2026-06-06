export const REPAIR_STATUSES = {
  PENDING: 'pending',
  WAITING_PARTS: 'waiting_parts',
  REPAIRED: 'done', 
  DELIVERED: 'returned',
}

export const REPAIR_STATUS_LABELS = {
  [REPAIR_STATUSES.PENDING]: 'Прийнято',
  [REPAIR_STATUSES.WAITING_PARTS]: 'Очікування запчастин',
  [REPAIR_STATUSES.REPAIRED]: 'Відремонтовано',
  [REPAIR_STATUSES.DELIVERED]: 'Видано',
}

export const REPAIR_STATUS_CLASSES = {
  [REPAIR_STATUSES.PENDING]: 'status-pending',
  [REPAIR_STATUSES.WAITING_PARTS]: 'status-waiting',
  [REPAIR_STATUSES.REPAIRED]: 'status-completed',
  [REPAIR_STATUSES.DELIVERED]: 'status-delivered',
}

export const ORDERING_OPTIONS = [
  { value: '-created_at', label: 'Спочатку нові' },
  { value: 'created_at', label: 'Спочатку старі' }
]

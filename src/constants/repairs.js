// Константи для статусів ремонту
export const REPAIR_STATUSES = {
    PENDING: 'прийнято',
    WAITING_PARTS: 'очікує запчастин',
    REPAIRED: 'відремонтовано',
    DELIVERED: 'видано'
  };
  
  //  Красиві назви для відображення в інтерфейсі (UI Labels)
  export const REPAIR_STATUS_LABELS = {
    [REPAIR_STATUSES.PENDING]: 'Прийнято',
    [REPAIR_STATUSES.WAITING_PARTS]: 'Очікування запчастин',
    [REPAIR_STATUSES.REPAIRED]: 'Відремонтовано',
    [REPAIR_STATUSES.DELIVERED]: 'Видано'
  };
  
  //  CSS класи для стилізації бейджів у таблиці чи канбані
  export const REPAIR_STATUS_CLASSES = {
    [REPAIR_STATUSES.PENDING]: 'status-pending',
    [REPAIR_STATUSES.WAITING_PARTS]: 'status-waiting',
    [REPAIR_STATUSES.REPAIRED]: 'status-completed',
    [REPAIR_STATUSES.DELIVERED]: 'status-delivered'
  };
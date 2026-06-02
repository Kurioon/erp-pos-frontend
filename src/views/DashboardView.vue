<template>
  <div>
    <h1>Дашборд</h1>
    </div>
<<<<<<< Updated upstream
</template>
=======

    <section class="dashboard-block-card table-section-block">
      <h3>Останні транзакції</h3>
      <div class="table-scroll-wrapper">
        <table class="recent-tx-table">
          <thead>
            <tr>
              <th>ДАТА</th>
              <th>КАСА</th>
              <th>ТИП</th>
              <th class="text-right">СУМА</th>
              <th>ЗАМОВЛЕННЯ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(tx, idx) in filteredTransactions" :key="idx" class="tx-row">
              <td class="text-muted font-medium">{{ tx.date }}</td>
              <td class="font-bold text-dark">{{ tx.register }}</td>
              <td>
                <span class="type-badge" :class="tx.class">{{ tx.type }}</span>
              </td>
              <td class="text-right font-bold text-price" :class="tx.sign === '+' ? 'amt-plus' : 'amt-minus'">
                {{ tx.sign }}{{ Math.abs(tx.amount).toLocaleString('uk-UA') }} {{ tx.currency }}
              </td>
              <td class="font-medium" :class="tx.order !== '—' ? 'text-link-order' : 'text-muted'">
                {{ tx.order }}
              </td>
            </tr>
            <tr v-if="filteredTransactions.length === 0">
              <td colspan="5" class="text-center text-muted empty-msg">
                Немає нещодавніх транзакцій для простору "{{ currentRegister }}"
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.dashboard-view {
  padding: 32px;
  background-color: #ffffff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dashboard-header h1 {
  font-size: 1.6rem;
  color: #0f172a;
  margin: 0 0 4px 0;
  font-weight: 700;
}

.subtitle {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}

/* --- КАРТКИ МЕТРИК --- */
.metrics-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

@media (max-width: 1024px) {
  .metrics-row { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .metrics-row { grid-template-columns: 1fr; }
}

.metric-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}

.metric-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 0.05em;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.02em;
}

.text-danger-val { color: #ef4444; }

.metric-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-blue-light { background-color: #eff6ff; }
.bg-green-light { background-color: #ecfdf5; }
.bg-amber-light { background-color: #fffbeb; }
.bg-red-light { background-color: #fef2f2; }

/* --- ГОЛОВНИЙ ГРІД ДАШБОРДУ --- */
.main-dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

@media (max-width: 1024px) {
  .main-dashboard-grid { grid-template-columns: 1fr; }
}

.dashboard-block-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.01), 0 20px 25px -5px rgba(0,0,0,0.02);
}

.dashboard-block-card h3 {
  font-size: 1rem;
  color: #0f172a;
  margin: 0 0 20px 0;
  font-weight: 700;
}

/* --- ЧИСТИЙ ПРЕМІУМ ГРАФІК НА CSS --- */
.pure-css-chart {
  display: flex;
  gap: 16px;
  height: 220px;
  position: relative;
  padding-top: 10px;
}

.chart-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 190px;
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 600;
  text-align: right;
  width: 35px;
}

.chart-bars-wrapper {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 190px;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 10px;
}

.chart-bar-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  height: 100%;
  justify-content: flex-end;
  position: relative;
}

.bar-actual {
  width: 32px;
  background-color: #2563eb;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  position: relative;
  transition: height 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  cursor: pointer;
}

.bar-actual:hover {
  background-color: #1d4ed8;
}

.bar-tooltip-pop {
  position: absolute;
  top: -36px;
  left: 50%;
  transform: translateX(-50%) scale(0.9);
  background: #0f172a;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: all 0.15s ease;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.bar-actual:hover .bar-tooltip-pop {
  opacity: 1;
  transform: translateX(-50%) scale(1);
}

.bar-day-label {
  position: absolute;
  bottom: -24px;
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 600;
}

.alerts-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 12px;
}

.alerts-header h3 { margin: 0 !important; }

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #f8fafc;
}
.alert-item-row:last-child { border-bottom: none; }

.alert-item-name {
  margin: 0 0 2px 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1e293b;
}

.alert-item-sku {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
}

.alert-ratio-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  background-color: #fef3c7;
  color: #d97706;
}

.alert-ratio-badge.is-critical {
  background-color: #fee2e2;
  color: #ef4444;
}
.table-section-block { margin-top: 8px; }
.table-scroll-wrapper { overflow-x: auto; }

.recent-tx-table {
  width: 100%;
  border-collapse: collapse;
}

.recent-tx-table th {
  padding: 12px 16px;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  background-color: #f8fafc;
  letter-spacing: 0.05em;
}

.recent-tx-table td {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9rem;
  color: #334155;
  vertical-align: middle;
}

.tx-row { transition: background-color 0.15s; }
.tx-row:hover { background-color: #f8fafc; }
.recent-tx-table tr:last-child td { border-bottom: none; }

.type-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
}

.type-sale { background-color: #dcfce7; color: #166534; }
.type-return { background-color: #fef2f2; color: #991b1b; }
.type-income { background-color: #eff6ff; color: #1e40af; }
.type-expense { background-color: #fff9db; color: #b45309; }

.text-price { font-size: 0.95rem; }
.amt-plus { color: #166534; }
.amt-minus { color: #b91c1c; }

.text-link-order { color: #2563eb; font-weight: 600; }
.empty-msg { padding: 32px !important; }

.text-muted { color: #94a3b8; }
.text-dark { color: #0f172a; }
.font-medium { font-weight: 500; }
.font-bold { font-weight: 600; }
.text-right { text-align: right; }
.text-center { text-align: center; }
</style>
>>>>>>> Stashed changes

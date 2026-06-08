<template>
  <div class="pos-container">
    <PosToolbar />

    <div class="pos-layout">
      <PosCatalog />
      <PosCart />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useCartStore } from '@/stores/pos'
import PosToolbar from '@/components/pos/PosToolbar.vue'
import PosCatalog from '@/components/pos/PosCatalog.vue'
import PosCart from '@/components/pos/PosCart.vue'

const cartStore = useCartStore()

onMounted(async () => {
  await cartStore.fetchCashboxes()
  cartStore.fetchProducts()
})
</script>

<style scoped>
.pos-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 136px);
  min-height: 650px;
  gap: 16px;
}

.pos-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  flex: 1;
  min-height: 0;
}

.pos-layout > :deep(*) {
  min-height: 0;
  height: 100%;
}

@media (max-width: 1023px) {
  .pos-container {
    height: auto;
    min-height: calc(100vh - 80px);
  }

  .pos-layout {
    display: flex;
    flex-direction: column;
    overflow: visible;
    gap: 16px;
  }
}
</style>

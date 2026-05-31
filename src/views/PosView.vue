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
import PosToolbar from '@/components/pos/PosToolbar.vue'
import PosCatalog from '@/components/pos/PosCatalog.vue'
import PosCart from '@/components/pos/PosCart.vue'
</script>

<style scoped>
.pos-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
  gap: 16px;
}

.pos-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  flex: 1;
  overflow: hidden;
}
</style>

<template>
  <div class="pos-layout">
    <PosCatalog />
    <PosCart />
  </div>
</template>

<script setup>
import PosCatalog from '@/components/pos/PosCatalog.vue'
import PosCart from '@/components/pos/PosCart.vue'
</script>

<style scoped>
.pos-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  height: calc(100vh - 120px);
  overflow: hidden;
}
</style>

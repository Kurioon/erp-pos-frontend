<template>
  <header class="header">
    <div class="header-content">
      <h2 class="page-title">Робочий простір</h2>
      <div class="user-profile">
        <div class="avatar">А</div>
        <span>Адміністратор</span>
      </div>
    </div>
  </header>
</template>

<script setup>
</script>

<style scoped>
.header {
  height: 64px;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  padding: 0 24px;
}
.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.page-title {
  font-size: 1.125rem;
  color: #111827;
  margin: 0;
}
.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #374151;
}
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #2563eb;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
</style>
<template>
  <div class="app-layout">
    <AppSidebar>
      <div class="page-container">
        <slot></slot>
      </div>
    </AppSidebar>
  </div>
</template>

<script setup>
import AppSidebar from './AppSidebar.vue'
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  background: #0f172a;
}

.page-container {
  padding: 0;
}
</style>

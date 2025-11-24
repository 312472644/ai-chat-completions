<template>
  <div class="layout-container">
    <aside class="aside-container">
      <AsideBar />
    </aside>
    <main class="main-container">
      <TopBar />
      <div class="content-container">
        <slot></slot>
      </div>
    </main>
  </div>
</template>
<script setup>
import AsideBar from './aside-bar.vue';
import TopBar from './top-bar.vue';
</script>
<style lang="scss">
.layout-container {
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
  display: flex;
  .aside-container {
    width: 256px;
    height: 100%;
    background-color: #f8f8f7;
  }
  .main-container {
    flex: 1;
    min-width: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    .content-container {
      flex: 1;
      min-height: 0;
      overflow: auto;
    }
  }
}
</style>

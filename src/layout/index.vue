<template>
  <div class="layout-container">
    <aside class="aside-container" :class="{ collapsed: isSideBarCollapsed }">
      <AsideBar />
    </aside>
    <main class="main-container">
      <TopBar />
      <div class="content-container">
        <slot />
      </div>
    </main>
    <div class="aside-container-mask" :class="{ collapsed: isSideBarCollapsed }" @click="toggleSideBarCollapsed" />
  </div>
</template>

<script setup>
import { watch } from 'vue';
import useMediaQuery from '@/hooks/useMediaQuery';
import { userStore } from '@/store/userStore';
import AsideBar from './aside-bar.vue';
import TopBar from './top-bar.vue';

const { isSideBarCollapsed, openSideBar, closeSideBar, toggleMobile } = userStore();

const isMobileQuery = useMediaQuery('(max-width: 768px)');

watch(
  () => isMobileQuery.value,
  newValue => {
    if (newValue) {
      closeSideBar();
    } else {
      openSideBar();
    }
    toggleMobile(newValue);
  },
  { immediate: true }
);
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
    transition:
      width 0.2s linear,
      opacity 0.2s linear;
    &.collapsed {
      opacity: 0;
      width: 0;
      overflow: hidden;
    }
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

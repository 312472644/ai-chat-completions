<template>
  <div class="top-bar">
    <div class="left">
      <div v-if="isSideBarCollapsed" class="icon-item" @click="handleToggleAside">
        <a-tooltip placement="bottom">
          <template #title>
            <span>收起侧边栏</span>
          </template>
          <SvgIcon name="expand" />
        </a-tooltip>
      </div>
      <div v-if="isSideBarCollapsed" class="icon-item" @click="handleNewChat">
        <a-tooltip placement="bottom">
          <template #title>
            <span>新对话</span>
          </template>
          <SvgIcon name="new_chat" />
        </a-tooltip>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue';
import SvgIcon from '@/components/SvgIcon/index.vue';
import { Tooltip as ATooltip } from 'ant-design-vue';
import { userStore } from '@/store/userStore';

const isSideBarCollapsed = computed(() => userStore.isSideBarCollapsed);

const handleToggleAside = () => {
  userStore.toggleSideBarCollapsed();
};

const handleNewChat = () => {
  console.log('🚀 ~ handleNewChat:');
};
</script>
<style lang="scss">
.top-bar {
  height: 52px;
  border-bottom: 1px solid #eaeaed;
  padding: 0 12px;
  display: flex;
  align-items: center;
  .left {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
</style>

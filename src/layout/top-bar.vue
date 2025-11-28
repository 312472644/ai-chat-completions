<template>
  <div class="top-bar">
    <div class="left">
      <div v-if="isSideBarCollapsed" class="icon-item" @click="handleToggleAside">
        <ATooltip placement="bottom">
          <template #title>
            <span>收起侧边栏</span>
          </template>
          <SvgIcon name="expand" />
        </ATooltip>
      </div>
      <div v-if="isSideBarCollapsed" class="icon-item" @click="handleNewChat">
        <ATooltip placement="bottom">
          <template #title>
            <span>新对话</span>
          </template>
          <SvgIcon name="new_chat" />
        </ATooltip>
      </div>
      <div class="model-item icon-item">
        <Model />
      </div>
    </div>
  </div>
</template>

<script setup>
import { Tooltip as ATooltip } from 'ant-design-vue';
import SvgIcon from '@/components/SvgIcon/index.vue';
import { sessionStore, userStore } from '@/store';

import Model from './model/index.vue';

const { isSideBarCollapsed, toggleSideBarCollapsed } = userStore();
const { newChat } = sessionStore();

function handleToggleAside() {
  toggleSideBarCollapsed();
}

function handleNewChat() {
  newChat();
}
</script>

<style lang="scss">
.top-bar {
  height: 52px;
  box-shadow: 1px 1px 2px #f1f1f1;
  padding: 0 12px;
  display: flex;
  align-items: center;
  .left {
    display: flex;
    align-items: center;
    gap: 8px;
    .model-item {
      font-size: 16px;
    }
  }
}
</style>

<template>
  <div class="aside-bar-container">
    <div class="aside-header">
      <div class="logo">
        <img src="/robot.svg" alt="logo" style="width: 32px; height: 32px" />
        <span class="logo-text">AI</span>
      </div>
      <div class="operation">
        <div v-if="!isSearchVisible" class="icon-item">
          <a-tooltip placement="bottom">
            <template #title>
              <span>搜索</span>
            </template>
            <SearchOutlined style="font-size: 18px" @click="isSearchVisible = !isSearchVisible" />
          </a-tooltip>
        </div>
        <div class="icon-item" @click="handleToggleAside">
          <a-tooltip placement="bottom">
            <template #title>
              <span>收起侧边栏</span>
            </template>
            <SvgIcon name="shrink" style="font-size: 18px" />
          </a-tooltip>
        </div>
      </div>
    </div>
    <div class="aside-content">
      <ChatList v-model:isSearchVisible="isSearchVisible" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { h, ref } from 'vue';
import { SearchOutlined } from '@ant-design/icons-vue';
import { Tooltip as ATooltip } from 'ant-design-vue';
import SvgIcon from '@/components/SvgIcon/index.vue';
import ChatList from './chat-list/index.vue';
import { userStore } from '@/store/userStore';

const emits = defineEmits(['toggleAside']);

const { toggleSideBarCollapsed } = userStore();
const isSearchVisible = ref(false);
const searchValue = ref('');

function handleToggleAside() {
  toggleSideBarCollapsed();
}
</script>

<style lang="scss">
.aside-bar-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;

  .aside-header {
    padding: 12px;
    height: 52px;
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;

    .logo {
      display: flex;
      align-items: center;
      .logo-text {
        font-size: 16px;
        font-weight: 500;
        color: #333;
        margin-left: 8px;
      }
    }

    .operation {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .aside-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    .new-chat {
      padding: 0 12px;
      margin-bottom: 10px;
    }
  }
}
</style>

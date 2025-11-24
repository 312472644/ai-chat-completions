<template>
  <div class="aside-bar-container">
    <div class="aside-header">
      <div class="logo">
        <img src="/robot.svg" alt="logo" style="width: 32px; height: 32px" />
        <span class="logo-text">AI</span>
      </div>
      <div class="operation">
        <div v-if="!isSearchVisible" class="operation-item">
          <a-tooltip placement="bottom">
            <template #title>
              <span>搜索</span>
            </template>
            <SearchOutlined style="font-size: 18px" @click="isSearchVisible = !isSearchVisible" />
          </a-tooltip>
        </div>
        <div class="operation-item">
          <a-tooltip placement="bottom">
            <template #title>
              <span>收起侧边栏</span>
            </template>
            <MenuFoldOutlined style="font-size: 18px" />
          </a-tooltip>
        </div>
      </div>
    </div>
    <div class="aside-content">
      <div class="new-chat">
        <a-button v-if="!isSearchVisible" block :icon="h(PlusOutlined)" @click="handleNewChat"> 新对话 </a-button>
        <a-input
          v-else
          v-model="searchValue"
          placeholder="搜索历史记录"
          style="width: 100%"
          prefix-icon="h(SearchOutlined)"
          allowClear
          :maxlength="10"
        >
          <template #prefix>
            <SearchOutlined style="color: #666" />
          </template>
        </a-input>
      </div>
      <div class="chat-history">
        <div class="chat-title">
          <span class="title-text">最近对话</span>
          <span>
            <a-tooltip placement="bottom">
              <template #title>
                <span>对话管理</span>
              </template>
              <SvgIcon name="controls" style="font-size: 15px; color: #9393a2; cursor: pointer" />
            </a-tooltip>
          </span>
        </div>
        <div class="chat-list">
          <div
            v-for="(item, index) in chatItems"
            class="chat-item"
            :class="{ active: index === activeChatItemIndex }"
            @click="activeChatItemIndex = index"
          >
            <div class="chat-text">{{ item.text }}</div>
            <div class="chat-icon">
              <EllipsisOutlined style="font-size: 14px" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { h, ref } from 'vue';
import {
  SearchOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  EllipsisOutlined,
} from '@ant-design/icons-vue';
import { Tooltip as ATooltip, Button as AButton, Input as AInput } from 'ant-design-vue';
import SvgIcon from '@/components/SvgIcon/index.vue';

const isSideBarCollapsed = ref(false);
const isSearchVisible = ref(false);
const searchValue = ref('');
const chatItems = ref([
  { id: 1, text: 'Axios请求取消机制问题' },
  { id: 2, text: 'Vue项目开发技术问题咨询' },
  { id: 3, text: 'React项目性能优化建议' },
  { id: 4, text: 'Vue项目组件化设计模式' },
  { id: 5, text: 'React项目路由配置问题' },
  { id: 6, text: 'Vue项目状态管理模式Vue项目状态管理模式' },
]);
const activeChatItemIndex = ref(null);

function handleNewChat() {
  console.log('新对话', searchValue.value);
}
</script>

<style scoped lang="scss">
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

      .operation-item {
        font-size: 14px;
        font-weight: 500;
        padding: 4px;
        border-radius: 4px;
        color: #333;
        cursor: pointer;
        transition: all 0.3s ease-in-out;

        &:hover {
          background-color: #eaeaed;
        }
      }
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
    .chat-history {
      padding: 0 20px;
      overflow: auto;
      .chat-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: sticky;
        top: 0;
        height: 34px;
        background: #f8f8f7;
        .title-text {
          font-size: 13px;
          color: #1111334d;
        }
      }
      .chat-list {
        padding-bottom: 12px;
        .chat-item {
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 12px;
          margin: 0 -12px 4px -12px;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s linear;
          .chat-text {
            font-size: 14px;
            color: #111133b3;
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            padding-right: 10px;
          }
          .chat-icon {
            opacity: 0;
          }
          &.active,
          &:hover {
            background-color: #ececef;
            .chat-icon {
              opacity: 1;
            }
          }
        }
      }
    }
  }
}
</style>

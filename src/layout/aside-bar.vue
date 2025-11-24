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
      <div class="new-chat">
        <a-button
          v-if="!isSearchVisible"
          block
          :icon="h(SvgIcon, { name: 'new_chat', style: 'margin-right: 4px' })"
          @click="handleNewChat"
        >
          新对话
        </a-button>
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
              <a-dropdown trigger="click">
                <a class="ant-dropdown-link" @click.prevent>
                  <EllipsisOutlined style="font-size: 14px" />
                </a>
                <template #overlay>
                  <a-menu class="chat-menu">
                    <a-menu-item>
                      <view class="chat-menu-item">
                        <PushpinOutlined />
                        <span>置顶此对话</span>
                      </view>
                    </a-menu-item>
                    <a-menu-item>
                      <view class="chat-menu-item">
                        <ControlOutlined />
                        <span>批量管理</span>
                      </view>
                    </a-menu-item>
                    <a-sub-menu key="session" title="导出会话" :icon="h(VerticalAlignBottomOutlined)">
                      <a-menu-item>PDF</a-menu-item>
                      <a-menu-item>Json</a-menu-item>
                    </a-sub-menu>
                    <div class="ant-dropdown-menu-item-separator"></div>
                    <a-menu-item>
                      <view class="chat-menu-item delete">
                        <DeleteOutlined />
                        <span>删除此对话</span>
                      </view>
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
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
  PushpinOutlined,
  ControlOutlined,
  DeleteOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons-vue';
import {
  Tooltip as ATooltip,
  Button as AButton,
  Input as AInput,
  Dropdown as ADropdown,
  Menu as AMenu,
  MenuItem as AMenuItem,
  SubMenu as ASubMenu,
} from 'ant-design-vue';
import SvgIcon from '@/components/SvgIcon/index.vue';
import { userStore } from '@/store/userStore';

const emits = defineEmits(['toggleAside']);

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

function handleToggleAside() {
  // isSideBarCollapsed.value = !isSideBarCollapsed.value;
  userStore.toggleSideBarCollapsed();
}

function handleNewChat() {
  console.log('新对话', searchValue.value);
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
            padding: 4px;
            border-radius: 4px;
            &:hover {
              background-color: #e1e1e6;
            }
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

.chat-menu {
  .ant-dropdown-menu-item {
    &:has(.delete) {
      &:hover {
        background-color: #fff2f2;
      }
      .chat-menu-item {
        color: #ff4d4f;
      }
    }
  }
  .ant-dropdown-menu-item-separator {
    background: #f3f3f5;
    height: 1px;
    margin: 4px -4px;
  }
  .chat-menu-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .ant-dropdown-menu-item-icon {
    margin-inline-end: 4px !important;
  }
}
</style>

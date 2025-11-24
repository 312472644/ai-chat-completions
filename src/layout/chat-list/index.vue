<template>
  <div class="chat-list-box">
    <div class="new-chat">
      <Search v-model:showSearch="showSearch" v-model="chatList" />
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
          v-for="(item, index) in chatList"
          class="chat-item"
          :class="{ active: index === activeChatItemIndex }"
          @click="activeChatItemIndex = index"
        >
          <div class="chat-text">{{ item.text }}</div>
          <div class="chat-icon">
            <ChatItemDropdown />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, h, useTemplateRef, watch, nextTick } from 'vue';
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons-vue';
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
import ChatItemDropdown from './chat-item-dropdown.vue';
import Search from './search.vue';

const showSearch = defineModel('isSearchVisible', {
  type: Boolean,
  default: () => false,
});

const chatList = ref([]);
// const SearchInput = useTemplateRef('SearchInput');
// const searchValue = ref('');
// const chatItems = [
//   { id: 1, text: 'Axios请求取消机制问题' },
//   { id: 2, text: 'Vue项目开发技术问题咨询' },
//   { id: 3, text: 'React项目性能优化建议' },
//   { id: 4, text: 'Vue项目组件化设计模式' },
//   { id: 5, text: 'React项目路由配置问题' },
//   { id: 6, text: 'Vue项目状态管理模式Vue项目状态管理模式' },
// ];
// const searchChatItems = ref(structuredClone(chatItems));
const activeChatItemIndex = ref(null);
</script>
<style lang="scss">
.chat-list-box {
  height: 100%;
  overflow: auto;
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
.chat-menu {
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

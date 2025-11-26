<template>
  <div class="chat-list-box">
    <div class="new-chat">
      <Search v-model:show-search="showSearch" v-model="modelList" v-model:is-search-result="isSearchResult" />
    </div>
    <div class="chat-history">
      <div class="chat-title">
        <span class="title-text">最近对话</span>
        <span>
          <ATooltip placement="bottom">
            <template #title>
              <span>对话管理</span>
            </template>
            <SvgIcon name="controls" style="font-size: 15px; color: #333; cursor: pointer" />
          </ATooltip>
        </span>
      </div>
      <div v-if="historyChatList.length" class="chat-list">
        <div
          v-for="(item, index) in historyChatList"
          :key="item.id"
          class="chat-item"
          :class="{ active: index === activeChatItemIndex }"
          @click="activeChatItemIndex = index"
        >
          <div class="chat-text">
            <span class="text" v-html="item.text" />
            <span v-if="item.isPinned" class="pin-icon">
              <PushpinOutlined style="font-size: 14px" />
            </span>
          </div>
          <div v-if="!isSearchResult" class="chat-icon">
            <ADropdown trigger="click">
              <a class="ant-dropdown-link" @click.prevent>
                <EllipsisOutlined style="font-size: 14px" />
              </a>
              <template #overlay>
                <AMenu class="chat-menu">
                  <AMenuItem>
                    <view class="chat-menu-item" @click="() => handlePinChat(item)">
                      <PushpinOutlined />
                      <span>
                        {{ item.isPinned ? '取消置顶' : '置顶此对话' }}
                      </span>
                    </view>
                  </AMenuItem>
                  <AMenuItem>
                    <view class="chat-menu-item">
                      <ControlOutlined />
                      <span>批量管理</span>
                    </view>
                  </AMenuItem>
                  <ASubMenu key="session" title="导出会话" :icon="h(VerticalAlignBottomOutlined)">
                    <AMenuItem>PDF</AMenuItem>
                    <AMenuItem>Json</AMenuItem>
                  </ASubMenu>
                  <div class="ant-dropdown-menu-item-separator" />
                  <AMenuItem>
                    <view class="chat-menu-item delete" @click="handleDeleteChat(item)">
                      <DeleteOutlined />
                      <span>删除此对话</span>
                    </view>
                  </AMenuItem>
                </AMenu>
              </template>
            </ADropdown>
          </div>
        </div>
      </div>
      <div v-else class="empty-item">
        <AEmpty :image="Empty.PRESENTED_IMAGE_SIMPLE" description="暂无对话记录" />
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ControlOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  PushpinOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons-vue';
import {
  Dropdown as ADropdown,
  Empty as AEmpty,
  Menu as AMenu,
  MenuItem as AMenuItem,
  SubMenu as ASubMenu,
  Tooltip as ATooltip,
  Empty,
  Modal,
} from 'ant-design-vue';
import { h, ref, shallowRef, watch } from 'vue';
import SvgIcon from '@/components/SvgIcon/index.vue';
import { deepClone } from '@/utils';
import Search from './search.vue';

const showSearch = defineModel('isSearchVisible', {
  type: Boolean,
  default: () => false,
});

const modelList = ref([]);
// 是否搜索结果（搜索结果不展示菜单）
const isSearchResult = ref(false);
// 历史对话列表，用于展示
const historyChatList = ref([]);
// 原始列表，用于排序
const originList = shallowRef([]);
const activeChatItemIndex = ref(null);

/**
 * 置顶对话后，需要重新排序
 * 1、如果a,b已经置顶，那么排到数组前面后在根据originList的index排序
 * 2、如果a,b都没有置顶，那么根据originList的index排序
 * 3、如果a置顶,b没有置顶，那么a排到数组前面
 * 4、如果a没有置顶,b置顶，那么b排到数组前面
 */
function sortList(list, originList) {
  return list.toSorted((a, b) => {
    const aIndex = originList.findIndex(item => item.id === a.id);
    const bIndex = originList.findIndex(item => item.id === b.id);
    if (a.isPinned && !b.isPinned) {
      return -1;
    }
    if (!a.isPinned && b.isPinned) {
      return 1;
    }
    return aIndex - bIndex;
  });
}

function handlePinChat(item) {
  const originIndex = originList.value.findIndex(_ => _.id === item.id);
  if (originIndex === -1) {
    return;
  }
  const list = (historyChatList.value || []).map(_ => {
    if (_.id === item.id) {
      _.isPinned = !_.isPinned;
    }
    return _;
  });
  const sortedList = sortList(list, originList.value);
  const activeIndex = sortedList.findIndex(_ => item.id === _.id);
  activeChatItemIndex.value = activeIndex;
  historyChatList.value = sortedList;
}

function handleDeleteChat(item) {
  Modal.confirm({
    title: '确认删除这 1 条对话记录吗？',
    content: '删除后将无法恢复，是否继续？',
    okText: '确认',
    cancelText: '取消',
    okType: 'danger',
    onOk: () => {
      const index = historyChatList.value.findIndex(_ => _.id === item.id);
      if (index === -1) {
        return;
      }
      historyChatList.value.splice(index, 1);
    },
  });
}

watch(
  () => modelList.value,
  newVal => {
    historyChatList.value = deepClone([...newVal]);
    if (newVal.length > 0 && originList.value.length === 0) {
      originList.value = [...modelList.value].map((item, index) => ({ ...item, index }));
      historyChatList.value = sortList(modelList.value, originList.value);
    }
  },
  { deep: true }
);

watch(
  () => isSearchResult.value,
  newVal => {
    if (!newVal) {
      historyChatList.value = sortList(modelList.value, originList.value);
    }
  }
);
</script>

<style lang="scss">
.chat-list-box {
  height: 100%;
  display: flex;
  flex-direction: column;
  .chat-history {
    padding: 0 20px;
    overflow: auto;
    flex: 1;
    min-height: 0;
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
          display: flex;
          font-size: 14px;
          color: #111133b3;
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          padding-right: 10px;
          .text {
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
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
      .pin-icon {
        margin-left: 4px;
      }
    }
    .empty-item {
      margin: 20px 0;
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

.ant-dropdown-menu-item {
  &:has(.delete) {
    &:hover {
      background-color: #fff2f2 !important;
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
</style>

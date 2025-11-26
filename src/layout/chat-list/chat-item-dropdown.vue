<template>
  <ADropdown trigger="click">
    <a class="ant-dropdown-link" @click.prevent>
      <EllipsisOutlined style="font-size: 14px" />
    </a>
    <template #overlay>
      <AMenu class="chat-menu">
        <AMenuItem>
          <view class="chat-menu-item" @click="handlePinChat">
            <PushpinOutlined />
            <span>{{ props.item.isPinned ? '取消置顶' : '置顶此对话' }}</span>
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
          <view class="chat-menu-item delete" @click="handleDeleteChat">
            <DeleteOutlined />
            <span>删除此对话</span>
          </view>
        </AMenuItem>
      </AMenu>
    </template>
  </ADropdown>
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
  Menu as AMenu,
  MenuItem as AMenuItem,
  SubMenu as ASubMenu,
  Tooltip as ATooltip,
} from 'ant-design-vue';
import { defineEmits, h, watch } from 'vue';

const props = defineProps({
  item: {
    type: Object,
    required: true,
    default: () => {},
  },
  list: {
    type: Array,
    required: true,
    default: () => [],
  },
});

const emit = defineEmits(['refresh']);

let originList = [];

/**
 * 置顶对话后，需要重新排序
 * 1、如果a,b已经置顶，那么排到数组前面后在根据originList的index排序
 * 2、如果a,b都没有置顶，那么根据originList的index排序
 * 3、如果a置顶,b没有置顶，那么a排到数组前面
 * 4、如果a没有置顶,b置顶，那么b排到数组前面
 * @param list
 */
function sortList(list) {
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

function handlePinChat() {
  const originIndex = originList.findIndex(item => item.id === props.item.id);
  if (originIndex === -1) {
    return;
  }
  const list = (props.list || []).map(item => {
    if (item.id === props.item.id) {
      item.isPinned = !item.isPinned;
    }
    return item;
  });
  const sortedList = sortList(list);
  const activeIndex = sortedList.findIndex(item => item.id === props.item.id);
  emit('refresh', { activeIndex, list: sortedList });
}

function handleDeleteChat() {
  emit('refresh', { list: [] });
}

watch(
  () => props.list,
  newVal => {
    if (newVal.length > 0 && originList.length === 0) {
      // 初始化时，需要根据isPinned排序
      originList = [...newVal].map((item, index) => ({ ...item, index }));
      emit('refresh', { activeIndex: null, list: sortList(originList) });
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss">
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

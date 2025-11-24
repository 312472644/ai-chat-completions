<template>
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
</template>
<script setup>
import { h } from 'vue';
import {
  EllipsisOutlined,
  PushpinOutlined,
  ControlOutlined,
  DeleteOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons-vue';
import {
  Tooltip as ATooltip,
  Dropdown as ADropdown,
  Menu as AMenu,
  MenuItem as AMenuItem,
  SubMenu as ASubMenu,
} from 'ant-design-vue';
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

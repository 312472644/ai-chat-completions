<template>
  <ADropdown placement="top">
    <PaperClipOutlined style="font-size: 20px" />
    <template #overlay>
      <AMenu>
        <AMenuItem>
          <InputUpload v-model="fileList" accept=".pdf,.docx,.doc,.txt,.xlsx,.xls,.ppt,.pptx" label="上传文档" />
        </AMenuItem>
        <AMenuItem>
          <InputUpload v-model="fileList" accept="image/*" label="上传图片" />
        </AMenuItem>
      </AMenu>
    </template>
  </ADropdown>
</template>

<script setup>
import { PaperClipOutlined } from '@ant-design/icons-vue';
import { Dropdown as ADropdown, Menu as AMenu, MenuItem as AMenuItem } from 'ant-design-vue';
import InputUpload from './InputUpload.vue';

const fileList = defineModel('modelValue', {
  type: Array,
  default: () => [],
});
</script>

<style lang="scss">
.attachment-container {
}
</style>

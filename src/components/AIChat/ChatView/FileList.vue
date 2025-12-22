<template>
  <div class="file-container">
    <div v-for="item in fileList" :key="item.id" class="attachment-item" @click="handleClick(item)">
      <div class="close-container" @click.stop="removeFile(item.id)">
        <div class="close">
          <CloseOutlined style="font-size: 14px" />
        </div>
      </div>
      <!-- 图片 -->
      <div v-if="item.type === 'image'" class="file-item item-image">
        <img class="img" style="" :src="item.url" alt="image" />
      </div>
      <!-- 文档附件 -->
      <div v-else class="file-item doc-file">
        <div class="file-icon">
          <component :is="getFileIcon(item)" style="font-size: 20px; color: #666" />
        </div>
        <div class="file-content">
          <div class="file-name">{{ item.name }}</div>
          <div class="file-size">{{ item.size }}</div>
        </div>
      </div>
    </div>
    <AImage
      style="display: none"
      class="item-image"
      :src="currentFile?.url"
      :preview="{
        visible: previewVisible,
        onVisibleChange: setVisible,
      }"
      alt="image"
    />
  </div>
</template>

<script setup>
import {
  CloseOutlined,
  FileExcelOutlined,
  FileMarkdownOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  FileWordOutlined,
} from '@ant-design/icons-vue';
import { Image as AImage } from 'ant-design-vue';
import { ref } from 'vue';

const fileList = defineModel('modelValue', {
  type: Array,
  default: () => [],
});

const currentFile = ref(null);
const previewVisible = ref(false);

function getFileIcon(item) {
  const ext = item.ext.toLowerCase();
  if (ext === 'pdf') {
    return FilePdfOutlined;
  }
  if (['docx', 'doc'].includes(ext)) {
    return FileWordOutlined;
  }
  if (['xlsx', 'xls'].includes(ext)) {
    return FileExcelOutlined;
  }
  if (['ppt', 'pptx'].includes(ext)) {
    return FileMarkdownOutlined;
  }
  return FileTextOutlined;
}

function setVisible(visible) {
  previewVisible.value = visible;
}

function removeFile(id) {
  fileList.value = fileList.value.filter(item => item.id !== id);
}

function handleClick(item) {
  if (item.type === 'image') {
    currentFile.value = item;
    previewVisible.value = true;
  }
}
</script>

<style lang="scss">
.file-container {
  display: flex;
  gap: 10px;
  .attachment-item {
    margin-top: 12px;
    position: relative;
    .close-container {
      position: absolute;
      top: -8px;
      right: -10px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: #fff;
      border: 1px solid #dddfe2;
      cursor: pointer;
      transition: transform 0.2s ease-in-out;
      transform: scale(0);
      .close {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      }
    }
    &:hover {
      .close-container {
        background-color: #f5f6f7;
        display: block;
        transform: scale(1);
      }
    }

    .file-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      border-radius: 8px;
      border: 1px solid #dcdee2;
      padding: 2px;
      width: 100%;
      height: 100%;
    }

    .item-image {
      width: 44px;
      height: 44px;
      .img {
        width: 44px;
        height: 44px;
        object-fit: contain;
        border-radius: 8px;
      }
    }

    .doc-file {
      padding: 8px;
      min-width: 150px;
      max-width: 205px;
      flex-direction: row;
      gap: 8px;
      .file-content {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
        min-width: 0;
        .file-name,
        .file-size {
          font-size: 13px;
          color: #333;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .file-size {
          font-size: 13px;
          color: #808080;
        }
      }
    }
  }
}
</style>

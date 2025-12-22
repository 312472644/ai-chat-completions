<template>
  <div class="file">
    <label :for="uid" style="color: #333">{{ label }}</label>
    <input :id="uid" ref="fileInputRef" class="input-file" type="file" :accept="accept" @change="handleUploadChange" />
  </div>
</template>

<script setup>
import { message, Modal } from 'ant-design-vue';
import { ref } from 'vue';

defineProps({
  label: {
    type: String,
    default: '上传图片',
  },
  accept: {
    type: String,
    default: '*',
  },
});

const fileList = defineModel('modelValue', {
  type: Array,
  default: () => [],
});
const uid = ref(crypto.randomUUID());
const fileInputRef = ref(null);

function getFileSize(size) {
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`;
  }
  if (size < 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(2)} MB`;
  }
  return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function coverFile() {
  return new Promise(res => {
    Modal.confirm({
      title: '确认覆盖',
      content: '确认覆盖已存在文件',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        fileList.value = [];
        res(true);
      },
      onCancel: () => {
        res(false);
      },
    });
  });
}

async function beforeUpload(file, fileType) {
  // 文件和图片不能同时上传
  if (fileType === 'file') {
    const isExistImage = fileList.value.some(item => item.type === 'image');
    if (isExistImage) {
      return await coverFile();
    }
  }
  if (fileType === 'image') {
    const isExistFile = fileList.value.some(item => item.type === 'file');
    if (isExistFile) {
      return await coverFile();
    }
  }
  const isExist = fileList.value.find(item => item.name === file.name);
  if (isExist) {
    message.error('文件已经存在');
    return false;
  }
  return true;
}

async function handleUploadChange(e) {
  const file = e.target.files[0];
  const fileType = file.type.includes('image') ? 'image' : 'file';
  const isPass = await beforeUpload(file, fileType);
  if (!isPass) {
    return;
  }
  const fileItem = {
    id: crypto.randomUUID(),
    name: file.name,
    type: fileType,
    size: getFileSize(file.size),
    ext: file.name.split('.').pop(),
    url: '',
  };
  // 图片需要转换为base64
  if (fileItem.type === 'image') {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      fileItem.url = reader.result;
      fileList.value.push(fileItem);
    };
  }
  // 文件直接添加
  else {
    fileList.value.push(fileItem);
  }
  fileInputRef.value.value = '';
}
</script>

<style lang="scss">
.file {
  position: relative;
  .input-file {
    opacity: 0;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
}
</style>

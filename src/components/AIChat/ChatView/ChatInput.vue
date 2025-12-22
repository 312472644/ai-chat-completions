<template>
  <textarea
    v-model="question"
    class="textarea"
    :rows="4"
    :placeholder="isTempSession ? '临时对话不会被记录，退出将会自动清除' : '想和AI聊一聊什么？🧐'"
    @keydown.enter.exact.prevent="handleChat"
    @paste="handlePaste"
  />
</template>

<script setup>
import { Modal } from 'ant-design-vue';
import { ref } from 'vue';

defineProps({
  isTempSession: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(['chat']);

const question = defineModel('modelValue', {
  type: String,
  default: '',
});
const fileList = defineModel('file-list', {
  type: Array,
  default: () => [],
});

function handleChat() {
  emits('chat', question.value);
}

function coverFile() {
  return new Promise((res, rej) => {
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
        rej(new Error('用户取消覆盖'));
      },
    });
  });
}

function readFileAsDataURL(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      res(reader.result);
    };
    reader.onerror = () => {
      rej(new Error('读取文件失败'));
    };
  });
}

function handlePaste(e) {
  e.preventDefault();
  const items = e.clipboardData.items;
  if (items.length === 0) {
    return;
  }
  for (const item of items) {
    const isImages = item.type.includes('image');
    if (!isImages) {
      continue;
    }
    const isExistFile = fileList.value.some(item => item.type === 'file');
    const blob = item.getAsFile();
    if (isExistFile) {
      coverFile().then(() => {
        readFileAsDataURL(blob).then(url => {
          fileList.value.push({
            id: crypto.randomUUID(),
            name: blob.name,
            url,
            type: 'image',
          });
        });
      });
      continue;
    }
    readFileAsDataURL(blob).then(url => {
      fileList.value.push({
        id: crypto.randomUUID(),
        name: blob.name,
        url,
        type: 'image',
      });
    });
  }
}
</script>

<style lang="scss"></style>

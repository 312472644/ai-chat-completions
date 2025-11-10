<template>
  <div ref="MessageContentRef" class="message-container">
    <div class="chat-list-container">
      <div v-if="chatMessage.messages.length" class="chat-list">
        <div
          data-type="chat-item"
          v-for="(item, index) in chatMessage.messages"
          :class="{ 'chat-item': true, delete: isDeleteMode, checked: item.checked }"
          :key="index"
          :id="item.id"
        >
          <div v-if="item[Role.USER]" class="question-item-box" :id="item[Role.USER].id">
            <div v-if="isDeleteMode" class="question-meta">
              <ACheckbox v-model:checked="item.checked" />
            </div>
            <div class="question-item">
              {{ item[Role.USER].content }}
            </div>
          </div>
          <!--已经完成的对话-->
          <div v-if="item[Role.ASSISTANT]?.content" class="answer-item-box" :id="item[Role.ASSISTANT].id">
            <div class="answer-meta">
              <div class="model-code">{{ item[Role.ASSISTANT].modelCode }}</div>
              <div class="create-time">
                {{ item[Role.ASSISTANT].createTime }}
              </div>
            </div>
            <div class="answer-content">
              <!--历史记录-->
              <div class="markdown-output" v-html="item[Role.ASSISTANT].content"></div>
            </div>
            <AnswerTool
              v-if="!isDeleteMode"
              :item="item"
              :showRefresh="index === chatMessage.messages.length - 1"
              @delete="handleDelete"
              @refresh="handleRefresh"
            />
          </div>
          <!--正在输出的对话-->
          <div v-else class="answer-item-box" :id="item?.[Role.ASSISTANT]?.id">
            <div v-if="index === chatMessage.messages.length - 1" class="answer-meta">
              <div class="model-code">{{ chatMessage.currentMessage.modelCode }}</div>
              <div class="create-time">
                {{ chatMessage.currentMessage.createTime }}
              </div>
            </div>
            <!--加载动画-->
            <div v-if="index === chatMessage.messages.length - 1 && loading && !renderHtml" class="cursor"></div>
            <div class="answer-content">
              <!--正在渲染-->
              <div ref="MarkdownRef" class="markdown-output" v-html="renderHtml"></div>
            </div>
          </div>
        </div>
        <div v-if="showScrollButton" @click="scrollToBottom" class="scroll-to-bottom">
          <div class="bottom-btn" :class="{ loading: loading }">
            <SvgIcon name="arrow_upward" size="1em" class="arrow" />
          </div>
        </div>
      </div>
      <!--AI建议列表-->
      <SuggestionList :list="chatMessage.suggestionList" @suggestion-click="item => $emit('suggestion-click', item)" />
    </div>
  </div>
  <!--删除按钮-->
  <div v-if="isDeleteMode" class="delete-container">
    <AButton class="delete-item" @click="handleDelete">取消</AButton>
    <AButton class="delete-item" @click="handleDeleteAll">删除全部</AButton>
    <AButton class="delete-item" type="primary" @click="handleDeleteSelected">删除选中</AButton>
  </div>
  <!--选中文字后菜单-->
  <SelectedMenu :MessageContentRef="MessageContentRef" @quote-selected="text => $emit('quote-selected', text)" />
</template>
<script setup>
import { computed, onMounted, ref, onBeforeUnmount, nextTick, watch } from 'vue';
import {
  Popover as APopover,
  Tooltip as ATooltip,
  Checkbox as ACheckbox,
  Button as AButton,
  message,
  Modal,
} from 'ant-design-vue';
import SelectedMenu from './SelectedMenu.vue';

import AnswerTool from './AnswerTool.vue';
import SuggestionList from './SuggestionList.vue';
import SvgIcon from '@/components/SvgIcon/index.vue';

import { Role } from '../scripts/config.js';
import useMarked from '../scripts/useMarked.js';
import { scrollToBottom as _scrollToBottom } from '../scripts/utils.js';

const emits = defineEmits(['refresh', 'suggestion-click', 'delete', 'quote-selected']);

const props = defineProps({
  chatMessage: {
    type: Object,
    default: () => {},
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const MessageContentRef = ref(null);
const SelectedMenuRef = ref(null);

const showToBottomBtn = ref(false);
// 是否自动滚动
const isAutoScroll = ref(true);
const isDeleteMode = ref(false);

const { parseMarkdown, initMarked } = useMarked();

const showScrollButton = computed(() => {
  if (props.loading) {
    return !isAutoScroll.value;
  } else {
    return showToBottomBtn.value;
  }
});

const renderHtml = computed(() => {
  const responseMarkdownText = props.chatMessage.currentMessage.markdown;
  if (!responseMarkdownText) return '';
  if (isAutoScroll.value) {
    scrollToBottom();
  }
  return parseMarkdown(responseMarkdownText);
});

const checkedItems = computed(() => props.chatMessage.messages.filter(item => item.checked));

function handleRefresh() {
  // 删除最后一条数据，重新请求
  const lastItem = props.chatMessage.messages.splice(props.chatMessage.messages.length - 1, 1);
  if (!lastItem.length) return;
  const question = lastItem[0][Role.USER].content;
  emits('refresh', { text: question });
}

function handleDelete() {
  isDeleteMode.value = !isDeleteMode.value;
  emits('delete', isDeleteMode.value);
}

function handleDeleteAll() {
  Modal.confirm({
    title: '提示',
    content: '确定要删除所有项吗？',
    cancelText: '取消',
    okText: '确认',
    onOk: () => {
      props.chatMessage.messages = [];
      handleDelete();
    },
  });
}

function handleDeleteSelected() {
  const checkedItems = props.chatMessage.messages.filter(item => item.checked);
  if (!checkedItems.length) {
    message.warn('请选择要删除的项');
    return;
  }
  const checkedLength = checkedItems.length;
  Modal.confirm({
    title: '提示',
    content: `确定要删除 ${checkedLength} 条选中项吗？`,
    cancelText: '取消',
    okText: '确认',
    onOk: () => {
      props.chatMessage.messages = props.chatMessage.messages.filter(item => !item.checked);
      handleDelete();
    },
  });
}

function handleScroll() {
  const messageContentDOM = MessageContentRef.value;
  if (!messageContentDOM) return false;
  const { scrollTop, scrollHeight, clientHeight } = messageContentDOM;
  if (!scrollTop) return;
  showToBottomBtn.value = scrollHeight - (scrollTop + clientHeight) > 0;
}

function scrollToBottom(isSmooth) {
  loadComplete();
  _scrollToBottom(MessageContentRef.value, isSmooth);
}

function handleWheel() {
  isAutoScroll.value = false;
}

function loadComplete() {
  isAutoScroll.value = true;
  handleScroll();
}

async function init() {
  await nextTick();
  await initMarked(MessageContentRef.value);
  MessageContentRef.value.addEventListener('scroll', handleScroll);
  window.addEventListener('wheel', handleWheel);
}

onMounted(() => init());

onBeforeUnmount(() => {
  MessageContentRef.value.removeEventListener('scroll', handleScroll);
  window.removeEventListener('wheel', handleWheel);
  window.removeEventListener('selectionchange', handleSelectionChange);
});

defineExpose({ scrollToBottom });

watch(
  () => props.loading,
  val => {
    if (!val) {
      loadComplete();
    }
  }
);
</script>
<style lang="scss">
.message-container {
  flex: 1;
  min-height: 0;
  overflow: auto;
  $max-width: 896px;
  .chat-list-container {
    margin: 0 auto;
    max-width: $max-width;
  }

  .chat-list {
    padding: 12px 4px 0 0;
    .chat-item {
      &.delete {
        background-color: #fafafb;
        padding: 16px;
        margin-bottom: 28px;
        border-radius: 10px;
      }
      &.checked {
        box-shadow: 1px 1px 1px #ff4d4f, 0px -1px 1px #ff4d4f, -1px 0px 1px #ff4d4f;
      }
    }
    .question-item-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .question-item {
        margin-left: auto;
        background-color: #f1f3f5;
        padding: 10px 12px;
        border-radius: 16px 0 16px 16px;
        margin-bottom: 8px;
        max-width: 50%;
        word-break: break-word;
      }
    }

    .answer-item-box {
      .answer-meta {
        display: flex;
        margin-bottom: 8px;
        gap: 4px;
        align-items: baseline;
        .model-code {
          font-size: 18px;
          color: #808695;
        }
        .create-time {
          font-size: 12px;
          color: #c5c8ce;
        }
      }
    }

    .cursor {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background-color: #dcdee2;
      animation: blink 1s ease-in-out infinite;
    }

    .scroll-to-bottom {
      position: absolute;
      bottom: 200px;
      left: 50%;
      transform: translate(-50%, -50%) rotate(180deg);
      .bottom-btn {
        position: relative;
        background: #f8f8f8;
        color: #808695;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        border: 1px solid #e8eaec;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

        &.loading {
          &::after {
            content: '';
            position: absolute;
            background: url('../../../assets/images/loading.png') no-repeat center center;
            background-size: 100% 100%;
            width: 100%;
            height: 100%;
            animation: rotate 1s linear infinite;
          }
        }
      }
    }

    @keyframes rotate {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    @keyframes blink {
      0%,
      100% {
        opacity: 0;
      }
      50% {
        opacity: 1;
      }
    }
  }
}

.delete-container {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 12px 0;
}
</style>

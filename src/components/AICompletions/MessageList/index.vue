<template>
  <div ref="MessageContentRef" class="message-container">
    <div class="chat-list-container">
      <div v-if="chatMessage.messages.length" class="chat-list">
        <div
          v-for="(item, index) in chatMessage.messages"
          :id="item.id"
          :key="index"
          data-type="chat-item"
          class="chat-item"
          :class="{ delete: isDeleteMode, checked: item.checked }"
        >
          <div v-if="item[Role.USER]" :id="item[Role.USER].id" class="question-item-box">
            <div v-if="isDeleteMode" class="question-meta">
              <ACheckbox v-model:checked="item.checked" />
            </div>
            <div class="question-item">
              {{ item[Role.USER].content }}
            </div>
          </div>
          <!-- 已经完成的对话 -->
          <div v-if="item[Role.ASSISTANT]?.content" :id="item[Role.ASSISTANT].id" class="answer-item-box">
            <div class="answer-meta">
              <div class="model-code">
                {{ item[Role.ASSISTANT].modelCode }}
              </div>
              <div class="create-time">
                {{ item[Role.ASSISTANT].createTime }}
              </div>
            </div>
            <div class="answer-content">
              <!-- 历史记录 -->
              <div class="markdown-output" v-html="item[Role.ASSISTANT].content" />
            </div>
            <AnswerTool
              v-if="!isDeleteMode"
              :item="item"
              :show-refresh="index === chatMessage.messages.length - 1"
              @delete="handleDelete"
              @refresh="handleRefresh"
            />
          </div>
        </div>
      </div>
      <!-- 正在渲染的对话 -->
      <div class="current-render answer-item-box" :class="{ stdin: loading }">
        <div class="answer-meta">
          <div class="model-code">
            {{ chatMessage.currentMessage.modelCode }}
          </div>
          <div class="create-time">
            {{ chatMessage.currentMessage.createTime }}
          </div>
        </div>
        <div class="answer-content">
          <div v-if="isFirstContentVisible" class="cursor" />
          <div ref="RenderRef" class="markdown-output" />
        </div>
      </div>
      <!-- 滚动到底部按钮 -->
      <div v-if="showScrollButton" class="scroll-to-bottom" @click="scrollToBottom">
        <div class="bottom-btn" :class="{ loading }">
          <SvgIcon name="arrow_upward" size="1em" class="arrow" />
        </div>
      </div>
      <!-- AI建议列表 -->
      <SuggestionList :list="chatMessage.suggestionList" @suggestion-click="item => $emit('suggestion-click', item)" />
    </div>
  </div>
  <!-- 删除按钮 -->
  <div v-if="isDeleteMode" class="delete-container">
    <AButton class="delete-item" @click="handleDelete"> 取消 </AButton>
    <AButton class="delete-item" @click="handleDeleteAll"> 删除全部 </AButton>
    <AButton class="delete-item" type="primary" @click="handleDeleteSelected"> 删除选中 </AButton>
  </div>
  <!-- 选中文字后菜单 -->
  <SelectedMenu :message-content-ref="MessageContentRef" @quote-selected="text => $emit('quote-selected', text)" />
</template>

<script setup>
import { Button as AButton, Checkbox as ACheckbox, message, Modal } from 'ant-design-vue';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import SvgIcon from '@/components/SvgIcon/index.vue';

import { chatStore } from '@/store/chatStore.js';
import { Role } from '../scripts/config.js';
import { scrollToBottom as toBottom } from '../scripts/utils.js';

import AnswerTool from './AnswerTool.vue';
import SelectedMenu from './SelectedMenu.vue';
import SuggestionList from './SuggestionList.vue';

const props = defineProps({
  chatMessage: {
    type: Object,
    default: () => {},
  },
});

const emits = defineEmits(['refresh', 'suggestion-click', 'delete', 'quote-selected']);

const { loading, isFirstContentVisible, setRenderDomRef } = chatStore();

// 当前组件实例
const MessageContentRef = ref(null);
// 渲染区域DOM
const RenderRef = ref(null);

const showToBottomBtn = ref(false);
// 是否自动滚动
const isAutoScroll = ref(true);
// 是否删除模式
const isDeleteMode = ref(false);
const interval = ref(false);

const showScrollButton = computed(() => {
  if (loading.value) {
    return !isAutoScroll.value;
  } else {
    return showToBottomBtn.value;
  }
});

function handleRefresh() {
  // 删除最后一条数据，重新请求
  // eslint-disable-next-line vue/no-mutating-props
  const lastItem = props.chatMessage.messages.splice(props.chatMessage.messages.length - 1, 1);
  if (!lastItem.length) {
    return;
  }
  const question = lastItem[0][Role.USER].content;
  emits('refresh', { text: question });
}

function handleDelete() {
  isDeleteMode.value = !isDeleteMode.value;
  emits('delete', isDeleteMode.value);
}

// TODO 接口调用删除全部
function handleDeleteAll() {
  Modal.confirm({
    title: '提示',
    content: '确定要删除所有项吗？',
    cancelText: '取消',
    okText: '确认',
    onOk: () => {
      // eslint-disable-next-line vue/no-mutating-props
      props.chatMessage.messages = [];
      handleDelete();
    },
  });
}

// TODO 接口调用删除选中
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
      // eslint-disable-next-line vue/no-mutating-props
      props.chatMessage.messages = props.chatMessage.messages.filter(item => !item.checked);
      handleDelete();
    },
  });
}

/**
 * 滚动事件绑定
 */
function handleScroll() {
  const messageContentDOM = MessageContentRef.value;
  if (!messageContentDOM) {
    return;
  }
  const { scrollTop, scrollHeight, clientHeight } = messageContentDOM;
  if (!scrollTop) {
    return;
  }
  showToBottomBtn.value = scrollHeight - (scrollTop + clientHeight) > 0;
}

function scrollToBottom(isSmooth) {
  loadComplete();
  nextTick().then(() => {
    toBottom(MessageContentRef.value, isSmooth);
  });
}

function handleWheel() {
  isAutoScroll.value = false;
}

function loadComplete() {
  isAutoScroll.value = true;
  handleScroll();
}

function autoScrollToBottom() {
  if (!isAutoScroll.value) {
    return;
  }
  interval.value = setInterval(() => {
    if (isAutoScroll.value) {
      scrollToBottom();
    }
  }, 500);
}

async function init() {
  await nextTick();
  setRenderDomRef(RenderRef.value);
  MessageContentRef.value.addEventListener('scroll', handleScroll);
  window.addEventListener('wheel', handleWheel);
}

onMounted(() => init());

onBeforeUnmount(() => {
  MessageContentRef.value.removeEventListener('scroll', handleScroll);
  window.removeEventListener('wheel', handleWheel);
  clearInterval(interval.value);
});

watch(
  () => loading.value,
  val => {
    if (!val) {
      clearInterval(interval.value);
      loadComplete();
      // 加载完成后，延时滚动到底部，底部可能还未加载完成
      setTimeout(() => {
        toBottom(MessageContentRef.value, true);
      }, 100);
    } else {
      autoScrollToBottom();
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
    padding: 12px;
  }

  .chat-list {
    padding: 0;
    .chat-item {
      &.delete {
        background-color: #fafafb;
        padding: 16px;
        margin-bottom: 28px;
        border-radius: 10px;
      }
      &.checked {
        box-shadow:
          1px 1px 1px #ff4d4f,
          0px -1px 1px #ff4d4f,
          -1px 0px 1px #ff4d4f;
      }
    }
    .question-item-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .question-item {
        margin-left: auto;
        background-color: #f1f3f5;
        padding: 10px 15px;
        border-radius: 16px 0 16px 16px;
        margin-bottom: 8px;
        max-width: 50%;
        font-size: 14px;
        word-break: break-word;
      }
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

  .cursor {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-color: #dcdee2;
    animation: blink 1s ease-in-out infinite;
  }

  .current-render {
    display: none;
    &.stdin {
      display: block;
    }
  }

  .stop-response {
    font-size: 14px;
    line-height: 25px;
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

.delete-container {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 12px 0;
}
</style>

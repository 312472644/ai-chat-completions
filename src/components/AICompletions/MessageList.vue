<template>
  <div ref="MessageContentRef" class="message-container">
    <div class="chat-list-container">
      <div v-if="chatMessage.messages.length" class="chat-list">
        <div data-type="chat-item" v-for="(item, index) in chatMessage.messages" :key="index" :id="item.id">
          <div v-if="item[Role.USER]" class="question-item-box" :id="item[Role.USER].id">
            <div class="question-item">
              {{ item[Role.USER].content }}
            </div>
          </div>
          <!--已经完成的对话-->
          <div v-if="item[Role.ASSISTANT]?.content" class="answer-item-box" :id="item[Role.ASSISTANT].id">
            <div class="answer-meta">
              <div class="model-code">{{ item[Role.ASSISTANT].modelCode || 'Qwen3-Max' }}</div>
              <div class="create-time">
                {{ item[Role.ASSISTANT].createTime }}
              </div>
            </div>
            <div class="answer-content">
              <!--历史记录-->
              <div class="markdown-output" v-html="item[Role.ASSISTANT].content"></div>
            </div>
            <div class="answer-tool"></div>
          </div>
          <!--正在输出的对话-->
          <div v-else class="answer-item-box" :id="item?.[Role.ASSISTANT]?.id">
            <div v-if="index === chatMessage.messages.length - 1" class="answer-meta">
              <div class="model-code">{{ chatMessage.currentMessage.modelCode || 'Qwen3-Max' }}</div>
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
            <div class="answer-tool"></div>
          </div>
        </div>
        <div v-if="showScrollButton" @click="scrollToBottom" class="scroll-to-bottom">
          <div class="bottom-btn" :class="{ loading: loading }" v-html="ArrowUpwardSvg"></div>
        </div>
      </div>
      <!--AI建议列表-->
      <div v-if="chatMessage.suggestionList.length" class="suggestion-list">
        <div
          v-for="(item, index) in chatMessage.suggestionList"
          :key="index"
          class="suggestion-item"
          @click="() => handleSuggestionClick(item)"
        >
          {{ item.text }}
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, onMounted, ref, onBeforeUnmount, nextTick, watch } from 'vue';
import { Role } from './scripts/config.js';
import useMarked from './scripts/useMarked.js';
import { scrollToBottom as _scrollToBottom, getUniqueid, formatTime } from './scripts/utils.js';

import ArrowUpwardSvg from '@/assets/arrow_upward.svg?raw';

const emits = defineEmits(['suggestion-click']);

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
const showToBottomBtn = ref(false);
// 是否自动滚动
const isAutoScroll = ref(true);

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

function handleScroll() {
  const messageContentDOM = MessageContentRef.value;
  if (!messageContentDOM) return false;
  const { scrollTop, scrollHeight, clientHeight } = messageContentDOM;
  showToBottomBtn.value = scrollHeight - (scrollTop + clientHeight) > 0;
}

function scrollToBottom(isSmooth) {
  loadComplete();
  _scrollToBottom(MessageContentRef.value, isSmooth);
}

function handleSuggestionClick(item) {
  emits('suggestion-click', item);
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
<style lang="scss" scoped>
.message-container {
  flex: 1;
  min-height: 0;
  overflow: auto;
  $max-width: 896px;
  .chat-list-container {
    margin: 0 auto;
    max-width: $max-width;
  }
  .suggestion-list {
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    display: flex;
    gap: 12px;
    .suggestion-item {
      color: rgba(17, 17, 51, 0.7);
      font-size: 14px;
      border-radius: 12px;
      padding: 12px 16px;
      display: flex;
      background-color: #fafafb;
      transition: background-color 0.3s ease-in-out;
      &:hover {
        cursor: pointer;
        background-color: #e8eaec;
      }
    }
  }
  .chat-list {
    padding: 12px 4px 0 0;
    .question-item-box {
      display: flex;
      justify-content: flex-end;
      .question-item {
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
      .answer-content {
      }
      .answer-tool {
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
            background: url('../../assets/loading.png') no-repeat center center;
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
</style>

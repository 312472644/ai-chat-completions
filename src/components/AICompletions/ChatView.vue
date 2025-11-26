<template>
  <div class="ai-input-container">
    <div class="input-box">
      <!-- 引用 -->
      <div v-if="quoteText" class="quote-container">
        <AAlert closable @close="quoteText = ''">
          <template #message>
            <div class="quote-message">
              <span style="padding-right: 8px; font-weight: bold">引用</span>
              <span class="quote-text">{{ quoteText }}</span>
            </div>
          </template>
        </AAlert>
      </div>
      <div class="chat-textarea">
        <textarea
          v-model="question"
          class="textarea"
          :rows="4"
          placeholder="请输入内容"
          @keydown.enter.exact.prevent="handleChat"
        />
      </div>
      <div class="function-area">
        <div class="left" />
        <div class="right">
          <div v-if="!loading" class="operation-btn" :class="{ disabled: !question }" @click="handleChat">
            <SvgIcon name="arrow_upward" size="20px" class="arrow" />
          </div>
          <div v-else class="operation-btn-stop" @click="handleStop">
            <SvgIcon name="paused" size="32px" class="pause" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Alert as AAlert, message } from 'ant-design-vue';
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import SvgIcon from '@/components/SvgIcon/index.vue';
import { useStreamingMarkdown } from '@/composables/useStreamingMarkdown/index.js';
import { chatStore } from '@/store/chatStore.js';
import { Role } from './scripts/config.js';

import { Message } from './scripts/message.js';

const emits = defineEmits(['finish']);

// 对外暴露的消息对象
const chatMessage = defineModel('modelValue', { default: new Message() });
const { loading, renderDomRef, updateLoading, updateFirstContentVisible } = chatStore();

const question = ref('');
const quoteText = ref('');

const streamMarkdown = ref({
  isLoading: false,
  error: '',
  isAbort: false,
  isFCP: false,
  markdown: null,
  fetchStream: () => {},
  cancel: () => {},
  release: () => {},
});

function getRenderContent() {
  const lastMessage = chatMessage.value.getLastMessage();
  if (!lastMessage) {
    return '';
  }
  // 获取当前正在渲染的markdown内容
  const renderHTML = renderDomRef.value?.innerHTML || '';
  return renderHTML.concat(streamMarkdown.value.isAbort ? '\n\n <div class="stop-response">已停止响应。</div>' : '');
}

function addUserMsg() {
  // 新增用户消息到消息列表
  chatMessage.value.addUser({ content: question.value, quoteText: quoteText.value });
  chatMessage.value.clearSuggestionList();
  chatMessage.value.updateCurrentMessage({});
}

function addAssistantMsg() {
  // 新增当前回复消息到消息列表
  chatMessage.value.addAssistant({
    markdown: streamMarkdown.value.markdown,
    quoteText: quoteText.value,
    content: getRenderContent(),
    isAborted: streamMarkdown.value.isAbort,
  });
}

function getBodyParams() {
  return JSON.stringify({
    stream: true,
    messages: [{ role: Role.USER, content: question.value }],
  });
}

async function beforeRequestChat() {
  addUserMsg();
  const bodyParams = getBodyParams();
  question.value = '';
  return bodyParams;
}

function finallyRequestChat() {
  addAssistantMsg();
  chatMessage.value.clearCurrentMessage();
  emits('finish', { error: streamMarkdown.value.error, chatMessage });
}

async function handleChat() {
  if (!question.value || loading.value) {
    return;
  }
  const bodyParams = await beforeRequestChat();

  try {
    await streamMarkdown.value.fetchStream('/ai/api/v2/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fastgpt-cLP2M3Sa3CdqkXj5i6EpInzRaKl7dmEyVc872BuwyxHLYqbUlPPF6c3B54Ws',
      },
      body: bodyParams,
    });
  } finally {
    finallyRequestChat();
  }
}

function handleStop() {
  streamMarkdown.value.cancel();
  message.info('请求已终止');
}

async function refreshChat(text) {
  question.value = text;
  await handleChat();
}

function setQuoteText(text) {
  quoteText.value = text;
}

onMounted(async () => {
  await nextTick();
  streamMarkdown.value = useStreamingMarkdown(renderDomRef.value);
});

onUnmounted(() => {
  streamMarkdown.value?.release();
});

watch(
  () => streamMarkdown.value,
  val => {
    updateLoading(val.isLoading);
    updateFirstContentVisible(val.isFCP);
  },
  { deep: true }
);

defineExpose({ refreshChat, setQuoteText });
</script>

<style lang="scss">
.ai-input-container {
  border: 1px solid #dcdee2;
  border-radius: 10px;
  padding: 0 12px;
  margin: 12px 0;
  box-shadow: 0 1px 8px 0 rgba(25, 25, 25, 0.06);

  .input-box {
    color: #515a6e;
    display: flex;
    flex-direction: column;
    .quote-container {
      font-size: 14px;
      color: #808080;
      margin: 16px 0 0 0;
      .ant-alert {
        background-color: #f7f8fc;
        border: none;
        color: rgba(17, 17, 51, 0.5);
      }
      .quote-message {
        display: flex;
        .quote-text {
          white-space: nowrap;
          flex: 1 0 0;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
    .chat-textarea {
      flex: 1;
      padding-top: 10px;
      .textarea {
        font-size: 15px;
        width: 100%;
        border: none;
        outline: none;
        resize: none;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
    }
    .function-area {
      height: 56px;
      display: flex;
      justify-content: space-between;
      .right {
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: 8px;
        .operation-btn {
          background-color: #2b85e4;
          border-radius: 50%;
          color: #fff;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          &:hover {
            background-color: #1976d2;
          }
          &.disabled {
            cursor: not-allowed;
            background-color: #90caf9;
          }
          &-stop {
            cursor: pointer;
            width: 32px;
            height: 32px;
            color: #17233d;
            img {
              width: 100%;
              height: 100%;
            }
          }
        }
      }
    }
  }
}
</style>

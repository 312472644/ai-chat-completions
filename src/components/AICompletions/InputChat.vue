<template>
  <div class="ai-input-container">
    <div class="input-box">
      <div class="chat-textarea">
        <textarea
          class="textarea"
          v-model="question"
          :rows="4"
          @keydown.enter.exact.prevent="handleChat"
          placeholder="请输入内容"
        ></textarea>
      </div>
      <div class="function-area">
        <div class="left"></div>
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
import { ref, shallowRef, nextTick, watch } from 'vue';
import { message } from 'ant-design-vue';
import { Role } from './scripts/config.js';
import SvgIcon from '@/components/SvgIcon/index.vue';

import { Message } from './scripts/message.js';

const props = defineProps({
  /**
   * 消息列表引用
   */
  messageListRef: {
    type: Object,
    default: () => {},
  },
});

// 对外暴露的消息对象
const chatMessage = defineModel('modelValue', {
  default: new Message(),
});
// 对外暴露的loading状态
const loading = defineModel('loading', {
  default: false,
});

const isRequestAborted = ref(false);
const question = ref('');
const abortController = shallowRef(null);

/**
 * 处理流式响应的每一行数据
 * @param {string} line - 流式响应的一行数据
 */
function processLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed === '[DONE]') return;

  if (trimmed.startsWith('data:')) {
    const dataStr = trimmed.slice(5).trim();
    if (!dataStr || dataStr === '[DONE]') return;

    try {
      const parsed = JSON.parse(dataStr);
      const contentChunk = parsed.choices?.[0]?.delta?.content;
      if (contentChunk !== undefined && contentChunk !== null) {
        chatMessage.value.currentMessage.markdown += contentChunk;
        return;
      }
    } catch (e) {
      console.debug('[Stream Parse Error]', e, 'Raw:', trimmed);
    }
  }
}

function getBodyParams(content) {
  return JSON.stringify({
    stream: true,
    messages: [{ role: Role.USER, content }],
  });
}

function getRenderContent() {
  const lastMessage = chatMessage.value.getLastMessage();
  if (!lastMessage) return '';
  const id = lastMessage.id;
  // 获取当前正在渲染的markdown内容
  const renderHTML = document.querySelector(`#${id} .markdown-output`)?.innerHTML || '';
  return renderHTML.concat(isRequestAborted.value ? '\n\n 已停止响应。' : '');
}

async function beforeRequestChat() {
  const content = question.value.trim();
  const bodyParams = getBodyParams(content);
  loading.value = true;
  isRequestAborted.value = false;
  // 新增用户消息到消息列表
  chatMessage.value.addUser({ role: Role.USER, content });
  chatMessage.value.clearSuggestionList();
  abortController.value = new AbortController();

  question.value = '';
  await nextTick();
  props.messageListRef.scrollToBottom(false);
  return bodyParams;
}

function finallyRequestChat() {
  // 新增当前回复消息到消息列表
  chatMessage.value.addAssistant({
    role: Role.ASSISTANT,
    markdown: chatMessage.value.currentMessage.markdown,
    content: getRenderContent(),
    isAborted: isRequestAborted.value,
  });
  loading.value = false;
  chatMessage.value.clearCurrentMessage();
}

async function requestAI(bodyParams) {
  const res = await fetch('/ai/api/v2/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer fastgpt-cLP2M3Sa3CdqkXj5i6EpInzRaKl7dmEyVc872BuwyxHLYqbUlPPF6c3B54Ws',
    },
    body: bodyParams,
    signal: abortController.value.signal,
  });

  if (!res.ok) {
    chatMessage.value.currentMessage.markdown += '\n\n 系统异常。';
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');

  while (true) {
    // if (isRequestAborted.value) {
    //   chatMessage.value.currentMessage.markdown += '\n\n 已停止响应。';
    //   break;
    // }
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');
    for (const line of lines) {
      processLine(line);
    }
  }
}

async function handleChat() {
  if (!question.value || loading.value) return;
  const bodyParams = await beforeRequestChat();
  try {
    await requestAI(bodyParams);
  } catch (err) {
    chatMessage.value.currentMessage.markdown += err.name === 'AbortError' ? '\n\n 已停止响应。' : '\n\n 未知异常。';
  } finally {
    finallyRequestChat();
  }
}

function handleStop() {
  abortController.value.abort();
  isRequestAborted.value = true;
  loading.value = false;
  message.info('请求已终止');
}

async function refreshChat(text) {
  question.value = text;
  await handleChat();
}

defineExpose({ refreshChat });
</script>
<style lang="scss">
.ai-input-container {
  border: 1px solid #dcdee2;
  border-radius: 10px;
  padding: 0 12px;
  margin: 12px 0;

  .input-box {
    color: #515a6e;
    display: flex;
    flex-direction: column;
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

<template>
  <div class="ai-chat">
    <div class="chat-wrapper">
      <div ref="ContentRef" class="content-container">
        <div class="chat-list">
          <div data-type="chat-item" v-for="(item, index) in chatHistoryList" :key="index">
            <div v-if="item[0].role === Role.USER" class="question-item-box">
              <div class="question-item" :id="item[0].id">
                {{ item[0].content }}
              </div>
            </div>
            <!--已经完成的对话-->
            <div v-if="item?.[1]?.content" class="answer-item-box" :id="item?.[1]?.id">
              <div class="answer-meta">
                <div class="model-code">{{ item?.[1]?.modelCode }}</div>
                <div class="create-time">
                  {{ item?.[1]?.createTime }}
                </div>
              </div>
              <div class="answer-content">
                <!--历史记录-->
                <div class="markdown-output" v-html="item?.[1]?.content"></div>
              </div>
              <div class="answer-tool"></div>
            </div>
            <!--正在输出的对话-->
            <div v-else class="answer-item-box" :id="item?.[1]?.id">
              <div v-if="currentRender.currentIndex === index" class="answer-meta">
                <div class="model-code">{{ currentRender.modelCode }}</div>
                <div class="create-time">
                  {{ currentRender.createTime }}
                </div>
              </div>
              <!--加载动画-->
              <div v-if="currentRender.currentIndex === index && loading && !renderHtml" class="cursor"></div>
              <div class="answer-content">
                <!--正在渲染-->
                <div ref="MarkdownRef" class="markdown-output" v-html="renderHtml"></div>
              </div>
              <div class="answer-tool"></div>
            </div>
            <!--AI建议列表-->
            <div></div>
          </div>
        </div>
      </div>
      <!--滚动按钮-->
      <div v-if="showToBottomBtn" @click="() => scrollToBottom(ContentRef)" class="scroll-to-bottom">
        <div class="bottom-btn" v-html="ArrowUpwardSvg"></div>
      </div>
      <!--输入-->
      <InputChat :loading="loading" @start="handleChat" @stop="handleStop" />
      <!-- <div class="input-container">
        <div class="input-box">
          <div class="chat-textarea scrollbar">
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
              <div
                v-if="!loading"
                v-html="ArrowUpwardSvg"
                class="operation-btn"
                :class="{ disabled: !question }"
                @click="handleChat"
              ></div>
              <div v-else v-html="PausedSvg" class="operation-btn-stop" @click="handleStop"></div>
            </div>
          </div>
        </div>
      </div> -->
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, shallowRef, nextTick, onUnmounted, onBeforeUnmount } from 'vue';
import { HighlighterConfig, Role } from './scripts/config.js';
import { scrollToBottom, getUniqueid, formatTime, findParentElement } from './scripts/utils.js';
import { message } from 'ant-design-vue';
import InputChat from './InputChat.vue';
import useMarked from './scripts/useMarked.js';

import mockData from './mock-data.js';

import ArrowUpwardSvg from '@/assets/arrow_upward.svg?raw';
import PausedSvg from '@/assets/paused.svg?raw';

const loading = ref(false);
// 是否请求被终止
const isRequestAborted = ref(false);
const currentRender = ref({
  currentIndex: 0,
  modelCode: '',
  createTime: '',
  responseMarkdownText: '',
});

const MarkdownRef = ref(null);
const ContentRef = ref(null);

// 聊天记录（二维数组，一条记录为一个对话）
const chatHistoryList = ref([]);
const showToBottomBtn = ref(false);

const { parseMarkdown, initMarked, codeEventListener } = useMarked();

const renderHtml = computed(() => {
  const responseMarkdownText = currentRender.value.responseMarkdownText;
  if (!responseMarkdownText) return '';
  return parseMarkdown(responseMarkdownText);
});

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
        currentRender.value.responseMarkdownText += contentChunk;
        return;
      }
    } catch (e) {
      console.debug('[Stream Parse Error]', e, 'Raw:', trimmed);
    }
  }
}

function updateHistoryChatList(params = {}) {
  const { modelCode = 'Qwen3-Max', role = '', content = '', markdown = '' } = params || {};
  const id = getUniqueid();
  const item = {
    id,
    modelCode,
    role,
    content,
    markdown,
    createTime: formatTime(Date.now()),
  };
  if (role === Role.USER) {
    chatHistoryList.value.push([item]);
  } else if (role === Role.ASSISTANT) {
    const renderHTML = MarkdownRef.value[MarkdownRef.value.length - 1].innerHTML || '';
    const lastIndex = chatHistoryList.value.length - 1;
    if (lastIndex >= 0) {
      chatHistoryList.value[lastIndex].push({
        ...item,
        isAborted: isRequestAborted.value,
        content: renderHTML.concat(isRequestAborted.value ? '\n\n 已停止响应。' : ''),
      });
    }
  }
}

function updateCurrentRender(params = {}) {
  const { currentIndex = 0, modelCode = '', createTime = '', responseMarkdownText = '' } = params || {};
  currentRender.value = {
    currentIndex,
    modelCode,
    createTime,
    responseMarkdownText,
  };
}

async function beforeRequestChat(question) {
  updateHistoryChatList({ role: Role.USER, content: question });
  updateCurrentRender({
    currentIndex: Math.max(chatHistoryList.value.length - 1, 0),
    modelCode: 'Qwen3-Max',
    createTime: formatTime(Date.now()),
    responseMarkdownText: '',
  });
  isRequestAborted.value = false;
  await nextTick();
  scrollToBottom(ContentRef.value, false);
}

async function handleChat({ question, abortController }) {
  loading.value = true;
  beforeRequestChat(question);

  try {
    const res = await fetch('/ai/api/v2/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer fastgpt-cLP2M3Sa3CdqkXj5i6EpInzRaKl7dmEyVc872BuwyxHLYqbUlPPF6c3B54Ws',
      },
      body: JSON.stringify({
        stream: true,
        messages: [
          {
            role: Role.USER,
            content: question,
          },
        ],
      }),
      signal: abortController.signal,
    });

    if (!res.ok) {
      currentRender.value.responseMarkdownText += '\n\n 系统异常。';
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      if (isRequestAborted.value) {
        currentRender.value.responseMarkdownText += '\n\n 已停止响应。';
        break;
      }
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      for (const line of lines) {
        processLine(line);
      }
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      currentRender.value.responseMarkdownText += '\n\n 已停止响应。';
      return;
    }
  } finally {
    updateHistoryChatList({
      role: Role.ASSISTANT,
      markdown: currentRender.value.responseMarkdownText,
    });
    loading.value = false;
    updateCurrentRender({});
    // console.log('add', JSON.stringify(chatHistoryList.value));
  }
}

function handleStop() {
  isRequestAborted.value = true;
  loading.value = false;
}

function handleScroll(e) {
  if (!ContentRef.value) return false;
  const { scrollTop, scrollHeight, clientHeight } = ContentRef.value;
  showToBottomBtn.value = scrollHeight - (scrollTop + clientHeight) > 0;
}

function bindEvent() {
  if (!ContentRef.value) return;
  ContentRef.value.addEventListener('scroll', handleScroll);
}

async function init() {
  await nextTick();
  scrollToBottom(ContentRef.value, false);
  bindEvent();
  await initMarked(ContentRef.value);
  setTimeout(() => {
    chatHistoryList.value = [...mockData];
    currentRender.value.responseMarkdownText = mockData[0][1].markdown;
  }, 500);
}

onMounted(() => init());

onBeforeUnmount(() => {
  ContentRef.value.removeEventListener('scroll', handleScroll);
});
</script>

<style lang="scss">
@use './markdown.scss';

.ai-chat {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0 auto;
  max-width: 896px;
  height: 100%;
  .chat-wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .content-container {
    flex: 1;
    min-height: 0;
    overflow: auto;
    .cursor {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background-color: #dcdee2;
      animation: blink 1s ease-in-out infinite;
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
    }
  }
  .scroll-to-bottom {
    position: absolute;
    bottom: 200px;
    left: 50%;
    transform: translate(-50%, -50%) rotate(180deg);
    .bottom-btn {
      background: #f8f8f8;
      color: #808695;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      border: 1px solid #e8eaec;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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
</style>

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
      <div class="input-container">
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
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, shallowRef, nextTick, onUnmounted, onBeforeUnmount } from 'vue';
import { Marked, Renderer } from 'marked';
import { createHighlighter, bundledLanguages } from 'shiki';
import { HighlighterConfig, Role } from './config.js';
import { scrollToBottom, getUniqueid, formatTime } from './utils.js';
import { message } from 'ant-design-vue';

import CopySvg from '@/assets/copy.svg?raw';
import ArrowSvg from '@/assets/arrow.svg?raw';
import BedtimeSvg from '@/assets/bedtime.svg?raw';
import LightSvg from '@/assets/light_mode.svg?raw';

import mockData from './mock.js';

import ArrowUpwardSvg from '@/assets/arrow_upward.svg?raw';
import PausedSvg from '@/assets/paused.svg?raw';

const question = ref('');
const abortController = shallowRef(null);
const highlighter = shallowRef();
const loading = ref(false);

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

const marked = new Marked();
const render = new Renderer();

// 自定义代码块渲染
render.code = ({ text, lang, escaped }) => {
  const html = highlighter.value.codeToHtml(text, {
    lang,
    theme: HighlighterConfig.theme.light,
  });

  const languageLabel = lang || 'text';
  return `<div class="custom-code-block" data-lang="${languageLabel}">
      <div class="code-header">
        <span class="lang-label">${languageLabel}</span>
        <div class="tool-btn-container">
          <div class="item copy" data-copy title="复制">${CopySvg}</div>
          <div class="item theme" data-lang="${languageLabel}" data-theme="light" title="切换主题">${BedtimeSvg}</div>
          <div class="item collapse" data-collapse="down" title="收起">${ArrowSvg}</div>
        </div>
      </div>
      <div class="code-content">${html}</div>
      <div class="code-footer">已隐藏1行代码</div>
    </div>`;
};

const renderHtml = computed(() => {
  const responseMarkdownText = currentRender.value.responseMarkdownText;
  if (!responseMarkdownText) return '';
  return marked.parse(responseMarkdownText);
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
        content: renderHTML,
      });
    }
  }
}

function getBodyParams(content) {
  return JSON.stringify({
    stream: true,
    messages: [
      {
        role: Role.USER,
        content: content,
      },
    ],
  });
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

async function beforeRequestChat() {
  updateHistoryChatList({ role: Role.USER, content: question.value });
  const bodyParams = getBodyParams(question.value);
  abortController.value = new AbortController();
  question.value = '';

  updateCurrentRender({
    currentIndex: Math.max(chatHistoryList.value.length - 1, 0),
    modelCode: 'Qwen3-Max',
    createTime: formatTime(Date.now()),
    responseMarkdownText: '',
  });

  await nextTick();
  scrollToBottom(ContentRef.value, false);
  return bodyParams;
}

async function handleChat() {
  if (!question.value.trim() || loading.value) return;
  loading.value = true;

  const bodyParams = await beforeRequestChat();

  try {
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
      currentRender.value.responseMarkdownText += '\n\n 系统异常。';
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
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
    console.error('Fetch error:', err);
  } finally {
    updateHistoryChatList({
      role: Role.ASSISTANT,
      markdown: currentRender.value.responseMarkdownText,
    });
    loading.value = false;
    abortController.value = null;
    updateCurrentRender({});
    console.log('add', JSON.stringify(chatHistoryList.value));
  }
}

function handleStop() {
  if (!abortController.value) {
    return;
  }
  question.value = '';
  abortController.value.abort();
  loading.value = false;
}

function handleScroll(e) {
  if (!ContentRef.value) return false;
  const { scrollTop, scrollHeight, clientHeight } = ContentRef.value;
  showToBottomBtn.value = scrollHeight - (scrollTop + clientHeight) > 0;
}

function handleToggleCodeTheme(target, codeBlock) {
  const theme = target.dataset.theme;
  const lang = target.dataset.lang;
  target.dataset.theme = theme === 'light' ? 'dark' : 'light';
  target.innerHTML = theme === 'light' ? LightSvg : BedtimeSvg;
  const html = highlighter.value.codeToHtml(codeBlock.querySelector('code').innerText, {
    lang,
    theme: theme === 'light' ? HighlighterConfig.theme.dark : HighlighterConfig.theme.light,
  });
  codeBlock.classList.toggle('dark');
  codeBlock.querySelector('.code-content').innerHTML = html;
}

function handleCopyCode(codeBlock) {
  const codeContent = codeBlock.querySelector('pre code')?.innerText || '';
  navigator.clipboard
    .writeText(codeContent)
    .then(() => {
      message.success('复制成功');
    })
    .catch(err => {
      message.error('复制失败');
    });
}

function handleExpandCode(target, codeBlock) {
  const collapse = target.dataset.collapse;
  const codeContent = codeBlock.querySelector('.code-content');
  const codeFooter = codeBlock.querySelector('.code-footer');
  const codeLines = codeBlock.querySelectorAll('code span.line').length;
  const isDown = collapse === 'down';

  codeContent.style.display = isDown ? 'none' : 'block';
  codeFooter.style.display = isDown ? 'flex' : 'none';
  codeFooter.innerText = `已隐藏${codeLines}行代码`;
  target.dataset.collapse = isDown ? 'up' : 'down';
  target.classList.toggle('up');
}

function findParentElement(target, selector) {
  while (target && target !== document.body) {
    if (target.matches(selector)) {
      return target;
    }
    target = target.parentElement;
  }
  return null;
}

function handleCustomCodeEvent(e) {
  const target = findParentElement(e.target, '[data-copy], [data-theme], [data-collapse]');
  const codeBlock = e.target.closest('.custom-code-block');
  if (target.matches('[data-copy]')) {
    handleCopyCode(codeBlock);
  } else if (target.matches('[data-theme]')) {
    handleToggleCodeTheme(target, codeBlock);
  } else if (target.matches('[data-collapse]')) {
    handleExpandCode(target, codeBlock);
  }
}

function listenCustomCodeEvent() {
  ContentRef.value.addEventListener('click', handleCustomCodeEvent);
}

function bindEvent() {
  if (!ContentRef.value) return;
  ContentRef.value.addEventListener('scroll', handleScroll);
  listenCustomCodeEvent();
}

async function init() {
  await nextTick();
  scrollToBottom(ContentRef.value, false);
  bindEvent();
  marked.use({ renderer: render });
  highlighter.value = await createHighlighter({
    langs: HighlighterConfig.langs,
    themes: HighlighterConfig.themes,
  });

  setTimeout(() => {
    chatHistoryList.value = [...mockData];
    currentRender.value.responseMarkdownText = mockData[0][1].markdown;
  }, 500);
}

onMounted(() => init());

onBeforeUnmount(() => {
  ContentRef.value.removeEventListener('scroll', handleScroll);
  ContentRef.value.removeEventListener('click', handleCustomCodeEvent);
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
  .input-container {
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

  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-track {
    background-color: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background-color: transparent;
    border-radius: 3px;
  }
  &:hover {
    ::-webkit-scrollbar-thumb {
      background-color: #e7e7ea;
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

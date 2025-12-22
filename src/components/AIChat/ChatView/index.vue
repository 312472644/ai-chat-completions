<template>
  <div v-if="!isDeleteMode" class="input-container">
    <div class="ai-input-container">
      <div class="input-box">
        <div class="attachment-container">
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
          <!-- 附件 -->
          <Attachment v-if="fileList.length > 0" v-model="fileList" />
        </div>
        <!-- 输入区域 -->
        <div class="chat-textarea">
          <textarea
            v-model="question"
            class="textarea"
            :rows="4"
            :placeholder="isTempSession ? '临时对话不会被记录，退出将会自动清除' : '想和AI聊一聊什么？🧐'"
            @keydown.enter.exact.prevent="handleChat"
            @paste="handlePaste"
          />
        </div>
        <!-- 操作按钮 -->
        <div class="function-area">
          <div class="left" />
          <div class="right">
            <div>
              <ADropdown placement="top">
                <PaperClipOutlined style="font-size: 20px" />
                <template #overlay>
                  <AMenu>
                    <AMenuItem>
                      <UploadFile
                        v-model="fileList"
                        accept=".pdf,.docx,.doc,.txt,.xlsx,.xls,.ppt,.pptx"
                        label="上传文档"
                      />
                    </AMenuItem>
                    <AMenuItem>
                      <UploadFile v-model="fileList" accept="image/*" label="上传图片" />
                    </AMenuItem>
                  </AMenu>
                </template>
              </ADropdown>
            </div>
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
  </div>
</template>

<script setup>
import { PaperClipOutlined } from '@ant-design/icons-vue';
import {
  Alert as AAlert,
  Dropdown as ADropdown,
  Menu as AMenu,
  MenuItem as AMenuItem,
  message,
  Modal,
} from 'ant-design-vue';
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import SvgIcon from '@/components/SvgIcon/index.vue';
import { useStreamingMarkdown } from '@/composables/useStreamingMarkdown/index.js';
import { MESSAGE_STATUS, ROLE } from '@/constant/enum.js';
import { chatStore, sessionStore } from '@/store/index';
import emitter, { EventType } from '@/utils/emitter.js';
import Attachment from './Attachment.vue';
import UploadFile from './UploadFile.vue';

const {
  loading,
  renderDomRef,
  updateLoading,
  updateFirstContentVisible,
  addUserChat,
  addBotChat,
  isDeleteMode,
  clearRenderedHTML,
  deleteLastChatChildList,
} = chatStore();
const { updateSession, isTempSession, currentSessionId, currentModel } = sessionStore();

const question = ref(null);
const quoteText = ref(null);
const fileList = ref([]);

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

function getRenderContent() {
  // 获取当前正在渲染的markdown内容
  const renderHTML = renderDomRef.value?.innerHTML || '';
  return renderHTML.concat(streamMarkdown.value.isAbort ? '\n\n <div class="stop-response">已停止响应。</div>' : '');
}

async function handleChat() {
  if (!question.value || loading.value) {
    return;
  }

  const content = question.value;
  const refText = quoteText.value;
  question.value = '';
  quoteText.value = '';

  // 更新会话摘要
  updateSession({ summary: content });
  addUserChat(currentSessionId.value, { refText, content });

  try {
    await streamMarkdown.value.fetchStream('/ai/api/v2/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fastgpt-cLP2M3Sa3CdqkXj5i6EpInzRaKl7dmEyVc872BuwyxHLYqbUlPPF6c3B54Ws',
      },
      body: JSON.stringify({
        stream: true,
        messages: [{ role: ROLE.USER, content }],
      }),
    });
  } finally {
    addBotChat(currentSessionId.value, {
      content: streamMarkdown.value.markdown,
      modelName: currentModel.value.modelName,
      modelCode: currentModel.value.modelCode,
      renderHTML: getRenderContent(),
      status: streamMarkdown.value.isAbort ? MESSAGE_STATUS.ABORTED : MESSAGE_STATUS.FINISHED,
    });
    await nextTick();
    setTimeout(() => {
      // 等待渲染完成后清空HTML
      clearRenderedHTML();
    }, 500);
  }
}

function handleStop() {
  streamMarkdown.value.cancel();
  message.info('请求已终止');
}

/**
 * 重新生成。删除列表消息最后一条数据。重新请求。
 * @param text 重新生成的文本
 */
async function handleRegenerate(text) {
  question.value = text;
  deleteLastChatChildList(currentSessionId.value);
  await handleChat();
}

// 处理建议点击
function handleSuggestion(text) {
  question.value = text;
  handleChat();
}

function handleTextRef(text) {
  quoteText.value = text;
}

function eventListener() {
  emitter.on(EventType.REGENERATE, handleRegenerate);
  emitter.on(EventType.SUGGESTION, handleSuggestion);
  emitter.on(EventType.TEXT_REF, handleTextRef);
}

onMounted(async () => {
  await nextTick();
  eventListener();
  streamMarkdown.value = useStreamingMarkdown(renderDomRef.value);
});

onUnmounted(() => {
  streamMarkdown.value?.release();
  emitter.off(EventType.REGENERATE, handleRegenerate);
  emitter.off(EventType.SUGGESTION, handleSuggestion);
  emitter.off(EventType.TEXT_REF, handleTextRef);
});

watch(
  () => streamMarkdown.value.isLoading,
  val => {
    updateLoading(val);
  }
);

watch(
  () => streamMarkdown.value.isFCP,
  val => {
    updateFirstContentVisible(val);
  }
);
</script>

<style lang="scss">
.ai-input-container {
  border: 1px solid #dcdee2;
  border-radius: 10px;
  padding: 0 12px;
  margin: 12px 0;
  box-shadow: 0 1px 8px 0 rgba(25, 25, 25, 0.06);
  &:hover {
    border-color: #2b85e4;
  }

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
        background: inherit;
        width: 100%;
        border: none;
        outline: none;
        resize: none;
        &::-webkit-input-placeholder {
          font-size: 15px;
          color: #b2b2bd;
        }
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

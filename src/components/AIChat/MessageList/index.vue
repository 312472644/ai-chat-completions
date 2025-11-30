<template>
  <div ref="MessageContentRef" class="message-container">
    <div class="chat-list-container">
      <div v-if="answerList.length" class="chat-list">
        <div
          v-for="(item, index) in answerList"
          :id="item.id"
          :key="index"
          data-type="chat-item"
          class="chat-item"
          :class="{ delete: isDeleteMode, checked: item.checked }"
        >
          <!-- 用户侧 -->
          <div v-if="item[0]" :id="item[0].id" class="question-item-box">
            <div v-if="isDeleteMode" class="question-meta">
              <ACheckbox v-model:checked="item.checked" />
            </div>
            <div class="right-content">
              <div v-if="item[0].refText" class="ref-text">
                <FoldText :text="`引用：${item[0].refText}`" />
              </div>
              <div class="question-item">
                {{ item[0].content }}
              </div>
            </div>
          </div>
          <!-- 已经完成的对话 -->
          <div v-if="item[1]?.content" :id="item[1]?.id" class="answer-item-box">
            <div class="answer-meta">
              <div class="model-code">
                {{ item[1].modelName }}
              </div>
              <div class="create-time">
                {{ item[1].createTime }}
              </div>
            </div>
            <div class="answer-content">
              <!-- 历史记录 -->
              <div class="markdown-output" v-html="item[1].renderHTML" />
            </div>
            <AnswerTool
              v-if="!isDeleteMode"
              :user-item="item[0]"
              :item="item[1]"
              :show-refresh="index === answerList.length - 1"
              @delete="handleDelete"
            />
          </div>
        </div>
      </div>
      <!-- 正在渲染的对话 -->
      <div class="current-render answer-item-box" :class="{ stdin: loading }">
        <div class="answer-meta">
          <div class="model-code">
            {{ currentModel.modelName }}
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
      <SuggestionList v-if="suggestList.length && !isDeleteMode" style="margin-top: 10px" :list="suggestList" />
    </div>
  </div>
  <!-- 删除按钮 -->
  <div v-if="isDeleteMode" class="delete-container">
    <AButton class="delete-item" @click="handleDelete"> 取消 </AButton>
    <AButton class="delete-item" danger @click="handleDeleteAll"> 删除全部 </AButton>
    <AButton class="delete-item" type="primary" @click="handleDeleteSelected"> 删除选中 </AButton>
  </div>
  <!-- 选中文字后菜单 -->
  <SelectedMenu :message-content-ref="MessageContentRef" />
</template>

<script setup>
import { Button as AButton, Checkbox as ACheckbox, message, Modal } from 'ant-design-vue';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import FoldText from '@/components/FoldText/index.vue';
import SvgIcon from '@/components/SvgIcon/index.vue';

import { chatStore, sessionStore } from '@/store/index.js';
import { scrollToBottom as toBottom } from '../scripts/utils.js';

import AnswerTool from './AnswerTool.vue';
import SelectedMenu from './SelectedMenu.vue';
import SuggestionList from './SuggestionList.vue';

const {
  loading,
  isFirstContentVisible,
  setRenderDomRef,
  chatList,
  suggestList,
  deleteChatChildList,
  isDeleteMode,
  setIsDeleteMode,
  deleteAllChatChildList,
} = chatStore();
const { currentSessionId, currentModel, setIsTempSession } = sessionStore();

// 当前组件实例
const MessageContentRef = ref(null);
// 渲染区域DOM
const RenderRef = ref(null);

const showToBottomBtn = ref(false);
// 是否自动滚动
const isAutoScroll = ref(true);
const interval = ref(false);
// 回答列表
const answerList = ref([]);
// 当前会话
const currentSessionChat = ref(null);

const showScrollButton = computed(() => {
  if (loading.value) {
    return !isAutoScroll.value;
  } else {
    return showToBottomBtn.value;
  }
});

// TODO 接口调用删除全部
function handleDeleteAll() {
  Modal.confirm({
    title: '提示',
    content: '确定要删除所有项吗？',
    cancelText: '取消',
    okText: '确认',
    onOk: () => {
      deleteAllChatChildList(currentSessionId.value);
    },
  });
}

// TODO 接口调用删除选中
function handleDeleteSelected() {
  const checkedItems = answerList.value.filter(item => item.checked);

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
      const msgIds = checkedItems.map(item => item.map(item => item.msgId)).flat();
      deleteChatChildList(currentSessionId.value, msgIds, answerList);
      message.success('删除成功');
    },
  });
}

function handleDelete() {
  setIsDeleteMode(!isDeleteMode.value);
  nextTick(() => {
    toBottom(MessageContentRef.value, false);
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

// TODO 接口调用查询
function handleAnswerList(val) {
  answerList.value = [];
  // 通过会话ID过滤回答列表
  const item = chatList.value.find(item => item.sessionId === val);
  if (!item) {
    answerList.value = [];
    return;
  }
  currentSessionChat.value = { ...item };
  answerList.value = item.list || [];
}

// 处理当前会话
function handleCurrChat(val) {
  setIsTempSession(false);
  scrollToBottom(false);
  handleAnswerList(val);
}

function handleNewChat() {
  // 清空回答列表
  answerList.value = [];
  currentSessionChat.value = null;
  toBottom(MessageContentRef.value, false, 0);
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

watch(
  () => currentSessionId.value,
  val => {
    setIsDeleteMode(false);
    if (val) {
      handleCurrChat(val);
    } else {
      handleNewChat();
    }
  },
  { immediate: true }
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
      margin: 20px 0;
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
      &:last-of-type {
        margin-bottom: 0;
      }
    }
    .question-item-box {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 40px;
      .right-content {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        flex: 1;
        .ref-text {
          color: #999;
          font-size: 14px;
          margin-bottom: 8px;
          line-height: 1.5;
        }
      }
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
    margin: 6px 0;
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

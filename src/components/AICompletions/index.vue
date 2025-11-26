<template>
  <div class="ai-chat">
    <div class="chat-wrapper">
      <MessageList
        ref="MessageListRef"
        :chat-message="chatMessage"
        :loading="loading"
        :is-f-c-p="isFCP"
        @refresh="handleSuggestionClick"
        @suggestion-click="handleSuggestionClick"
        @delete="val => (isDeleteMode = val)"
        @quote-selected="handleQuoteSelectedText"
      />
      <!-- 输入 -->
      <div v-show="!isDeleteMode" class="input-container">
        <ChatView
          ref="InputChatRef"
          v-model:loading="loading"
          v-model:is-f-c-p="isFCP"
          v-model="chatMessage"
          :message-list-ref="MessageListRef"
          @finish="handleFinish"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import ChatView from './ChatView.vue';
import MessageList from './MessageList/index.vue';
import mockData from './mock/mock-data.js';
import { Message } from './scripts/message.js';

const MessageListRef = ref(null);

const chatMessage = ref(new Message());
const loading = ref(false);
const isFCP = ref(false);
const InputChatRef = ref(null);
const isDeleteMode = ref(false);

function handleSuggestionClick(item) {
  InputChatRef.value.refreshChat(item.text);
}

// 意见列表
function handleQuoteSelectedText(text) {
  InputChatRef.value.setQuoteText(text);
}

function handleFinish(data) {
  console.log('🚀 ~ 输出结果完成 ~ data:', data);
}

async function init() {
  setTimeout(async () => {
    chatMessage.value.messages = [...mockData];
    // chatMessage.value.currentMessage.markdown = mockData[0].assistant.markdown;
    // await nextTick();
    // MessageListRef.value.scrollToBottom(false);
  }, 500);
}

onMounted(() => init());
</script>

<style lang="scss">
@use './markdown.scss';

.ai-chat {
  $max-width: 896px;
  height: 100%;
  .chat-wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .input-container {
      max-width: $max-width;
      margin: 0 auto;
      width: 100%;
      padding: 0 12px;
    }
  }
}
</style>

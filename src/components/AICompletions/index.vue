<template>
  <div class="ai-chat">
    <div class="chat-wrapper">
      <MessageList
        ref="MessageListRef"
        :chat-message="chatMessage"
        :loading="loading"
        :isFCP="isFCP"
        @refresh="handleSuggestionClick"
        @suggestion-click="handleSuggestionClick"
        @delete="val => (isDeleteMode = val)"
        @quote-selected="handleQuoteSelectedText"
      ></MessageList>
      <!--输入-->
      <div v-show="!isDeleteMode" class="input-container">
        <ChatView
          ref="InputChatRef"
          v-model:loading="loading"
          v-model:isFCP="isFCP"
          v-model="chatMessage"
          :messageListRef="MessageListRef"
          @finish="handleFinish"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, shallowRef, nextTick, onUnmounted, onBeforeUnmount } from 'vue';
import ChatView from './ChatView.vue';
import MessageList from './MessageList/index.vue';
import { Message } from './scripts/message.js';
import mockData from './mock/mock-data.js';

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
  // setTimeout(async () => {
  //   chatMessage.value.messages = [...mockData];
  //   // chatMessage.value.currentMessage.markdown = mockData[0].assistant.markdown;
  //   // await nextTick();
  //   // MessageListRef.value.scrollToBottom(false);
  // }, 500);
}

onMounted(() => init());
</script>

<style lang="scss">
@use './markdown.scss';

.ai-chat {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
    }
  }
}
</style>

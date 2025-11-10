<template>
  <div class="ai-chat">
    <div class="chat-wrapper">
      <MessageList
        ref="MessageListRef"
        :chat-message="chatMessage"
        :loading="loading"
        @refresh="handleSuggestionClick"
        @suggestion-click="handleSuggestionClick"
        @delete="val => (isDeleteMode = val)"
        @quote-selected="handleQuoteSelectedText"
      ></MessageList>
      <!--输入-->
      <div v-show="!isDeleteMode" class="input-container">
        <InputChat
          ref="InputChatRef"
          v-model:loading="loading"
          v-model="chatMessage"
          :messageListRef="MessageListRef"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, shallowRef, nextTick, onUnmounted, onBeforeUnmount } from 'vue';
import InputChat from './InputChat.vue';
import MessageList from './MessageList/index.vue';

import { Role } from './scripts/config.js';
import { scrollToBottom, getUniqueid, formatTime } from './scripts/utils.js';
import { message } from 'ant-design-vue';
import { Message } from './scripts/message.js';
import mockData from './mock-data.js';

const MessageListRef = ref(null);

const chatMessage = ref(new Message());
const loading = ref(false);
const InputChatRef = ref(null);
const isDeleteMode = ref(false);

function handleSuggestionClick(item) {
  InputChatRef.value.refreshChat(item.text);
}

function handleQuoteSelectedText(text) {
  InputChatRef.value.setQuoteText(text);
}

async function init() {
  // chatMessage.value.messages = [...mockData];
  // await nextTick();
  // MessageListRef.value.scrollToBottom(false);

  setTimeout(async () => {
    chatMessage.value.messages = [...mockData];
    await nextTick();
    MessageListRef.value.scrollToBottom(false);
    // chatMessage.value.currentMessage.markdown = mockData[0].markdown;
    // currentRender.value.responseMarkdownText = mockData[0].markdown;
  }, 500);
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

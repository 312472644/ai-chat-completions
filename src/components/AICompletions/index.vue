<template>
  <div class="ai-chat">
    <div class="chat-wrapper">
      <MessageList :chat-message="chatMessage" />
      <ChatView v-model="chatMessage" @finish="handleFinish" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import ChatView from './ChatView.vue';
import MessageList from './MessageList/index.vue';
import mockData from './mock/mock-data.js';
import { Message } from './scripts/message.js';

const chatMessage = ref(new Message());

function handleFinish(data) {
  console.log('🚀 ~ 输出结果完成 ~ data:', data);
}

async function init() {
  // setTimeout(async () => {
  //   // chatMessage.value.messages = [...mockData];
  //   // chatMessage.value.suggestionList = [
  //   //   { text: '有哪些场景不适合使用wheel事件？' },
  //   //   { text: '如何用touch事件替代wheel事件？' },
  //   //   { text: 'wheel事件在移动端有哪些局限性？' },
  //   // ];
  //   // MessageListRef.value.scrollToBottom(false);
  // }, 500);
}

onMounted(() => init());
</script>

<style lang="scss">
@use './markdown.scss';

.ai-chat {
  $max-width: 896px;
  height: 100%;
  .chat-wrapper {
    position: relative;
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

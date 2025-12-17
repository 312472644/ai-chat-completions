<template>
  <div class="ai-chat">
    <div class="chat-wrapper" :class="{ 'new-chat': !currentSessionId, 'temp-chat': isTempSession }">
      <MessageList />
      <div class="guide-container">
        <div v-if="!currentSessionId" class="guide-text">
          <!-- 非临时对话时显示 -->
          <div v-if="!isTempSession" class="guide-content">
            <SvgIcon name="orange" size="32px" />
            <span>你好，我是 AI 助手，有什么我可以帮助你的吗？</span>
          </div>
          <!-- 临时对话时显示 -->
          <div v-else class="guide-content">
            <SvgIcon name="temp_session" size="32px" />
            <span>临时对话</span>
          </div>
        </div>
        <ChatView />
      </div>
    </div>
  </div>
</template>

<script setup>
import SvgIcon from '@/components/SvgIcon/index.vue';
import { sessionStore } from '@/store';
import ChatView from './ChatView.vue';
import MessageList from './MessageList/index.vue';

const { currentSessionId, isTempSession } = sessionStore();

// function handleFinish(data) {}
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
    &.new-chat {
      .guide-container {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
      .guide-content {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 12px;
      }
      .guide-text {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 20px;
        color: #333;
        margin-bottom: 12px;
        text-shadow: 1px 1px 1px #999;
        text-shadow: -1px 1px #999;
      }
    }
    &.temp-chat {
      .ai-input-container {
        border: 1px dashed #dcdee2;
        background: #f8f8f9;
      }
    }
  }
}
</style>

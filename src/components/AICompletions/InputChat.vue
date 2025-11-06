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
</template>
<script setup>
import { ref, shallowRef } from 'vue';
import { message } from 'ant-design-vue';
import ArrowUpwardSvg from '@/assets/arrow_upward.svg?raw';
import PausedSvg from '@/assets/paused.svg?raw';

const emits = defineEmits(['start', 'stop']);
const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
});

const question = ref('');
const abortController = shallowRef(null);

function handleChat() {
  if (!question.value || props.loading) return;
  abortController.value = new AbortController();
  emits('start', { question: question.value, abortController: abortController.value });
  question.value = '';
}

function handleStop() {
  if (!props.loading) return;
  abortController.value.abort();
  message.info('请求已终止');
  emits('stop');
}
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

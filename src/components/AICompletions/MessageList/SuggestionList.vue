<template>
  <div v-if="list.length > 0" class="suggestion-list">
    <div v-for="(item, index) in list" :key="index" class="suggestion-item" @click="() => handleSuggestionClick(item)">
      {{ item.text }}
    </div>
  </div>
</template>

<script setup>
import { onUnmounted } from 'vue';
import emitter, { EventType } from '@/utils/emitter';

defineProps({
  list: {
    type: Array,
    default: () => [],
  },
});

function handleSuggestionClick(item) {
  emitter.emit(EventType.SUGGESTION, item.text);
}

onUnmounted(() => {
  emitter.off(EventType.SUGGESTION);
});
</script>

<style lang="scss">
.suggestion-list {
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  display: flex;
  gap: 12px;
  .suggestion-item {
    color: rgba(17, 17, 51, 0.7);
    font-size: 14px;
    border-radius: 12px;
    padding: 12px 16px;
    display: flex;
    background-color: #fafafb;
    transition: background-color 0.3s ease-in-out;
    &:hover {
      cursor: pointer;
      background-color: #e8eaec;
    }
  }
}
</style>

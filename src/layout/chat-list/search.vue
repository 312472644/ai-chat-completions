<template>
  <a-button
    v-if="!showSearch"
    block
    :icon="h(SvgIcon, { name: 'new_chat', style: 'margin-right: 4px' })"
    @click="handleNewChat"
  >
    新对话
  </a-button>
  <a-input
    v-else
    v-model:value="searchValue"
    placeholder="搜索历史记录"
    style="width: 100%"
    ref="SearchInput"
    @change="debounceSearchChange"
    @blur="showSearch = false"
    allowClear
  >
    <template #prefix>
      <LoadingOutlined v-if="isLoading" style="color: #666" />
      <SearchOutlined v-else style="color: #666" />
    </template>
  </a-input>
</template>
<script setup>
import { ref, h, useTemplateRef, watch, nextTick, onMounted } from 'vue';
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons-vue';
import { Tooltip as ATooltip, Button as AButton, Input as AInput } from 'ant-design-vue';
import ChatItemDropdown from './chat-item-dropdown.vue';
import SvgIcon from '@/components/SvgIcon/index.vue';
import { debounce } from '@/utils';
import { ChatHistory } from '@/mock/index.js';

const showSearch = defineModel('showSearch', {
  type: Boolean,
  default: false,
});
const searchChatItems = defineModel('modelValue', {
  type: Array,
  default: () => [],
});

const SearchInput = useTemplateRef('SearchInput');
const searchValue = ref('');
const isLoading = ref(false);
// 默认历史项
const chatItems = structuredClone(ChatHistory);

const debounceSearchChange = debounce(handleSearchChange, 300);

//TODO 搜索功能
function handleSearchChange() {
  if (!searchValue.value) {
    searchChatItems.value = structuredClone(chatItems);
    return;
  }
  isLoading.value = true;
  setTimeout(() => {
    searchChatItems.value = chatItems.filter(item => item.text.includes(searchValue.value));
    isLoading.value = false;
  }, 1000);
}

function handleNewChat() {
  console.log('新对话', searchValue.value);
}

onMounted(() => {
  searchChatItems.value = structuredClone(chatItems);
});

watch(
  () => showSearch.value,
  async newVal => {
    if (newVal) {
      await nextTick();
      SearchInput.value.focus();
    }
  }
);
</script>
<style lang="scss"></style>

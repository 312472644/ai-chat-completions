<template>
  <AButton
    v-if="!showSearch"
    block
    :icon="h(SvgIcon, { name: 'new_chat', style: 'margin-right: 4px' })"
    @click="handleNewChat"
  >
    新对话
  </AButton>
  <AInput
    v-else
    ref="SearchInput"
    v-model:value="searchValue"
    placeholder="搜索历史记录"
    style="width: 100%"
    allow-clear
    @change="debounceSearchChange"
    @blur="handleBlur"
  >
    <template #prefix>
      <LoadingOutlined v-if="isLoading" style="color: #666" />
      <SearchOutlined v-else style="color: #666" />
    </template>
  </AInput>
</template>

<script setup>
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons-vue';
import { Button as AButton, Input as AInput } from 'ant-design-vue';
import { h, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue';
import SvgIcon from '@/components/SvgIcon/index.vue';
import { ChatHistory } from '@/mock/index.js';
import { debounce } from '@/utils';

const showSearch = defineModel('showSearch', {
  type: Boolean,
  default: false,
});
const searchChatItems = defineModel('modelValue', {
  type: Array,
  default: () => [],
});
// 是否搜索结果
const isSearchResult = defineModel('isSearchResult', {
  type: Boolean,
  default: false,
});

const SearchInput = useTemplateRef('SearchInput');
const searchValue = ref('');
const isLoading = ref(false);
// 默认历史项
const chatItems = structuredClone(ChatHistory);

const debounceSearchChange = debounce(handleSearchChange, 300);

// TODO 搜索功能
function handleSearchChange() {
  if (!searchValue.value) {
    searchChatItems.value = structuredClone(chatItems);
    isSearchResult.value = false;
    return;
  }
  isLoading.value = true;
  setTimeout(() => {
    searchChatItems.value = chatItems
      .filter(item => item.text.includes(searchValue.value))
      .map(item => {
        return {
          ...item,
          text: item.text.replace(searchValue.value, `<span class="search-marked_text">${searchValue.value}</span>`),
        };
      });
    isLoading.value = false;
    isSearchResult.value = true;
  }, 500);
}

function handleBlur() {
  showSearch.value = Boolean(searchValue.value);
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

<style lang="scss">
.search-marked_text {
  color: #edab38;
  font-weight: bold;
}
</style>

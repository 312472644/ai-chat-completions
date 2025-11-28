<template>
  <div ref="SelectedMenuRef" class="selected-menu-container">
    <div class="selected-menu">
      <div class="item" @click="handleQuoteSelectedText">
        <SvgIcon name="quotation" />
        <span>引用</span>
      </div>
      <div class="item" @click="handleCopySelectedText">
        <SvgIcon name="copy" />
        <span>复制</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import SvgIcon from '@/components/SvgIcon/index.vue';
import emitter, { EventType } from '@/utils/emitter';
import { copyText, debounce } from '@/utils/index';

const props = defineProps({
  messageContentRef: {
    type: Object,
    default: () => {},
  },
});

// const emits = defineEmits(['quote-selected']);

const SelectedMenuRef = ref(null);
const copySelectedText = ref(null);
const debounceShowSelectMenu = debounce(showSelectMenu, 500);

/**
 * 获取选中文本的结束位置的矩形框
 * @returns {DOMRect | null} 选中文本的结束位置的矩形框
 */
function getEndOfSelectionRect() {
  const selection = window.getSelection();
  if (selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0).cloneRange();
  range.collapse(false);

  const tempSpan = document.createElement('span');
  tempSpan.textContent = '\u200B'; // 零宽空格，不可见
  range.insertNode(tempSpan);

  const rect = tempSpan.getBoundingClientRect();
  tempSpan.remove();
  return rect;
}

function showSelectMenu(rect) {
  const { left, top, height } = rect;
  SelectedMenuRef.value.style.left = `${left - 5}px`;
  SelectedMenuRef.value.style.top = `${top + 8 + height}px`;
  SelectedMenuRef.value.style.display = 'block';
}

function handleSelectionChange() {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  // 获取选区所在的 DOM 节点
  const container = selection.anchorNode?.parentElement;

  if (props.messageContentRef.contains(container) && selectedText) {
    const rangeCount = selection.rangeCount;
    if (rangeCount === 0) {
      return;
    }
    const rect = getEndOfSelectionRect();
    if (!rect) {
      return;
    }
    copySelectedText.value = selectedText;
    debounceShowSelectMenu(rect);
  }
}

function handleCopySelectedText() {
  const selectedText = copySelectedText.value;
  if (!selectedText) {
    return;
  }
  copyText(selectedText).finally(() => {
    SelectedMenuRef.value.style.display = 'none';
    copySelectedText.value = '';
  });
}

function handleQuoteSelectedText() {
  const selectedText = copySelectedText.value;
  if (!selectedText) {
    return;
  }
  SelectedMenuRef.value.style.display = 'none';
  emitter.emit(EventType.TEXT_REF, selectedText);
  // emits('quote-selected', selectedText);
}

function handleWindowClick(e) {
  if (!SelectedMenuRef.value.contains(e.target)) {
    SelectedMenuRef.value.style.display = 'none';
  }
}

onMounted(() => {
  document.addEventListener('selectionchange', handleSelectionChange);
  window.addEventListener('click', handleWindowClick);
});

onUnmounted(() => {
  document.removeEventListener('selectionchange', handleSelectionChange);
  window.removeEventListener('click', handleWindowClick);
  emitter.off(EventType.TEXT_REF);
});
</script>

<style lang="scss" scoped>
.selected-menu-container {
  position: fixed;
  background: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 6px;
  border-radius: 6px;
  display: none;
  .selected-menu {
    display: flex;
    align-items: center;

    .item {
      font-size: 14px;
      padding: 8px;
      border-radius: 6px;
      transition: all 0.3s ease-in-out;
      > span {
        padding-left: 2px;
      }
      &:hover {
        cursor: pointer;
        background-color: #e7e7e8;
      }
    }
  }
}
</style>

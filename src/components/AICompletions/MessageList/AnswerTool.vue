<template>
  <div class="answer-tool">
    <APopover>
      <template #content>
        <div class="popover-content">
          <div class="popover-item" @click="handleCopyMarkdown">
            <SvgIcon name="file-markdown" size="1.1em" />
            <span>复制为Markdown</span>
          </div>
          <div class="popover-item" @click="handleCopyText">
            <SvgIcon name="copy" size="1.1em" />
            <span>复制</span>
          </div>
        </div>
      </template>
      <div class="item">
        <SvgIcon name="copy" size="1.2em" />
        <SvgIcon name="arrow" size="1em" class="arrow" />
      </div>
    </APopover>
    <div class="item">
      <ATooltip title="点赞">
        <SvgIcon name="agree" size="1em" @click="handleProcessOpinion('agree')" />
      </ATooltip>
    </div>
    <div class="item">
      <ATooltip title="点踩">
        <SvgIcon name="disagree" size="1em" @click="handleProcessOpinion('disagree')" />
      </ATooltip>
    </div>
    <div v-if="showRefresh" class="item">
      <ATooltip title="重新生成">
        <SvgIcon name="refresh" size="1em" @click="handleRefresh" />
      </ATooltip>
    </div>
    <div class="item">
      <APopover>
        <template #content>
          <div class="popover-content">
            <div class="popover-item" @click="handleDelete">
              <SvgIcon name="delete" size="1.1em" />
              <span>删除</span>
            </div>
          </div>
        </template>
        <SvgIcon name="more" size="1em" />
      </APopover>
    </div>
  </div>
</template>
<script setup>
import { Popover as APopover, Tooltip as ATooltip } from 'ant-design-vue';
import SvgIcon from '@/components/SvgIcon/index.vue';
import { message } from 'ant-design-vue';
import { copyText } from '../scripts/utils.js';

const emits = defineEmits(['refresh', 'delete']);

const props = defineProps({
  item: {
    type: Object,
    default: () => ({}),
  },
  showRefresh: {
    type: Boolean,
    default: false,
  },
});

function handleCopyMarkdown() {
  const markdown = props.item.assistant?.markdown || '';
  copyText(markdown);
}

function handleCopyText() {
  const text = props.item.assistant?.content || '';
  const domParse = new DOMParser();
  const doc = domParse.parseFromString(text, 'text/html');
  const plainText = doc.querySelector('body').innerText;
  copyText(plainText);
}

function handleProcessOpinion(type) {
  console.log('🚀 ~ handleProcessOpinion ~ type:', type);
  message.warn('功能暂未实现');
}

function handleDelete() {
  emits('delete');
}

function handleRefresh() {
  emits('refresh');
}
</script>
<style lang="scss">
.answer-tool {
  display: flex;
  gap: 4px;
  margin-top: 4px;
  .item {
    display: flex;
    color: #808695;
    align-items: center;
    border-radius: 4px;
    padding: 2px 4px;
    transition: background-color 0.3s ease-in-out;
    > div {
      display: flex;
    }
    &:hover {
      cursor: pointer;
      background-color: #e7e7e8;
      .arrow {
        transform: rotate(180deg);
      }
    }
  }
}

.popover-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  .popover-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    color: #111333;
    padding: 2px 6px;
    border-radius: 4px;
    transition: background-color 0.3s ease-in-out;
    &:hover {
      background-color: #f3f3f5;
      cursor: pointer;
    }
  }
}
</style>

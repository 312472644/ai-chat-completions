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
        <SvgIcon name="refresh" size="1em" @click="handleRegenerate" />
      </ATooltip>
    </div>
    <div class="item">
      <APopover overlay-class-name="answer-tool-popover">
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
import { Popover as APopover, Tooltip as ATooltip, message } from 'ant-design-vue';
import { onUnmounted } from 'vue';
import SvgIcon from '@/components/SvgIcon/index.vue';

import emitter, { EventType } from '@/utils/emitter';
import { copyText } from '@/utils/index';

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

const emits = defineEmits(['delete']);

function handleCopyMarkdown() {
  const markdown = props.item.assistant?.markdown || '';
  copyText(markdown);
}

function handleCopyText() {
  const text = props.item.assistant?.content || '';
  const domParse = new DOMParser();
  const doc = domParse.parseFromString(text, 'text/html');
  const plainText = doc.querySelector('body').textContent;
  copyText(plainText);
}

function handleProcessOpinion() {
  message.warn('功能暂未实现');
}

function handleDelete() {
  emits('delete');
}

function handleRegenerate() {
  emitter.emit(EventType.REGENERATE, props.item.user.content);
}

onUnmounted(() => {
  emitter.off(EventType.REGENERATE);
});
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

.answer-tool-popover {
  .ant-popover-inner {
    padding: 8px !important;
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
}
</style>

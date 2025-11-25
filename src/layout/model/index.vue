<template>
  <div class="model">
    <a-popover overlayClassName="model-popover" :open="visible" placement="bottomLeft" trigger="click" :arrow="false">
      <template #content>
        <div class="model-list">
          <div
            v-for="item in modelList"
            :key="item.modelCode"
            class="model-item"
            :class="{ active: item.modelCode === currentModel }"
            @click="handleModelChange(item.modelCode)"
          >
            <div class="model-item-name">{{ item.modelName }}</div>
            <div v-if="item.desc" class="model-item-desc">{{ item.desc }}</div>
          </div>
        </div>
        <div class="model-footer">
          <div class="left-icon">
            <SvgIcon name="temp_chat" size="18px" />
            <span>临时对话</span>
          </div>
          <div class="right-icon">
            <a-switch v-model:checked="isTempChat" size="small" @change="handleTempChatChange" />
          </div>
        </div>
      </template>
      <template #title>
        <div style="font-size: 16px; padding: 0 12px">模型</div>
      </template>
      <div class="model-name" @click="visible = !visible">
        <span>{{ modelName }}</span>
        <DownOutlined style="font-size: 12px; margin-left: 4px" />
      </div>
    </a-popover>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue';
import { DownOutlined } from '@ant-design/icons-vue';
import { Popover as APopover, Switch as ASwitch } from 'ant-design-vue';
import SvgIcon from '@/components/SvgIcon/index.vue';

const currentModel = ref('qwen3-max');
const isTempChat = ref(false);
const visible = ref(false);

//TODO 从接口获取模型列表
const modelList = ref([
  {
    modelName: 'Qwen3-Max',
    modelCode: 'qwen3-max',
    desc: '通义千问 Qwen3 最大模型，128K 上下文/128K 输出，擅长复杂推理、长文档处理与代码生成。',
  },
  {
    modelName: 'Qwen3-Plus',
    modelCode: 'qwen3-plus',
    desc: '通义千问 Qwen3 均衡版，128K 上下文/64K 输出，兼顾性能与成本，适合通用创作与对话。',
  },
  {
    modelName: 'Kimi-K2-0905',
    modelCode: 'kimi-k2-0905',
    desc: 'Moonshot Kimi K2-0905 高性价模型，128K 上下文/64K 输出，中文长文理解与检索总结表现优异。',
  },
  {
    modelName: 'GPT-4.1',
    modelCode: 'gpt-4.1',
    desc: 'OpenAI GPT-4.1 高级通用模型，推理与创作能力强，支持较长上下文，适合复杂任务与工具调用。',
  },
  {
    modelName: 'Gemini-1.5',
    modelCode: 'gemini-1.5',
    desc: 'Google Gemini 1.5 长上下文与多模态能力突出，适合检索增强与跨格式内容理解。',
  },
]);

const modelName = computed(() => {
  const model = modelList.value.find(item => item.modelCode === currentModel.value);
  return model?.modelName || 'Qwen3-Max';
});

function handleModelChange(modelCode) {
  currentModel.value = modelCode;
  visible.value = false;
}

function handleTempChatChange(checked) {
  console.log('🚀 ~ handleTempChatChange ~ checked:', checked);
  isTempChat.value = checked;
  visible.value = false;
}
</script>
<style lang="scss">
.model {
}

.model-popover {
  max-width: 500px;
  .ant-popover-inner {
    margin-top: 8px;
  }

  .model-list {
    max-height: 300px;
    overflow: auto;
    .model-item {
      padding: 6px 12px;
      cursor: pointer;
      border-radius: 4px;
      transition: background-color 0.3s ease-in-out;
      margin-bottom: 4px;
      &.active {
        background-color: #f5f5f5;
      }
      &:hover {
        background-color: #f5f5f5;
      }
      .model-item-name {
        color: #113;
        font-size: 16px;
      }
      .model-item-desc {
        font-size: 13px;
        color: #666;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  .model-footer {
    border-top: 1px solid #eaeaed;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px 0 8px;
    font-size: 13px;
    color: #666;
    .left-icon {
      display: flex;
      align-items: center;
      gap: 2px;
    }
    .right-icon {
    }
  }
}
</style>

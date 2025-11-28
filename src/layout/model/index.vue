<template>
  <div class="model">
    <APopover
      v-model:open="visible"
      overlay-class-name="model-popover"
      placement="bottomLeft"
      trigger="click"
      :arrow="false"
    >
      <template #content>
        <div class="model-list">
          <div
            v-for="item in modelList"
            :key="item.modelCode"
            class="model-item"
            :class="{ active: item.modelCode === currentModel.modelCode }"
            @click="handleModelChange(item)"
          >
            <div class="model-item-name">
              {{ item.modelName }}
            </div>
            <div v-if="item.desc" class="model-item-desc">
              {{ item.desc }}
            </div>
          </div>
        </div>
        <div class="model-footer">
          <div class="left-icon">
            <SvgIcon name="temp_chat" size="18px" />
            <span>临时对话</span>
          </div>
          <div class="right-icon">
            <ASwitch v-model:checked="isTempSession" size="small" @change="handleTempChatChange" />
          </div>
        </div>
      </template>
      <template #title>
        <div style="font-size: 16px; padding: 0 12px">模型</div>
      </template>
      <div class="model-name" @click="visible = !visible">
        <span>{{ currentModel.modelName }}</span>
        <DownOutlined style="font-size: 12px; margin-left: 4px" />
      </div>
    </APopover>
  </div>
</template>

<script setup>
import { DownOutlined } from '@ant-design/icons-vue';
import { Popover as APopover, Switch as ASwitch } from 'ant-design-vue';
import { onMounted, ref } from 'vue';
import SvgIcon from '@/components/SvgIcon/index.vue';
import { ModelList } from '@/mock/index.js';
import { sessionStore } from '@/store';

const { isTempSession, setIsTempSession, setCurrentSessionId, currentModel, setCurrentModel } = sessionStore();

// TODO 从接口获取模型列表
const modelList = ref(ModelList);
const visible = ref(false);

function handleModelChange(model) {
  setCurrentModel({
    modelCode: model.modelCode,
    modelName: model.modelName,
  });
  visible.value = false;
}

function handleTempChatChange(checked) {
  visible.value = false;
  setIsTempSession(checked);
  setCurrentSessionId(false);
}

onMounted(() => {
  setCurrentModel({
    modelCode: modelList.value[0].modelCode,
    modelName: modelList.value[0].modelName,
  });
});
</script>

<style lang="scss">
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

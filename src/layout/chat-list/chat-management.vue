<template>
  <AModal
    v-model:open="visible"
    wrap-class-name="chat-management-modal"
    :width="isMobile ? '100%' : '960px'"
    :footer="null"
    :closable="false"
  >
    <template #title>
      <div class="chat-management-title">
        <span v-if="!isMobile" class="title-text">
          <span>管理对话记录</span>
          <span> · </span>
          <span>共{{ tableData.length }}条</span>
        </span>
        <span v-else>批量管理</span>
        <div class="right">
          <div v-if="!isMobile">
            <AInput v-model:value="keyWord" placeholder="搜索历史对话记录" size="large" @change="handleSearch">
              <template #prefix><SearchOutlined style="color: #999" /></template>
            </AInput>
          </div>
          <CloseOutlined style="color: #999" @click="visible = false" />
        </div>
      </div>
    </template>
    <div v-if="isMobile">
      <AInput v-model:value="keyWord" placeholder="搜索历史对话记录" @change="handleSearch">
        <template #prefix><SearchOutlined style="color: #999" /></template>
      </AInput>
    </div>
    <div class="chat-management-content">
      <ATable
        v-if="!isMobile && tableData.length > 0"
        :columns="columns"
        :data-source="tableData"
        row-key="id"
        sticky
        :pagination="false"
        :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
        empty-text="暂无对话记录"
      >
        <template #bodyCell="{ column, record }">
          <div v-if="column.key === 'operation'">
            <DeleteOutlined style="cursor: pointer; font-size: 16px" @click="handleDeleteChat(record)" />
          </div>
        </template>
      </ATable>
      <div
        v-if="tableData.length === 0"
        style="display: flex; flex-direction: column; justify-content: center; align-items: center; margin: 20px 0"
      >
        <AEmpty description="暂无对话记录" />
      </div>
      <div class="mobile-list">
        <div v-for="item in tableData" :key="item.id" class="mobile-item">
          <div class="mobile-item-left">
            <span>{{ item.summary }}</span>
          </div>
          <div class="mobile-item-right">
            <DeleteOutlined style="cursor: pointer; font-size: 16px" @click="handleDeleteChat(item)" />
          </div>
        </div>
      </div>
    </div>
    <div class="chat-management-footer">
      <div style="display: flex; align-items: center; gap: 6px">
        <span>已选中 {{ selectedCount }} 项</span>
        <AButton type="primary" :disabled="selectedRowKeys.length === 0" @click="handleDeleteSelected">
          删除选中项
        </AButton>
      </div>
    </div>
  </AModal>
</template>

<script setup>
import { CloseOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons-vue';
import {
  Button as AButton,
  Empty as AEmpty,
  Input as AInput,
  Modal as AModal,
  Table as ATable,
  Modal,
} from 'ant-design-vue';
import { computed, defineModel, ref, watch } from 'vue';
import { sessionStore, userStore } from '@/store';

const emits = defineEmits(['delete-session']);

const visible = defineModel('visible', {
  type: Boolean,
  default: () => false,
});

const { isMobile } = userStore();
const { sessionList, updateSessionList } = sessionStore();

const originalSessionList = ref([]);
const tableData = ref([]);
const keyWord = ref(null);
const selectedRowKeys = ref([]);
const columns = [
  {
    title: '对话名称',
    dataIndex: 'summary',
    key: 'summary',
    ellipsis: true,
  },
  {
    title: '对话时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 300,
  },
  {
    width: 80,
    align: 'center',
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
  },
];

const selectedCount = computed(() => {
  return tableData.value.filter(item => selectedRowKeys.value.includes(item.id)).length;
});

function handleSearch() {
  if (keyWord.value) {
    tableData.value = originalSessionList.value.filter(item => item.summary.includes(keyWord.value));
  } else {
    tableData.value = [...originalSessionList.value];
  }
}

function onSelectChange(selectedRows) {
  selectedRowKeys.value = selectedRows;
}

function handleDeleteChat(record) {
  Modal.confirm({
    title: '确认删除此对话记录吗？',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      const list = tableData.value.filter(item => item.id !== record.id);
      originalSessionList.value = [...list];
      tableData.value = [...list];
      selectedRowKeys.value = selectedRowKeys.value.filter(item => item !== record.id);
      updateSessionList(list);
      emits(
        'delete-session',
        [record].map(item => item.id)
      );
    },
  });
}

function handleDeleteSelected() {
  Modal.confirm({
    title: '确认删除选中项吗？',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      const list = tableData.value.filter(item => !selectedRowKeys.value.includes(item.id));
      originalSessionList.value = [...list];
      tableData.value = [...list];
      updateSessionList(list);
      emits('delete-session', list.length > 0 ? selectedRowKeys.value : []);
      selectedRowKeys.value = [];
    },
  });
}

watch(
  () => visible.value,
  newVal => {
    if (newVal) {
      originalSessionList.value = [...sessionList.value];
      tableData.value = [...sessionList.value];
    }
  }
);
</script>

<style lang="scss">
.chat-management-modal {
  .ant-modal {
    height: calc(100vh - 200px);
    bottom: 100px;
    > div:first-child {
      height: 100%;
    }
  }
  .ant-modal-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    .ant-modal-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
  }
  .chat-management-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .right {
      display: flex;
      align-items: center;
      gap: 20px;
      align-items: center;
    }
  }
  .mobile-list {
    .mobile-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 35px;
    }
  }
  .chat-management-content {
    flex: 1;
    overflow: auto;
  }
  .chat-management-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: 10px;
  }
}
</style>

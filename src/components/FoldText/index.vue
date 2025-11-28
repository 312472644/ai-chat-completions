<template>
  <div ref="foldTextContainer" class="fold-text-container" :class="{ 'show-fold': showFold }">
    <div class="fold-text">{{ text }}</div>
    <div v-if="showFold" class="icon" @click="handleFold">
      <DownOutlined v-if="isFold" />
      <UpOutlined v-else />
    </div>
  </div>
</template>

<script setup>
import { DownOutlined, UpOutlined } from '@ant-design/icons-vue';
import { onMounted, ref } from 'vue';

const props = defineProps({
  text: {
    type: String,
    default: '',
  },
  height: {
    type: Number,
    default: 25,
  },
});

const isFold = ref(true);
const showFold = ref(false);
const foldTextContainer = ref(null);
const showHeight = ref(`${props.height}px`);

function checkFold() {
  const dom = document.createElement('div');
  dom.style.cssText = 'left: -9999px; top: -9999px; position: absolute; width: 100%;';
  dom.innerHTML = props.text;
  foldTextContainer.value.appendChild(dom);
  showFold.value = dom.clientHeight > props.height;
  foldTextContainer.value.removeChild(dom);
}

function handleFold() {
  isFold.value = !isFold.value;
  showHeight.value = isFold.value ? `${props.height}px` : 'auto';
}

onMounted(() => checkFold());
</script>

<style lang="scss">
.fold-text-container {
  display: flex;
  width: 100%;
  height: v-bind(showHeight);
  position: relative;
  .icon {
    cursor: pointer;
  }
  &.show-fold {
    overflow: hidden;
  }
}
</style>

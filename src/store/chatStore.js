import { createGlobalState } from '@/hooks/createGlobalState';
import { useState } from '@/hooks/useState';

export const chatStore = createGlobalState(() => {
  // 是否正在加载中
  const [loading, updateLoading] = useState(false);
  // 第一个内容是否可见
  const [isFirstContentVisible, updateFirstContentVisible] = useState(false);
  // Render组件DOM实例
  const [renderDomRef, setRenderDomRef] = useState(null);

  return {
    loading,
    isFirstContentVisible,
    updateLoading,
    updateFirstContentVisible,
    renderDomRef,
    setRenderDomRef,
  };
});

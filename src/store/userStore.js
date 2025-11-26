import { ref } from 'vue';
import { createGlobalState } from '@/hooks/createGlobalState';
import { useState } from '@/hooks/useState';

/**
 * 用户状态管理
 * @returns {object} 用户状态对象
 * @property {Ref<boolean>} isMobile 是否为移动设备
 * @property {Ref<boolean>} isSideBarCollapsed 是否侧边栏折叠
 * @property {Function} toggleSideBarCollapsed 切换侧边栏折叠状态
 * @property {Function} toggleMobile 切换移动设备状态
 */
export const userStore = createGlobalState(() => {
  // 是否为移动设备
  const [isMobile, updateMobile] = useState(false);
  const isSideBarCollapsed = ref(false);

  const toggleSideBarCollapsed = () => {
    isSideBarCollapsed.value = !isSideBarCollapsed.value;
  };

  return {
    isMobile,
    isSideBarCollapsed,
    toggleMobile: updateMobile,
    toggleSideBarCollapsed,
  };
});

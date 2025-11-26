import { ref } from 'vue';
import { createGlobalState } from '@/hooks/createGlobalState';

/**
 * 用户状态管理
 * @returns {object} 用户状态对象
 * @property {Ref<boolean>} isMobile 是否为移动设备
 * @property {Ref<boolean>} isSideBarCollapsed 是否侧边栏折叠
 * @property {Function} toggleSideBarCollapsed 切换侧边栏折叠状态
 * @property {Function} toggleMobile 切换移动设备状态
 */
export const userStore = createGlobalState(() => {
  const isSideBarCollapsed = ref(false);
  const isMobile = ref(false);

  const toggleSideBarCollapsed = () => {
    isSideBarCollapsed.value = !isSideBarCollapsed.value;
  };

  const toggleMobile = val => {
    console.log('🚀 ~ toggleMobile ~ val:', val);
    isMobile.value = val;
  };

  return {
    isMobile,
    isSideBarCollapsed,
    toggleMobile,
    toggleSideBarCollapsed,
  };
});

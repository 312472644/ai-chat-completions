import { ref } from 'vue';
import { createGlobalState } from '@/hooks/createGlobalState';

export const userStore = createGlobalState(() => {
  const isSideBarCollapsed = ref(false);

  const toggleSideBarCollapsed = () => {
    isSideBarCollapsed.value = !isSideBarCollapsed.value;
  };

  return {
    isSideBarCollapsed,
    toggleSideBarCollapsed,
  };
});

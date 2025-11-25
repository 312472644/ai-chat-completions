import { reactive } from 'vue';

export const userStore = reactive({
  isSideBarCollapsed: false, // 侧边栏是否折叠
  toggleSideBarCollapsed() {
    this.isSideBarCollapsed = !this.isSideBarCollapsed;
  },
});

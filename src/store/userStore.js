import { reactive } from 'vue';

export const userStore = reactive({
  isSideBarCollapsed: false, // 侧边栏是否折叠
  toggleSideBarCollapsed(val) {
    this.isSideBarCollapsed = !this.isSideBarCollapsed;
  },
});

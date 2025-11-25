import { ref, onMounted, onBeforeUnmount } from 'vue';
import { debounce } from '@/utils/index.js';

/**
 * 监听媒体查询变化
 * @param {string} query 媒体查询字符串
 * @returns {boolean} 是否匹配媒体查询
 */
export default function useMediaQuery(query) {
  const mediaQueryList = window.matchMedia(query);
  const isMatched = ref(mediaQueryList.matches);

  function handleResize() {
    isMatched.value = mediaQueryList.matches;
  }

  const debouncedHandleResize = debounce(handleResize, 200);

  onMounted(() => {
    // 初始化时调用一次，确保初始值正确
    handleResize();
    window.addEventListener('resize', debouncedHandleResize);
  });

  // 移除事件监听，避免内存泄漏
  onBeforeUnmount(() => {
    window.removeEventListener('resize', debouncedHandleResize);
  });

  return isMatched;
}

import { nextTick, ref, shallowRef, watch } from 'vue';
import useMarked from '@/components/AICompletions/scripts/useMarked';
import { htmlToElement } from '@/utils/index';
import { applyHtmlDiff, canSafelyPreview, isIncompleteStructure } from './utils';

/**
 * 流式渲染Markdown信息
 */
export function useStreamingMarkdown(containerDOM) {
  const { parseMarkdown, initMarked, release } = useMarked();
  // 挂载的DOM元素
  const containerRef = ref(null);
  // 是否加载中
  const isLoading = ref(false);
  // 错误信息
  const error = ref(null);
  // 取消请求
  const controller = ref(null);
  // 是否看见第一个内容
  const isFCP = ref(false);
  // 是否终止请求
  const isAbort = ref(false);
  const markdown = shallowRef(null);

  const beforeFetch = () => {
    if (controller.value) {
      controller.value.abort();
    }
    if (containerRef.value) {
      containerRef.value.innerHTML = '';
    }
    controller.value = new AbortController();
    isAbort.value = false;
    error.value = null;
    isFCP.value = true;
    isLoading.value = true;
  };

  const afterFetch = () => {
    isLoading.value = false;
    controller.value = null;
    isFCP.value = false;
  };

  /**
   * fetch请求
   * @param {string} url 请求地址
   * @param {object} params
   */
  const fetchStream = async (url, params = {}) => {
    beforeFetch();

    let rawBuffer = '';
    let markdownBuffer = '';
    let isStreamDone = false;

    try {
      const response = await fetch(url, { ...params, signal: controller.value.signal });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (!isStreamDone) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        // 保证数据的完整性。并不是所有的数据刚好是处在\n换行处。有可文字被拆分
        rawBuffer += decoder.decode(value, { stream: true });
        const lines = rawBuffer.split('\n');
        rawBuffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') {
              isStreamDone = true;
              break;
            }

            try {
              const chunk = JSON.parse(dataStr);
              const content = chunk?.choices?.[0]?.delta?.content;
              if (typeof content === 'string') {
                markdownBuffer += content;
              }
            } catch {
              console.warn('JSON parse error:', dataStr);
            }
          }
        }

        // 增量式渲染
        if (!isIncompleteStructure(markdownBuffer) || canSafelyPreview(markdownBuffer)) {
          const htmlAll = parseMarkdown(markdownBuffer);
          requestAnimationFrame(() => {
            applyHtmlDiff(htmlAll, containerRef.value);
            if (isFCP.value) {
              const dom = htmlToElement(htmlAll);
              if (dom) {
                isFCP.value = dom.textContent.length === 0;
              }
            }
          });
        }
      }

      // 兜底策略，防止渲染异常。
      if (markdownBuffer.trim()) {
        const finalHtmlAll = parseMarkdown(markdownBuffer);
        applyHtmlDiff(finalHtmlAll, containerRef.value);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        error.value = err.message || '请求失败';
      }
    } finally {
      markdown.value = markdownBuffer;
      afterFetch();
    }
  };

  const cancel = () => {
    controller.value?.abort();
    controller.value = null;
    isAbort.value = true;
  };

  watch(
    () => containerDOM,
    async val => {
      await nextTick();
      if (val && !containerRef.value) {
        containerRef.value = val;
        // 初始化marked
        initMarked(document.querySelector('.message-container'));
      }
    },
    { immediate: true }
  );

  return {
    isLoading,
    error,
    isFCP,
    isAbort,
    markdown,
    fetchStream,
    cancel,
    release,
  };
}

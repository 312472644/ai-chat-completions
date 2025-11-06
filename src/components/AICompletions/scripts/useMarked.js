import { nextTick, onBeforeUnmount, shallowRef } from 'vue';

import { createHighlighter } from 'shiki';
import { Marked, Renderer } from 'marked';
import { HighlighterConfig } from './config.js';

import { rendererCode, codeEventListener } from './marked-renderer/code-renderer.js';

/**
 * 解析 markdown 文本
 */

const useMarked = () => {
  const marked = new Marked();
  const render = new Renderer();

  const highlighter = shallowRef(null);
  const containerDOM = shallowRef(null);

  const event = {
    handleCode: () => {},
  };

  /**
   * 事件监听
   */
  function eventListener() {
    // 为代码块添加事件监听
    event.handleCode = codeEventListener(containerDOM.value);
  }

  /**
   * 将markdown转化成html
   * @param {string} markdown
   * @returns {string}
   */
  function parseMarkdown(markdown) {
    if (!markdown) return '';
    return marked.parse(markdown);
  }

  /**
   * 自定义元素渲染内容
   * @link https://marked.js.org/using_pro#renderer
   */
  function customRenderer() {
    render.code = rendererCode(highlighter.value, HighlighterConfig.theme.light);
  }

  async function initHighlighter() {
    highlighter.value = await createHighlighter({
      langs: HighlighterConfig.langs,
      themes: HighlighterConfig.themes,
    });
  }

  async function initMarked(containerDOMRef) {
    await initHighlighter();
    containerDOM.value = containerDOMRef;
    customRenderer();
    marked.use({ renderer: render });
    await nextTick();
    eventListener();
  }

  onBeforeUnmount(() => {
    event?.handleCode?.();
  });

  return {
    initMarked,
    parseMarkdown,
  };
};

export default useMarked;

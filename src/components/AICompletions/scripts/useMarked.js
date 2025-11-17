import { nextTick, shallowRef } from 'vue';

import { createHighlighter } from 'shiki';
import { Marked, Renderer } from 'marked';
import { HighlighterConfig } from './config.js';

import { rendererCode, codeEventListener } from './marked-renderer/code.js';
import { rendererImage } from './marked-renderer/image.js';

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
    handleImage: () => {},
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
    render.image = rendererImage;
    // 超链接
    render.link = ({ href, text }) => {
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    };
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

  function release() {
    event?.handleCode?.();
    event?.handleImage?.();
  }

  return {
    release,
    initMarked,
    parseMarkdown,
  };
};

export default useMarked;

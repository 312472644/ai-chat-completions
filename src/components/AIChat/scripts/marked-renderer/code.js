import { message } from 'ant-design-vue';
import ArrowSvg from '@/assets/svg/arrow.svg?raw';
import BedtimeSvg from '@/assets/svg/bedtime.svg?raw';

import CopySvg from '@/assets/svg/copy.svg?raw';
import LightSvg from '@/assets/svg/light_mode.svg?raw';
import { findParentElement } from '@/utils/index.js';
import { HighlighterConfig } from '../config.js';

const globalInstance = { highlighter: null };

/**
 * 代码复制
 * @param {HTMLElement} codeBlock
 */
function handleCopyCode(codeBlock) {
  const codeContent = codeBlock.querySelector('pre code')?.textContent || '';
  navigator.clipboard
    .writeText(codeContent)
    .then(() => {
      message.success('复制成功');
    })
    .catch(() => {
      message.error('复制失败');
    });
}

/**
 * 主题切换
 * @param {HTMLElement} target
 * @param {HTMLElement} codeBlock
 */
function handleToggleCodeTheme(target, codeBlock) {
  const theme = target.dataset.theme;
  const lang = target.dataset.lang;
  target.dataset.theme = theme === 'light' ? 'dark' : 'light';
  target.innerHTML = theme === 'light' ? LightSvg : BedtimeSvg;
  const html = globalInstance.highlighter.codeToHtml(codeBlock.querySelector('code').textContent, {
    lang,
    theme: theme === 'light' ? HighlighterConfig.theme.dark : HighlighterConfig.theme.light,
  });
  codeBlock.classList.toggle('dark');
  codeBlock.querySelector('.code-content').innerHTML = html;
}

/**
 * 展开/收起代码块
 * @param {HTMLElement} target 展开/收起按钮
 * @param {HTMLElement} codeBlock 代码块
 */
function handleExpandCode(target, codeBlock) {
  const collapse = target.dataset.collapse;
  const codeContent = codeBlock.querySelector('.code-content');
  const codeFooter = codeBlock.querySelector('.code-footer');
  const codeLines = codeBlock.querySelectorAll('code span.line').length;
  const isDown = collapse === 'down';

  codeContent.style.display = isDown ? 'none' : 'block';
  codeFooter.style.display = isDown ? 'flex' : 'none';
  codeFooter.textContent = `已隐藏${codeLines}行代码`;
  target.dataset.collapse = isDown ? 'up' : 'down';
  target.classList.toggle('up');
}

function handleCodeEvent(e) {
  const target = findParentElement(e.target, '[data-copy], [data-theme], [data-collapse]');
  if (!target) {
    return;
  }
  const codeBlock = e.target.closest('.custom-code-block');
  if (target.matches('[data-copy]')) {
    handleCopyCode(codeBlock);
  } else if (target.matches('[data-theme]')) {
    handleToggleCodeTheme(target, codeBlock);
  } else if (target.matches('[data-collapse]')) {
    handleExpandCode(target, codeBlock);
  }
}

/**
 *  markdown code代码块自定义渲染
 * @param {Highlight} highlighter highlighter对象
 * @param {string} theme 主题
 * @returns {Function} 代码块自定义渲染函数
 */
export function rendererCode(highlighter, theme) {
  globalInstance.highlighter = highlighter;
  return ({ text, lang }) => {
    const html = highlighter.codeToHtml(text, {
      lang,
      theme,
    });

    const languageLabel = lang || 'text';
    return `<div class="custom-code-block" data-lang="${languageLabel}">
        <div class="code-header">
          <span class="lang-label">${languageLabel}</span>
          <div class="tool-btn-container">
            <div class="item copy" data-copy title="复制">${CopySvg}</div>
            <div class="item theme" data-lang="${languageLabel}" data-theme="light" title="切换主题">${BedtimeSvg}</div>
            <div class="item collapse" data-collapse="down" title="收起">${ArrowSvg}</div>
          </div>
        </div>
        <div class="code-content">${html}</div>
        <div class="code-footer">已隐藏0行代码</div>
      </div>`;
  };
}

/**
 * 事件监听。通过监听容器元素（事件委托），实现对所有代码块的事件监听。
 * @param {*} containerDOM 代码块容器元素
 * @returns {Function} 移除事件监听函数
 */
export function codeEventListener(containerDOM) {
  containerDOM.addEventListener('click', handleCodeEvent);
  return () => {
    containerDOM.removeEventListener('click', handleCodeEvent);
  };
}

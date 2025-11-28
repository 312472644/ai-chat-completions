import { message } from 'ant-design-vue';

/**
 * 滚动至DOM元素指定位置
 * @param {HTMLElement} target 目标元素
 * @param {boolean} [isSmooth]  是否平滑滚动
 * @param {number} [top]  滚动到的位置
 * @returns {void}
 */
export function scrollToBottom(target, isSmooth = true, top) {
  if (!target) {
    return;
  }
  target.scrollTo({
    top: top === undefined || top === null ? target.scrollHeight : top,
    behavior: isSmooth ? 'smooth' : 'auto',
  });
}

/**
 * simple-uniqueid 生成唯一ID
 * @returns {string} 唯一ID
 */
export function getUniqueid() {
  const id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  return `xx-${id}`;
}

/**
 * 格式化时间戳为日期时间字符串
 * @param {number} timestamp 时间戳（毫秒）
 * @returns {string} 格式化后的日期时间字符串（例如："2023-08-15 14:30:00"）
 */
export function formatTime(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 查找目标元素的最近匹配父元素
 * @param {HTMLElement} target 目标元素
 * @param {string} selector 选择器字符串
 * @returns {HTMLElement|null} 最近匹配的父元素或null（如果未找到）
 */
export function findParentElement(target, selector) {
  while (target && target !== document.body) {
    if (target.matches(selector)) {
      return target;
    }
    target = target.parentElement;
  }
  return null;
}

/**
 * 复制文本到剪贴板
 * @param {string} text 要复制的文本
 * @returns {Promise<void>} 复制操作的Promise
 */
export function copyText(text) {
  if (!text) {
    return Promise.resolve();
  }

  return navigator.clipboard
    .writeText(text)
    .then(() => {
      message.success('复制成功');
    })
    .catch(() => {
      message.error('复制失败');
    });
}

/**
 * 函数防抖
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function} 防抖函数
 */
export function debounce(fn, delay = 1000) {
  let timer = null;
  return function (...args) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * 将html元素字符串转化成dom元素
 * @param {string} htmlString html元素字符串
 * @returns {HTMLElement} dom元素
 */
export function htmlToElement(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  return doc.body;
}

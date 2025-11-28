import { message } from 'ant-design-vue';

/**
 * 滚动至DOM元素最底部
 * @param {HTMLElement} target 目标元素
 * @param {boolean} [isSmooth]  是否平滑滚动
 * @returns {void}
 */
export function scrollToBottom(target, isSmooth = true) {
  if (!target) {
    return;
  }
  target.scrollTo({
    top: target.scrollHeight,
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
export function formatTime(timestamp, format = 'yyyy-MM-dd HH:mm:ss') {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace('yyyy', year)
    .replace('MM', month)
    .replace('dd', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
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
 * 函数节流
 * @param {Function} func 要节流的函数
 * @param {number} delay 节流时间间隔（毫秒）
 * @returns {Function} 节流函数
 */
export function throttle(func, delay = 1000) {
  let timer = null;
  let lastExecTime = 0;
  return function (...args) {
    const now = Date.now();
    const remaining = delay - (now - lastExecTime);

    if (remaining <= 0 || remaining > delay) {
      // 立即执行
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      func.apply(this, args);
      lastExecTime = now;
    } else if (!timer) {
      // 延迟执行尾部
      timer = setTimeout(() => {
        func.apply(this, args);
        lastExecTime = Date.now();
        timer = null;
      }, remaining);
    }
  };
}

/**
 * 将html元素字符串转化成dom元素
 * @param {string} htmlString
 * @returns {HTMLElement} dom元素
 */
export function htmlToElement(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  return doc.body;
}

/**
 * 深拷贝对象
 * @param {object} obj 要拷贝的对象
 * @returns {object} 拷贝后的对象
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(deepClone);
  }

  const clone = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clone[key] = deepClone(obj[key]);
    }
  }

  return clone;
}

/**
 * 判断一个值是否不为空对象
 * @param {string | object} val 要判断的值
 * @returns {boolean} 是否为空对象
 */
export function isNotEmptyObject(val) {
  if (typeof val !== 'object' || val === null) {
    return false;
  }
  return Object.keys(val).length > 0;
}
/**
 * 下载JSON文件
 * @param {object} data 要下载的JSON数据
 * @param {string} fileName 下载的文件名（可选，默认：'file.json'）
 */
export function downloadJsonFile(data, fileName = 'file.json') {
  return new Promise((resolve, reject) => {
    try {
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { contentType: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName.includes('.json') ? fileName : `${fileName}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      resolve(url);
    } catch (error) {
      reject(error);
    }
  });
}

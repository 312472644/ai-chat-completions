/**
 * 滚动至DOM元素最底部
 * @param {HTMLElement} target 目标元素
 * @param {Boolean} [isSmooth=true]  是否平滑滚动
 * @returns
 */
export function scrollToBottom(target, isSmooth = true) {
  if (!target) return;
  target.scrollTo({
    top: target.scrollHeight,
    behavior: isSmooth ? 'smooth' : 'auto',
  });
}

/**
 * simple-uniqueid 生成唯一ID
 * @returns {String} 唯一ID
 */
export function getUniqueid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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

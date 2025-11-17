import { getUniqueid } from '@/utils/index';

const imgSet = new Set();
/**
 * 图片渲染
 */

function imageLoaded(id) {
  setTimeout(() => {
    const imageBlock = document.querySelector(`#${id}`);
    if (imageBlock) {
      imageBlock.querySelector('.image-placeholder').remove();
      imageBlock.querySelector('img').removeAttribute('onload');
    }
  }, 1000);
}

export function rendererImage({ href, alt }) {
  const id = 'image-' + getUniqueid();
  return `
  <div id="${id}" class="custom-image-block" data-image="${href}">
    <div class="image-placeholder">
      <div class="spinner-border" role="status"></div>
    </div>
    <img src="${href}" alt="${alt || ''}" width="100px" height="100px" onload="${imageLoaded(
    id
  )}"  loading="lazy"  />
  </div>`;
}

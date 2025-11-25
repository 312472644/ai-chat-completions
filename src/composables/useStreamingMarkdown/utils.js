import DOMPurify from 'dompurify';

/**
 * 校验文本是否符合Markdown语法
 * @param {*} text
 * @returns {boolean}
 */
export function isIncompleteStructure(text) {
  if (!text?.trim()) return false;
  const lines = text.split('\n');

  const hasOpenFence = (() => {
    let inFence = false;
    let fence = null;
    for (const ln of lines) {
      const m = ln.match(/^\s*(```|~~~)/);
      if (m) {
        if (!inFence) {
          inFence = true;
          fence = m[1];
        } else if (m[1] === fence) {
          inFence = false;
          fence = null;
        }
      }
    }
    return inFence;
  })();
  if (hasOpenFence) return true;

  const removeFences = ls => {
    let inFence = false;
    let fence = null;
    const out = [];
    for (const ln of ls) {
      const m = ln.match(/^\s*(```|~~~)/);
      if (m) {
        if (!inFence) {
          inFence = true;
          fence = m[1];
        } else if (m[1] === fence) {
          inFence = false;
          fence = null;
        }
        continue;
      }
      if (!inFence) out.push(ln);
    }
    return out.join('\n');
  };

  const outsideText = removeFences(lines);
  const outsideLastLine = outsideText.split('\n').pop() || '';
  const textNoInlineCode = outsideText.replace(/`[^`\n]*`/g, '');
  const lastLineNoInlineCode = outsideLastLine.replace(/`[^`\n]*`/g, '');

  const inlineBacktickCount = (textNoInlineCode.match(/(?<!\\)`/g) || []).length;
  if (inlineBacktickCount % 2 === 1) return true;

  const lastLineMathCount = (lastLineNoInlineCode.match(/(?<!\\)\$/g) || []).length;
  if (lastLineMathCount % 2 === 1) return true;

  const totalLb = (textNoInlineCode.match(/\[/g) || []).length;
  const totalRb = (textNoInlineCode.match(/]/g) || []).length;
  if (totalLb > totalRb) return true;
  {
    const rb = lastLineNoInlineCode.lastIndexOf(']');
    if (rb !== -1) {
      let balance = 0;
      for (let i = rb + 1; i < lastLineNoInlineCode.length; i++) {
        const ch = lastLineNoInlineCode[i];
        const prev = lastLineNoInlineCode[i - 1];
        if (ch === '(' && prev !== '\\') balance++;
        else if (ch === ')' && prev !== '\\') balance--;
        if (balance < 0) balance = 0;
        if (balance === 0 && ch === ')' && prev !== '\\') break;
      }
      if (balance > 0) return true;
    }
  }

  if (/<[A-Za-z][^>]*$/.test(lastLineNoInlineCode)) return true;
  {
    const openIdx = textNoInlineCode.lastIndexOf('<!--');
    const closeIdx = textNoInlineCode.lastIndexOf('-->');
    if (openIdx > closeIdx) return true;
  }

  {
    const firstNonEmpty = lines.find(l => l.trim().length > 0);
    if (firstNonEmpty && /^\s*---\s*$/.test(firstNonEmpty)) {
      const hasClosing = lines.slice(1).some(l => /^\s*---\s*$/.test(l));
      if (!hasClosing) return true;
    }
  }

  {
    const inlineParenOpen = (lastLineNoInlineCode.match(/\\\(/g) || []).length;
    const inlineParenClose = (lastLineNoInlineCode.match(/\\\)/g) || []).length;
    if (inlineParenOpen > inlineParenClose && !text.endsWith('\n')) return true;
    const inlineBracketOpen = (lastLineNoInlineCode.match(/\\\[/g) || []).length;
    const inlineBracketClose = (lastLineNoInlineCode.match(/\\\]/g) || []).length;
    if (inlineBracketOpen > inlineBracketClose && !text.endsWith('\n')) return true;
  }

  return false;
}

/**
 * 校验文本是否符合markdown表格或代码语法
 * @param {string} text
 * @returns {boolean}
 */
export function canSafelyPreview(text) {
  if (!text.trim()) return false;

  const lines = text.split('\n');
  const lastLine = lines[lines.length - 1].trim();

  let inFence = false;
  let fenceType = null;
  for (const ln of lines) {
    const m = ln.match(/^\s*(```|~~~)(\S*)?/);
    if (m) {
      if (!inFence) {
        inFence = true;
        fenceType = m[1];
      } else if (m[1] === fenceType) {
        inFence = false;
        fenceType = null;
      }
    }
  }

  if (inFence && !/^\s*(```|~~~)/.test(lastLine)) {
    return true;
  }

  // 情况2：长表格（以 | 开头，且有表头分隔线）
  const isLikelyTable =
    lines.some(l => l.trim().startsWith('|')) && lines.some(l => /(\|[-:| ]+)+\|/.test(l)); // 包含分隔行
  if (isLikelyTable && lines.length > 3) {
    return true;
  }

  return false;
}

/**
 * 增量更新容器里的内容
 * @param {string} htmlAll
 * @param {HTMLElement} container
 * @returns
 */
export function applyHtmlDiff(htmlAll, container) {
  let cleanHtml = '';
  try {
    cleanHtml = DOMPurify.sanitize(htmlAll, {
      ADD_ATTR: ['target'],
      ADD_TAGS: ['img'],
    });
  } catch (e) {
    console.error('DOMPurify error:', e);
    return;
  }

  if (!container || !cleanHtml.trim()) return;

  // 使用临时容器承载最新完整 HTML，用于和现有 DOM 做差异对比
  const existing = container;
  const temp = document.createElement('div');
  temp.innerHTML = cleanHtml;

  // 提取元素子节点序列（不包含纯文本节点），用于逐元素比对
  const oldChildren = Array.from(existing.children);
  const newChildren = Array.from(temp.children);

  // 找到第一个不同的节点索引
  let i = 0;
  const minLen = Math.min(oldChildren.length, newChildren.length);
  while (i < minLen && oldChildren[i].outerHTML === newChildren[i].outerHTML) {
    i++;
  }

  // 从第一个差异位置开始，移除旧容器的尾部节点，避免重建已一致的前缀
  while (existing.children.length > i) {
    existing.removeChild(existing.lastElementChild);
  }

  // 追加差异及新增节点（克隆插入，避免移动导致的副作用）
  for (let j = i; j < newChildren.length; j++) {
    existing.appendChild(newChildren[j].cloneNode(true));
  }
}

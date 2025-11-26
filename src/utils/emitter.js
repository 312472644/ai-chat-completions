import mitt from 'mitt';

/**
 * 事件类型
 */
export const EventType = {
  /**
   * 重新生成事件
   */
  REGENERATE: 'regenerate',
  /**
   * 删除事件
   */
  DELETE: 'delete',
  /**
   * 建议点击事件
   */
  SUGGESTION: 'suggestion',
  /**
   * 新对话
   */
  NEW_CHAT: 'newChat',
  /**
   * 临时对话
   */
  TEMP_CHAT: 'tempChat',
};

const emitter = mitt();

export default emitter;

/**
 * 终端类型
 */
export const TERMINAL = {
  /**
   * 网页端
   */
  WEB: 'web',
  /**
   * 移动端
   */
  MOBILE: 'mobile',
};

/**
 * 角色类型
 */
export const ROLE = {
  /**
   * 用户
   */
  USER: 'user',
  /**
   * 助手
   */
  ASSISTANT: 'assistant',
};

/**
 * 消息类型
 */
export const MESSAGE_TYPE = {
  /**
   * 文本消息(默认)
   */
  TEXT: 'text',
  /**
   * 图片消息
   */
  IMAGE: 'image',
  /**
   * 视频消息
   */
  VIDEO: 'video',
};

/**
 * 发送者类型
 */
export const SENDER_TYPE = {
  /**
   * 用户
   */
  USER: 'USER',
  /**
   * 助手(机器)
   */
  BOT: 'BOT',
};

/**
 * 消息状态
 */
export const MESSAGE_STATUS = {
  /**
   * 完成
   */
  FINISHED: 'FINISHED',
  /**
   * 终止
   */
  ABORTED: 'ABORTED',
};

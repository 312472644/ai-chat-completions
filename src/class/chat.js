import { formatTime, getUniqueid, isNotEmptyObject } from '@/utils/index';

/**
 * 对话消息
 * @description 对话消息类，用于表示一个对话消息。
 */
export class Chat {
  constructor(chat) {
    if (!isNotEmptyObject(chat)) {
      console.warn('构造参数为空对象');
      return;
    }
    /**
     * 消息ID
     */
    this.msgId = getUniqueid() || '';
    /**
     * 是否可以复制
     */
    this.canCopy = chat.canCopy ?? true;
    /**
     * 是否可以反馈
     */
    this.canFeedback = chat.canFeedback ?? true;
    /**
     * 是否可以重新生成
     */
    this.canRegenerate = chat.canRegenerate ?? true;
    /**
     * 是否可以删除
     */
    this.canDelete = chat.canDelete ?? true;
    /**
     * 模型名称
     */
    this.modelName = chat.modelName || '';
    /**
     * 模型代码
     */
    this.modelCode = chat.modelCode || '';
    /**
     * 对话ID
     */
    this.sessionId = chat.sessionId || '';
    /**
     * 引用文本
     */
    this.refText = chat.refText || '';
    /**
     * 消息内容
     */
    this.content = chat.content || '';
    /**
     * 渲染HTML内容
     */
    this.renderHTML = chat.renderHTML || '';
    /**
     * 角色(用户、助手)
     * @type {ROLE}
     */
    this.role = chat.role || '';
    /**
     * 消息状态(完成、终止)
     * @type {MESSAGE_STATUS}
     */
    this.status = chat.status || '';
    /**
     * 消息类型(文本、图片、视频)
     * @type {MESSAGE_TYPE}
     */
    this.contentType = chat.contentType || '';
    /**
     * 发送者类型(用户、助手)
     * @type {SENDER_TYPE}
     */
    this.senderType = chat.senderType || '';
    /**
     * 创建时间
     */
    this.createTime = formatTime(new Date()) || '';
    return this;
  }
}

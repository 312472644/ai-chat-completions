import { formatTime, getUniqueid } from './utils.js';
import { Role } from './config.js';

/**
 * 消息类
 */
class BaseMessage {
  constructor({ modelCode = '', role = '', content = '', markdown = '', isAborted = false }) {
    this.id = getUniqueid();
    // 消息角色(user, assistant)
    this.role = role;
    // 模型编码
    this.modelCode = modelCode;
    // 消息内容(用户输入或助手回复。 HTML格式或文本)
    this.content = content;
    // 助手回复的markdown格式
    this.markdown = markdown;
    // 是否被中止
    this.isAborted = isAborted;
    // 创建时间
    this.createTime = formatTime(new Date());
  }
}

/**
 * 消息列表类
 * 用于存储和管理消息列表
 */
class Message {
  /**
   * 构造器
   * @param {BaseMessage} message
   */
  constructor() {
    // 当前渲染的消息
    this.currentMessage = {
      modelCode: '',
      markdown: '',
      createTime: formatTime(new Date()),
    };
    // 消息列表
    this.messages = [];
  }
  /**
   * 更新当前消息
   * @param {BaseMessage} message 要更新的消息
   * @returns
   */
  updateCurrentMessage(message) {
    if (!message) return;
    const { modelCode, markdown } = message || {};
    this.currentMessage = {
      modelCode,
      createTime: formatTime(new Date()),
      markdown,
    };
  }
  /**
   * 清空当前消息
   */
  clearCurrentMessage() {
    this.currentMessage = {
      modelCode: '',
      markdown: '',
      createTime: formatTime(new Date()),
    };
  }
  /**
   * 添加消息
   * @param {BaseMessage} message
   */
  addUser(message) {
    if (!message) return;
    const userMessage = new BaseMessage(message);
    const msg = {
      id: getUniqueid(),
      [Role.USER]: userMessage,
      [Role.ASSISTANT]: null,
    };
    this.messages.push(msg);
  }
  /**
   * 添加助手消息
   * @param {BaseMessage} message
   * @returns
   */
  addAssistant(message) {
    if (!message) return;
    const assistantMessage = new BaseMessage(message);
    assistantMessage.isAborted = message.isAborted;
    const lastIndex = this.messages.length - 1;
    if (lastIndex >= 0) {
      this.messages[lastIndex][Role.ASSISTANT] = assistantMessage;
      this.messages[lastIndex].isAborted = assistantMessage.isAborted;
    }
  }
  /**
   * 删除消息
   * @param {string} id
   */
  deleteItem(id) {
    if (!id) return;
    const index = this.messages.findIndex(item => item.id === id);
    if (index >= 0) {
      this.messages.splice(index, 1);
    }
  }
  /**
   * 批量删除消息
   * @param {string[]} ids
   */
  deleteItems(ids) {
    if (!ids || ids.length === 0) return;
    ids.forEach(id => this.deleteItem(id));
  }
  /**
   * 清空消息列表
   */
  clear() {
    this.messages = [];
  }
}

export { Message };

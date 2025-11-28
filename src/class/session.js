import { MESSAGE_TYPE, TERMINAL } from '@/constant/enum';
import { formatTime, getUniqueid, isNotEmptyObject } from '@/utils/index';

/**
 * 对话会话
 * @description 对话会话类，用于表示一个对话会话。通过sessionId来与对话列表进行关联。(一个用户可以有多个对话列表)
 */
export class Session {
  constructor(session) {
    if (!isNotEmptyObject(session)) {
      console.warn('构造参数为空对象');
      return;
    }
    /**
     * 是否置顶
     */
    this.top = session.top ?? false;
    /**
     * 对话总结
     */
    this.summary = session.summary || '';
    /**
     * 总结类型(文本、图片、视频)
     */
    this.summaryType = MESSAGE_TYPE.TEXT || session.summaryType || '';
    /**
     * 对话ID
     */
    this.id = getUniqueid() || session.sessionId || '';
    /**
     * 用户ID
     */
    this.userId = session.userId || '';
    /**
     * 用户ID
     */
    this.userId = '';
    /**
     * 终端类型(web、mobile)
     * @type {TERMINAL}
     */
    this.terminal = TERMINAL.WEB || session.terminal || '';
    /**
     * 对话组ID
     */
    this.groupId = session.groupId || '';
    /**
     * 对话组名称
     */
    this.groupName = session.groupName || '';
    /**
     * 创建时间
     */
    this.createTime = formatTime(new Date()) || '';
    /**
     * 修改时间
     */
    this.modifiedTime = session.modifiedTime || '';

    return this;
  }
}

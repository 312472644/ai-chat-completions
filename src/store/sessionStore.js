import { ref } from 'vue';
import { Session } from '@/class/index';
import { createGlobalState } from '@/hooks/createGlobalState';
import { useState } from '@/hooks/useState';

export const sessionStore = createGlobalState(() => {
  const sessionList = ref(JSON.parse(localStorage.getItem('sessionList')) || []);
  // 是否是临时对话
  const [isTempSession, setIsTempSession] = useState(false);
  // 当前会话
  const [currentSessionId, setCurrentSessionId] = useState(null);
  // 当前选择会话模型
  const [currentModel, setCurrentModel] = useState({
    modelCode: '',
    modelName: '',
  });

  function persist() {
    localStorage.setItem('sessionList', JSON.stringify(sessionList.value));
  }

  /**
   * 更新会话
   * @param {Session} session 会话对象
   */
  // TODO （应该从接口获取）
  function updateSession(session) {
    // 临时对话不需要更新
    if (isTempSession.value) {
      console.log('🚀 ~ updateSession ~ 临时对话不需要更新');
      currentSessionId.value = null;
      return;
    }
    // 新增会话
    if (!currentSessionId.value) {
      const sessionObj = new Session(session);
      currentSessionId.value = sessionObj.id;
      sessionList.value.unshift(sessionObj);
      persist();
    }
  }

  /**
   * 新建对话
   */
  function newChat() {
    currentSessionId.value = null;
    setIsTempSession(false);
  }

  /**
   * 删除会话
   * @param {string} sessionId 会话ID
   */
  function deleteSession(sessionId) {
    sessionList.value = sessionList.value.filter(item => item.id !== sessionId);
    setCurrentSessionId(null);
    persist();
  }

  /**
   * 更新会话列表
   * @param {Session[]} newList 会话列表
   */
  function updateSessionList(newList) {
    sessionList.value = [...newList];
    persist();
  }

  return {
    currentModel,
    setCurrentModel,
    sessionList,
    updateSession,
    currentSessionId,
    setCurrentSessionId,
    isTempSession,
    setIsTempSession,
    newChat,
    deleteSession,
    updateSessionList,
  };
});

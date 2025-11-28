import { ref } from 'vue';
import { Chat } from '@/class';
import { SENDER_TYPE } from '@/constant/enum';
import { createGlobalState } from '@/hooks/createGlobalState';
import { useState } from '@/hooks/useState';
import { getUniqueid } from '@/utils/index';
import { sessionStore } from './sessionStore.js';

export const chatStore = createGlobalState(() => {
  const { deleteSession, setCurrentSessionId } = sessionStore();
  // 是否正在加载中
  const [loading, updateLoading] = useState(false);
  // 第一个内容是否可见
  const [isFirstContentVisible, updateFirstContentVisible] = useState(false);
  // Render组件DOM实例
  const [renderDomRef, setRenderDomRef] = useState(null);
  // 当前选中的对话
  const [currSelectChat, setCurrSelectChat] = useState(null);
  // 建议列表
  const [suggestList, setSuggestList] = useState([]);
  // 是否是删除模式
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  // 对话列表
  const chatList = ref(JSON.parse(localStorage.getItem('chatList')) || []);

  /**
   * 持久化对话列表
   */
  function persist() {
    localStorage.setItem('chatList', JSON.stringify(chatList.value));
  }

  /**
   * 添加用户对话
   */
  function addUserChat(sessionId, chat) {
    if (!sessionId) {
      return;
    }
    // 如果存在chatList
    const chatObj = chatList.value.find(item => item.sessionId === sessionId);
    const newChat = new Chat({ ...chat, senderType: SENDER_TYPE.USER, sessionId });
    // 不存在就新增
    if (!chatObj) {
      chatList.value.push({
        id: getUniqueid(),
        sessionId,
        // 这里list存放的是二维数组。默认第一个数组是用户对话，第二个数组是机器人对话
        list: [[{ ...newChat }]],
      });
    } else {
      chatObj.list.push([{ ...newChat }]);
    }
  }

  /**
   * 添加机器人对话
   */
  function addBotChat(sessionId, chat) {
    if (!sessionId) {
      return;
    }
    // 取chatList最后一项
    const chatObj = chatList.value.find(item => item.sessionId === sessionId);
    if (!chatObj) {
      return;
    }
    const lastList = chatObj.list[chatObj.list.length - 1];
    const newChat = new Chat({ ...chat, senderType: SENDER_TYPE.BOT, sessionId });
    lastList.push({ ...newChat });
    persist();
  }

  /**
   * 删除选中的chat对象中list数组中的项
   * @param {string} sessionId 会话ID
   * @param {Array} checkedItemIds 选中项ID数组
   * @param {Array} answerList 回答显示的列表
   */
  function deleteChatChildList(sessionId, checkedItemIds, answerList) {
    if (!sessionId) {
      return;
    }
    const chat = chatList.value.find(item => item.sessionId === sessionId);
    const newChatList = chat.list.filter(item => {
      return item.some(_ => !checkedItemIds.includes(_.msgId));
    });
    chat.list = [...newChatList];
    // 刷新回答显示的列表
    answerList.value = [...newChatList];
    // 如果删除后没有对话了，就清空当前选中的对话。并且要删除sessionStore中的对话
    if (newChatList.length === 0) {
      setCurrSelectChat(null);
      setCurrentSessionId(null);
      deleteSession(sessionId);
    }
    setIsDeleteMode(false);
    persist();
  }

  /**
   * 删除chat对象中所有list数组
   * @param {string} sessionId 会话ID
   */
  function deleteAllChatChildList(sessionId) {
    if (!sessionId) {
      return;
    }
    const newChatList = chatList.value.filter(item => item.sessionId !== sessionId);
    chatList.value = [...newChatList];
    setCurrSelectChat(null);
    setCurrentSessionId(null);
    deleteSession(sessionId);
    persist();
  }

  /**
   * 删除chat对象中list数组中的项
   * @param {string} sessionId 会话ID
   */
  function deleteChatBySessionId(sessionId) {
    if (!sessionId) {
      return;
    }
    const newChatList = chatList.value.filter(item => item.sessionId !== sessionId);
    chatList.value = [...newChatList];
    persist();
  }

  /**
   * 删除选中的chat对象中list数组中的最后一项
   */
  function deleteLastChatChildList(sessionId) {
    if (!sessionId) {
      return;
    }
    const chat = chatList.value.find(item => item.sessionId === sessionId);
    if (!chat) {
      return;
    }
    chat.list.pop();
    persist();
  }

  /**
   * 清空渲染的HTML
   */
  function clearRenderedHTML() {
    renderDomRef.value.innerHTML = null;
  }

  return {
    loading,
    isFirstContentVisible,
    updateLoading,
    updateFirstContentVisible,
    renderDomRef,
    setRenderDomRef,
    currSelectChat,
    setCurrSelectChat,
    chatList,
    addUserChat,
    addBotChat,
    suggestList,
    setSuggestList,
    clearRenderedHTML,
    isDeleteMode,
    setIsDeleteMode,
    deleteChatChildList,
    deleteAllChatChildList,
    deleteChatBySessionId,
    deleteLastChatChildList,
  };
});

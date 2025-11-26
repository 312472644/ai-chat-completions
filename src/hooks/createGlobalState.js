import { effectScope } from 'vue';

/**
 * 创建全局状态
 * @param {Function} stateFactory 状态工厂函数，用于创建状态对象
 * @returns {object} 全局状态对象
 */
export function createGlobalState(stateFactory) {
  let initialized = false;
  let state;
  const scope = effectScope();
  return (...args) => {
    if (!initialized) {
      initialized = true;
      state = scope.run(() => stateFactory(...args));
    }
    return state;
  };
}

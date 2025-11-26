import { ref } from 'vue';

export function useState(initState) {
  const state = ref(initState);
  /**
   * 更新状态
   * @param {*} newState 新状态
   */
  function updateState(newState) {
    state.value = newState;
  }
  return [state, updateState];
}

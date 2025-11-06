/**
 * 角色配置
 */
export const Role = {
  // 用户
  USER: 'user',
  // AI助手
  ASSISTANT: 'assistant',
};

/**
 * 语法高亮配置
 */
export const HighlighterConfig = {
  langs: ['javascript', 'typescript', 'vue', 'json', 'css', 'html', 'bash', 'python', 'yaml'],
  theme: {
    light: 'vitesse-light',
    dark: 'andromeeda',
  },
};

Object.defineProperty(HighlighterConfig, 'themes', {
  get: () => {
    return Object.values(HighlighterConfig.theme);
  },
});

import antfu from '@antfu/eslint-config';

export default antfu({
  vue: true,
  typescript: false,
  prettier: true,
  // 自定义规则（可选）
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/block-order': [
      'error',
      {
        order: [['template', 'script'], 'style'],
      },
    ],
    'vue/custom-event-name-casing': ['off', 'kebab-case'],
    'vue/singleline-html-element-content-newline': 'off',
    'vue/html-self-closing': 'off',
    'style/operator-linebreak': 'off',
    'style/arrow-parens': 'off',
    'style/comma-dangle': 'off',
    'style/semi': 'off',
    'style/brace-style': 'off',
    'no-console': 'off',
    'no-unused-vars': 'warn',
  },
  ignores: ['**/node_modules/**', '**/dist/**'],
});

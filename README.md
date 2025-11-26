# 项目文档

## 项目简介

这是一个基于 Vue 3 和 Vite 构建的 AI 聊天 completions 项目。它使用 Ant Design Vue 作为 UI 库，并具有一个聊天界面，用户可以在其中发送消息并接收 AI 生成的响应。

## 入门

要运行此项目，请按照以下步骤操作：

1. **克隆存储库：**

   ```bash
   git clone https://github.com/your-username/ai-chat-completions.git
   ```

2. **安装依赖项：**

   ```bash
   cd ai-chat-completions
   npm install
   ```

3. **运行开发服务器：**

   ```bash
   npm run dev
   ```

4. **在浏览器中打开应用程序：**

   开发服务器启动后，您可以在浏览器中访问 `http://localhost:5173` 查看应用程序。

## 功能

- **聊天界面**：一个用户友好的界面，用于发送和接收消息。
- **Markdown 支持**：聊天消息以 Markdown 格式呈现，支持代码块、列表等。
- **代码高亮**：代码块使用 `highlight.js` (或 `shiki`) 进行语法高亮。
- **建议**：提供建议的后续问题或操作。

## 技术栈

- **Vue 3**：用于构建用户界面的现代化 JavaScript 框架。
- **Vite**：一个快速的构建工具，可提供快速的开发体验。
- **Ant Design Vue**：一个企业级的 UI 组件库。
- **Sass**：一个 CSS 预处理器，用于编写更具可维护性的样式。
- **Marked**：一个 Markdown 解析器，用于将 Markdown 转换为 HTML。
- **Highlight.js / Shiki**：用于代码语法高亮的库。

## 项目结构

```
├── .gitignore
├── .vscode/
│   └── extensions.json
├── README.md
├── index.html
├── package-lock.json
├── package.json
├── public/
│   └── vite.svg
├── src/
│   ├── App.vue
│   ├── assets/
│   │   ├── arrow.svg
│   │   ├── arrow_upward.svg
│   │   ├── bedtime.svg
│   │   ├── copy.svg
│   │   ├── light_mode.svg
│   │   ├── loading.png
│   │   └── paused.svg
│   ├── components/
│   │   └── AICompletions/
│   │       ├── InputChat.vue
│   │       ├── MessageList.vue
│   │       ├── index.vue
│   │       ├── markdown.scss
│   │       ├── mock-data.js
│   │       └── scripts/
│   │           ├── config.js
│   │           ├── marked-renderer/
│   │           │   └── code-renderer.js
│   │           ├── message.js
│   │           ├── useMarked.js
│   │           └── utils.js
│   ├── index.scss
│   └── main.js
└── vite.config.js
```

## 依赖项

### 生产依赖

- `ant-design-vue`: ^4.2.6
- `vue`: ^3.5.22

### 开发依赖

- `@vitejs/plugin-vue`: ^6.0.1
- `highlight.js`: ^11.11.1
- `marked`: ^16.4.1
- `sass`: ^1.93.2
- `shiki`: ^3.14.0
- `vite`: ^7.1.7

## 脚本

- `dev`: 启动开发服务器
- `build`: 构建生产版本
- `preview`: 预览生产版本

# HN Reader

一个现代化的 Hacker News 阅读器，提供评论摘要和内容摘要功能。

## 特性

- 📱 响应式设计，支持移动端和桌面端
- 🔄 无限滚动加载更多故事
- 🤖 使用 Google Gemini 自动生成评论摘要
- 📝 自动生成文章内容摘要
- 💾 使用 Redis 缓存摘要结果
- ⚡️ 快速加载和平滑过渡
- 🎨 现代化的 UI 设计

## 技术栈

- **框架**: [Next.js 14](https://nextjs.org/)
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **AI**: [Google Gemini](https://ai.google.dev/)
- **缓存**: [Upstash Redis](https://upstash.com/)
- **部署**: [Vercel](https://vercel.com)

## 本地开发

1. 克隆仓库：

```bash
git clone https://github.com/dickeylth/news-reader.git
cd news-reader
```

2. 安装依赖：

```bash
pnpm install
```

3. 配置环境变量，创建 `.env.local` 文件：

```env
GEMINI_API_KEY=your_gemini_api_key
KV_REST_API_URL=your_upstash_redis_url
KV_REST_API_TOKEN=your_upstash_redis_token
```

4. 启动开发服务器：

```bash
pnpm dev
```

5. 打开 [http://localhost:3000](http://localhost:3000) 查看应用

## 主要功能

- **故事列表**: 展示最新的 Hacker News 故事
- **内容摘要**: 自动生成文章内容的中文摘要
- **评论摘要**: 使用 AI 总结评论区的主要观点
- **缓存机制**: 使用 Redis 缓存摘要结果，提高响应速度
- **骨架屏**: 优化加载体验
- **错误处理**: 友好的错误提示和重试机制

## 贡献

欢迎提交 Pull Request 或创建 Issue！

## 许可

MIT License

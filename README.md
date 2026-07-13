# Nova — AI Chat App

A premium, ChatGPT/Claude/Gemini-style AI chat interface built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and shadcn/ui-style components. Backed by the DeepSeek R1 API through a secure server-side proxy route.

## Features

- Glassmorphism + gradient UI, full dark/light mode
- Responsive layout (desktop, tablet, mobile) with a collapsible sidebar
- Conversation history stored in LocalStorage, with new/select/delete
- Markdown rendering with GitHub-flavored Markdown + syntax-highlighted code blocks (copy-to-clipboard per block)
- Simulated typing animation, auto-scroll, "AI is thinking" indicator
- Copy message / regenerate response / stop generating / clear chat
- Enter to send, Shift+Enter for new line, live character counter
- Skeleton loading, empty state with prompt suggestions, timestamps, avatars
- Framer Motion animations, Lucide icons, Sonner toasts
- Full TypeScript, modular folder structure, SEO metadata

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No environment variables or extra configuration are required — the app proxies requests to `https://api.siputzx.my.id/api/ai/deepseekr1` from `app/api/chat/route.ts`, so the third-party API is never called directly from the browser.

## Project structure

```
app/
 ├── api/chat/route.ts   # Server-side proxy to the DeepSeek R1 API
 ├── layout.tsx          # Root layout, fonts, metadata, theme + toast providers
 ├── page.tsx            # Home page (renders <Chat />)
 └── globals.css         # Design tokens, glass utilities, markdown/code styles

components/
 ├── Chat.tsx            # Main orchestrator: state, storage, API calls
 ├── ChatInput.tsx        # Composer: textarea, send/stop, char counter
 ├── Message.tsx           # Message bubble: markdown, code blocks, actions
 ├── Sidebar.tsx           # Conversation history + collapsible drawer
 ├── Header.tsx            # Top bar: sidebar toggle, clear chat, theme toggle
 ├── Loading.tsx           # Thinking indicator + skeleton loader
 ├── theme-provider.tsx    # next-themes wrapper
 ├── theme-toggle.tsx      # Dark/light toggle button
 └── ui/                   # button, textarea, scroll-area, separator

lib/
 ├── api.ts               # Client helper — calls /api/chat only
 ├── storage.ts            # LocalStorage persistence helpers
 └── utils.ts               # cn(), id/time/title helpers

types/
 └── chat.ts               # Shared TypeScript types
```

## Notes

- The DeepSeek R1 endpoint used here is a simple `GET` API without streaming, so the "typing" effect is simulated client-side after the full reply arrives. Swap `runAssistantReply` in `components/Chat.tsx` for a real stream if you move to a streaming-capable backend later.
- Conversation data lives only in the browser's LocalStorage — clearing site data will reset chat history.

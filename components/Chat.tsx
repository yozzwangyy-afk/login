"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Message } from "@/components/Message";
import { ChatInput } from "@/components/ChatInput";
import { ThinkingIndicator, ChatSkeleton } from "@/components/Loading";
import type { ChatMessage, Conversation } from "@/types/chat";
import { generateId, deriveTitle } from "@/lib/utils";
import { sendChatMessage, ChatApiError } from "@/lib/api";
import {
  loadConversations,
  saveConversations,
  loadActiveConversationId,
  saveActiveConversationId,
} from "@/lib/storage";

const TYPING_CHARS_PER_TICK = 3;
const TYPING_TICK_MS = 12;

function createEmptyConversation(): Conversation {
  const now = Date.now();
  return {
    id: generateId(),
    title: "New chat",
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

export function Chat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const typingStoppedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // --- Load from LocalStorage on mount ---
  useEffect(() => {
    const stored = loadConversations();
    const storedActive = loadActiveConversationId();

    if (stored.length > 0) {
      setConversations(stored);
      setActiveId(
        storedActive && stored.some((c) => c.id === storedActive)
          ? storedActive
          : stored[0].id
      );
    } else {
      const fresh = createEmptyConversation();
      setConversations([fresh]);
      setActiveId(fresh.id);
    }

    setIsSidebarOpen(window.innerWidth >= 1024);
    setIsMounted(true);
  }, []);

  // --- Persist on change ---
  useEffect(() => {
    if (!isMounted) return;
    saveConversations(conversations);
  }, [conversations, isMounted]);

  useEffect(() => {
    if (!isMounted || !activeId) return;
    saveActiveConversationId(activeId);
  }, [activeId, isMounted]);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;
  const messages = activeConversation?.messages ?? [];

  // --- Auto scroll to newest message ---
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, messages[messages.length - 1]?.content]);

  const updateConversation = useCallback(
    (id: string, updater: (conv: Conversation) => Conversation) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? updater(c) : c))
      );
    },
    []
  );

  const stopTyping = () => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
  };

  const handleNewChat = () => {
    const fresh = createEmptyConversation();
    setConversations((prev) => [fresh, ...prev]);
    setActiveId(fresh.id);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const handleSelectConversation = (id: string) => {
    setActiveId(id);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (id === activeId) {
        if (next.length > 0) {
          setActiveId(next[0].id);
        } else {
          const fresh = createEmptyConversation();
          setActiveId(fresh.id);
          return [fresh];
        }
      }
      return next;
    });
    toast.success("Conversation deleted");
  };

  const handleClearChat = () => {
    if (!activeId) return;
    updateConversation(activeId, (c) => ({
      ...c,
      messages: [],
      title: "New chat",
      updatedAt: Date.now(),
    }));
    toast.success("Chat cleared");
  };

  const runAssistantReply = useCallback(
    async (convId: string, promptText: string) => {
      setIsGenerating(true);
      const assistantId = generateId();

      updateConversation(convId, (c) => ({
        ...c,
        messages: [
          ...c.messages,
          {
            id: assistantId,
            role: "assistant",
            content: "",
            createdAt: Date.now(),
            isStreaming: true,
          },
        ],
        updatedAt: Date.now(),
      }));

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const reply = await sendChatMessage(
          { prompt: promptText },
          controller.signal
        );

        // Simulate a smooth typing animation client-side.
        typingStoppedRef.current = false;
        let i = 0;
        await new Promise<void>((resolve) => {
          typingIntervalRef.current = setInterval(() => {
            if (typingStoppedRef.current) {
              stopTyping();
              resolve();
              return;
            }
            i += TYPING_CHARS_PER_TICK;
            const partial = reply.slice(0, i);
            const done = i >= reply.length;
            updateConversation(convId, (c) => ({
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantId
                  ? { ...m, content: partial, isStreaming: !done }
                  : m
              ),
            }));
            if (done) {
              stopTyping();
              resolve();
            }
          }, TYPING_TICK_MS);
        });
      } catch (err) {
        stopTyping();
        const wasAborted =
          err instanceof DOMException && err.name === "AbortError";

        if (wasAborted) {
          updateConversation(convId, (c) => ({
            ...c,
            messages: c.messages.map((m) =>
              m.id === assistantId
                ? { ...m, isStreaming: false, stopped: true }
                : m
            ),
          }));
        } else {
          const message =
            err instanceof ChatApiError
              ? err.message
              : "Something went wrong while reaching the AI service.";
          updateConversation(convId, (c) => ({
            ...c,
            messages: c.messages.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content: message,
                    isStreaming: false,
                    error: true,
                  }
                : m
            ),
          }));
          toast.error(message);
        }
      } finally {
        setIsGenerating(false);
        abortRef.current = null;
      }
    },
    [updateConversation]
  );

  const handleSend = useCallback(
    (text: string) => {
      if (!activeId) return;
      const isFirstMessage = messages.length === 0;

      const userMessage: ChatMessage = {
        id: generateId(),
        role: "user",
        content: text,
        createdAt: Date.now(),
      };

      updateConversation(activeId, (c) => ({
        ...c,
        title: isFirstMessage ? deriveTitle(text) : c.title,
        messages: [...c.messages, userMessage],
        updatedAt: Date.now(),
      }));

      void runAssistantReply(activeId, text);
    },
    [activeId, messages.length, updateConversation, runAssistantReply]
  );

  const handleStop = () => {
    abortRef.current?.abort();
    typingStoppedRef.current = true;

    // If we were mid-typing-animation (fetch already resolved), mark the
    // in-progress assistant message as stopped rather than an error.
    if (activeId) {
      updateConversation(activeId, (c) => ({
        ...c,
        messages: c.messages.map((m) =>
          m.isStreaming ? { ...m, isStreaming: false, stopped: true } : m
        ),
      }));
    }

    setIsGenerating(false);
  };

  const handleRegenerate = () => {
    if (!activeId || !activeConversation) return;
    const lastUser = [...activeConversation.messages]
      .reverse()
      .find((m) => m.role === "user");
    if (!lastUser) return;

    // Remove the trailing assistant message before regenerating.
    updateConversation(activeId, (c) => {
      const idx = c.messages.map((m) => m.role).lastIndexOf("assistant");
      if (idx === -1) return c;
      return { ...c, messages: c.messages.slice(0, idx) };
    });

    void runAssistantReply(activeId, lastUser.content);
  };

  const lastMessage = messages[messages.length - 1];
  const showThinking =
    isGenerating && (!lastMessage || lastMessage.content.length === 0);

  return (
    <div className="flex h-dvh w-full overflow-hidden">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSelect={handleSelectConversation}
        onNew={handleNewChat}
        onDelete={handleDeleteConversation}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title={activeConversation?.title ?? "New chat"}
          onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
          onClearChat={handleClearChat}
          hasMessages={messages.length > 0}
        />

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-end gap-6 px-3 py-6 sm:px-6">
            {!isMounted ? (
              <ChatSkeleton />
            ) : messages.length === 0 ? (
              <EmptyState onPromptSelect={handleSend} />
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((m, idx) => (
                  <Message
                    key={m.id}
                    message={m}
                    isLast={idx === messages.length - 1 && m.role === "assistant"}
                    onRegenerate={
                      idx === messages.length - 1 && !isGenerating
                        ? handleRegenerate
                        : undefined
                    }
                  />
                ))}
              </AnimatePresence>
            )}
            {showThinking && <ThinkingIndicator />}
            <div ref={bottomRef} />
          </div>
        </div>

        <ChatInput
          onSend={handleSend}
          onStop={handleStop}
          isGenerating={isGenerating}
          disabled={!isMounted}
        />
      </div>
    </div>
  );
}

function EmptyState({
  onPromptSelect,
}: {
  onPromptSelect: (text: string) => void;
}) {
  const suggestions = [
    "Explain quantum computing simply",
    "Write a function to reverse a linked list",
    "Draft a friendly product launch email",
    "Give me 5 ideas for a weekend trip",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="m-auto flex max-w-lg flex-col items-center gap-6 py-16 text-center"
    >
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-signal-gradient shadow-glass-lg">
        <Sparkles className="h-8 w-8 text-white" />
        <span className="absolute inset-0 rounded-2xl bg-signal-gradient opacity-50 animate-pulse-ring" />
      </div>
      <div>
        <h2 className="font-display text-2xl font-semibold text-void-900 dark:text-mist-50">
          Where should we start?
        </h2>
        <p className="mt-2 text-sm text-void-500 dark:text-mist-300/50">
          Ask anything — Nova writes, explains, and codes with you.
        </p>
      </div>
      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onPromptSelect(s)}
            className="glass rounded-xl px-4 py-3 text-left text-sm text-void-700 transition-colors hover:bg-black/5 dark:text-mist-200 dark:hover:bg-white/10"
          >
            {s}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

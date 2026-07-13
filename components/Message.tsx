"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Check,
  Copy,
  RefreshCcw,
  Sparkles,
  User,
  AlertTriangle,
} from "lucide-react";
import type { ChatMessage } from "@/types/chat";
import { cn, formatTime } from "@/lib/utils";
import { toast } from "sonner";

interface MessageProps {
  message: ChatMessage;
  isLast: boolean;
  onRegenerate?: () => void;
}

function CodeBlock({
  language,
  value,
}: {
  language: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-white/10 bg-[#0d0f18]">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-3 py-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wide text-mist-300/60">
          {language || "text"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-mist-300/70 hover:bg-white/10 hover:text-mist-100"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" /> Copy
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: "0.9rem 1rem",
          background: "transparent",
          fontSize: "0.83rem",
        }}
        wrapLongLines
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}

export function Message({ message, isLast, onRegenerate }: MessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopyMessage = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast.success("Message copied to clipboard");
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "group flex w-full gap-3 px-1",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-black/10 dark:bg-white/10"
            : message.error
            ? "bg-red-500/15"
            : "bg-signal-gradient"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-void-700 dark:text-mist-100" />
        ) : message.error ? (
          <AlertTriangle className="h-4 w-4 text-red-500" />
        ) : (
          <Sparkles className="h-4 w-4 text-white" />
        )}
      </div>

      <div
        className={cn(
          "flex max-w-[85%] flex-col sm:max-w-[75%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "px-4 py-3",
            isUser
              ? "rounded-2xl rounded-tr-sm bg-signal-gradient text-white shadow-glass"
              : message.error
              ? "glass rounded-2xl rounded-tl-sm border-red-500/20 text-red-500"
              : "glass rounded-2xl rounded-tl-sm text-void-900 dark:text-mist-100"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words text-[0.95rem] leading-relaxed">
              {message.content}
            </p>
          ) : (
            <div
              className={cn(
                "markdown-body break-words",
                message.isStreaming && "typing-caret"
              )}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const isInline = !match && !String(children).includes("\n");
                    if (isInline) {
                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    }
                    return (
                      <CodeBlock
                        language={match?.[1] ?? ""}
                        value={String(children).replace(/\n$/, "")}
                      />
                    );
                  },
                }}
              >
                {message.content || " "}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Meta row: timestamp + actions */}
        <div
          className={cn(
            "mt-1 flex items-center gap-2 px-1 text-[11px] text-void-500 dark:text-mist-300/40",
            isUser ? "flex-row-reverse" : "flex-row"
          )}
        >
          <span>{formatTime(message.createdAt)}</span>
          {message.stopped && <span className="italic">Stopped</span>}

          {!message.isStreaming && (
            <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={handleCopyMessage}
                className="rounded-md p-1 hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="Copy message"
                title="Copy"
              >
                {copied ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
              {!isUser && isLast && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="rounded-md p-1 hover:bg-black/5 dark:hover:bg-white/10"
                  aria-label="Regenerate response"
                  title="Regenerate response"
                >
                  <RefreshCcw className="h-3 w-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

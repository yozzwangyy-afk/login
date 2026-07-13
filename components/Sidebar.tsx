"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageSquarePlus, MessageSquare, Trash2, X, Sparkles } from "lucide-react";
import type { Conversation } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

export function Sidebar({
  conversations,
  activeId,
  isOpen,
  onClose,
  onSelect,
  onNew,
  onDelete,
}: SidebarProps) {
  return (
    <>
      {/* Mobile scrim */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
            aria-hidden
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? 288 : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col overflow-hidden lg:relative lg:z-0",
          "glass-strong lg:border-y-0 lg:border-l-0"
        )}
      >
        <div className="flex h-full w-72 flex-col p-3">
          <div className="mb-2 flex items-center justify-between px-1 pb-2 pt-1">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-signal-gradient">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-display text-sm font-semibold tracking-tight">
                Nova
              </span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-void-500 hover:bg-black/5 dark:text-mist-300 dark:hover:bg-white/10 lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <Button
            onClick={onNew}
            className="mb-3 w-full justify-start"
            variant="default"
          >
            <MessageSquarePlus className="h-4 w-4" />
            New chat
          </Button>

          <div className="mb-1 px-2 text-xs font-medium uppercase tracking-wider text-void-500 dark:text-mist-300/50">
            History
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
            {conversations.length === 0 && (
              <p className="px-2 py-6 text-center text-xs text-void-500 dark:text-mist-300/40">
                No conversations yet.
                <br />
                Start a new chat to begin.
              </p>
            )}
            {conversations
              .slice()
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .map((conv) => (
                <div
                  key={conv.id}
                  className={cn(
                    "group flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm transition-colors cursor-pointer",
                    conv.id === activeId
                      ? "bg-signal-gradient-soft text-void-900 dark:text-mist-50"
                      : "text-void-700 hover:bg-black/5 dark:text-mist-200 dark:hover:bg-white/5"
                  )}
                  onClick={() => onSelect(conv.id)}
                >
                  <MessageSquare className="h-4 w-4 shrink-0 opacity-60" />
                  <span className="flex-1 truncate">{conv.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(conv.id);
                    }}
                    className="shrink-0 rounded-md p-1 opacity-0 hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100"
                    aria-label={`Delete conversation: ${conv.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
          </nav>

          <div className="mt-2 border-t border-black/5 pt-3 text-center text-[11px] text-void-500 dark:border-white/5 dark:text-mist-300/30">
            Powered by DeepSeek R1
          </div>
        </div>
      </motion.aside>
    </>
  );
}

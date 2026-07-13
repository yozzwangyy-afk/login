"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Square } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_CHARS = 4000;

interface ChatInputProps {
  onSend: (text: string) => void;
  onStop: () => void;
  isGenerating: boolean;
  disabled?: boolean;
}

export function ChatInput({
  onSend,
  onStop,
  isGenerating,
  disabled,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const trimmed = value.trim();
  const canSend = trimmed.length > 0 && !isGenerating && !disabled;
  const overLimit = value.length > MAX_CHARS;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  const handleSend = () => {
    if (!canSend || overLimit) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="sticky bottom-0 z-10 px-3 pb-4 pt-2 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div
          className={cn(
            "glass-strong flex flex-col rounded-3xl px-4 py-3 shadow-glass-lg transition-colors",
            overLimit && "border-red-500/40"
          )}
        >
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Nova… (Shift + Enter for a new line)"
            rows={1}
            disabled={disabled}
            className="max-h-[200px] min-h-[24px]"
          />
          <div className="mt-2 flex items-center justify-between">
            <span
              className={cn(
                "text-[11px] tabular-nums text-void-500 dark:text-mist-300/40",
                overLimit && "text-red-500"
              )}
            >
              {value.length}/{MAX_CHARS}
            </span>

            {isGenerating ? (
              <Button
                onClick={onStop}
                size="icon"
                variant="destructive"
                aria-label="Stop generating"
                title="Stop generating"
              >
                <Square className="h-4 w-4 fill-current" />
              </Button>
            ) : (
              <Button
                onClick={handleSend}
                size="icon"
                disabled={!canSend || overLimit}
                aria-label="Send message"
                title="Send message"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <p className="mt-2 text-center text-[11px] text-void-500 dark:text-mist-300/30">
          Nova can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}

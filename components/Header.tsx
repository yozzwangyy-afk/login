"use client";

import { PanelLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

interface HeaderProps {
  title: string;
  onToggleSidebar: () => void;
  onClearChat: () => void;
  hasMessages: boolean;
}

export function Header({
  title,
  onToggleSidebar,
  onClearChat,
  hasMessages,
}: HeaderProps) {
  return (
    <header className="glass sticky top-0 z-20 flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="h-[18px] w-[18px]" />
        </Button>
        <h1 className="truncate font-display text-sm font-medium text-void-800 dark:text-mist-100 sm:text-base">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClearChat}
          disabled={!hasMessages}
          aria-label="Clear chat"
          title="Clear chat"
        >
          <Trash2 className="h-[18px] w-[18px]" />
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}

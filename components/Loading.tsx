"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function ThinkingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 px-1"
    >
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-signal-gradient">
        <Sparkles className="h-4 w-4 text-white" />
        <span className="absolute inset-0 rounded-full bg-signal-gradient opacity-60 animate-pulse-ring" />
      </div>
      <div className="glass flex items-center gap-1.5 rounded-2xl rounded-tl-sm px-4 py-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-signal-violet"
            animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
            transition={{
              duration: 1.1,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="space-y-6 px-1">
      {[0, 1].map((row) => (
        <div key={row} className="flex flex-col gap-3">
          <div className="ml-auto h-10 w-2/5 animate-pulse rounded-2xl bg-black/5 dark:bg-white/5" />
          <div className="flex gap-3">
            <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-black/5 dark:bg-white/5" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-4/5 animate-pulse rounded bg-black/5 dark:bg-white/5" />
              <div className="h-3 w-3/5 animate-pulse rounded bg-black/5 dark:bg-white/5" />
              <div className="h-3 w-2/5 animate-pulse rounded bg-black/5 dark:bg-white/5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

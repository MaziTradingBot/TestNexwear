"use client";

import { create } from "zustand";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";

interface Toast {
  id: number;
  message: string;
}
interface ToastState {
  toasts: Toast[];
  show: (message: string) => void;
  dismiss: (id: number) => void;
}

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  show: (message) => {
    const id = Date.now() + Math.random();
    set((s) => ({ toasts: [...s.toasts, { id, message }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 2600);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export function Toaster() {
  const toasts = useToast((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[200] flex -translate-x-1/2 flex-col items-center gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            className="pointer-events-auto flex items-center gap-2.5 bg-ink px-6 py-3.5 text-xs font-medium uppercase tracking-wide2 text-white shadow-xl"
          >
            <Check className="h-4 w-4 text-gold" />
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

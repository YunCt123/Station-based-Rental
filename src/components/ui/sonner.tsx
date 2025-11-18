// components/ui/toaster.tsx
"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster(props: ToasterProps) {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-right"
      closeButton
      expand
      richColors
      duration={3200}
      className="toaster group"
      toastOptions={{
        // Hiệu ứng & layout chung
        classNames: {
          toast:
            // container + nền kính + đổ bóng
            "group relative w-auto min-w-[280px] max-w-[420px] rounded-2xl border bg-background/70 backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.35)] " +
            "ring-1 ring-border/60 " +
            // gradient viền mảnh
            "before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:bg-[radial-gradient(120%_120%_at_0%_0%,rgba(10,132,255,0.35),transparent_60%)] " +
            // animation vào/ra + swipe
            "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 sm:slide-in-from-right-4 " +
            "data-[swipe=move]:translate-x-[var(--x)] data-[swipe=move]:transition-none " +
            "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--swipe-end-x)] " +
            "transition-all duration-300",
          title:
            "text-base font-semibold tracking-[-0.01em]",
          description:
            "mt-1 text-sm text-muted-foreground leading-relaxed",
          icon:
            // vòng sáng icon
            "mr-2 grid h-9 w-9 place-items-center rounded-xl shadow-inner " +
            "bg-gradient-to-b from-white/30 to-white/10 backdrop-blur " +
            "ring-1 ring-white/20",
          actionButton:
            "h-8 rounded-lg px-3 text-sm font-medium " +
            "bg-primary text-primary-foreground hover:opacity-90 transition",
          cancelButton:
            "h-8 rounded-lg px-3 text-sm font-medium " +
            "bg-muted text-muted-foreground hover:opacity-90 transition",
        },

        // Màu theo type (dùng Tech Blue làm chủ đạo)
        style: {
          // bạn có thể tinh chỉnh thêm ở đây nếu muốn
        },
      }}
      {...props}
    />
  );
}
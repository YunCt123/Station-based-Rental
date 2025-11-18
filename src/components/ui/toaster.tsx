/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { CheckCircle2, Info, AlertTriangle, XCircle } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider swipeDirection="right">
      {toasts.map(({ id, title, description, action, ...props }) => {
        // variant mặc định của shadcn là "default" hoặc "destructive"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const variant = (props as any).variant as
          | "default"
          | "destructive"
          | "success"
          | "warning"
          | "info"
          | undefined;

        const icon =
          variant === "success" ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : variant === "destructive" ? (
            <XCircle className="h-5 w-5" />
          ) : variant === "warning" ? (
            <AlertTriangle className="h-5 w-5" />
          ) : (
            <Info className="h-5 w-5" />
          );

        const duration = (props as any).duration ?? 3000; // ms, có thể truyền khi toast()

        return (
          <Toast
            key={id}
            {...props}
            // nền kính + ring gradient + animation + layout
            className={cn(
              "group relative w-auto min-w-[300px] max-w-[440px] overflow-hidden",
              "rounded-2xl border bg-background/70 backdrop-blur-xl",
              "shadow-[0_10px_40px_-10px_rgba(0,0,0,0.35)]",
              "ring-1 ring-border/60",
              // glow góc trái trên (tech blue)
              "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[inherit]",
              "before:bg-[radial-gradient(120%_120%_at_0%_0%,rgba(10,132,255,0.35),transparent_60%)]",
              // hiệu ứng vào/ra + swipe
              "data-[state=open]:animate-toast-in data-[state=closed]:animate-toast-out",
              "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
              // màu theo variant
              variant === "destructive" &&
                "border-rose-300/50 ring-rose-300/40",
              variant === "success" &&
                "border-emerald-300/50 ring-emerald-300/40",
              variant === "warning" && "border-amber-300/50 ring-amber-300/40",
              variant === "info" && "border-sky-300/50 ring-sky-300/40"
            )}
            style={
              {
                // tiến trình progress bar
                "--toast-duration": `${duration}ms`,
              } as React.CSSProperties
            }
          >
            <div className="flex items-start gap-3">
              {/* icon bubble */}
              <div
                className={cn(
                  "mt-0.5 grid h-9 w-9 place-items-center rounded-xl ring-1 ring-white/15",
                  "bg-gradient-to-b from-white/30 to-white/10 backdrop-blur-sm text-foreground"
                )}
              >
                {icon}
              </div>

              <div className="grid gap-1">
                {title && (
                  <ToastTitle className="text-black font-semibold tracking-[-0.01em]">
                    {title}
                  </ToastTitle>
                )}
                {description && (
                  <ToastDescription className="text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </ToastDescription>
                )}
                {/* action button (nếu có) */}
                {action && <div className="mt-2">{action}</div>}
              </div>

              <ToastClose className="ml-auto rounded-md p-1 text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground" />
            </div>

            {/* progress bar ở đáy */}
            <div
              className={cn(
                "pointer-events-none absolute inset-x-0 bottom-0 h-1",
                variant === "destructive" && "bg-rose-200/50",
                variant === "success" && "bg-emerald-200/50",
                variant === "warning" && "bg-amber-200/50",
                (!variant || variant === "info" || variant === "default") &&
                  "bg-sky-200/50"
              )}
            >
              <span className="block h-full w-full origin-left animate-toast-progress bg-foreground/70" />
            </div>
          </Toast>
        );
      })}

      <ToastViewport className="fixed top-4 right-4 z-[100] flex max-h-screen w-[440px] flex-col gap-3 p-2 outline-none" />
    </ToastProvider>
  );
}

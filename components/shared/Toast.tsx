import type { LucideIcon } from "lucide-react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type ToastTone = "success" | "error" | "warning" | "info";

export interface ToastData {
  id: string;
  message: string;
  tone?: ToastTone;
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

const toneConfig: Record<ToastTone, { icon: LucideIcon; className: string }> = {
  success: { icon: CheckCircle2, className: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  error: { icon: XCircle, className: "border-red-200 bg-red-50 text-red-800" },
  warning: { icon: AlertTriangle, className: "border-amber-200 bg-amber-50 text-amber-800" },
  info: { icon: Info, className: "border-blue-200 bg-blue-50 text-blue-800" },
};

export function Toast({ toast, onDismiss }: ToastProps) {
  const { icon: Icon, className } = toneConfig[toast.tone ?? "info"];

  return (
    <div
      className={cn("flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm shadow-md", className)}
      role="status"
    >
      <Icon size={18} className="mt-0.5 shrink-0" />
      <p className="flex-1">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 opacity-70 hover:opacity-100"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}

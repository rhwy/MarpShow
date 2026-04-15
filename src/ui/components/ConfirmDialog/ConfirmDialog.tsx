"use client";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

/**
 * ConfirmDialog — modal overlay for confirming destructive actions.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  destructive = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
      onClick={onCancel}
      data-testid="confirm-dialog-overlay"
    >
      <div
        className="rounded-xl p-6 w-full max-w-md"
        style={{
          backgroundColor: "var(--surface-elevated)",
          border: "1px solid var(--border-subtle)",
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <h2
          id="confirm-dialog-title"
          className="text-lg font-semibold mb-2"
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--fg-primary)",
          }}
        >
          {title}
        </h2>

        <p
          className="text-sm mb-6"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--fg-secondary)",
          }}
        >
          {message}
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: "var(--surface-hover)",
              color: "var(--fg-primary)",
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: destructive
                ? "#EF4444"
                : "var(--accent-primary)",
              color: "#FFFFFF",
            }}
            data-testid="confirm-button"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

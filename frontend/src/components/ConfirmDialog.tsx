import { useState } from "react";
import "./ConfirmDialog.css";

type DialogType = "confirm" | "alert" | "success" | "error" | "warning";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: DialogType;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const iconMap: Record<DialogType, string> = {
  confirm: "❓",
  alert: "ℹ️",
  success: "✅",
  error: "❌",
  warning: "⚠️",
};

export function ConfirmDialog({
  isOpen,
  title,
  message,
  type = "confirm",
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const isAlertType =
    type === "alert" ||
    type === "success" ||
    type === "error" ||
    type === "warning";

  return (
    <div
      className="confirm-overlay"
      onClick={isAlertType ? onConfirm : onCancel}
    >
      <div
        className={`confirm-dialog dialog-${type}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-header">
          <span className="dialog-icon">{iconMap[type]}</span>
          <h3>{title}</h3>
        </div>
        <div className="confirm-body">
          <p>{message}</p>
        </div>
        <div className="confirm-footer">
          {!isAlertType && (
            <button className="btn btn-secondary" onClick={onCancel}>
              {cancelText || "Hủy"}
            </button>
          )}
          <button
            className={`btn ${type === "error" ? "btn-danger" : type === "warning" ? "btn-warning" : "btn-primary"}`}
            onClick={onConfirm}
          >
            {confirmText || (isAlertType ? "OK" : "Xác nhận")}
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook để dùng confirm dialog dễ dàng
export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const confirm = (title: string, message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfig({
        title,
        message,
        onConfirm: () => {
          setIsOpen(false);
          resolve(true);
        },
      });
      setIsOpen(true);
    });
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      isOpen={isOpen}
      title={config.title}
      message={config.message}
      onConfirm={config.onConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, ConfirmDialogComponent };
}

// Hook để dùng alert dialog
export function useAlert() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<{
    title: string;
    message: string;
    type: DialogType;
    onClose?: () => void;
  }>({
    title: "",
    message: "",
    type: "alert",
  });

  const showAlert = (
    message: string,
    options?: {
      title?: string;
      type?: DialogType;
      onClose?: () => void;
    },
  ): void => {
    const type = options?.type || "alert";
    const defaultTitles: Record<DialogType, string> = {
      alert: "Thông báo",
      success: "Thành công",
      error: "Lỗi",
      warning: "Cảnh báo",
      confirm: "Xác nhận",
    };

    setConfig({
      title: options?.title || defaultTitles[type],
      message,
      type,
      onClose: options?.onClose,
    });
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    config.onClose?.();
  };

  const AlertDialogComponent = () => (
    <ConfirmDialog
      isOpen={isOpen}
      title={config.title}
      message={config.message}
      type={config.type}
      onConfirm={handleClose}
      onCancel={handleClose}
    />
  );

  return { showAlert, AlertDialogComponent };
}

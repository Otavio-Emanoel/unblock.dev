"use client";

import React, { useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  Trash2,
  PhoneOff,
  ShieldAlert,
  HelpCircle,
} from "lucide-react";

export type ModalType = "info" | "success" | "warning" | "danger" | "confirm";

export interface ModalConfig {
  isOpen: boolean;
  type?: ModalType;
  title: string;
  description: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

interface CustomModalProps {
  config: ModalConfig;
  onClose: () => void;
}

export function CustomModal({ config, onClose }: CustomModalProps) {
  const {
    isOpen,
    type = "info",
    title,
    description,
    confirmText = "OK",
    cancelText = "Cancelar",
    onConfirm,
    onCancel,
    isLoading = false,
  } = config;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        if (onCancel) onCancel();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onCancel, onClose]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  // Color scheme & icons based on modal type
  const getModalStyle = () => {
    switch (type) {
      case "danger":
        return {
          icon: <Trash2 className="w-6 h-6 text-rose-400" />,
          glow: "bg-rose-500/20 border-rose-500/30",
          btnConfirm: "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30",
          badge: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
          glow: "bg-amber-500/20 border-amber-500/30",
          btnConfirm: "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30",
          badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        };
      case "success":
        return {
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />,
          glow: "bg-emerald-500/20 border-emerald-500/30",
          btnConfirm: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30",
          badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        };
      case "confirm":
        return {
          icon: <ShieldAlert className="w-6 h-6 text-indigo-400" />,
          glow: "bg-indigo-500/20 border-indigo-500/30",
          btnConfirm: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30",
          badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
        };
      case "info":
      default:
        return {
          icon: <Info className="w-6 h-6 text-indigo-400" />,
          glow: "bg-indigo-500/20 border-indigo-500/30",
          btnConfirm: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30",
          badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
        };
    }
  };

  const style = getModalStyle();
  const isConfirmation = type === "confirm" || type === "danger" || Boolean(onCancel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={!isLoading ? handleCancel : undefined}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 font-sans">
        {/* Glow ambient decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        {!isLoading && (
          <button
            onClick={handleCancel}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Header Icon + Title */}
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${style.glow}`}
          >
            {style.icon}
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-white leading-snug">{title}</h3>
            <div className="mt-2 text-xs text-slate-300 leading-relaxed font-sans">
              {description}
            </div>
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-white/5">
          {isConfirmation && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 transition cursor-pointer disabled:opacity-50"
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50 ${style.btnConfirm}`}
          >
            {isLoading && (
              <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

import { toast as sonnerToast } from "sonner";
import { useState, useEffect } from "react";

type ToastVariant = "default" | "destructive" | "success" | "warning" | "info";

interface ToastProps {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: React.ReactNode;
}

// Define our toast interface
export interface Toast extends ToastProps {
  id: string;
}

// Create a dummy implementation that doesn't actually store toasts 
// since we're using Sonner toast under the hood
export const toast = ({
  title,
  description,
  variant = "default",
  duration = 3000,
  action,
}: ToastProps) => {
  switch (variant) {
    case "destructive":
      return sonnerToast.error(title, { description, duration, action });
    case "success":
      return sonnerToast.success(title, { description, duration, action });
    case "warning":
      return sonnerToast.warning(title, { description, duration, action });
    case "info":
      return sonnerToast.info(title, { description, duration, action });
    case "default":
    default: // Fallback for any unexpected variant
      return sonnerToast.message(title, { description, duration, action });
  }
};

export const useToast = () => {
  // Since we're using sonner under the hood and it manages its own toast state,
  // we'll provide an empty array for compatibility
  return {
    toast,
    toasts: [] as Toast[],
  };
};
import React, { useContext } from "react";
import { CheckCircle, AlertCircle, Info, XCircle, X } from "lucide-react";
import { ToastContext } from "../context/ToastContext";

const Toast = () => {
  const { toasts, removeToast } = useContext(ToastContext);

  const getToastStyles = (type) => {
    switch (type) {
      case "success":
        return "bg-green-600/20 border-green-500/50 text-green-300";
      case "error":
        return "bg-red-600/20 border-red-500/50 text-red-300";
      case "warning":
        return "bg-yellow-600/20 border-yellow-500/50 text-yellow-300";
      default:
        return "bg-blue-600/20 border-blue-500/50 text-blue-300";
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle size={20} />;
      case "error":
        return <XCircle size={20} />;
      case "warning":
        return <AlertCircle size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[99999] max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`mb-3 px-4 py-3 rounded-lg border flex items-center gap-3 backdrop-blur-sm animate-in ${getToastStyles(toast.type)}`}
        >
          {getIcon(toast.type)}
          <span className="flex-1 text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="hover:opacity-75 transition"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;

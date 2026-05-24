import { createContext, useContext, useMemo, useState } from 'react';

type ToastLevel = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  title: string;
  message: string;
  level: ToastLevel;
}

interface ToastContextValue {
  toasts: Toast[];
  pushToast: (toast: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = (toast: Omit<Toast, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((current) => [...current, { ...toast, id }]);
    setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 5000);
  };

  const value = useMemo(() => ({ toasts, pushToast }), [toasts]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex flex-col gap-3 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-xl transition transform ${
              toast.level === 'success'
                ? 'bg-emerald-600/95 border-emerald-400 text-white'
                : toast.level === 'error'
                ? 'bg-red-600/95 border-red-400 text-white'
                : 'bg-slate-900/95 border-slate-600 text-white'
            }`}
          >
            <p className="font-semibold">{toast.title}</p>
            <p className="text-sm opacity-90 mt-1">{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return context;
};

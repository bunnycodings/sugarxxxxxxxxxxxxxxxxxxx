'use client'

import { useToast } from '@/contexts/ToastContext'

export default function Toast() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            relative px-4 py-3 rounded-lg shadow-lg
            flex items-center gap-3
            pointer-events-auto
            animate-slideInRight
            ${
              toast.type === 'success'
                ? 'bg-green-500 dark:bg-green-600 text-white'
                : toast.type === 'error'
                ? 'bg-red-500 dark:bg-red-600 text-white'
                : toast.type === 'warning'
                ? 'bg-yellow-500 dark:bg-yellow-600 text-white'
                : 'bg-blue-500 dark:bg-blue-600 text-white'
            }
          `}
        >
          <div className="flex-1">
            <p className="font-medium">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 text-white/80 hover:text-white transition-colors"
            aria-label="Close notification"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}


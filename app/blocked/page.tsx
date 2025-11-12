export default function BlockedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12 text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <svg 
              className="w-10 h-10 text-red-600 dark:text-red-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Access Restricted
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-blue-500 mx-auto mb-6"></div>
        </div>
        
        <div className="space-y-6">
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
            We're sorry, but access to this website is currently restricted in your region.
          </p>
          
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg text-left">
            <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
              Why am I seeing this?
            </p>
            <p className="text-sm text-red-700 dark:text-red-400">
              This website is not available in your region (United Kingdom or Jordan) due to regional restrictions.
            </p>
          </div>
          
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              If you believe this is an error, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


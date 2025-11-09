export default function Redeem() {
  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-8 bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
          Redeem
        </h1>
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 transition-colors">
          <h2 className="text-2xl font-display font-semibold mb-4 text-gray-800 dark:text-gray-200">Enter Your Code</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Redeem Code
              </label>
              <input
                type="text"
                id="code"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter your code here"
              />
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all font-semibold shadow-md"
            >
              Redeem
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}


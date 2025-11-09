export default function Reviews() {
  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-8 bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
          Reviews
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          See what our customers are saying about us.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sample review cards */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-pink-100 dark:border-gray-700 transition-colors">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold">
                  U{i}
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">Customer {i}</h3>
                  <div className="flex text-yellow-400">
                    {'★'.repeat(5)}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Great service and fast delivery! Highly recommend Sugarbunny Stores for all your virtual product needs.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


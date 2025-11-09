'use client'

import { useState } from 'react'

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: 'What products do you offer?',
    answer: 'We offer a variety of virtual products and services including virtual airline services, automated bots, website development services, and digital redeem codes. All products are listed in our Products section and are available 24/7.'
  },
  {
    question: 'How do I place an order?',
    answer: 'To place an order, simply browse our products, add items to your cart, and proceed to checkout. You will need to create an account or log in to complete your purchase. Follow the payment instructions to finalize your order.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept payments via MoneyGram and other wire transfer services. After placing your order, you will receive payment instructions. Please submit your payment proof to complete the transaction. Our staff working hours are 12:00 PM - 6:00 AM.'
  },
  {
    question: 'How long does it take to receive my order?',
    answer: 'Delivery times vary depending on the product type. Digital products and redeem codes are typically delivered within 24-48 hours after payment verification. For custom services like website development, delivery timeframes are discussed during the order process.'
  },
  {
    question: 'Can I cancel or refund my order?',
    answer: 'Due to the digital nature of our products, all sales are typically final. However, refund requests may be considered on a case-by-case basis if submitted within 48 hours of purchase. Please contact our support team for assistance with refund requests.'
  },
  {
    question: 'How do I use a redeem code?',
    answer: 'To use a redeem code, navigate to the Redeem page, enter your code, and click Redeem. If the code is valid and not expired, the discount or product will be automatically applied to your account or order.'
  },
  {
    question: 'What is the exchange rate for USD to THB?',
    answer: 'Our exchange rate is updated daily and displayed in the top bar of our website. The rate shows the current conversion from USD to Thai Baht (THB). This rate is used for any USD transactions on our platform.'
  },
  {
    question: 'How do I track my order status?',
    answer: 'You can track your order status by logging into your account and visiting the Dashboard page. There you will see all your orders with their current status (pending, payment_pending, completed, etc.).'
  },
  {
    question: 'What if I forgot my password?',
    answer: 'You can reset your password by clicking the "Forgot Password" link on the login page. Enter your email address, and we will send you instructions to reset your password. Make sure to check your spam folder if you don\'t see the email.'
  },
  {
    question: 'Do you offer customer support?',
    answer: 'Yes! Our customer support is available during working hours (12:00 PM - 6:00 AM). You can contact us via email at support@sugarbunny.com or reach out through our Discord support channel. We aim to respond to all inquiries within 24 hours.'
  },
  {
    question: 'Are your products refundable?',
    answer: 'Digital products are generally non-refundable due to their nature. However, we review refund requests on a case-by-case basis, especially if there are technical issues or problems with the product. Contact our support team within 48 hours of purchase if you need assistance.'
  },
  {
    question: 'How do I leave a review?',
    answer: 'After completing a purchase, you can leave a review on our Reviews page or through your dashboard. Reviews help other customers make informed decisions and help us improve our services. All reviews are subject to moderation before being published.'
  },
  {
    question: 'What information do you collect?',
    answer: 'We collect necessary information to process your orders, including name, email, contact details, and payment information. We do not sell your personal information. Please review our Privacy Policy for complete details on how we handle your data.'
  },
  {
    question: 'Is my payment information secure?',
    answer: 'Yes, we take security seriously. We use secure encryption and follow best practices to protect your payment and personal information. We do not store complete payment card details on our servers. All transactions are processed securely.'
  },
  {
    question: 'Can I change my order after placing it?',
    answer: 'Once an order is placed, changes may be limited. Contact our support team immediately if you need to modify your order. We will do our best to accommodate changes if the order hasn\'t been processed yet.'
  }
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="py-12 bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 min-h-screen transition-colors">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 md:p-12 border border-pink-100 dark:border-gray-700">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 bg-gradient-to-r from-pink-600 to-blue-600 dark:from-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
            Find answers to commonly asked questions about our products, services, and policies.
          </p>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-pink-200 dark:border-gray-700 rounded-lg overflow-hidden transition-colors hover:border-pink-300 dark:hover:border-gray-600"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between bg-gradient-to-r from-pink-50 to-blue-50 dark:from-gray-700 dark:to-gray-700 hover:from-pink-100 hover:to-blue-100 dark:hover:from-gray-600 dark:hover:to-gray-600 transition-all"
                >
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 pr-4">
                    {faq.question}
                  </h3>
                  <svg
                    className={`w-5 h-5 text-pink-600 dark:text-pink-400 flex-shrink-0 transition-transform ${
                      openIndex === index ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openIndex === index && (
                  <div className="px-6 py-4 bg-white dark:bg-gray-800 border-t border-pink-200 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-gradient-to-r from-pink-50 to-blue-50 dark:from-gray-700 dark:to-gray-700 rounded-lg border border-pink-200 dark:border-gray-600">
            <h2 className="text-xl font-display font-bold text-gray-800 dark:text-gray-200 mb-3">
              Still have questions?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              If you can't find the answer you're looking for, please don't hesitate to contact our support team.
            </p>
            <a
              href="/contact"
              className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all font-semibold shadow-md hover:shadow-lg"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}


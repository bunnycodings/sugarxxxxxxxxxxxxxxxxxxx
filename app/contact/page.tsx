'use client'

import { useState } from 'react'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    // Simulate form submission (you can integrate with an API endpoint here)
    setTimeout(() => {
      setSubmitted(true)
      setSubmitting(false)
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      })
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000)
    }, 1000)
  }

  return (
    <div className="py-12 bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 min-h-screen transition-colors">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-pink-100 dark:border-gray-700">
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 bg-gradient-to-r from-pink-600 to-blue-600 dark:from-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
                Contact Us
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
                We're here to help! Get in touch with our team.
              </p>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Email</h3>
                    <a href="mailto:support@sugarbunny.com" className="text-pink-600 dark:text-pink-400 hover:underline">
                      support@sugarbunny.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Working Hours</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      12:00 PM - 6:00 AM<br />
                      <span className="text-sm text-gray-500 dark:text-gray-400">(Thai Time)</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515a.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0a12.64 12.64 0 00-.617-1.25a.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057a19.9 19.9 0 005.993 3.03a.078.078 0 00.084-.028a14.09 14.09 0 001.226-1.994a.076.076 0 00-.041-.106a13.107 13.107 0 01-1.872-.892a.077.077 0 01-.008-.128a10.2 10.2 0 00.372-.292a.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127a12.299 12.299 0 01-1.873.892a.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028a19.839 19.839 0 006.002-3.03a.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Discord Support</h3>
                    <a 
                      href="https://discord.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-pink-600 dark:text-pink-400 hover:underline"
                    >
                      Join our Discord server
                    </a>
                  </div>
                </div>

                <div className="pt-6 border-t border-pink-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Response Time</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    We aim to respond to all inquiries within 24 hours during our working hours. For urgent matters, please mention it in your message subject.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-pink-100 dark:border-gray-700">
              <h2 className="text-2xl font-display font-bold mb-6 text-gray-800 dark:text-gray-200">
                Send us a Message
              </h2>

              {submitted && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-green-800 dark:text-green-300 font-medium">
                    ✓ Thank you! Your message has been sent. We'll get back to you soon.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-pink-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200 transition-colors"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-pink-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200 transition-colors"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-pink-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200 transition-colors"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="order">Order Question</option>
                    <option value="payment">Payment Issue</option>
                    <option value="technical">Technical Support</option>
                    <option value="refund">Refund Request</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-pink-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200 transition-colors resize-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Link */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Have a quick question? Check out our{' '}
            <a href="/faq" className="text-pink-600 dark:text-pink-400 hover:underline font-semibold">
              Frequently Asked Questions
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}


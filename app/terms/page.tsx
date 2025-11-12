export default function TermsOfService() {
  return (
    <div className="py-12 bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 min-h-screen transition-colors">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 md:p-12 border border-pink-100 dark:border-gray-700">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 bg-gradient-to-r from-pink-600 to-blue-600 dark:from-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-gray-800 dark:text-gray-200 mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                By accessing and using Sugarbunny Stores ("we," "our," or "us"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-gray-800 dark:text-gray-200 mb-4">
                2. Description of Service
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                Sugarbunny Stores provides virtual products and services including, but not limited to:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2 ml-4">
                <li>Virtual airline services and products</li>
                <li>Automated bots and solutions</li>
                <li>Website services and development</li>
                <li>Digital redeem codes</li>
                <li>Other virtual products and services as available</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-gray-800 dark:text-gray-200 mb-4">
                3. User Accounts
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                To purchase products and services, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2 ml-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept all responsibility for activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-gray-800 dark:text-gray-200 mb-4">
                4. Products and Services
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                All products and services are provided "as is" without warranty of any kind. We reserve the right to:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2 ml-4">
                <li>Modify or discontinue any product or service at any time</li>
                <li>Change prices without prior notice</li>
                <li>Limit quantities available for purchase</li>
                <li>Refuse service to anyone at our discretion</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-gray-800 dark:text-gray-200 mb-4">
                5. File Delivery and Sharing
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                For products that include downloadable files or digital content:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2 ml-4">
                <li>Files are delivered after payment verification is completed</li>
                <li>To receive your purchased files, you must open a support ticket in our Discord server</li>
                <li>When opening a ticket, provide your Order ID and payment receipt (image or PDF format)</li>
                <li>Our team will verify your payment and provide access to your files</li>
                <li>File delivery may take up to 24-48 hours after payment verification</li>
                <li>You are responsible for maintaining the security and confidentiality of files you receive</li>
                <li>Sharing, redistributing, or reselling purchased files is strictly prohibited</li>
                <li>Files are provided for personal use only unless otherwise specified in the product description</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                <strong>Important:</strong> Failure to provide accurate order information or payment proof may delay or prevent file delivery. We are not responsible for files lost due to user error or failure to follow delivery instructions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-gray-800 dark:text-gray-200 mb-4">
                6. Payment Terms
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                By making a purchase, you agree to:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2 ml-4">
                <li>Pay all charges incurred by your account</li>
                <li>Provide accurate payment information</li>
                <li>Authorize us to charge your payment method for all applicable fees</li>
                <li>Complete payment verification as required</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                All prices are in Thai Baht (THB) unless otherwise stated. Payment must be completed before products or services are delivered.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-gray-800 dark:text-gray-200 mb-4">
                7. Refund Policy
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                Due to the digital nature of our products and services:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2 ml-4">
                <li>All sales are final unless otherwise stated</li>
                <li>Refunds may be considered on a case-by-case basis</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-gray-800 dark:text-gray-200 mb-4">
                8. Intellectual Property
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                All content on this website, including products, services, text, graphics, logos, and software, is the property of Sugarbunny Stores and is protected by copyright and other intellectual property laws. You may not:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2 ml-4">
                <li>Copy, reproduce, or distribute any content without permission</li>
                <li>Modify or create derivative works from our products</li>
                <li>Use our content for commercial purposes without authorization</li>
                <li>Remove any copyright or proprietary notices</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-gray-800 dark:text-gray-200 mb-4">
                9. Prohibited Uses
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                You agree not to use our service to:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2 ml-4">
                <li>Violate any laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Transmit harmful or malicious code</li>
                <li>Spam or harass other users</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt our services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-gray-800 dark:text-gray-200 mb-4">
                10. Geographic Restrictions and IP Blocking
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                We reserve the right to restrict access to our website and services based on geographic location:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2 ml-4">
                <li>We may block access from certain countries or regions at our discretion</li>
                <li>IP blocking may be implemented temporarily or permanently</li>
                <li>Blocked countries are determined by our administrative team and may change without prior notice</li>
                <li>If you are located in a blocked region, you will be redirected to an access restriction page</li>
                <li>We are not obligated to provide access to users from blocked regions</li>
                <li>Attempting to bypass geographic restrictions using VPNs, proxies, or other methods is prohibited</li>
                <li>Violation of geographic restrictions may result in permanent account termination</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                <strong>Note:</strong> Geographic restrictions are implemented for various reasons including legal compliance, security, and business operations. If you believe you have been incorrectly blocked, please contact our support team.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-gray-800 dark:text-gray-200 mb-4">
                11. Limitation of Liability
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                To the maximum extent permitted by law, Sugarbunny Stores shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-gray-800 dark:text-gray-200 mb-4">
                12. Termination
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                We reserve the right to terminate or suspend your account and access to our services at any time, without prior notice, for any reason, including breach of these Terms of Service. Upon termination, your right to use the service will immediately cease.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-gray-800 dark:text-gray-200 mb-4">
                13. Changes to Terms
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new Terms of Service on this page and updating the "Last updated" date. Your continued use of the service after any changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-gray-800 dark:text-gray-200 mb-4">
                14. Contact Information
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                <strong>Email:</strong> support@sugarbunny.com<br />
                <strong>Working Hours:</strong> 12:00 PM - 6:00 AM
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}


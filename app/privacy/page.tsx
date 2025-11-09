export default function PrivacyPolicy() {
  return (
    <div className="py-12 bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 min-h-screen transition-colors">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 md:p-12 border border-pink-100 dark:border-gray-700">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 bg-gradient-to-r from-pink-600 to-blue-600 dark:from-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-gray-800 dark:text-gray-200 mb-4">
                1. Introduction
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                Sugarbunny Stores ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-gray-800 dark:text-gray-200 mb-4">
                2. Information We Collect
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">
                2.1 Personal Information
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                We may collect personal information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2 ml-4">
                <li>Name and contact information (email address, phone number)</li>
                <li>Account credentials (username, password)</li>
                <li>Payment information (billing address, payment method details)</li>
                <li>Order history and transaction details</li>
                <li>Member ID and account preferences</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">
                2.2 Automatically Collected Information
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                When you visit our website, we automatically collect certain information:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2 ml-4">
                <li>IP address and location data</li>
                <li>Browser type and version</li>
                <li>Device information</li>
                <li>Pages visited and time spent on pages</li>
                <li>Referral sources</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-gray-800 dark:text-gray-200 mb-4">
                3. How We Use Your Information
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                We use the collected information for various purposes:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2 ml-4">
                <li>To process and fulfill your orders</li>
                <li>To create and manage your account</li>
                <li>To communicate with you about your orders and account</li>
                <li>To send you updates, promotions, and newsletters (with your consent)</li>
                <li>To improve our website and services</li>
                <li>To prevent fraud and ensure security</li>
                <li>To comply with legal obligations</li>
                <li>To respond to your inquiries and provide customer support</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-gray-800 dark:text-gray-200 mb-4">
                4. Information Sharing and Disclosure
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                We do not sell your personal information. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2 ml-4">
                <li><strong>Service Providers:</strong> With trusted third-party service providers who assist us in operating our website and conducting our business</li>
                <li><strong>Payment Processors:</strong> With payment processors to handle transactions securely</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>With Your Consent:</strong> When you have given us explicit consent to share your information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-gray-800 dark:text-gray-200 mb-4">
                5. Data Security
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2 ml-4">
                <li>Encryption of sensitive data during transmission</li>
                <li>Secure storage of personal information</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Password hashing and secure authentication</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-gray-800 dark:text-gray-200 mb-4">
                6. Cookies and Tracking Technologies
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to track activity on our website and store certain information. Cookies are files with a small amount of data that are sent to your browser from a website and stored on your device.
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                Types of cookies we use:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2 ml-4">
                <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our website</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-gray-800 dark:text-gray-200 mb-4">
                7. Your Rights and Choices
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                You have certain rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2 ml-4">
                <li><strong>Access:</strong> Request access to your personal information we hold</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Objection:</strong> Object to processing of your personal information</li>
                <li><strong>Data Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                To exercise these rights, please contact us using the contact information provided below.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-gray-800 dark:text-gray-200 mb-4">
                8. Data Retention
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                We will retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your information, we will securely delete or anonymize it.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-gray-800 dark:text-gray-200 mb-4">
                9. Children's Privacy
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately, and we will take steps to delete such information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-gray-800 dark:text-gray-200 mb-4">
                10. International Data Transfers
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ. By using our services, you consent to the transfer of your information to facilities located outside your jurisdiction.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-gray-800 dark:text-gray-200 mb-4">
                11. Changes to This Privacy Policy
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-bold text-gray-800 dark:text-gray-200 mb-4">
                12. Contact Us
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                <strong>Email:</strong> support@sugarbunny.com<br />
                <strong>Working Hours:</strong> 12:00 PM - 6:00 AM<br />
                <strong>Subject:</strong> Privacy Policy Inquiry
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}


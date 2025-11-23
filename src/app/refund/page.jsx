"use client";

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Refund Policy</h1>
        
        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Refund Eligibility</h2>
            <p className="text-gray-700 leading-relaxed">
              We offer refunds within 7 days of purchase if you have not accessed more than 25% of 
              the course content. Refund requests must be submitted via our contact form or email.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Non-Refundable Cases</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Refunds will not be provided in the following cases:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>More than 7 days have passed since purchase</li>
              <li>You have accessed more than 25% of the course content</li>
              <li>You have downloaded course materials</li>
              <li>The course was purchased during a promotional period</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Refund Process</h2>
            <p className="text-gray-700 leading-relaxed">
              To request a refund, contact us at chakmashuvo2016@gmail.com with your transaction ID 
              and reason for the refund. Approved refunds will be processed within 7-10 business days 
              to your original payment method.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Technical Issues</h2>
            <p className="text-gray-700 leading-relaxed">
              If you experience technical issues preventing you from accessing the course, please 
              contact our support team first. We will work to resolve the issue before processing 
              any refund requests.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed">
              For refund requests or questions, please email us at chakmashuvo2016@gmail.com 
              or call +880 1625490792
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";

export const metadata = {
  title: "Legal Disclaimer - Instagram Post Downloader",
  description: "Legal disclaimer and limitations for our service.",
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-4xl mx-auto p-6">
        <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm mb-4 inline-block">
          &larr; Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold mb-6">Legal Disclaimer</h1>
        <p className="text-sm text-[var(--placeholder)] mb-8">
          Last Updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-red-900 dark:text-white-100 mb-2">Important Notice</h2>
              <p className="text-red-900 dark:text-white-100">
                This service is provided for educational and personal use only. Users are solely responsible for ensuring their use complies with all applicable laws, regulations, and third-party terms of service.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">1. No Affiliation with Instagram</h2>
            <p className="text-[var(--placeholder)]">
              This service is NOT affiliated with, endorsed by, or connected to Instagram, Meta Platforms, Inc., or any of their subsidiaries or affiliates. Instagram is a trademark of Meta Platforms, Inc.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Educational Purpose</h2>
            <p className="text-[var(--placeholder)]">
              This tool is created for educational purposes to demonstrate web technologies and API integration. It should be used responsibly and in compliance with all applicable laws and platform terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. User Responsibility</h2>
            <p className="text-[var(--placeholder)] mb-3">
              By using this service, you acknowledge and agree that:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[var(--placeholder)]">
              <li>You are solely responsible for your use of this service</li>
              <li>You must comply with Instagram&apos;s Terms of Service</li>
              <li>You must respect copyright and intellectual property rights</li>
              <li>You will not use this service for any illegal purposes</li>
              <li>You understand that downloading content you don&apos;t own may violate copyright laws</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. No Warranty</h2>
            <p className="text-[var(--placeholder)]">
              This service is provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; without any warranties of any kind, either express or implied, including but not limited to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[var(--placeholder)] mt-2">
              <li>Warranties of merchantability or fitness for a particular purpose</li>
              <li>Warranties that the service will be uninterrupted or error-free</li>
              <li>Warranties regarding the accuracy or reliability of results</li>
              <li>Warranties that defects will be corrected</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Limitation of Liability</h2>
            <p className="text-[var(--placeholder)]">
              To the maximum extent permitted by law, we shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages, including but not limited to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[var(--placeholder)] mt-2">
              <li>Loss of profits, data, or use</li>
              <li>Business interruption</li>
              <li>Legal fees or costs</li>
              <li>Damages resulting from use or inability to use the service</li>
              <li>Damages from copyright infringement claims</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Third-Party Content</h2>
            <p className="text-[var(--placeholder)]">
              All content accessed through this service originates from Instagram and is subject to Instagram&apos;s terms and policies. We do not host, store, or control any third-party content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Copyright Compliance</h2>
            <p className="text-[var(--placeholder)]">
              Users must ensure they have the right to download and use any content. Downloading copyrighted material without permission may violate copyright laws and could result in legal consequences.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Service Availability</h2>
            <p className="text-[var(--placeholder)]">
              We do not guarantee that this service will always be available or functional. The service may be interrupted, suspended, or terminated at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Changes to Service</h2>
            <p className="text-[var(--placeholder)]">
              We reserve the right to modify, suspend, or discontinue the service (or any part thereof) at any time without notice or liability.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Indemnification</h2>
            <p className="text-[var(--placeholder)]">
              You agree to indemnify and hold harmless the service operators from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the service or violation of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Legal Compliance</h2>
            <p className="text-[var(--placeholder)]">
              You are responsible for ensuring your use of this service complies with all applicable local, state, national, and international laws and regulations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Contact</h2>
            <p className="text-[var(--placeholder)]">
              If you have questions about this disclaimer, please review our <Link href="/terms" className="text-blue-600 hover:underline">Terms &amp; Conditions</Link> or contact us through appropriate channels.
            </p>
          </section>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-8">
            <p className="text-[var(--foreground)] font-medium">
              By using this service, you acknowledge that you have read, understood, and agree to be bound by this disclaimer and all related policies.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

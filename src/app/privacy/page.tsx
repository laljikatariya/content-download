import Link from "next/link";

export const metadata = {
  title: "Privacy Policy - Instagram Post Downloader",
  description: "Privacy policy for our Instagram post downloader service.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-4xl mx-auto p-6">
        <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm mb-4 inline-block">
          &larr; Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-sm text-[var(--placeholder)] mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
            <p className="text-[var(--placeholder)] mb-3">
              We are committed to protecting your privacy. This service is designed to minimize data collection:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[var(--placeholder)]">
              <li><strong>URLs Submitted:</strong> We temporarily process Instagram URLs you submit to resolve media links. These are not stored permanently.</li>
              <li><strong>Technical Data:</strong> We may collect basic technical information such as IP addresses, browser type, and access times for security and analytics purposes.</li>
              <li><strong>Cookies:</strong> We may use essential cookies for service functionality. We do not use tracking cookies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-[var(--placeholder)]">
              <li>To provide and maintain our service</li>
              <li>To process your requests for media resolution</li>
              <li>To improve and optimize our service</li>
              <li>To detect and prevent abuse or misuse</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Data Storage and Security</h2>
            <p className="text-[var(--placeholder)]">
              We do not store downloaded media on our servers. URLs are processed in real-time and not permanently retained. We implement reasonable security measures to protect against unauthorized access, but no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Third-Party Services</h2>
            <p className="text-[var(--placeholder)]">
              This service may use third-party APIs to resolve Instagram media. These third parties may have their own privacy policies. We are not responsible for the privacy practices of third-party services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Data Sharing</h2>
            <p className="text-[var(--placeholder)]">
              We do not sell, trade, or rent your personal information to third parties. We may share information only:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[var(--placeholder)] mt-2">
              <li>When required by law or legal process</li>
              <li>To protect our rights, property, or safety</li>
              <li>With service providers who assist in operating our service (under strict confidentiality)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
            <p className="text-[var(--placeholder)] mb-2">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-[var(--placeholder)]">
              <li>Access information we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Children's Privacy</h2>
            <p className="text-[var(--placeholder)]">
              This service is not intended for users under 13 years of age. We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. International Users</h2>
            <p className="text-[var(--placeholder)]">
              If you are accessing this service from outside your jurisdiction, please be aware that your information may be transferred to, stored, and processed in different locations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Changes to Privacy Policy</h2>
            <p className="text-[var(--placeholder)]">
              We may update this privacy policy from time to time. We will notify you of significant changes by posting the new policy on this page with an updated date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Contact Us</h2>
            <p className="text-[var(--placeholder)]">
              If you have questions or concerns about this privacy policy, please contact us through appropriate channels.
            </p>
          </section>
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

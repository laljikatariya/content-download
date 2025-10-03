import Link from "next/link";

export const metadata = {
  title: "Terms & Conditions - Instagram Post Downloader",
  description: "Terms and conditions for using our Instagram post downloader service.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-4xl mx-auto p-6">
        <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm mb-4 inline-block">
          ← Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold mb-6">Terms & Conditions</h1>
        <p className="text-sm text-[var(--placeholder)] mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-[var(--placeholder)]">
              By accessing and using this Instagram Post Downloader service, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Service Description</h2>
            <p className="text-[var(--placeholder)]">
              This service allows users to resolve and download publicly available media from Instagram posts. This tool is provided for educational and personal use only.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. User Responsibilities</h2>
            <ul className="list-disc list-inside space-y-2 text-[var(--placeholder)]">
              <li>You must respect copyright laws and intellectual property rights</li>
              <li>You may only download content you have permission to download</li>
              <li>You must comply with Instagram's Terms of Service</li>
              <li>You are responsible for how you use downloaded content</li>
              <li>You must not use this service for commercial purposes without authorization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Prohibited Uses</h2>
            <p className="text-[var(--placeholder)] mb-2">You agree NOT to use this service to:</p>
            <ul className="list-disc list-inside space-y-2 text-[var(--placeholder)]">
              <li>Download copyrighted content without permission</li>
              <li>Violate any person's privacy or intellectual property rights</li>
              <li>Engage in any illegal activities</li>
              <li>Redistribute, sell, or commercially exploit downloaded content</li>
              <li>Harass, stalk, or harm others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Disclaimer of Warranties</h2>
            <p className="text-[var(--placeholder)]">
              This service is provided "as is" without any warranties, express or implied. We do not guarantee that the service will be uninterrupted, secure, or error-free. We are not responsible for the content downloaded through this service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Limitation of Liability</h2>
            <p className="text-[var(--placeholder)]">
              We shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use this service. You use this service at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Copyright Compliance</h2>
            <p className="text-[var(--placeholder)]">
              We respect intellectual property rights. If you believe content downloaded through our service infringes your copyright, please see our <Link href="/dmca" className="text-blue-600 hover:underline">DMCA Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Changes to Terms</h2>
            <p className="text-[var(--placeholder)]">
              We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Termination</h2>
            <p className="text-[var(--placeholder)]">
              We reserve the right to terminate or suspend access to our service immediately, without prior notice, for any reason, including breach of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Governing Law</h2>
            <p className="text-[var(--placeholder)]">
              These terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Contact</h2>
            <p className="text-[var(--placeholder)]">
              If you have any questions about these Terms & Conditions, please contact us through the appropriate channels.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
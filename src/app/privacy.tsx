import Link from "next/link";

export const metadata = {
  title: "Privacy Policy - Instagram Post Downloader",
  description: "Privacy policy for our Instagram post downloader service.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-4xl mx-auto p-6">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-700 text-sm mb-4 inline-block"
        >
          &larr; Back to Home
        </Link>

        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-sm text-[var(--placeholder)] mb-8">
          Last Updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-6 text-sm leading-relaxed">
          <p className="text-[var(--placeholder)]">
            This is the privacy policy page. We are committed to protecting your
            privacy. Our service processes Instagram URLs temporarily to resolve
            media links and does not store them permanently. Any sensitive
            information, including cookies or technical data, is handled
            securely and responsibly.
          </p>

          <p className="text-[var(--placeholder)]">
            Users under 13 years of age should not use this service. For more
            details or concerns about your data, please contact us through the
            available support channels. We&apos;re committed to your privacy.
          </p>
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

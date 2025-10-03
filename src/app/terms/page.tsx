import Link from "next/link";

export const metadata = {
  title: "Terms & Conditions - Instagram Post Downloader",
  description: "Terms and conditions for using our Instagram post downloader service.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-4xl mx-auto p-6">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-700 text-sm mb-4 inline-block"
        >
          &larr; Back to Home
        </Link>

        <h1 className="text-3xl font-bold mb-6">Terms &amp; Conditions</h1>
        <p className="text-sm text-[var(--placeholder)] mb-8">
          Last Updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-6 text-sm leading-relaxed">
          <p className="text-[var(--placeholder)]">
            By using this Instagram Post Downloader service, you agree to our
            terms and conditions. The service is provided for personal and
            educational use only. Users are responsible for respecting copyright
            laws and intellectual property rights. We are not liable for any
            issues arising from the use of downloaded content.
          </p>

          <p className="text-[var(--placeholder)]">
            We reserve the right to modify or terminate the service at any time.
            If you have questions about these terms, please contact us through
            the appropriate channels.
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

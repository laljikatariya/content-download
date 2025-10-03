import Link from "next/link";

export const metadata = {
  title: "DMCA Policy - Instagram Post Downloader",
  description: "DMCA copyright policy and takedown procedures.",
};

export default function DMCAPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-4xl mx-auto p-6">
        <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm mb-4 inline-block">
          ← Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold mb-6">DMCA Copyright Policy</h1>
        <p className="text-sm text-[var(--placeholder)] mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3">Copyright Respect</h2>
            <p className="text-[var(--placeholder)]">
              We respect the intellectual property rights of others and expect our users to do the same. It is our policy to respond to clear notices of alleged copyright infringement that comply with the Digital Millennium Copyright Act (DMCA).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Important Notice</h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-[var(--foreground)]">
                <strong>This service does not host any content.</strong> We provide a tool that resolves publicly available URLs from Instagram. All content remains on Instagram's servers. We do not store, cache, or redistribute any media files.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">DMCA Takedown Notice</h2>
            <p className="text-[var(--placeholder)] mb-3">
              If you believe that content accessible through our service infringes your copyright, you may send a DMCA notice containing the following information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[var(--placeholder)]">
              <li>Your physical or electronic signature</li>
              <li>Identification of the copyrighted work claimed to have been infringed</li>
              <li>Identification of the material that is claimed to be infringing (URL)</li>
              <li>Your contact information (address, telephone number, email)</li>
              <li>A statement that you have a good faith belief that use of the material is not authorized</li>
              <li>A statement that the information in the notification is accurate, and under penalty of perjury, that you are authorized to act on behalf of the copyright owner</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Where to Send Notices</h2>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
              <p className="text-[var(--placeholder)]">
                <strong>Note:</strong> Since we do not host content, copyright claims should primarily be directed to Instagram/Meta, as they host the actual content. However, if you believe our service facilitates copyright infringement, you may contact us at:
              </p>
              <p className="text-[var(--foreground)] mt-3">
                [Your DMCA Contact Email]<br />
                [Your Address if applicable]
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Counter-Notice</h2>
            <p className="text-[var(--placeholder)]">
              If you believe that content you posted was removed or access was disabled by mistake or misidentification, you may file a counter-notice containing:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[var(--placeholder)] mt-2">
              <li>Your physical or electronic signature</li>
              <li>Identification of the material and its location before removal</li>
              <li>A statement under penalty of perjury that you have a good faith belief the material was removed by mistake</li>
              <li>Your name, address, telephone number, and consent to jurisdiction</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Repeat Infringer Policy</h2>
            <p className="text-[var(--placeholder)]">
              We will terminate access for users who are repeat infringers of copyright.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">False Claims</h2>
            <p className="text-[var(--placeholder)]">
              Please note that under Section 512(f) of the DMCA, any person who knowingly materially misrepresents that material is infringing may be subject to liability.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">User Responsibility</h2>
            <p className="text-[var(--placeholder)]">
              Users of this service are solely responsible for ensuring they have the right to download and use any content. We strongly encourage users to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[var(--placeholder)] mt-2">
              <li>Only download content they own or have permission to download</li>
              <li>Respect copyright and intellectual property rights</li>
              <li>Comply with Instagram's Terms of Service</li>
              <li>Use downloaded content responsibly and legally</li>
            </ul>
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
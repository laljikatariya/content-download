import Link from "next/link";

export const metadata = {
  title: "DMCA Copyright Policy - Instagram Downloader Service",
  description: "DMCA copyright policy and takedown procedures for our Instagram video downloader, photo saver, and reels downloader service.",
};

export default function DMCAPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/" className="text-blue-600 hover:underline text-sm mb-6 inline-block">
          ← Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold mb-4 gradient-text">DMCA Copyright Policy</h1>
        <p className="text-sm text-gray-600 mb-8">Last Updated: October 9, 2025</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Overview</h2>
            <p className="mb-4">
              We respect the intellectual property rights of others and expect our users to do the same. This DMCA (Digital Millennium Copyright Act) Policy outlines our procedures for addressing copyright infringement claims related to our Instagram content downloader service.
            </p>
            <p className="mb-4">
              <strong>Important:</strong> We are a tool provider that enables users to download publicly available Instagram content. We do not host, store, or distribute copyrighted content. Our Instagram video downloader, photo downloader, reels downloader, story downloader, IGTV downloader, and carousel downloader services merely facilitate access to content already publicly available on Instagram.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Our Role and Responsibility</h2>
            <p className="mb-4">
              <strong>1.1 Tool Provider Status:</strong> We provide a technical tool that allows users to download publicly accessible Instagram content. We:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Do NOT host or store any Instagram content on our servers</li>
              <li>Do NOT upload or distribute copyrighted material</li>
              <li>Do NOT create or modify any Instagram content</li>
              <li>Process download requests in real-time without permanent storage</li>
              <li>Act as a neutral technology provider</li>
            </ul>
            <p className="mb-4">
              <strong>1.2 User Responsibility:</strong> Users of our Instagram downloader service are solely responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Ensuring they have the right to download and use content</li>
              <li>Complying with copyright laws and Instagram&apos;s Terms of Service</li>
              <li>Obtaining necessary permissions from content creators</li>
              <li>Using downloaded content in accordance with applicable laws</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Filing a DMCA Takedown Notice</h2>
            <p className="mb-4">
              To file a valid DMCA notice, you must provide a written communication that includes:
            </p>
            
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 mb-4">
              <ol className="list-decimal list-inside space-y-3">
                <li><strong>Identification of the copyrighted work:</strong> Describe the copyrighted work you claim has been infringed.</li>
                <li><strong>Identification of the infringing material:</strong> Provide the specific Instagram URLs where the allegedly infringing content is located.</li>
                <li><strong>Contact information:</strong> Include your name, address, telephone number, and email address.</li>
                <li><strong>Good faith statement:</strong> Include a statement that you have a good faith belief that use of the material is not authorized.</li>
                <li><strong>Accuracy statement:</strong> Include a statement under penalty of perjury that the information is accurate.</li>
                <li><strong>Physical or electronic signature:</strong> A signature of the copyright owner or authorized representative.</li>
              </ol>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Limitations of Our Service</h2>
            <p className="mb-4">
              Please understand that:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>We cannot remove content from Instagram - only Instagram/Meta can do that</li>
              <li>We do not control what content users choose to download</li>
              <li>We process requests in real-time without storing content</li>
              <li>The original content remains on Instagram regardless of our service</li>
            </ul>
            <p className="mt-4 font-medium">
              For content removal from Instagram itself, you must contact Instagram/Meta directly through their official DMCA procedures.
            </p>
          </section>

          <section className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Important Notices</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>We are NOT Instagram or Meta:</strong> We are an independent third-party tool</li>
              <li><strong>No Content Hosting:</strong> We do not store or host any Instagram content</li>
              <li><strong>User Responsibility:</strong> Users are responsible for their downloads and usage</li>
              <li><strong>Contact Instagram:</strong> For content removal, contact Instagram directly</li>
              <li><strong>Legal Compliance:</strong> Users must comply with copyright laws and Instagram&apos;s TOS</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

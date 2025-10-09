"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image"; // ✅ Next.js optimized image

// Zod schema for input validation
const schema = z.object({
  url: z.string().min(1, "URL is required").url("Enter a valid Instagram URL"),
});

type FormValues = z.infer<typeof schema>;
// Interface matching the NormalizedMedia defined in resolve/route.ts
type MediaItem = { url: string; type: "image" | "video" };

export default function Home() {
  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/$/, "");
  const apiUrl = (path: string) => `${API_BASE}${path}`;

  // Form setup using React Hook Form and Zod
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { url: "" },
  });

  // Data fetching and state management using React Query (useMutation)
  const { mutate, data, isPending, error, reset } = useMutation({
    mutationFn: async (values: FormValues) => {
      // API call to the resolver endpoint
      const res = await fetch(apiUrl("/api/resolve"), { 
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        // Attempt to parse error message from API response body
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `Failed to resolve (${res.status})`);
      }
      // Ensure the response is cast correctly to match the backend structure
      return (await res.json()) as { media: MediaItem[] };
    },
  });

  // Extracts the array of media items from the mutation result
  const media = useMemo(() => data?.media ?? [], [data]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-3xl mx-auto p-6">
        {/* Header */}
        <header className="py-6">
          <h1 className="text-2xl font-semibold">Instagram Content Downloader</h1>
          <p className="text-sm text-[var(--placeholder)] mt-1">
            Paste a public Instagram content URL to resolve downloadable media. For educational and personal use only.
          </p>
        </header>

        {/* Form */}
        <section className="mt-4">
          <form
            onSubmit={form.handleSubmit((v) => mutate(v))}
            className="flex gap-3 items-start"
          >
            <div className="flex-1">
              <input
                type="url"
                placeholder="https://www.instagram.com/p/POST_ID/"
                {...form.register("url")}
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring-0 focus:border-blue-500 bg-[var(--surface)] text-[var(--foreground)] border-[var(--border)]"
              />
              {form.formState.errors.url && (
                <p className="text-red-600 text-sm mt-1">
                  {form.formState.errors.url.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="rounded-md bg-blue-600 text-white px-4 py-2 disabled:opacity-60"
              disabled={isPending}
            >
              {isPending ? "Resolving..." : "Resolve"}
            </button>
            <button
              type="button"
              onClick={() => {
                form.reset();
                reset();
              }}
              className="rounded-md border border-neutral-300 dark:border-neutral-700 px-4 py-2"
            >
              Clear
            </button>
          </form>
          {error && (
            <div className="mt-3 text-red-600 text-sm">{String(error.message)}</div>
          )}
        </section>

        {/* Media Preview (only first item) */}
        <section className="mt-8">
          {!media.length ? (
            <p className="text-sm text-[var(--placeholder)]">
              No media yet. Enter a URL and click Resolve.
            </p>
          ) : (
            <div className="flex justify-center">
              {(() => {
                const m = media[0]; // ✅ only first media item
                return (
                  <div className="border border-[var(--border)] rounded-md overflow-hidden bg-[var(--surface)] max-w-2xl w-full">
                    <div className="p-3 flex items-center justify-between">
                      <span className="text-xs px-2 py-1 rounded bg-[var(--background)] border border-[var(--border)] uppercase">
                        {m.type}
                      </span>
                      <span
                        className="text-xs text-[var(--placeholder)] truncate max-w-[200px]"
                        title={m.url}
                      >
                        {new URL(m.url).hostname}
                      </span>
                    </div>
                    <div className="bg-neutral-900 aspect-square sm:aspect-video flex items-center justify-center overflow-hidden relative">
                      {m.type?.toLowerCase() === "image" ? (
                        <Image
                          src={m.url}
                          alt="preview"
                          width={800}
                          height={600}
                          className="w-full h-full object-cover"
                        />
                      ) : m.type?.toLowerCase() === "video" ? (
                        <video
                          controls
                          preload="metadata"
                          className="w-full h-full object-contain"
                          poster={m.thumbnail}
                        >
                          <source
                            src={apiUrl(
                              `/api/download?disposition=inline&url=${encodeURIComponent(m.url)}`
                            )}
                          />
                          Your browser does not support the video tag.
                        </video>
                      ) : m.thumbnail ? (
                        <Image
                          src={m.thumbnail}
                          alt="thumbnail"
                          width={800}
                          height={600}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="p-4 text-xs text-[var(--placeholder)]">
                          No preview available
                        </div>
                      )}
                    </div>
                    <div className="p-3 border-t border-[var(--border)] bg-[var(--surface)]">
                      <a
                        href={apiUrl(`/api/download?url=${encodeURIComponent(m.url)}`)}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
                        aria-label="Download media"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </section>

        {/* Disclaimer */}
        <section className="mt-10 border-t border-neutral-200 dark:border-neutral-800 pt-4">
          <h2 className="font-medium mb-2">Disclaimer</h2>
          <p className="text-xs text-[var(--placeholder)]">
            Downloading media you do not own may violate Instagram’s Terms of Service and copyright laws. This tool is for educational and personal use only. Respect creators’ rights.
          </p>
        </section>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex flex-wrap gap-4 justify-center text-xs text-[var(--placeholder)]">
            <a href="/terms" className="hover:text-[var(--foreground)] transition-colors">
              Terms & Conditions
            </a>
            <span>•</span>
            <a href="/privacy" className="hover:text-[var(--foreground)] transition-colors">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="/dmca" className="hover:text-[var(--foreground)] transition-colors">
              DMCA Policy
            </a>
            <span>•</span>
            <a href="/disclaimer" className="hover:text-[var(--foreground)] transition-colors">
              Legal Disclaimer
            </a>
          </div>
          <p className="text-center text-xs text-[var(--placeholder)] mt-4">
            © {new Date().getFullYear()} Instagram Post Downloader. For educational purposes only.
          </p>
        </footer>
      </div>
    </div>
  );
}

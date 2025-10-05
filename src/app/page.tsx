"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// Assuming @tanstack/react-query is available in the environment
import { useMutation } from "@tanstack/react-query"; 
// The import for "next/image" has been removed to fix the compilation error.

// Zod schema for input validation
const schema = z.object({
  url: z.string().min(1, "URL is required").url("Enter a valid Instagram URL"),
});

type FormValues = z.infer<typeof schema>;
// Interface matching the NormalizedMedia defined in resolve/route.ts
type MediaItem = { url: string; type: "image" | "video" };

export default function Home() {
  // Utility function to handle API base URL (if needed in deployment)
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
  const [aspectMap, setAspectMap] = useState<Record<number, string>>({});

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // noop UI; could add toast if desired
    } catch {}
  };

  type Variant = 'image' | 'video' | 'reel';
  const getVariant = (m: MediaItem): Variant => {
    const inputUrl = form.getValues().url || '';
    if (/\/reel\//i.test(inputUrl)) return 'reel';
    return m.type === 'video' ? 'video' : 'image';
  };
  const getCardRing = (v: Variant) =>
    v === 'reel'
      ? 'ring-1 ring-purple-500/30'
      : v === 'video'
      ? 'ring-1 ring-blue-500/30'
      : 'ring-1 ring-emerald-500/20';
  const getBadgeClasses = (v: Variant) =>
    v === 'reel'
      ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-200 dark:border-purple-800'
      : v === 'video'
      ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-800'
      : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:border-emerald-800';

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-3xl mx-auto p-6">
        <header className="py-6">
          <h1 className="text-2xl font-semibold">Instagram Content Downloader</h1>
          <p className="text-sm text-[var(--placeholder)] mt-1">
            Paste a public Instagram URL to resolve downloadable media. For educational/personal use only.
          </p>
        </header>

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
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring-0 focus:focus:border-blue-500 bg-[var(--surface)] text-[var(--foreground)] border-[var(--border)]"
                disabled={isPending}
              />
              {form.formState.errors.url && (
                <p className="text-red-600 text-sm mt-1">{form.formState.errors.url.message}</p>
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
                reset(); // Resets the useMutation state (data, error)
              }}
              className="rounded-md border border-neutral-300 dark:border-neutral-700 px-4 py-2"
              disabled={isPending}
            >
              Clear
            </button>
          </form>
          {error && <div className="mt-3 text-red-600 text-sm">{String(error.message)}</div>}
        </section>

        <section className="mt-8">
          {!media.length && !isPending ? (
            <p className="text-sm text-[var(--placeholder)]">No media yet. Enter a URL and click Resolve.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {isPending && [0, 1].map((i) => (
                <div key={`s-${i}`} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm overflow-hidden animate-pulse">
                  <div className="h-3.5 bg-neutral-200 dark:bg-neutral-800 m-4 rounded w-24" />
                  <div className="aspect-video bg-neutral-200 dark:bg-neutral-800" />
                  <div className="h-9 bg-neutral-200 dark:bg-neutral-800 m-4 rounded" />
                </div>
              ))}

              {media.map((m, idx) => {
                const variant = getVariant(m);
                const fallbackAspect = variant === 'reel' ? '9/16' : '16/9';
                return (
                <div key={idx} className={`rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm overflow-hidden ${getCardRing(variant)}`}>

                  {/* Media */}
                  <div
                    className={`relative overflow-hidden bg-[var(--surface)]`}
                    style={{ aspectRatio: aspectMap[idx] || fallbackAspect }}
                  > 
                    {m.type === 'video' ? (
                      <video
                        controls
                        preload="metadata"
                        playsInline
                        className="w-full h-full object-contain block"
                        onLoadedMetadata={(e) => {
                          const v = e.currentTarget;
                          const w = v.videoWidth || 16;
                          const h = v.videoHeight || 9;
                          setAspectMap((s) => ({ ...s, [idx]: `${w}/${h}` }));
                        }}
                      >
                        <source src={apiUrl(`/api/download?disposition=inline&url=${encodeURIComponent(m.url)}`)} />
                        Your browser does not support the video tag.
                      </video>
                    ) : /\/reel\//i.test(form.getValues().url || '') ? (
                      <video
                        controls
                        preload="metadata"
                        playsInline
                        className="w-full h-full object-contain block"
                        onLoadedMetadata={(e) => {
                          const v = e.currentTarget;
                          const w = v.videoWidth || 9;
                          const h = v.videoHeight || 16;
                          setAspectMap((s) => ({ ...s, [idx]: `${w}/${h}` }));
                        }}
                      >
                        <source src={apiUrl(`/api/download?disposition=inline&url=${encodeURIComponent(m.url)}`)} />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <img
                        src={apiUrl(`/api/download?disposition=inline&url=${encodeURIComponent(m.url)}`)}
                        alt={`Media preview ${idx + 1} (${m.type})`}
                        className="w-full h-full object-contain block"
                        onLoad={(e) => {
                          const img = e.currentTarget as HTMLImageElement;
                          const w = img.naturalWidth || 16;
                          const h = img.naturalHeight || 9;
                          setAspectMap((s) => ({ ...s, [idx]: `${w}/${h}` }));
                        }}
                        onError={(e) => (e.currentTarget.src = 'https://placehold.co/1200x675/161616/8b8b8b?text=Preview+Unavailable')}
                      />
                    )}

                    {m.type === 'video' && (
                      <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/40 text-white px-2 py-1 text-[10px] font-semibold">
                        {variant === 'reel' ? 'REEL' : 'VIDEO'}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="px-4 py-3 flex gap-2 border-t border-[var(--border)] bg-[var(--surface)]">
                    <a
                      href={apiUrl(`/api/download?disposition=attachment&url=${encodeURIComponent(m.url)}`)}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium"
                      download={`instagram_media_${idx + 1}.${m.type === 'video' ? 'mp4' : 'jpg'}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download
                    </a>
                  </div>
                </div>
              );})}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { menuContent, ContentType } from "@/data/menuContent";
import SchemaMarkup from "./schema";

const schema = z.object({
  url: z
    .string()
    .min(1, "URL is required")
    .url("Enter a valid Instagram post URL"),
});

type FormValues = z.infer<typeof schema>;

type MediaItem = { url: string; type: string; thumbnail?: string };

export default function Home() {
  const [selectedType, setSelectedType] = useState<ContentType>('video');
  const content = menuContent[selectedType];
  
  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/$/, "");
  const apiUrl = (path: string) => `${API_BASE}${path}`;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { url: "" },
  });

  const { mutate, data, isPending, error, reset } = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await fetch(apiUrl("/api/resolve"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `Failed to resolve (${res.status})`);
      }
      return (await res.json()) as { media: MediaItem[] };
    },
  });

  const media = useMemo(() => data?.media ?? [], [data]);
  const [aspectMap, setAspectMap] = useState<Record<number, string>>({});

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
    <>
      <SchemaMarkup />
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        {/* Menu Bar */}
        <div className="sticky top-0 z-40 bg-[var(--background)]/95 backdrop-blur-md border-b border-[var(--border)] shadow-sm">
          <div className="w-full px-4 py-3">
            <div className="overflow-x-auto overflow-y-hidden scrollbar-hide">
              <div className="flex items-center justify-start gap-2 min-w-max mx-auto" style={{ maxWidth: 'fit-content' }}>
                <div className="inline-flex items-center gap-2 sm:gap-3 p-2 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 backdrop-blur-sm border border-purple-200/30 dark:border-purple-800/30">
                  
                  <button
                    onClick={() => setSelectedType('video')}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all transform hover:scale-105 ${
                      selectedType === 'video' 
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg' 
                        : 'text-[var(--foreground)] hover:bg-white/50 dark:hover:bg-white/10'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Video
                  </button>

                  <button
                    onClick={() => setSelectedType('photo')}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all transform hover:scale-105 ${
                      selectedType === 'photo' 
                        ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg' 
                        : 'text-[var(--foreground)] hover:bg-white/50 dark:hover:bg-white/10'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Photo
                  </button>

                  <button
                    onClick={() => setSelectedType('reels')}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all transform hover:scale-105 ${
                      selectedType === 'reels' 
                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg' 
                        : 'text-[var(--foreground)] hover:bg-white/50 dark:hover:bg-white/10'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                    </svg>
                    Reels
                  </button>

                  <button
                    onClick={() => setSelectedType('story')}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all transform hover:scale-105 ${
                      selectedType === 'story' 
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg' 
                        : 'text-[var(--foreground)] hover:bg-white/50 dark:hover:bg-white/10'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Story
                  </button>

                  <button
                    onClick={() => setSelectedType('igtv')}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all transform hover:scale-105 ${
                      selectedType === 'igtv' 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg' 
                        : 'text-[var(--foreground)] hover:bg-white/50 dark:hover:bg-white/10'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    IGTV
                  </button>

                  <button
                    onClick={() => setSelectedType('carousel')}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all transform hover:scale-105 ${
                      selectedType === 'carousel' 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
                        : 'text-[var(--foreground)] hover:bg-white/50 dark:hover:bg-white/10'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                    </svg>
                    Carousel
                  </button>

                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto p-6">
          {/* Header - Dynamic Content */}
          <header className="py-6 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              <span className="gradient-text">{content.title}</span>
            </h1>
            <p className="text-base sm:text-lg text-[var(--placeholder)] max-w-2xl mx-auto">
              {content.description}
            </p>
            
            {/* Social Proof Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 py-6 mt-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-bold gradient-text">50M+</span>
                <span className="text-sm text-[var(--placeholder)]">Downloads</span>
              </div>
              <div className="hidden sm:block w-px h-8 bg-[var(--border)]"></div>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <span className="text-2xl sm:text-3xl font-bold gradient-text">4.9</span>
                  <svg className="w-6 h-6 text-yellow-500 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <span className="text-sm text-[var(--placeholder)]">Rating</span>
              </div>
              <div className="hidden sm:block w-px h-8 bg-[var(--border)]"></div>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-bold gradient-text">1M+</span>
                <span className="text-sm text-[var(--placeholder)]">Happy Users</span>
              </div>
            </div>
          </header>

          {/* Quick Instructions Banner */}
          <div className="mt-6 mb-4 bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-orange-900/20 rounded-2xl p-4 border-2 border-purple-200/50 dark:border-purple-800/50">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[var(--foreground)] mb-1 text-sm sm:text-base">
                  🎯 How to Download in 3 Easy Steps:
                </h3>
                <ol className="text-xs sm:text-sm text-[var(--placeholder)] space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-purple-600 dark:text-purple-400 flex-shrink-0">1.</span>
                    <span>Open Instagram, find your {selectedType}, click <strong>⋯</strong> (three dots) → <strong>Copy link</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-pink-600 dark:text-pink-400 flex-shrink-0">2.</span>
                    <span>Paste the link in the box below (or tap the 📋 paste button)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-orange-600 dark:text-orange-400 flex-shrink-0">3.</span>
                    <span>Click <strong>{content.buttonText}</strong> button and download in HD quality!</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Form */}
          <section className="mt-4">
            <form
              onSubmit={form.handleSubmit((v) => mutate(v))}
              className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-start"
            >
              <div className="flex-1">
                <label htmlFor="url-input" className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                  📎 Step 2: Paste Instagram URL Here
                </label>
                <div className="relative">
                  <input
                    id="url-input"
                    type="url"
                    placeholder={content.placeholder}
                    {...form.register("url")}
                    className="w-full rounded-lg border-2 px-4 py-3 pr-24 outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-[var(--surface)] text-[var(--foreground)] border-[var(--border)] text-base shadow-sm hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <button
                      type="button"
                      onClick={async () => {
                        const text = await navigator.clipboard.readText();
                        form.setValue("url", text);
                      }}
                      className="p-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 active:scale-95 transition-all touch-manipulation"
                      title="Paste"
                      aria-label="Paste URL from clipboard"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        form.reset();
                        reset();
                      }}
                      className="p-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 active:scale-95 transition-all touch-manipulation"
                      title="Clear"
                      aria-label="Clear input"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                {form.formState.errors.url && (
                  <p className="text-red-600 text-sm mt-1">
                    {form.formState.errors.url.message}
                  </p>
                )}
              </div>
              <div className="sm:pt-7">
                <button
                  type="submit"
                  className={`w-full sm:w-auto rounded-lg bg-gradient-to-r ${content.gradient} text-white px-8 py-3.5 disabled:opacity-60 hover:shadow-xl hover:scale-105 active:scale-95 transition-all font-bold text-base touch-manipulation whitespace-nowrap flex items-center justify-center gap-2 shadow-lg`}
                  disabled={isPending}
                  aria-label={content.buttonText}
                >
                  {isPending ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      {content.buttonText}
                    </>
                  )}
                </button>
              </div>
            </form>
            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-md">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-red-600 dark:text-red-400 text-sm font-medium">Error occurred</p>
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{String(error.message)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Example URLs Helper */}
            {!media.length && !isPending && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">
                      💡 Example URL Format:
                    </p>
                    <code className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 block break-all">
                      https://www.instagram.com/{selectedType === 'reels' ? 'reel' : selectedType === 'igtv' ? 'tv' : 'p'}/ABC123xyz/
                    </code>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* SEO-Rich Feature Section */}
          <section className="mt-12 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2 text-[var(--foreground)]">No Watermark Downloads</h3>
                <p className="text-sm text-[var(--placeholder)]">Download Instagram videos, photos, and reels without any watermarks. Get clean, original quality content.</p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-900/30 border border-pink-200 dark:border-pink-800 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2 text-[var(--foreground)]">Lightning Fast Speed</h3>
                <p className="text-sm text-[var(--placeholder)]">Download Instagram content in seconds. Our servers ensure the fastest download speeds possible.</p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/30 border border-orange-200 dark:border-orange-800 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2 text-[var(--foreground)]">HD Quality Guaranteed</h3>
                <p className="text-sm text-[var(--placeholder)]">Download videos and photos in full HD resolution. Original quality preserved, no compression.</p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2 text-[var(--foreground)]">100% Free & Safe</h3>
                <p className="text-sm text-[var(--placeholder)]">Completely free to use with no hidden charges. No registration required. Safe and secure downloads.</p>
              </div>
            </div>
          </section>

          {/* Media Preview - Keeping existing implementation */}
          <section className="mt-8">
            {!media.length ? (
              <p className="text-sm text-[var(--placeholder)] text-center py-8">
                No media yet. Enter a URL and click {content.buttonText}.
              </p>
            ) : (
              <div className="flex justify-center">
                {(() => {
                  const m = media[0];
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

          {/* How to Use Section */}
          <section className="mt-16 mb-12 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-3xl p-8 border border-purple-200/50 dark:border-purple-800/50">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
              <span className="gradient-text">How to Download Instagram Videos & Photos</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4 shadow-lg">
                  1
                </div>
                <h3 className="text-lg font-bold mb-2 text-[var(--foreground)]">Copy Instagram URL</h3>
                <p className="text-sm text-[var(--placeholder)]">
                  Open Instagram app or website, find the post/reel/story you want to download, and copy its link.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4 shadow-lg">
                  2
                </div>
                <h3 className="text-lg font-bold mb-2 text-[var(--foreground)]">Paste URL Above</h3>
                <p className="text-sm text-[var(--placeholder)]">
                  Paste the copied Instagram link into the input field above and click the download button.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4 shadow-lg">
                  3
                </div>
                <h3 className="text-lg font-bold mb-2 text-[var(--foreground)]">Download Content</h3>
                <p className="text-sm text-[var(--placeholder)]">
                  Preview the content and click the download button to save it to your device in HD quality.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mt-16 mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
              <span className="gradient-text">Frequently Asked Questions</span>
            </h2>
            
            <div className="max-w-3xl mx-auto space-y-4">
              <details className="group bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden hover:border-purple-400/50 transition-colors">
                <summary className="px-6 py-4 cursor-pointer font-semibold text-[var(--foreground)] flex items-center justify-between hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors">
                  <span>Is it free to download Instagram videos and photos?</span>
                  <svg className="w-5 h-5 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 py-4 text-sm text-[var(--placeholder)] border-t border-[var(--border)] bg-gradient-to-br from-purple-50/30 to-pink-50/30 dark:from-purple-900/5 dark:to-pink-900/5">
                  Yes! Our Instagram downloader is 100% free with no hidden charges. You can download unlimited videos, photos, reels, and stories without any registration.
                </div>
              </details>

              <details className="group bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden hover:border-purple-400/50 transition-colors">
                <summary className="px-6 py-4 cursor-pointer font-semibold text-[var(--foreground)] flex items-center justify-between hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors">
                  <span>Can I download Instagram Reels without watermark?</span>
                  <svg className="w-5 h-5 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 py-4 text-sm text-[var(--placeholder)] border-t border-[var(--border)] bg-gradient-to-br from-purple-50/30 to-pink-50/30 dark:from-purple-900/5 dark:to-pink-900/5">
                  Absolutely! Our tool removes watermarks and lets you download Instagram Reels in HD quality without any branding or logos.
                </div>
              </details>

              <details className="group bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden hover:border-purple-400/50 transition-colors">
                <summary className="px-6 py-4 cursor-pointer font-semibold text-[var(--foreground)] flex items-center justify-between hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors">
                  <span>What formats are supported for downloads?</span>
                  <svg className="w-5 h-5 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 py-4 text-sm text-[var(--placeholder)] border-t border-[var(--border)] bg-gradient-to-br from-purple-50/30 to-pink-50/30 dark:from-purple-900/5 dark:to-pink-900/5">
                  Videos are downloaded in MP4 format and photos in JPG format, ensuring maximum compatibility with all devices.
                </div>
              </details>

              <details className="group bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden hover:border-purple-400/50 transition-colors">
                <summary className="px-6 py-4 cursor-pointer font-semibold text-[var(--foreground)] flex items-center justify-between hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors">
                  <span>Do I need to install any software or app?</span>
                  <svg className="w-5 h-5 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 py-4 text-sm text-[var(--placeholder)] border-t border-[var(--border)] bg-gradient-to-br from-purple-50/30 to-pink-50/30 dark:from-purple-900/5 dark:to-pink-900/5">
                  No installation required! Our Instagram downloader works directly in your web browser on any device - desktop, mobile, or tablet.
                </div>
              </details>

              <details className="group bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden hover:border-purple-400/50 transition-colors">
                <summary className="px-6 py-4 cursor-pointer font-semibold text-[var(--foreground)] flex items-center justify-between hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors">
                  <span>Can I download private Instagram posts?</span>
                  <svg className="w-5 h-5 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 py-4 text-sm text-[var(--placeholder)] border-t border-[var(--border)] bg-gradient-to-br from-purple-50/30 to-pink-50/30 dark:from-purple-900/5 dark:to-pink-900/5">
                  No, our tool only works with public Instagram posts. Private accounts and content cannot be accessed for download.
                </div>
              </details>

              <details className="group bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden hover:border-purple-400/50 transition-colors">
                <summary className="px-6 py-4 cursor-pointer font-semibold text-[var(--foreground)] flex items-center justify-between hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors">
                  <span>Is it safe to use this Instagram downloader?</span>
                  <svg className="w-5 h-5 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 py-4 text-sm text-[var(--placeholder)] border-t border-[var(--border)] bg-gradient-to-br from-purple-50/30 to-pink-50/30 dark:from-purple-900/5 dark:to-pink-900/5">
                  Yes, it's completely safe. We don't store any downloaded content or personal information. Your privacy is our priority.
                </div>
              </details>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="mt-10 border-t border-neutral-200 dark:border-neutral-800 pt-4">
            <h2 className="font-medium mb-2">Disclaimer</h2>
            <p className="text-xs text-[var(--placeholder)]">
              Downloading media you do not own may violate Instagram's Terms of Service and copyright laws. This tool is for educational and personal use only. Respect creators' rights.
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
    </>
  );
}

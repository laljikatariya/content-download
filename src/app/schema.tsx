export default function SchemaMarkup() {
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Instagram Video Downloader",
    "applicationCategory": "MultimediaApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Free Instagram video downloader to save videos, photos, Reels, Stories & IGTV in HD quality without watermark. Fast, safe, and no registration required.",
    "operatingSystem": "Any",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "featureList": [
      "Download Instagram Videos in HD",
      "Download Instagram Photos in Original Quality",
      "Download Instagram Reels Without Watermark",
      "Download Instagram Stories Anonymously",
      "Download IGTV Videos",
      "Download Carousel Posts",
      "HD Quality Downloads",
      "No Watermark",
      "Free & Unlimited",
      "No Registration Required"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "15420",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is it free to download Instagram videos and photos?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Our Instagram downloader is 100% free with no hidden charges. You can download unlimited videos, photos, reels, and stories without any registration or subscription."
        }
      },
      {
        "@type": "Question",
        "name": "Can I download Instagram Reels without watermark?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely! Our tool removes watermarks and lets you download Instagram Reels in HD quality without any branding or logos."
        }
      },
      {
        "@type": "Question",
        "name": "What formats are supported for downloads?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Videos are downloaded in MP4 format and photos in JPG format, ensuring maximum compatibility with all devices including iPhone, Android, Windows, and Mac."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need to install any software or app?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No installation required! Our Instagram downloader works directly in your web browser on any device - desktop, mobile, or tablet. Just paste the URL and download."
        }
      },
      {
        "@type": "Question",
        "name": "Can I download private Instagram posts?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, our tool only works with public Instagram posts. Private accounts and content cannot be accessed for download due to Instagram's privacy policies."
        }
      },
      {
        "@type": "Question",
        "name": "Is it safe to use this Instagram downloader?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, it's completely safe and secure. We don't store any downloaded content or personal information. Your privacy is our top priority."
        }
      }
    ]
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Download Instagram Videos and Photos",
    "description": "Step-by-step guide to download Instagram videos, photos, and reels using our free downloader tool.",
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Copy Instagram URL",
        "text": "Open Instagram app or website, find the post/reel/story you want to download, and copy its link by clicking the three dots and selecting 'Copy Link'."
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Paste URL",
        "text": "Paste the copied Instagram link into the input field on our website and click the download button."
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Download Content",
        "text": "Preview the content and click the download button to save it to your device in HD quality without watermark."
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
    </>
  );
}

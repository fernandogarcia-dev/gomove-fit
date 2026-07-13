import { SITE_NAME, SITE_TAGLINE, SITE_URL, SITE_LOGO } from "./site";

type FaqItem = { question: string; answer: string };

export const organizationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: SITE_LOGO,
  description: SITE_TAGLINE,
  areaServed: {
    "@type": "Country",
    name: "United States",
  },
});

export const webApplicationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  url: SITE_URL,
  applicationCategory: "HealthApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Free personalized home workout plans using household items, apartment gym equipment, or no equipment at all. Built for Americans who want to exercise without a gym membership.",
  audience: {
    "@type": "Audience",
    audienceType: "People exercising at home in the United States",
  },
});

export const faqJsonLd = (faqs: FaqItem[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
});

export const breadcrumbJsonLd = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: `${SITE_URL}${item.path}`,
  })),
});

export const articleJsonLd = (params: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  datePublished?: string;
  dateModified?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: params.title,
  description: params.description,
  url: `${SITE_URL}${params.path}`,
  image: params.image ? [params.image] : undefined,
  datePublished: params.datePublished,
  dateModified: params.dateModified ?? params.datePublished,
  author: {
    "@type": "Organization",
    name: SITE_NAME,
  },
  publisher: {
    "@type": "Organization",
    name: SITE_NAME,
    logo: {
      "@type": "ImageObject",
      url: SITE_LOGO,
    },
  },
  keywords: params.keywords?.join(", "),
  inLanguage: "en-US",
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": `${SITE_URL}${params.path}`,
  },
});

export const blogListingJsonLd = (posts: { title: string; path: string; image: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "Blog",
  name: `${SITE_NAME} Home Workout Blog`,
  description:
    "Free home workout guides, apartment gym tips, pain relief exercises, and state-by-state fitness articles for Americans.",
  url: `${SITE_URL}/guides`,
  publisher: {
    "@type": "Organization",
    name: SITE_NAME,
    logo: SITE_LOGO,
  },
  blogPost: posts.slice(0, 12).map((post) => ({
    "@type": "BlogPosting",
    headline: post.title,
    url: `${SITE_URL}${post.path}`,
    image: post.image,
  })),
});

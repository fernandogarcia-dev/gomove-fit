import { SITE_NAME, SITE_URL, SITE_TAGLINE } from "./site";

type FaqItem = { question: string; answer: string };

export const organizationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logotipo.svg`,
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
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: params.title,
  description: params.description,
  url: `${SITE_URL}${params.path}`,
  author: {
    "@type": "Organization",
    name: SITE_NAME,
  },
  publisher: {
    "@type": "Organization",
    name: SITE_NAME,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logotipo.svg`,
    },
  },
  keywords: params.keywords?.join(", "),
  inLanguage: "en-US",
});

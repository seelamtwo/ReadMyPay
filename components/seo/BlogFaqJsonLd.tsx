import { BLOG_FAQ_SCHEMA_BY_SLUG } from "@/lib/blog-faq-schema";

type Props = { slug: string };

export function BlogFaqJsonLd({ slug }: Props) {
  const faqs = BLOG_FAQ_SCHEMA_BY_SLUG[slug];
  if (!faqs?.length) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

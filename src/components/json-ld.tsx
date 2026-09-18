type JsonLdValue = Record<string, unknown> | Array<unknown>;

export function JsonLd({ data }: { data: JsonLdValue }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

export function absoluteUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return new URL(path, base).toString();
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function campgroundItemListJsonLd(
  name: string,
  path: string,
  campgrounds: Array<{ name: string; slug: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url: absoluteUrl(path),
    numberOfItems: campgrounds.length,
    itemListElement: campgrounds.map((campground, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: campground.name,
      url: absoluteUrl(`/camping/${campground.slug}`),
    })),
  };
}

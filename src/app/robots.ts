import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // The current Netlify deployment is a development preview.
  // Switch this to allow indexing only when the production domain is ready.
  return {
    rules: [{ userAgent: "*", disallow: "/" }]
  };
}

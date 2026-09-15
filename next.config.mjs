/** @type {import('next').NextConfig} */
const remotePatterns = [
  { protocol: "https", hostname: "images.unsplash.com" }
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (supabaseUrl) {
  try {
    const { hostname } = new URL(supabaseUrl);
    remotePatterns.push({
      protocol: "https",
      hostname,
      pathname: "/storage/v1/object/public/**"
    });
  } catch {
    console.warn("NEXT_PUBLIC_SUPABASE_URL is not a valid URL; Supabase Storage images will not be allowlisted.");
  }
}

const nextConfig = {
  images: {
    remotePatterns
  }
};

export default nextConfig;

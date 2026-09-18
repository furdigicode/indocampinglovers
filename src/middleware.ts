import { NextRequest, NextResponse } from "next/server";

// Province slugs are seeded reference data and reserved from campground slugs.
// Rewriting keeps the public/canonical URL at /camping/{province-slug} while
// allowing the existing /camping/[slug] campground detail route to remain intact.
const PROVINCE_SLUGS=new Set([
  "aceh","sumatera-utara","sumatera-barat","riau","jambi","sumatera-selatan","bengkulu","lampung","kepulauan-bangka-belitung","kepulauan-riau",
  "dki-jakarta","jawa-barat","jawa-tengah","di-yogyakarta","jawa-timur","banten",
  "bali","nusa-tenggara-barat","nusa-tenggara-timur",
  "kalimantan-barat","kalimantan-tengah","kalimantan-selatan","kalimantan-timur","kalimantan-utara",
  "sulawesi-utara","sulawesi-tengah","sulawesi-selatan","sulawesi-tenggara","gorontalo","sulawesi-barat",
  "maluku","maluku-utara","papua","papua-barat","papua-selatan","papua-tengah","papua-pegunungan","papua-barat-daya",
]);

export function middleware(request:NextRequest){
  const match=request.nextUrl.pathname.match(/^\/camping\/([^/]+)\/?$/);
  if(!match||!PROVINCE_SLUGS.has(match[1]))return NextResponse.next();
  const url=request.nextUrl.clone();
  url.pathname=`/geography/province/${match[1]}`;
  return NextResponse.rewrite(url);
}

export const config={matcher:["/camping/:path*"]};

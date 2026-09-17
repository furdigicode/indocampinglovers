import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RegencyGeographicLanding } from "@/components/geographic-landing";
import { getRegencyLanding } from "@/lib/campgrounds/geography";

type Props={params:Promise<{slug:string;regency:string}>};
export const dynamic="force-dynamic";

export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {slug,regency}=await params;
  const geography=await getRegencyLanding(slug,regency);
  if(!geography)return{title:"Wilayah tidak ditemukan",robots:{index:false,follow:true}};
  const canonical=`/camping/${geography.province.slug}/${geography.slug}`;
  return{
    title:`Tempat Camping di ${geography.name}, ${geography.province.name} | IndoCampingLovers`,
    description:`Jelajahi ${geography.publishedCampgroundCount} campground di ${geography.name}, ${geography.province.name} dalam direktori IndoCampingLovers.`,
    alternates:{canonical},
    robots:geography.publishedCampgroundCount>0?{index:true,follow:true}:{index:false,follow:true},
  };
}

export default async function RegencyPage({params}:Props){
  const {slug,regency}=await params;
  const geography=await getRegencyLanding(slug,regency);
  if(!geography)notFound();
  return <RegencyGeographicLanding regency={geography}/>;
}

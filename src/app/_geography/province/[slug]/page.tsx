import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProvinceGeographicLanding } from "@/components/geographic-landing";
import { getProvinceLanding } from "@/lib/campgrounds/geography";

type Props={params:Promise<{slug:string}>};
export const dynamic="force-dynamic";

export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {slug}=await params;
  const province=await getProvinceLanding(slug);
  if(!province)return{title:"Provinsi tidak ditemukan",robots:{index:false,follow:true}};
  return{
    title:`Tempat Camping di ${province.name} | IndoCampingLovers`,
    description:`Jelajahi ${province.publishedCampgroundCount} campground di ${province.name} dalam direktori IndoCampingLovers.`,
    alternates:{canonical:`/camping/${province.slug}`},
    robots:province.publishedCampgroundCount>0?{index:true,follow:true}:{index:false,follow:true},
  };
}

export default async function ProvincePage({params}:Props){
  const {slug}=await params;
  const province=await getProvinceLanding(slug);
  if(!province)notFound();
  return <ProvinceGeographicLanding province={province}/>;
}

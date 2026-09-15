import { SiteHeader } from "@/components/site-header";

export default function CampingLoading() {
  return (
    <main>
      <SiteHeader />
      <div className="container-icl animate-pulse py-10 md:py-16">
        <div className="h-4 w-24 rounded bg-black/10" />
        <div className="mt-8 h-10 max-w-xl rounded bg-black/10" />
        <div className="mt-4 h-5 max-w-2xl rounded bg-black/5" />
        <div className="mt-10 h-14 max-w-2xl rounded-2xl bg-black/5" />
        <div className="mt-6 h-24 rounded-3xl bg-black/5" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-3xl border border-black/5 bg-white">
              <div className="aspect-[4/3] bg-black/10" />
              <div className="space-y-3 p-5"><div className="h-4 w-1/2 rounded bg-black/10"/><div className="h-6 w-3/4 rounded bg-black/10"/><div className="h-12 rounded bg-black/5"/></div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

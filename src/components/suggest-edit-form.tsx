"use client";
import { FormEvent, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { CampgroundUpdateType } from "@/lib/submissions/campground-update";

const categories:{value:CampgroundUpdateType;label:string;help:string}[]=[
 {value:"general",label:"Informasi umum",help:"Nama, deskripsi, kapasitas, atau informasi umum lainnya."},
 {value:"price",label:"Harga",help:"Harga camping, tiket masuk, parkir, atau biaya lainnya."},
 {value:"facility",label:"Fasilitas",help:"Toilet, listrik, air, musala, dan fasilitas lain."},
 {value:"access",label:"Akses",help:"Kondisi jalan dan kendaraan yang dapat mencapai lokasi."},
 {value:"contact",label:"Kontak",help:"WhatsApp, telepon, Instagram, atau website pengelola."},
 {value:"location",label:"Lokasi",help:"Alamat, area, atau koreksi posisi lokasi."},
 {value:"operating_status",label:"Status operasional",help:"Tempat tutup, buka kembali, atau perubahan operasional."},
 {value:"photo",label:"Foto",help:"Usulkan koreksi atau informasi terkait foto. Upload foto menyusul setelah moderasi."},
];
export function SuggestEditForm({campgroundId,campgroundName}:{campgroundId:string;campgroundName:string}){
 const [type,setType]=useState<CampgroundUpdateType>("general"); const [change,setChange]=useState(""); const [name,setName]=useState(""); const [contact,setContact]=useState(""); const [consent,setConsent]=useState(false); const [busy,setBusy]=useState(false); const [error,setError]=useState(""); const [reference,setReference]=useState("");
 async function submit(e:FormEvent){e.preventDefault();setError("");if(change.trim().length<10||!name.trim()||!contact.trim()||!consent){setError("Lengkapi usulan, data pengirim, dan persetujuan.");return}setBusy(true);
  const key=crypto.randomUUID().replaceAll("-","_");
  try{const res=await fetch("/api/submissions/campground-updates",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({campgroundId,updateType:type,proposedChange:change,submitterName:name,submitterContact:contact,consent,idempotencyKey:key})});const body=await res.json();if(!res.ok)throw new Error(body.error||"Usulan belum dapat dikirim.");setReference(body.referenceCode)}
  catch(err){setError(err instanceof Error?err.message:"Usulan belum dapat dikirim.")}finally{setBusy(false)}
 }
 if(reference)return <div className="icl-card p-6 md:p-8"><CheckCircle2 className="text-forest-700" size={34}/><h2 className="mt-4 text-2xl font-extrabold">Usulan sudah diterima</h2><p className="mt-3 leading-7 text-black/60">Terima kasih sudah membantu memperbarui informasi {campgroundName}. Tim ICL akan memeriksa usulan sebelum data direktori berubah.</p><div className="mt-5 rounded-2xl bg-sand p-4"><p className="text-xs font-bold uppercase text-black/45">Kode referensi</p><p className="mt-1 font-extrabold">{reference}</p></div></div>;
 return <form onSubmit={submit} className="icl-card space-y-7 p-6 md:p-8">
  <div><label className="text-sm font-extrabold">Apa yang perlu diperbarui?</label><div className="mt-3 grid gap-3 sm:grid-cols-2">{categories.map(c=><button type="button" key={c.value} onClick={()=>setType(c.value)} className={`icl-focus rounded-2xl border p-4 text-left ${type===c.value?"border-forest-700 bg-[#eef3e7]":"border-black/10 bg-white"}`}><span className="block text-sm font-extrabold">{c.label}</span><span className="mt-1 block text-xs leading-5 text-black/50">{c.help}</span></button>)}</div></div>
  <div><label htmlFor="change" className="text-sm font-extrabold">Jelaskan perubahan yang benar</label><textarea id="change" value={change} onChange={e=>setChange(e.target.value)} maxLength={4000} rows={6} placeholder="Contoh: Harga camping sekarang Rp35.000 per orang. Informasi ini saya dapat dari pengelola pada September 2026." className="mt-2 w-full rounded-2xl border border-black/10 p-4 outline-none focus:border-forest-700"/><p className="mt-1 text-xs text-black/40">{change.length}/4000</p></div>
  <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-extrabold">Nama pengirim<input value={name} onChange={e=>setName(e.target.value)} maxLength={120} className="mt-2 w-full rounded-xl border border-black/10 p-3 font-normal outline-none focus:border-forest-700" placeholder="Nama kamu"/></label><label className="text-sm font-extrabold">Kontak pengirim<input value={contact} onChange={e=>setContact(e.target.value)} maxLength={200} className="mt-2 w-full rounded-xl border border-black/10 p-3 font-normal outline-none focus:border-forest-700" placeholder="WhatsApp atau email"/></label></div>
  <label className="flex items-start gap-3 text-sm leading-6 text-black/60"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} className="mt-1"/>Saya menyatakan informasi ini diberikan dengan itikad baik dan boleh diperiksa oleh tim IndoCampingLovers.</label>
  {error&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
  <button disabled={busy} className="icl-button-primary icl-focus w-full px-6 py-3 disabled:opacity-60">{busy?"Mengirim usulan...":"Kirim usulan perubahan"}</button>
 </form>
}

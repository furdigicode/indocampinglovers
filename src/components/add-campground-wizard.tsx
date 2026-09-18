"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ImagePlus, Trash2 } from "lucide-react";
import type { ContributionReferenceData } from "@/lib/submissions/reference-data";

const steps = ["Tempat", "Informasi", "Foto", "Pengirim"];
const accessOptions = ["Motor", "Mobil", "Minibus", "Bus"];

function newKey() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().replace(/-/g, "")
    : `icl${Date.now()}submission`;
}

export function AddCampgroundWizard({ reference }: { reference: ContributionReferenceData }) {
  const [step,setStep]=useState(0);
  const [form,setForm]=useState({name:"",provinceId:"",regencyId:"",address:"",typeIds:[] as string[],facilityIds:[] as string[],access:[] as string[],price:"",priceUnit:"per orang",notes:"",submitterName:"",submitterContact:"",consent:false});
  const [idempotencyKey]=useState(newKey);
  const [error,setError]=useState("");
  const [sending,setSending]=useState(false);
  const [referenceCode,setReferenceCode]=useState("");
  const [photos,setPhotos]=useState<Array<{file:File;url:string}>>([]);
  const [photoError,setPhotoError]=useState("");
  useEffect(()=>()=>photos.forEach(x=>URL.revokeObjectURL(x.url)),[photos]);
  const regencies=useMemo(()=>reference.regencies.filter(x=>x.provinceId===form.provinceId),[reference.regencies,form.provinceId]);
  const set=(key:string,value:unknown)=>setForm(prev=>({...prev,[key]:value}));
  const toggle=(key:"typeIds"|"facilityIds"|"access",value:string)=>setForm(prev=>({...prev,[key]:prev[key].includes(value)?prev[key].filter(x=>x!==value):[...prev[key],value]}));

  function validateCurrent(){
    if(step===0 && (form.name.trim().length<3||!form.provinceId||!form.regencyId||form.address.trim().length<5)) return "Lengkapi nama, provinsi, kabupaten/kota, dan alamat.";
    if(step===3 && (form.submitterName.trim().length<2||form.submitterContact.trim().length<3||!form.consent)) return "Lengkapi data pengirim dan persetujuan.";
    return "";
  }
  function next(){const message=validateCurrent();if(message){setError(message);return}setError("");setStep(x=>Math.min(3,x+1));}
  function addPhotos(e:ChangeEvent<HTMLInputElement>){const incoming=Array.from(e.target.files??[]);e.target.value="";setPhotoError("");const accepted:Array<{file:File;url:string}>=[];for(const file of incoming){if(!["image/jpeg","image/png","image/webp"].includes(file.type)){setPhotoError("Gunakan foto JPEG, PNG, atau WebP.");continue}if(file.size>8*1024*1024){setPhotoError("Setiap foto maksimal 8 MB.");continue}accepted.push({file,url:URL.createObjectURL(file)})}setPhotos(prev=>{const room=Math.max(0,5-prev.length);if(accepted.length>room)setPhotoError("Maksimal 5 foto per submission.");accepted.slice(room).forEach(x=>URL.revokeObjectURL(x.url));return [...prev,...accepted.slice(0,room)]})}
  function removePhoto(index:number){setPhotos(prev=>{const target=prev[index];if(target)URL.revokeObjectURL(target.url);return prev.filter((_,i)=>i!==index)})}
  async function uploadPhotos(code:string){for(const photo of photos){const fd=new FormData();fd.append("referenceCode",code);fd.append("file",photo.file);const response=await fetch("/api/submissions/campgrounds/photos",{method:"POST",body:fd});const data=await response.json();if(!response.ok)throw new Error(data.error||`Foto ${photo.file.name} gagal diunggah.`)}}
  async function submit(e:FormEvent){e.preventDefault();const message=validateCurrent();if(message){setError(message);return}setSending(true);setError("");
    try{
      const response=await fetch("/api/submissions/campgrounds",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({...form,price:form.price?{amountIdr:Number(form.price),unit:form.priceUnit}:undefined,idempotencyKey})});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||"Submission gagal dikirim.");
      if(photos.length) await uploadPhotos(data.referenceCode);
      setReferenceCode(data.referenceCode);
    }catch(err){setError(err instanceof Error?err.message:"Submission gagal dikirim.");}finally{setSending(false)}
  }
  if(referenceCode)return <div className="rounded-3xl border border-black/5 bg-white p-8 text-center shadow-sm md:p-12"><p className="icl-eyebrow">Kontribusi diterima</p><h1 className="mt-3 text-3xl font-extrabold">Terima kasih!</h1><p className="mx-auto mt-4 max-w-lg text-black/60">Usulan tempat camping sudah kami terima dan belum langsung dipublikasikan. Tim ICL akan memeriksanya terlebih dahulu.</p><div className="mx-auto mt-7 max-w-sm rounded-2xl bg-sand p-5"><p className="text-xs font-bold uppercase tracking-wider text-black/45">Kode submission</p><p className="mt-2 text-2xl font-extrabold text-forest-900">{referenceCode}</p><p className="mt-2 text-sm text-black/55">Status: Menunggu pemeriksaan</p></div><Link href="/camping" className="icl-button-primary icl-focus mt-7 inline-flex min-h-12 items-center justify-center px-6">Jelajahi Camping</Link></div>;

  return <form onSubmit={submit} className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_12px_40px_rgba(21,37,26,.07)] md:p-10">
    <div className="flex gap-2" aria-label={`Langkah ${step+1} dari 4`}>{steps.map((label,i)=><div key={label} className="min-w-0 flex-1"><div className={`h-1.5 rounded-full ${i<=step?"bg-forest-800":"bg-black/10"}`}/><p className={`mt-2 truncate text-xs font-bold ${i===step?"text-forest-800":"text-black/40"}`}>{i+1}. {label}</p></div>)}</div>
    <div className="mt-9">
      {step===0&&<div className="space-y-5"><div><p className="icl-eyebrow">Langkah 1</p><h1 className="mt-2 text-3xl font-extrabold">Tempat campingnya di mana?</h1><p className="mt-2 text-sm text-black/55">Mulai dari informasi dasar. Semua field di langkah ini wajib.</p></div>
        <Field label="Nama tempat camping"><input value={form.name} onChange={e=>set("name",e.target.value)} className="icl-form-control" placeholder="Contoh: Camping Ground ..." /></Field>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Provinsi"><select value={form.provinceId} onChange={e=>{setForm(p=>({...p,provinceId:e.target.value,regencyId:""}))}} className="icl-form-control"><option value="">Pilih provinsi</option>{reference.provinces.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field><Field label="Kabupaten / Kota"><select value={form.regencyId} disabled={!form.provinceId} onChange={e=>set("regencyId",e.target.value)} className="icl-form-control"><option value="">Pilih kabupaten/kota</option>{regencies.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field></div>
        <Field label="Alamat / petunjuk lokasi"><textarea value={form.address} onChange={e=>set("address",e.target.value)} className="icl-form-control" placeholder="Desa, kecamatan, jalan atau petunjuk menuju lokasi" /></Field></div>}
      {step===1&&<div className="space-y-6"><div><p className="icl-eyebrow">Langkah 2</p><h2 className="mt-2 text-3xl font-extrabold">Apa yang kamu tahu?</h2><p className="mt-2 text-sm text-black/55">Bagian ini boleh dilewati. Isi informasi yang kamu yakin benar.</p></div>
        <ChoiceGroup label="Tipe camping" options={reference.types} selected={form.typeIds} toggle={v=>toggle("typeIds",v)}/><ChoiceGroup label="Fasilitas" options={reference.facilities} selected={form.facilityIds} toggle={v=>toggle("facilityIds",v)}/>
        <ChoiceGroup label="Akses kendaraan" options={accessOptions.map(x=>({id:x,name:x}))} selected={form.access} toggle={v=>toggle("access",v)}/>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Harga mulai (Rp) — opsional"><input type="number" min="0" value={form.price} onChange={e=>set("price",e.target.value)} className="icl-form-control" placeholder="25000"/></Field><Field label="Satuan harga"><input value={form.priceUnit} onChange={e=>set("priceUnit",e.target.value)} className="icl-form-control"/></Field></div>
        <Field label="Catatan tambahan — opsional"><textarea value={form.notes} onChange={e=>set("notes",e.target.value)} className="icl-form-control" placeholder="Jam buka, kondisi jalan, aturan lokasi, kontak, atau informasi lain"/></Field></div>}
      {step===2&&<div><p className="icl-eyebrow">Langkah 3</p><h2 className="mt-2 text-3xl font-extrabold">Tambahkan foto lokasi</h2><p className="mt-2 text-sm leading-6 text-black/55">Opsional. Maksimal 5 foto, masing-masing 8 MB. JPEG, PNG, atau WebP. Foto akan diperiksa sebelum dapat tampil publik.</p><label className="mt-6 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-forest-800/25 bg-sand/60 p-6 text-center transition hover:border-forest-800/50 hover:bg-sand"><ImagePlus size={28} className="text-forest-800"/><span className="mt-3 font-extrabold text-forest-900">Pilih foto</span><span className="mt-1 text-xs text-black/50">{photos.length}/5 foto dipilih</span><input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addPhotos} disabled={photos.length>=5}/></label>{photoError&&<p className="mt-3 text-sm font-semibold text-red-700">{photoError}</p>}{photos.length>0&&<div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{photos.map((photo,i)=><div key={`${photo.file.name}-${i}`} className="relative overflow-hidden rounded-2xl border border-black/10 bg-white"><img src={photo.url} alt={`Preview ${i+1}`} className="aspect-[4/3] w-full object-cover"/><button type="button" onClick={()=>removePhoto(i)} aria-label={`Hapus ${photo.file.name}`} className="icl-focus absolute right-2 top-2 grid size-9 place-items-center rounded-full bg-white/95 text-red-700 shadow"><Trash2 size={16}/></button><p className="truncate px-3 py-2 text-xs font-semibold">{photo.file.name}</p></div>)}</div>}</div>}
      {step===3&&<div className="space-y-5"><div><p className="icl-eyebrow">Langkah 4</p><h2 className="mt-2 text-3xl font-extrabold">Terakhir, tentang kamu</h2><p className="mt-2 text-sm text-black/55">Kami memakai kontak ini hanya bila perlu mengklarifikasi kontribusi.</p></div>
        <Field label="Nama"><input value={form.submitterName} onChange={e=>set("submitterName",e.target.value)} className="icl-form-control" /></Field><Field label="Email / WhatsApp"><input value={form.submitterContact} onChange={e=>set("submitterContact",e.target.value)} className="icl-form-control" /></Field>
        <label className="flex gap-3 rounded-2xl border border-black/10 p-4 text-sm leading-6"><input type="checkbox" checked={form.consent} onChange={e=>set("consent",e.target.checked)} className="mt-1"/><span>Saya mengizinkan IndoCampingLovers menggunakan informasi yang saya kirim untuk memelihara direktori camping.</span></label></div>}
    </div>
    {error&&<p role="alert" className="mt-6 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
    <div className="icl-form-actions mt-9 flex items-center justify-between gap-3 border-t border-black/10 pt-6">{step>0?<button type="button" onClick={()=>{setError("");setStep(x=>x-1)}} className="icl-button-secondary">← Kembali</button>:<span/>}{step<3?<button type="button" onClick={next} className="icl-button-primary">Lanjutkan →</button>:<button disabled={sending} className="icl-button-primary disabled:opacity-50">{sending?(photos.length?"Mengirim & mengunggah foto...":"Mengirim..."):"Kirim usulan"}</button>}</div>
  </form>;
}
function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="block"><span className="mb-2 block text-sm font-extrabold text-forest-900">{label}</span>{children}</label>}
function ChoiceGroup({label,options,selected,toggle}:{label:string;options:Array<{id:string;name:string}>;selected:string[];toggle:(id:string)=>void}){return <fieldset><legend className="text-sm font-bold">{label}</legend><div className="mt-3 flex flex-wrap gap-2">{options.map(x=><label key={x.id} className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold ${selected.includes(x.id)?"border-forest-800 bg-forest-800 text-white":"border-black/10"}`}><input type="checkbox" className="sr-only" checked={selected.includes(x.id)} onChange={()=>toggle(x.id)}/>{x.name}</label>)}</div></fieldset>}

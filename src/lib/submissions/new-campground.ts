export type NewCampgroundSubmissionInput = {
  name: string;
  provinceId: string;
  regencyId: string;
  address: string;
  latitude?: number;
  longitude?: number;
  typeIds?: string[];
  facilityIds?: string[];
  access?: string[];
  price?: { amountIdr: number; unit?: string };
  contacts?: Array<{ type: "whatsapp" | "phone" | "instagram" | "website" | "email"; value: string }>;
  notes?: string;
  submitterName: string;
  submitterContact: string;
  consent: boolean;
  idempotencyKey: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const IDEMPOTENCY = /^[A-Za-z0-9_-]{16,100}$/;

function cleanText(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, max) : "";
}

export function parseNewCampgroundSubmission(value: unknown): NewCampgroundSubmissionInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("INVALID_PAYLOAD");
  const v = value as Record<string, unknown>;
  const name = cleanText(v.name, 160);
  const address = cleanText(v.address, 500);
  const submitterName = cleanText(v.submitterName, 120);
  const submitterContact = cleanText(v.submitterContact, 200);
  const provinceId = cleanText(v.provinceId, 36);
  const regencyId = cleanText(v.regencyId, 36);
  const idempotencyKey = cleanText(v.idempotencyKey, 100);
  if (name.length < 3 || address.length < 5 || submitterName.length < 2 || submitterContact.length < 3) throw new Error("INVALID_FIELDS");
  if (!UUID.test(provinceId) || !UUID.test(regencyId) || !IDEMPOTENCY.test(idempotencyKey)) throw new Error("INVALID_FIELDS");
  if (v.consent !== true) throw new Error("CONSENT_REQUIRED");

  const latitude = typeof v.latitude === "number" && v.latitude >= -90 && v.latitude <= 90 ? v.latitude : undefined;
  const longitude = typeof v.longitude === "number" && v.longitude >= -180 && v.longitude <= 180 ? v.longitude : undefined;
  if ((latitude === undefined) !== (longitude === undefined)) throw new Error("INVALID_COORDINATES");

  return {
    name, provinceId, regencyId, address, latitude, longitude,
    typeIds: Array.isArray(v.typeIds) ? v.typeIds.filter((x): x is string => typeof x === "string" && UUID.test(x)).slice(0, 10) : [],
    facilityIds: Array.isArray(v.facilityIds) ? v.facilityIds.filter((x): x is string => typeof x === "string" && UUID.test(x)).slice(0, 30) : [],
    access: Array.isArray(v.access) ? v.access.map(x => cleanText(x, 60)).filter(Boolean).slice(0, 10) : [],
    price: v.price && typeof v.price === "object" && !Array.isArray(v.price) && typeof (v.price as Record<string, unknown>).amountIdr === "number"
      ? { amountIdr: Math.max(0, Math.round((v.price as Record<string, number>).amountIdr)), unit: cleanText((v.price as Record<string, unknown>).unit, 80) || undefined } : undefined,
    contacts: Array.isArray(v.contacts) ? v.contacts.flatMap((x) => {
      if (!x || typeof x !== "object") return [];
      const c=x as Record<string,unknown>; const type=cleanText(c.type,20); const val=cleanText(c.value,300);
      return ["whatsapp","phone","instagram","website","email"].includes(type) && val ? [{type:type as "whatsapp"|"phone"|"instagram"|"website"|"email",value:val}] : [];
    }).slice(0,10) : [],
    notes: cleanText(v.notes, 2000) || undefined,
    submitterName, submitterContact, consent: true, idempotencyKey,
  };
}

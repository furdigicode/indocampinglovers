export type VerificationStatus = "verified" | "community_updated" | "needs_update";

export type Campground = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  province: string;
  regency: string;
  district?: string;
  address: string;
  latitude: number;
  longitude: number;
  elevationM?: number;
  types: string[];
  priceFrom: number;
  priceUnit: string;
  facilities: string[];
  access: string[];
  suitableFor: string[];
  image: string;
  verificationStatus: VerificationStatus;
  lastVerifiedAt: string;
  featured?: boolean;
};

export type CampgroundPriceType = "entrance" | "camping" | "parking" | "tent_rental" | "equipment_rental" | "firewood" | "other";
export type CampgroundContactType = "whatsapp" | "phone" | "instagram" | "website" | "email";

export type CampgroundPriceDetail = { id:string; type:CampgroundPriceType; label:string; amountIdr:number; unit?:string; note?:string; sortOrder:number };
export type CampgroundContactDetail = { id:string; type:CampgroundContactType; label?:string; value:string; isPrimary:boolean };
export type CampgroundPhotoDetail = { id:string; url:string; altText?:string; caption?:string; creditName?:string; sourceUrl?:string; isCover:boolean; sortOrder:number };
export type CampgroundFacilityDetail = { name:string; note?:string };
export type CampgroundAccessDetail = { vehicleType:string; note?:string };
export type CampgroundVerificationDetail = { status:VerificationStatus; verifiedAt?:string; sourceType?:string; sourceNote?:string };

export type CampgroundDetail = Campground & {
  description?: string;
  capacityPeople?: number;
  accessDescription?: string;
  checkInInfo?: string;
  goodToKnow?: string;
  prices: CampgroundPriceDetail[];
  contacts: CampgroundContactDetail[];
  photos: CampgroundPhotoDetail[];
  facilityDetails: CampgroundFacilityDetail[];
  accessDetails: CampgroundAccessDetail[];
  verification?: CampgroundVerificationDetail;
};

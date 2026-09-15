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

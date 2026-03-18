export type WebsiteStatus = "available" | "reserved" | "sold";

export type PlacementType = "guest-post" | "niche-edit" | "homepage" | "link-insert";

export type LinkAttribute = "dofollow" | "nofollow" | "sponsored";

export type WebsiteRecord = {
  id: string;
  websiteName: string;
  url: string;
  ownerName: string;
  email: string;
  phone: string;
  generalPrice: number;
  sensitivePrice: number;
  da: number;
  dr: number;
  backlinks: number;
  trustFlow: number;
  language: string;
  region: string;
  niche: string;
  monthlyTraffic: number;
  turnaroundDays: number;
  placementType: PlacementType;
  linkAttribute: LinkAttribute;
  status: WebsiteStatus;
  verified: boolean;
  note: string;
  lastUpdated: string;
};

export type WebsiteRecordInput = Omit<WebsiteRecord, "id" | "lastUpdated">;

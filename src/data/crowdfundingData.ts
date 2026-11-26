export interface CrowdfundingMediaImage {
  src: string;
  alt: string;
}

export interface CrowdfundingMediaVideo {
  src: string;
  caption?: string;
}

export interface CrowdfundingCampaign {
  id: string;
  personName: string;
  title: string;
  story: string;
  location?: string;
  targetAmount: number;
  raisedAmount: number;
  status: "active" | "completed" | "paused";
  upiId?: string;
  contactPhone?: string;
  images: CrowdfundingMediaImage[];
  video?: CrowdfundingMediaVideo;
  createdAt: string;
}

export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

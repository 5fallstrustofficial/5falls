export interface TeamSocials {
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  website?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  roleTitle?: string;
  description: string;
  imageUrl?: string;
  socials: TeamSocials;
  sortOrder: number;
}

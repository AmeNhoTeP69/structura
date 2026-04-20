export interface PublicService {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  tags: string[];
  categorySlugs: string[];
}

export interface PublicServiceCategory {
  id: string;
  name: string;
  slug: string;
}

export interface PublicHomeContent {
  heroTitle: string;
  heroHighlight: string;
  heroDescription: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  trustTitle: string;
  partners: string[];
}

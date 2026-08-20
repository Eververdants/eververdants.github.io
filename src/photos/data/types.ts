export interface Work {
  slug: string;
  title: string;
  titleZh?: string;
  date: string;
  category: string;
  location?: string;
  locationZh?: string;
  description?: string;
  descriptionZh?: string;
  cover: string;
  gallery?: string[];
  camera?: string;
  lens?: string;
  focal?: string;
  aperture?: string;
  shutter?: string;
  iso?: string;
  featured?: boolean;
  order?: number;
}

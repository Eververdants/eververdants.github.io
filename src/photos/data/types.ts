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
  /* Intrinsic pixel dimensions, probed from the cover WebP at build time so
     <img> can declare width/height and the browser reserves the box before
     the bytes arrive. Absent when the file could not be parsed. */
  coverW?: number;
  coverH?: number;
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

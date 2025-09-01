export type ListingPack = {
  title: { en: string; hi?: string };
  description: { en: string; hi?: string };
  tags: string[];
  price: { min: number; max: number; rationale: string };
  assets: { cleanedImages: string[]; poster?: string; catalogCard?: string };
  social: { caption: { en: string; hi?: string } };
  meta: { artisanName: string };
};

export type GenerateListingInput = {
  images: File[];
  voiceNote: File;
  languages: string[];
  photoTheme?: string;
};

export type DesignVariationInput = { baseImage: File; prompt: string };
export type DesignVariationResult = { variations: string[] };
export type GenerateImageInput = { prompt: string; model?: string };
export type GenerateImageResult = { images: string[]; note?: string };

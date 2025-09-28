/** Personalization sliders scaffold. */
export interface PersonalizationPrefs { userId: string; priceSensitivity: number; uniqueness: number; speed: number; }
export function defaultPrefs(userId: string): PersonalizationPrefs { return { userId, priceSensitivity: 0.5, uniqueness: 0.5, speed: 0.5 }; }

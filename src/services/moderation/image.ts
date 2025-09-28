/** Image / design plagiarism moderation scaffold. */
export interface ImageModerationResult { decision: 'allow' | 'review' | 'block'; reasons: string[]; similarity?: number; }

export async function moderateImage(_file: File | Blob, _opts?: { perceptual?: boolean }): Promise<ImageModerationResult> {
  // TODO: perceptual hashing (pHash), embedding similarity, brand/IP classifier.
  return { decision: 'review', reasons: ['unimplemented'], similarity: 0 };
}

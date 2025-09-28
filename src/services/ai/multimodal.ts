/**
 * Multimodal ingestion scaffold.
 * Future: accept image/sketch uploads, run vision tagging, material inference, style classification.
 */
export interface MultimodalIngestInput { fileName: string; mime: string; bytes?: ArrayBuffer; url?: string; }
export interface InferredAttributes {
  tags: string[];
  materials: string[];
  dominantColors: string[];
  estimatedCategory?: string;
  confidence: number;
}

export async function inferFromImage(_input: MultimodalIngestInput): Promise<InferredAttributes> {
  // TODO: integrate vision model (e.g., Gemini Vision / AWS Rekognition / custom CLIP).
  return { tags: [], materials: [], dominantColors: [], estimatedCategory: undefined, confidence: 0 };
}

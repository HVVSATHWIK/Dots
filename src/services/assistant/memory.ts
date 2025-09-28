import { generateEmbedding } from '@/lib/embeddings';

export interface Interaction { role: 'user' | 'assistant'; content: string; ts: number }
export interface MemorySummary { userId: string; summary: string; updatedAt: number; interactions: number; }

// Simple reducer: keep last N interactions and compress by sentence selection and truncation.
export function summarizeInteractions(userId: string, history: Interaction[], maxLen = 800): MemorySummary {
  const last = history.slice(-20); // window
  const text = last.map(i => `${i.role === 'user' ? 'U' : 'A'}:${i.content}`).join('\n');
  // Naive compression: pick first sentence of each user message + key tokens.
  const userSentences = last.filter(i => i.role === 'user').map(i => (i.content.split(/[.!?]/)[0]||'').trim());
  let combined = userSentences.join('. ');
  if (combined.length > maxLen) combined = combined.slice(0, maxLen - 3) + '...';
  return { userId, summary: combined, updatedAt: Date.now(), interactions: last.length };
}

// Stub personalization embedding (future use for retrieval augmentation)
export async function embedMemory(summary: MemorySummary) {
  try { await generateEmbedding(summary.summary); } catch {}
}
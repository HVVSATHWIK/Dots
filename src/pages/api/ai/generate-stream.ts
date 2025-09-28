import type { APIRoute } from 'astro';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { publish } from '@/lib/event-bus';
import { incr, METRIC } from '@/lib/metrics';
import { fallbackGenerate } from '@/services/assistant/fallback';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    publish('generation.requested', { kind: 'assistant-stream' });
    incr(METRIC.ASSISTANT_RUN);
    const startMs = Date.now();
    const { prompt } = await request.json();
    if (!prompt || typeof prompt !== 'string') {
      return new Response('Invalid prompt', { status: 400 });
    }

    const apiKey = (import.meta.env.GEMINI_API_KEY as string | undefined) ?? (process.env.GEMINI_API_KEY as string | undefined);

    // DOTS-specific system prompt for contextual responses
    const systemPrompt = `
You are the DOTS Assistant, a helpful AI companion for the DOTS platform that connects artisans with buyers.

DOTS is a platform where:
- Artisans can sell handmade products
- Buyers can discover unique, authentic crafts
- Features include AI-powered listing generation, design variations, and digital certificates

Be friendly, concise, and helpful. Focus on:
- Helping artisans with product listings, titles, descriptions, pricing, and photography
- Providing advice on handmade crafts, materials, and techniques
- Answering questions about the DOTS platform and its features
- Suggesting tags, categories, and marketing ideas for artisan products

Keep responses practical, encouraging, and relevant to the artisan community.
`;

    const encoder = new TextEncoder();

    if (!apiKey) {
      // Dynamic heuristic fallback streamed token by token
      const fallbackReply = fallbackGenerate(prompt);
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          async function push() {
            const tokens = fallbackReply.split(/(\s+)/); // keep spaces
            for (const token of tokens) {
              if (!token) continue;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
              await sleep(30 + Math.random() * 60);
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, fallback: true })}\n\n`));
            const elapsed = Date.now() - startMs;
            incr(METRIC.ASSISTANT_STREAM_LAT_TOTAL_MS, elapsed);
            incr(METRIC.ASSISTANT_STREAM_LAT_SAMPLES);
            controller.close();
          }
          void push();
        }
      });

      return new Response(stream, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Use real Gemini API with streaming
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = (import.meta.env.GEMINI_MODEL as string | undefined) || (process.env.GEMINI_MODEL as string | undefined) || 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        async function push() {
          try {
            const result = await model.generateContentStream({
              contents: [
                { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser: ${prompt}\n\nAssistant:` }] },
              ],
            });

            for await (const chunk of result.stream) {
              const chunkText = chunk.text();
              if (chunkText) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: chunkText })}\n\n`));
              }
            }

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
            const elapsed = Date.now() - startMs;
            incr(METRIC.ASSISTANT_STREAM_LAT_TOTAL_MS, elapsed);
            incr(METRIC.ASSISTANT_STREAM_LAT_SAMPLES);
            controller.close();
          } catch (error) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Sorry, I encountered an error. Please try again.' })}\n\n`));
            controller.close();
          }
        }
        void push();
      }
    });

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (e: any) {
    return new Response(`Streaming error: ${e?.message || 'unknown'}`, { status: 500 });
  }
};

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }
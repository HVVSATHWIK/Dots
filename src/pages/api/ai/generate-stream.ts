import type { APIRoute } from 'astro';

// Lightweight SSE streaming endpoint. If GEMINI_API_KEY is present, you could integrate real SDK streaming.
// For now, we simulate token streaming for development safety.
export const POST: APIRoute = async ({ request }) => {
  try {
    const { prompt } = await request.json();
    if (!prompt || typeof prompt !== 'string') {
      return new Response('Invalid prompt', { status: 400 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        async function push() {
          const fakeReply = generateFakeResponse(prompt);
          for (const token of fakeReply) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
            await sleep(40 + Math.random() * 120);
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
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
  } catch (e: any) {
    return new Response(`Streaming error: ${e?.message || 'unknown'}` , { status: 500 });
  }
};

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function generateFakeResponse(prompt: string): string[] {
  const base = `Here's an AI drafted suggestion based on your prompt: ${prompt.slice(0, 160)}.`;
  const elaboration = ' This is a simulated streaming response. Integrate the Gemini streaming SDK here for production use.';
  const full = base + elaboration;
  const tokens: string[] = [];
  let i = 0;
  while (i < full.length) {
    const span = Math.min(8 + Math.floor(Math.random() * 12), full.length - i);
    tokens.push(full.slice(i, i + span));
    i += span;
  }
  return tokens;
}

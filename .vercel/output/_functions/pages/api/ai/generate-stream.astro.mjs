export { renderers } from '../../../renderers.mjs';

const POST = async ({
  request
}) => {
  try {
    const {
      prompt
    } = await request.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response("Invalid prompt", {
        status: 400
      });
    }
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        async function push() {
          const fakeReply = generateFakeResponse(prompt);
          for (const token of fakeReply) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              token
            })}

`));
            await sleep(40 + Math.random() * 120);
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            done: true
          })}

`));
          controller.close();
        }
        void push();
      }
    });
    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (e) {
    return new Response(`Streaming error: ${e?.message || "unknown"}`, {
      status: 500
    });
  }
};
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
function generateFakeResponse(prompt) {
  const base = `Here's an AI drafted suggestion based on your prompt: ${prompt.slice(0, 160)}.`;
  const elaboration = " This is a simulated streaming response. Integrate the Gemini streaming SDK here for production use.";
  const full = base + elaboration;
  const tokens = [];
  let i = 0;
  while (i < full.length) {
    const span = Math.min(8 + Math.floor(Math.random() * 12), full.length - i);
    tokens.push(full.slice(i, i + span));
    i += span;
  }
  return tokens;
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

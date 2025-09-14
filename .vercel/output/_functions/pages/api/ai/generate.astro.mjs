import { GoogleGenerativeAI } from '@google/generative-ai';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const POST = async ({
  request
}) => {
  try {
    const {
      prompt,
      model,
      system
    } = await request.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({
        error: "Missing prompt"
      }), {
        status: 400
      });
    }
    const apiKey = "AIzaSyBaTLF0Z0Krem0WO0yumMfNO3GfJ-tTR2A";
    if (!apiKey) ;
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = model || "gemini-1.5-flash";
    const m = genAI.getGenerativeModel({
      model: modelName
    });
    const baseSystem = system || "You are a helpful assistant.";
    const result = await m.generateContent({
      contents: [{
        role: "user",
        parts: [{
          text: `${baseSystem}
User: ${prompt}
Assistant:`
        }]
      }]
    });
    const reply = result.response.text();
    return new Response(JSON.stringify({
      reply
    }), {
      status: 200,
      headers: {
        "content-type": "application/json"
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({
      error: e?.message ?? "error"
    }), {
      status: 500
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

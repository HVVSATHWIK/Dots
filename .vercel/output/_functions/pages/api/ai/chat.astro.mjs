import { GoogleGenerativeAI } from '@google/generative-ai';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const POST = async ({
  request
}) => {
  try {
    const {
      messages,
      model
    } = await request.json();
    const systemPrompt = `
You are the DOTS Assistant.
- Be friendly, concise, and helpful.
- Support both artisans and buyers using the DOTS platform.
- Help with artisan products, creative ideas, and platform guidance.
- Suggest tags, titles, descriptions, pricing ranges, and materials when asked.
- If asked about something outside DOTS, answer politely but briefly.
- Keep responses supportive, approachable, and easy to act on.
`;
    const incoming = messages ?? [];
    const effectiveMessages = [{
      role: "system",
      content: systemPrompt
    }, ...incoming];
    const apiKey = "AIzaSyBaTLF0Z0Krem0WO0yumMfNO3GfJ-tTR2A";
    if (!apiKey) ;
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = model || "gemini-1.5-flash";
    const m = genAI.getGenerativeModel({
      model: modelName
    });
    const parts = [];
    parts.push({
      text: systemPrompt
    });
    for (const msg of effectiveMessages) {
      if (msg.role === "user" || msg.role === "assistant") {
        parts.push({
          text: `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
        });
      }
    }
    parts.push({
      text: "Assistant:"
    });
    const result = await m.generateContent({
      contents: [{
        role: "user",
        parts
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

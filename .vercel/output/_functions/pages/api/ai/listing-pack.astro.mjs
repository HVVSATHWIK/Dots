import { GoogleGenerativeAI } from '@google/generative-ai';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
async function fileToBase64(file) {
  const ab = await file.arrayBuffer();
  if (typeof Buffer !== "undefined") return Buffer.from(ab).toString("base64");
  let binary = "";
  const bytes = new Uint8Array(ab);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
function extractJson(text) {
  const codeFence = text.match(/```(?:json)?\n([\s\S]*?)```/i);
  const raw = codeFence ? codeFence[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return JSON.parse(raw.slice(start, end + 1));
  }
  return JSON.parse(raw);
}
const POST = async ({
  request
}) => {
  try {
    const form = await request.formData();
    const languages = JSON.parse(String(form.get("languages") ?? "[]"));
    const photoTheme = String(form.get("photoTheme") ?? "");
    const voiceNote = form.get("voiceNote");
    const images = [];
    for (const [key, val] of form.entries()) {
      if (key.startsWith("images[") && val instanceof File) images.push(val);
    }
    const apiKey = "AIzaSyBaTLF0Z0Krem0WO0yumMfNO3GfJ-tTR2A";
    if (!apiKey) ;
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = "gemini-1.5-flash";
    const model = genAI.getGenerativeModel({
      model: modelName
    });
    const parts = [];
    parts.push({
      text: `You are a listing and storytelling copilot for artisans.
Produce a concise JSON matching this TypeScript type (no extra text):
type ListingPack = {
  title: { en: string; hi?: string };
  description: { en: string; hi?: string };
  tags: string[];
  price: { min: number; max: number; rationale: string };
  assets: { cleanedImages: string[]; poster?: string; catalogCard?: string };
  social: { caption: { en: string; hi?: string } };
  meta: { artisanName: string };
};

Guidance:
- Use any attached images to infer product details, style, colors.
- If an audio note is attached, first transcribe it and use the content for title/description.
- Languages requested: ${languages.join(", ") || "en"}.
- If 'hi' is requested, include high-quality Hindi for title/description/caption.
- Use '${photoTheme || "natural light"}' as the preferred photo theme in suggestions (do not invent URLs).
- assets.cleanedImages should echo back one or more representative images as data URLs only if the input images were data URLs; otherwise leave cleanedImages empty and focus on text outputs.
- Keep tags relevant and minimal (4-6).
- price should be reasonable INR min/max with one sentence rationale.
- social.caption should be WhatsApp-ready, short, and include 2-3 relevant hashtags.
`
    });
    for (const img of images) {
      const b64 = await fileToBase64(img);
      parts.push({
        inlineData: {
          mimeType: img.type || "image/jpeg",
          data: b64
        }
      });
    }
    if (voiceNote instanceof File) {
      const b64v = await fileToBase64(voiceNote);
      parts.push({
        inlineData: {
          mimeType: voiceNote.type || "audio/mpeg",
          data: b64v
        }
      });
    }
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts
      }]
    });
    const text = result.response.text();
    const json = extractJson(text);
    if (!languages.includes("hi")) {
      if (json?.title) delete json.title.hi;
      if (json?.description) delete json.description.hi;
      if (json?.social?.caption) delete json.social.caption.hi;
    }
    return new Response(JSON.stringify(json), {
      status: 200,
      headers: {
        "content-type": "application/json"
      }
    });
  } catch (e) {
    const msg = e?.message ?? "error";
    return new Response(JSON.stringify({
      error: msg
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

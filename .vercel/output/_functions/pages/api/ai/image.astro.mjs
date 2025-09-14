export { renderers } from '../../../renderers.mjs';

const prerender = false;
function looksImageCapable(model) {
  return true && /image|imagen/i.test(model);
}
const POST = async ({
  request
}) => {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return new Response(JSON.stringify({
        error: "application/json required"
      }), {
        status: 415
      });
    }
    const {
      prompt,
      model
    } = await request.json();
    const apiKey = "AIzaSyBaTLF0Z0Krem0WO0yumMfNO3GfJ-tTR2A";
    const configuredModel = model || undefined                            || process.env.IMAGE_MODEL || "gemini-1.5-flash";
    const project = process.env.GCP_PROJECT || undefined                           ;
    const location = process.env.GCP_LOCATION || undefined                             || "us-central1";
    if (!apiKey || !looksImageCapable(configuredModel) || !project) {
      const note = !apiKey ? "No GEMINI_API_KEY configured; returning stub images." : !project ? "Missing GCP_PROJECT; set GCP_PROJECT and GCP_LOCATION (optional) in server env to enable Vertex calls." : "Configured model is not image-capable; set IMAGE_MODEL to an image model such as gemini-2.5-flash-image-preview or an Imagen model.";
      return new Response(JSON.stringify({
        images: ["https://static.wixstatic.com/media/d7d9fb_6da1e82469934cfb897017b6350736d1~mv2.png?originWidth=1920&originHeight=1024", "https://static.wixstatic.com/media/d7d9fb_a252aa7a948b46c6b4243cff0059d330~mv2.png?originWidth=1920&originHeight=1024"],
        note
      }), {
        status: 200,
        headers: {
          "content-type": "application/json"
        }
      });
    }
    const modelId = configuredModel;
    const modelPath = `projects/${project}/locations/${location}/publishers/google/models/${modelId}:predict`;
    const url = `https://${location}-aiplatform.googleapis.com/v1/${modelPath}?key=${encodeURIComponent(apiKey)}`;
    const body = {
      instances: [{
        // Many image models accept a simple prompt field; adapt as needed
        prompt: String(prompt ?? "").slice(0, 2e3)
      }]
    };
    const vertexRes = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(body)
    });
    if (!vertexRes.ok) {
      const errText = await vertexRes.text().catch(() => "");
      return new Response(JSON.stringify({
        images: ["https://static.wixstatic.com/media/d7d9fb_3b86be1391f746a093ff78ded0b98a08~mv2.png?originWidth=1920&originHeight=1024"],
        note: `Vertex call failed (${vertexRes.status}). Ensure model access and auth. ${errText.slice(0, 240)}`
      }), {
        status: 200,
        headers: {
          "content-type": "application/json"
        }
      });
    }
    const data = await vertexRes.json().catch(() => ({}));
    const pred = data?.predictions?.[0] ?? {};
    const base64 = pred.imageBase64 || pred.b64_json;
    if (base64) {
      const dataUrl = `data:image/png;base64,${base64}`;
      return new Response(JSON.stringify({
        images: [dataUrl]
      }), {
        status: 200,
        headers: {
          "content-type": "application/json"
        }
      });
    }
    return new Response(JSON.stringify({
      images: ["https://static.wixstatic.com/media/d7d9fb_a252aa7a948b46c6b4243cff0059d330~mv2.png?originWidth=1920&originHeight=1024"],
      note: "Vertex response did not include base64 image. Returning stub and raw payload for debugging.",
      raw: pred
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

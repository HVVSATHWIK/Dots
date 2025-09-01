import type { APIRoute } from 'astro';

export const prerender = false;

// Simple capability check: treat models containing "image" or "imagen" as image-capable
function looksImageCapable(model?: string | null) {
  return !!model && /image|imagen/i.test(model);
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return new Response(JSON.stringify({ error: 'application/json required' }), { status: 415 });
    }

    const { prompt, model } = await request.json();
    const apiKey = (import.meta.env.GEMINI_API_KEY as string | undefined) ?? (process.env.GEMINI_API_KEY as string | undefined);
    const configuredModel = (model as string | undefined)
      || (import.meta.env.IMAGE_MODEL as string | undefined)
      || (process.env.IMAGE_MODEL as string | undefined)
      || (import.meta.env.GEMINI_MODEL as string | undefined)
      || (process.env.GEMINI_MODEL as string | undefined);

    const project = (process.env.GCP_PROJECT as string | undefined) || (import.meta.env.GCP_PROJECT as string | undefined);
    const location = (process.env.GCP_LOCATION as string | undefined) || (import.meta.env.GCP_LOCATION as string | undefined) || 'us-central1';

    // If not image capable or no key or missing project, return a safe stub so UI can proceed
    if (!apiKey || !looksImageCapable(configuredModel) || !project) {
      const note = !apiKey
        ? 'No GEMINI_API_KEY configured; returning stub images.'
        : (!project
          ? 'Missing GCP_PROJECT; set GCP_PROJECT and GCP_LOCATION (optional) in server env to enable Vertex calls.'
          : 'Configured model is not image-capable; set IMAGE_MODEL to an image model such as gemini-2.5-flash-image-preview or an Imagen model.'
        );
      return new Response(
        JSON.stringify({
          images: [
            'https://static.wixstatic.com/media/d7d9fb_6da1e82469934cfb897017b6350736d1~mv2.png?originWidth=1920&originHeight=1024',
            'https://static.wixstatic.com/media/d7d9fb_a252aa7a948b46c6b4243cff0059d330~mv2.png?originWidth=1920&originHeight=1024',
          ],
          note,
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    }

    // Attempt Vertex AI Model Garden predict REST call for the configured image-capable model
    // Example path: projects/{project}/locations/{location}/publishers/google/models/{model}:predict
    const modelId = configuredModel!;
    const modelPath = `projects/${project}/locations/${location}/publishers/google/models/${modelId}:predict`;
    const url = `https://${location}-aiplatform.googleapis.com/v1/${modelPath}?key=${encodeURIComponent(apiKey)}`;

    const body = {
      instances: [
        {
          // Many image models accept a simple prompt field; adapt as needed
          prompt: String(prompt ?? '').slice(0, 2000),
        },
      ],
    } as Record<string, unknown>;

    const vertexRes = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!vertexRes.ok) {
      const errText = await vertexRes.text().catch(() => '');
      // Fall back to stub while surfacing diagnostic note
      return new Response(
        JSON.stringify({
          images: [
            'https://static.wixstatic.com/media/d7d9fb_3b86be1391f746a093ff78ded0b98a08~mv2.png?originWidth=1920&originHeight=1024',
          ],
          note: `Vertex call failed (${vertexRes.status}). Ensure model access and auth. ${errText.slice(0, 240)}`,
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    }

    const data = await vertexRes.json().catch(() => ({}));
    const pred = (data as any)?.predictions?.[0] ?? {};
    const base64: string | undefined = pred.imageBase64 || pred.b64_json;
    if (base64) {
      const dataUrl = `data:image/png;base64,${base64}`;
      return new Response(JSON.stringify({ images: [dataUrl] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }

    // If format unknown, return the raw prediction object for inspection alongside a stub
    return new Response(
      JSON.stringify({
        images: [
          'https://static.wixstatic.com/media/d7d9fb_a252aa7a948b46c6b4243cff0059d330~mv2.png?originWidth=1920&originHeight=1024',
        ],
        note: 'Vertex response did not include base64 image. Returning stub and raw payload for debugging.',
        raw: pred,
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? 'error' }), { status: 500 });
  }
};

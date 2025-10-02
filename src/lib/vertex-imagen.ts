import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';

const DEFAULT_PROJECT_ID = 'dots-57778';
const DEFAULT_LOCATION = 'us-central1';
const DEFAULT_GENERATE_MODEL = 'imagen-4.0-generate-001';

export type VertexPredictImage = {
  b64: string;
  mime: string;
  model: string;
  meta?: Record<string, unknown>;
};

export type VertexPredictResult = {
  images: VertexPredictImage[];
  raw: unknown;
  model: string;
};

export type VertexPredictOptions = {
  prompt?: string;
  negativePrompt?: string;
  sampleCount?: number;
  model?: string;
  projectId?: string;
  location?: string;
  publisher?: string;
  imageBase64?: string;
  imageMimeType?: string;
  maskBase64?: string;
  parameters?: Record<string, unknown>;
};

type VertexTokenCache = { token: string; expiresAt: number };
let vertexTokenCache: VertexTokenCache | null = null;

type VertexServiceAccount = { client_email: string; private_key: string };

export function getVertexEnv(key: string): string | undefined {
  const metaEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};
  return metaEnv[`VERTEX_${key}`] ?? process.env[`VERTEX_${key}`];
}

function getServerEnv(key: string): string | undefined {
  const metaEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};
  return metaEnv[key] ?? process.env[key];
}

export function getVertexConfig() {
  const projectId = getVertexEnv('PROJECT_ID') || process.env.VERTEX_PROJECT_ID || DEFAULT_PROJECT_ID;
  const location = getVertexEnv('LOCATION') || process.env.VERTEX_LOCATION || DEFAULT_LOCATION;
  return { projectId, location };
}

export async function getVertexAccessToken(): Promise<string | null> {
  const now = Date.now();
  if (vertexTokenCache && vertexTokenCache.expiresAt - now > 60_000) {
    return vertexTokenCache.token;
  }

  const manual = getVertexEnv('ACCESS_TOKEN') || process.env.VERTEX_ACCESS_TOKEN;
  if (manual) {
    vertexTokenCache = { token: manual, expiresAt: now + 5 * 60_000 };
    return manual;
  }

  const creds = loadVertexServiceAccount();
  if (!creds) return null;
  const token = await exchangeJwtForToken(creds);
  return token;
}

export function clearVertexTokenCache() {
  vertexTokenCache = null;
}

function loadVertexServiceAccount(): VertexServiceAccount | null {
  const inline = getVertexEnv('SERVICE_ACCOUNT_JSON') || getServerEnv('VERTEX_SERVICE_ACCOUNT_JSON');
  if (inline) {
    const parsed = JSON.parse(inline);
    return { client_email: parsed.client_email, private_key: parsed.private_key };
  }
  const path =
    getVertexEnv('SERVICE_ACCOUNT_PATH') ||
    getServerEnv('VERTEX_SERVICE_ACCOUNT_PATH') ||
    getServerEnv('GOOGLE_APPLICATION_CREDENTIALS');
  if (path) {
    const abs = resolvePath(path);
    const content = readFileSync(abs, 'utf8');
    const parsed = JSON.parse(content);
    return { client_email: parsed.client_email, private_key: parsed.private_key };
  }
  return null;
}

async function exchangeJwtForToken({ client_email, private_key }: VertexServiceAccount) {
  if (!client_email || !private_key) {
    throw new Error('vertex-service-account-missing-fields');
  }
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600;
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    exp,
    iat: now,
  })).toString('base64url');
  const unsigned = `${header}.${payload}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const signature = signer.sign(private_key, 'base64url');
  const assertion = `${unsigned}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`vertex-token ${res.status} ${res.statusText}: ${text}`);
  }
  const json = await res.json();
  const token = json.access_token as string | undefined;
  if (!token) throw new Error('vertex-token missing access_token');
  const expiresIn = typeof json.expires_in === 'number' ? json.expires_in : 3600;
  vertexTokenCache = { token, expiresAt: Date.now() + expiresIn * 1000 };
  return token;
}

function normalizeModelName(model?: string) {
  const name = model || getVertexEnv('IMAGEN_MODEL') || process.env.VERTEX_IMAGEN_MODEL || DEFAULT_GENERATE_MODEL;
  if (!name) return DEFAULT_GENERATE_MODEL;
  if (name.startsWith('projects/')) {
    const match = name.split('/models/')[1];
    return match || name;
  }
  if (name.startsWith('models/')) return name.slice('models/'.length);
  if (name.includes('/models/')) {
    const [, tail] = name.split('/models/');
    return tail || name;
  }
  return name;
}

export async function vertexPredict(options: VertexPredictOptions): Promise<VertexPredictResult> {
  const token = await getVertexAccessToken();
  if (!token) {
    throw new Error('vertex-missing-credentials');
  }
  const { projectId: defaultProject, location: defaultLocation } = getVertexConfig();
  const projectId = options.projectId || defaultProject;
  const location = options.location || defaultLocation;
  const publisher = options.publisher || 'google';
  const modelName = normalizeModelName(options.model);

  const instance: Record<string, unknown> = {};
  if (options.prompt) instance.prompt = options.prompt;
  if (options.negativePrompt) instance.negativePrompt = options.negativePrompt;
  if (options.imageBase64) {
    const imagePayload: Record<string, unknown> = { bytesBase64Encoded: options.imageBase64 };
    if (options.imageMimeType) imagePayload.mimeType = options.imageMimeType;
    instance.image = imagePayload;
  }
  if (options.maskBase64) {
    instance.mask = { bytesBase64Encoded: options.maskBase64 };
  }

  if (!Object.keys(instance).length) {
    throw new Error('vertex-predict requires at least prompt or image input');
  }

  const parameters = { ...(options.parameters ?? {}) } as Record<string, unknown>;
  if (typeof options.sampleCount === 'number' && Number.isFinite(options.sampleCount)) {
    parameters.sampleCount = Math.max(1, Math.min(16, Math.floor(options.sampleCount)));
  }

  const payload: Record<string, unknown> = { instances: [instance] };
  if (Object.keys(parameters).length) {
    payload.parameters = parameters;
  }

  const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/${publisher}/models/${modelName}:predict`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`vertex-predict ${res.status} ${res.statusText}: ${text}`);
  }
  const data: any = await res.json();
  const predictions: any[] = Array.isArray(data?.predictions) ? data.predictions : [];
  const images: VertexPredictImage[] = predictions
    .map((pred, idx) => {
      const b64 = typeof pred?.bytesBase64Encoded === 'string'
        ? pred.bytesBase64Encoded
        : typeof pred?.imageBytes === 'string'
          ? pred.imageBytes
          : typeof pred?.image?.bytesBase64Encoded === 'string'
            ? pred.image.bytesBase64Encoded
            : typeof pred?.image?.base64 === 'string'
              ? pred.image.base64
              : undefined;
      if (!b64) return null;
      const mime = typeof pred?.mimeType === 'string'
        ? pred.mimeType
        : typeof pred?.image?.mimeType === 'string'
          ? pred.image.mimeType
          : 'image/png';
      const meta: Record<string, unknown> = {};
      if (pred?.safetyAttributes) meta.safety = pred.safetyAttributes;
      if (pred?.score != null) meta.score = pred.score;
      return { b64, mime, model: modelName, meta: { ...meta, index: idx } };
    })
    .filter(Boolean) as VertexPredictImage[];

  return { images, raw: data, model: modelName };
}

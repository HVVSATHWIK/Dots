import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSign } from 'node:crypto';

const DEFAULT_LOCATION = process.env.VERTEX_LOCATION || 'us-central1';
const DEFAULT_PROJECT = process.env.VERTEX_PROJECT_ID || 'dots-57778';
const DEFAULT_MODEL = process.env.VERTEX_IMAGEN_MODEL || 'imagen-4.0-generate-001';

function buildPredictUrl(projectId, location, model) {
  return `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:predict`;
}

export async function generateImagen(prompt, sampleCount = 4) {
  ensureEnvLoaded();
  const token = await getVertexAccessToken();
  const url = buildPredictUrl(DEFAULT_PROJECT, DEFAULT_LOCATION, DEFAULT_MODEL);
  const payload = {
    instances: [{ prompt }],
    parameters: { sampleCount },
  };

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
    throw new Error(`Vertex Imagen request failed (${res.status} ${res.statusText}): ${text}`);
  }

  return res.json();
}

let envLoaded = false;
function ensureEnvLoaded() {
  if (envLoaded) return;
  envLoaded = true;
  if (process.env.VERTEX_IMAGEN_API_KEY) return;
  try {
    const envPath = resolve(process.cwd(), '.env');
    const content = readFileSync(envPath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      if (!line || line.trim().startsWith('#')) continue;
      const idx = line.indexOf('=');
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim();
      if (key in process.env) continue;
      const raw = line.slice(idx + 1).trim();
      const value = raw.replace(/^['"]|['"]$/g, '');
      process.env[key] = value;
    }
  } catch (err) {
    console.warn('Could not auto-load .env file:', err?.message || err);
  }
}

let cachedToken = null;
async function getVertexAccessToken() {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt - now > 60_000) {
    return cachedToken.token;
  }
  const manual = process.env.VERTEX_ACCESS_TOKEN;
  if (manual) {
    cachedToken = { token: manual, expiresAt: now + 5 * 60_000 };
    return manual;
  }

  const credentials = loadServiceAccount();
  const token = await exchangeJwtForToken(credentials);
  return token;
}

function loadServiceAccount() {
  const inline = process.env.VERTEX_SERVICE_ACCOUNT_JSON;
  if (inline) {
    return JSON.parse(inline);
  }
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credPath) {
    const abs = resolve(credPath);
    const content = readFileSync(abs, 'utf8');
    return JSON.parse(content);
  }
  throw new Error('Provide Vertex credentials via VERTEX_SERVICE_ACCOUNT_JSON, GOOGLE_APPLICATION_CREDENTIALS, or VERTEX_ACCESS_TOKEN.');
}

async function exchangeJwtForToken({ client_email, private_key }) {
  if (!client_email || !private_key) {
    throw new Error('Service account must include client_email and private_key.');
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
    throw new Error(`Failed to obtain Vertex access token: ${res.status} ${res.statusText} ${text}`);
  }
  const json = await res.json();
  const token = json.access_token;
  if (!token) {
    throw new Error('Token response missing access_token');
  }
  const expiresIn = typeof json.expires_in === 'number' ? json.expires_in : 3600;
  cachedToken = { token, expiresAt: Date.now() + expiresIn * 1000 };
  return token;
}

const thisFilePath = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === resolve(thisFilePath)) {
  const [, , promptArg = 'make a pot with different variations', samplesArg] = process.argv;
  const sampleCount = Number(samplesArg ?? 4);

  const count = Number.isFinite(sampleCount) && sampleCount > 0 ? sampleCount : 4;
  console.log(`▶️  Requesting ${count} sample(s) for prompt: "${promptArg}"`);
  generateImagen(promptArg, count)
    .then((response) => {
      console.log('✅ Imagen response received');
      if (!response?.predictions?.length) {
        console.warn('⚠️  No predictions returned. Full response:');
        console.dir(response, { depth: null, colors: true });
        return;
      }
      response.predictions.forEach((pred, idx) => {
        const hasImage = typeof pred?.bytesBase64Encoded === 'string';
        console.log(`• Prediction ${idx + 1}: ${hasImage ? 'image data received' : 'missing image data'}`);
      });
    })
    .catch((err) => {
      console.error('❌ Imagen call failed:', err?.message || err);
      process.exitCode = 1;
    });
}

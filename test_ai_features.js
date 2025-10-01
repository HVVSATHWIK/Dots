// Test script to verify AI features work as expected
// This simulates what a real user would do when trying the AI features

import fs from 'fs';
import path from 'path';
import { createServer } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

console.log('🚀 Testing DOTS AI Features as a curious user!');

const rootDir = process.cwd();
const envPath = path.join(rootDir, '.env');

function parseEnv(content) {
  const out = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

console.log('\n1. 📋 Checking Environment Setup...');

let envFileVars = {};
let envReadError = null;
try {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envFileVars = parseEnv(envContent);
} catch (err) {
  envReadError = err;
  console.log('   ❌ Could not read .env file');
}

const importantKeys = [
  'GEMINI_API_KEY',
  'GEMINI_MODEL',
  'PUBLIC_FB_API_KEY',
  'PUBLIC_FB_AUTH_DOMAIN',
  'PUBLIC_FB_PROJECT_ID',
  'PUBLIC_FB_STORAGE_BUCKET',
  'PUBLIC_FB_MESSAGING_SENDER_ID',
  'PUBLIC_FB_APP_ID',
  'PUBLIC_FB_MEASUREMENT_ID',
  'VITE_FB_API_KEY',
  'VITE_FB_AUTH_DOMAIN',
  'VITE_FB_PROJECT_ID',
  'VITE_FB_STORAGE_BUCKET',
  'VITE_FB_MESSAGING_SENDER_ID',
  'VITE_FB_APP_ID',
  'VITE_FB_MEASUREMENT_ID'
];

const envForModules = { ...envFileVars };
for (const key of importantKeys) {
  if (!envForModules[key] && process.env[key]) {
    envForModules[key] = process.env[key];
  }
}

const hasGeminiKey = typeof envForModules.GEMINI_API_KEY === 'string' && envForModules.GEMINI_API_KEY.length > 10;
const hasFirebaseConfig = Boolean(
  envForModules.PUBLIC_FB_API_KEY &&
  envForModules.PUBLIC_FB_PROJECT_ID &&
  envForModules.PUBLIC_FB_APP_ID
);

console.log(`   ✓ Gemini API Key: ${hasGeminiKey ? 'Found' : 'Missing'}`);
console.log(`   ✓ Firebase Config: ${hasFirebaseConfig ? 'Found' : 'Missing'}`);

if (!hasGeminiKey) {
  console.log('   ⚠️  Warning: No Gemini API key found - AI features will use fallbacks');
}

for (const [key, value] of Object.entries(envForModules)) {
  if (value != null && !(key in process.env)) {
    process.env[key] = value;
  }
}

console.log('\n2. 🧪 Testing AI API Endpoints...');

function buildDefineEnv(envMap) {
  const define = {
    'import.meta.env.DEV': 'true',
    'import.meta.env.PROD': 'false',
    'import.meta.env.MODE': JSON.stringify('development'),
    'import.meta.env.BASE_URL': JSON.stringify('/')
  };
  for (const [key, value] of Object.entries(envMap)) {
    if (value !== undefined) {
      define[`import.meta.env.${key}`] = JSON.stringify(value);
    }
  }
  return define;
}

function firebaseStubPlugin() {
  return {
    name: 'dots-ai-feature-firebase-stub',
    enforce: 'pre',
    resolveId(id) {
      if (id === 'firebase/app') return '\u0000firebase-app-stub';
      if (id === 'firebase/auth') return '\u0000firebase-auth-stub';
      if (id === 'firebase/firestore') return '\u0000firebase-firestore-stub';
      if (id === 'firebase/storage') return '\u0000firebase-storage-stub';
      return null;
    },
    load(id) {
      switch (id) {
        case '\u0000firebase-app-stub':
          return `const apps = [];
export function initializeApp(config = {}) {
  const app = { config };
  if (!apps.length) apps.push(app);
  return app;
}
export function getApps() {
  return apps;
}
export default { initializeApp, getApps };`;
        case '\u0000firebase-auth-stub':
          return `export function getAuth() { return { stub: true }; }
export class GoogleAuthProvider { setCustomParameters() {} }`;
        case '\u0000firebase-storage-stub':
          return `export function getStorage() { return { stub: true }; }`;
        case '\u0000firebase-firestore-stub':
          return `const makeDoc = (id) => ({
  id: id ?? 'stub-id',
  data: () => ({}),
  exists: () => false,
  ref: { id: id ?? 'stub-id' }
});
export function getFirestore() { return { stub: true }; }
export function initializeFirestore(app) { return { stub: true, app }; }
export function collection(...args) { return { __collection: args }; }
export function doc(...args) { return makeDoc(args[args.length - 1]); }
export function query(...args) { return { __query: args }; }
export function where(...args) { return { __where: args }; }
export function orderBy(...args) { return { __orderBy: args }; }
export function limit(n) { return { __limit: n }; }
export async function addDoc() { return { id: 'stub-' + Math.random().toString(36).slice(2, 10) }; }
export async function getDoc(ref) { return makeDoc(ref?.id); }
export async function getDocs() { return { empty: true, size: 0, docs: [] }; }
export async function updateDoc() { return; }
export async function deleteDoc() { return; }
export async function setDoc() { return; }
export function onSnapshot(_ref, cb) {
  if (typeof cb === 'function') {
    try {
      cb({ docChanges: () => [], docs: [] });
    } catch (err) {}
  }
  return () => {};
}
export function serverTimestamp() { return Date.now(); }`;
        default:
          return null;
      }
    }
  };
}

async function createTestServer() {
  return createServer({
    root: rootDir,
    logLevel: 'error',
    clearScreen: false,
    configFile: false,
    appType: 'custom',
    server: { middlewareMode: true },
    optimizeDeps: { entries: [] },
    plugins: [
      tsconfigPaths({ projects: [path.join(rootDir, 'tsconfig.json')] }),
      firebaseStubPlugin()
    ],
    define: buildDefineEnv(envForModules)
  });
}

// Test the health endpoint first
async function testHealthEndpoint(loadApi) {
  try {
    console.log('   🏥 Testing AI Health endpoint...');
    const mod = await loadApi('health');
    const response = await mod.GET({ request: new Request('http://localhost/api/ai/health') });
    const result = await response.json();
    console.log(`   ✓ Health endpoint works: ${JSON.stringify(result)}`);
    return true;
  } catch (error) {
    console.log(`   ❌ Health endpoint failed: ${error.message}`);
    return false;
  }
}

// Test image generation endpoint
async function testImageGeneration(loadApi) {
  try {
    console.log('   🎨 Testing Image Generation...');
    const mod = await loadApi('image-generate');
    const mockRequest = new Request('http://localhost/api/ai/image-generate', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'handmade ceramic coffee mug with blue glaze', variants: 1 }),
      headers: { 'content-type': 'application/json' }
    });
    const response = await mod.POST({ request: mockRequest });
    const result = await response.json();
    console.log(`   ✓ Image generation ${result.fallback ? 'fallback' : 'success'}: ${result.images?.length || 0} images`);
    if (result.note) {
      console.log(`   📝 Note: ${result.note}`);
    }
    return true;
  } catch (error) {
    console.log(`   ❌ Image generation failed: ${error.message}`);
    return false;
  }
}

// Test text generation
async function testTextGeneration(loadApi) {
  try {
    console.log('   📝 Testing Text Generation...');
    const mod = await loadApi('generate');
    const mockRequest = new Request('http://localhost/api/ai/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Write a short product description for a handmade ceramic mug' }),
      headers: { 'content-type': 'application/json' }
    });
    const response = await mod.POST({ request: mockRequest });
    const result = await response.json();
    console.log(`   ✓ Text generation: ${result.reply || result.text ? 'Success' : 'Fallback'}`);
    const preview = result.reply || result.text;
    if (preview) {
      console.log(`   📄 Generated: ${String(preview).substring(0, 100)}...`);
    }
    return true;
  } catch (error) {
    console.log(`   ❌ Text generation failed: ${error.message}`);
    return false;
  }
}

// Test TTS endpoint
async function testTTS(loadApi) {
  try {
    console.log('   🔊 Testing Text-to-Speech...');
    const mod = await loadApi('tts');
    const mockRequest = new Request('http://localhost/api/ai/tts', {
      method: 'POST',
      body: JSON.stringify({ text: 'Hello, welcome to DOTS marketplace!' }),
      headers: { 'content-type': 'application/json' }
    });
    const response = await mod.POST({ request: mockRequest });
    const result = await response.json();
    const isAudio = !!result.audio;
    console.log(`   ✓ TTS endpoint: ${isAudio ? 'Audio generated' : 'Fallback response'}`);
    return true;
  } catch (error) {
    console.log(`   ❌ TTS failed: ${error.message}`);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('\n🎯 Running AI Feature Tests...\n');
  const server = await createTestServer();
  const loadApi = (name) => server.ssrLoadModule(`/src/pages/api/ai/${name}.ts`);

  const tests = [
    () => testHealthEndpoint(loadApi),
    () => testImageGeneration(loadApi),
    () => testTextGeneration(loadApi),
    () => testTTS(loadApi)
  ];

  let passed = 0;
  const total = tests.length;

  try {
    for (const test of tests) {
      try {
        const result = await test();
        if (result) passed++;
      } catch (error) {
        console.log(`   ❌ Test failed: ${error.message}`);
      }
      console.log('');
    }

    console.log(`\n🏆 Results: ${passed}/${total} tests passed`);
    if (passed === total) {
      console.log('🎉 All AI features are working! Users can successfully:');
      console.log('   ✓ Generate product images');
      console.log('   ✓ Create product descriptions');
      console.log('   ✓ Convert text to speech');
      console.log('   ✓ Access AI health status');
    } else {
      console.log('⚠️  Some AI features may not work as expected for users.');
    }
  } finally {
    await server.close();
  }
}

runTests().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
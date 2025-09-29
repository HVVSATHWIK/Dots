import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load environment variables
let env: Record<string, string> = {}
try {
  const envPath = resolve(process.cwd(), '.env')
  const envFile = readFileSync(envPath, 'utf8')
  
  envFile.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=')
      if (key) {
        const value = valueParts.join('=')
        env[key] = value
      }
    }
  })
} catch (error) {
  console.warn('Could not load .env file:', error)
}

export default defineConfig({
  // @ts-expect-error - vite-tsconfig-paths is not typed correctly
  plugins: [tsconfigPaths()],
  define: {
    // Make import.meta.env available in tests
    'import.meta.env.PUBLIC_FB_API_KEY': JSON.stringify(env.PUBLIC_FB_API_KEY),
    'import.meta.env.PUBLIC_FB_AUTH_DOMAIN': JSON.stringify(env.PUBLIC_FB_AUTH_DOMAIN),
    'import.meta.env.PUBLIC_FB_PROJECT_ID': JSON.stringify(env.PUBLIC_FB_PROJECT_ID),
    'import.meta.env.PUBLIC_FB_STORAGE_BUCKET': JSON.stringify(env.PUBLIC_FB_STORAGE_BUCKET),
    'import.meta.env.PUBLIC_FB_MESSAGING_SENDER_ID': JSON.stringify(env.PUBLIC_FB_MESSAGING_SENDER_ID),
    'import.meta.env.PUBLIC_FB_APP_ID': JSON.stringify(env.PUBLIC_FB_APP_ID),
    'import.meta.env.PUBLIC_FB_MEASUREMENT_ID': JSON.stringify(env.PUBLIC_FB_MEASUREMENT_ID),
    'import.meta.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    'import.meta.env.DEV': JSON.stringify(true),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.js'],
  },
  esbuild: {
    target: 'node20',
  },
})
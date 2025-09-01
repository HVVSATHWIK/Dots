// @ts-nocheck
// (Editor-only) Disable TS checking here to avoid Vite/Rollup plugin type drift noise.
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/server";
import wix from "@wix/astro";
import react from "@astrojs/react";
import sourceAttrsPlugin from "@wix/babel-plugin-jsx-source-attrs";
import dynamicDataPlugin from "@wix/babel-plugin-jsx-dynamic-data";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import customErrorOverlayPlugin from "./vite-error-overlay-plugin.js";

const isBuild = process.env.NODE_ENV == "production";
const enableWix = !!process.env.WIX_CLIENT_ID; // Only enable Wix integration if env is provided

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [
    {
      name: "framewire",
      hooks: {
        "astro:config:setup": ({ injectScript, command }) => {
          if (command === "dev") {
            injectScript(
              "page",
              `import { init } from "@wix/framewire";
              console.log("Framewire initialized");
              init();`,
            );
          }
        },
      },
    },
    tailwind(),
    // Enable Wix integration only when WIX_CLIENT_ID is available (e.g., CI/Prod)
    ...(enableWix
      ? [
          wix({
            enableHtmlEmbeds: isBuild,
            enableAuthRoutes: true,
          }),
        ]
      : []),
    react({ babel: { plugins: [sourceAttrsPlugin, dynamicDataPlugin] } }),
  ],
  vite: {
    plugins: [
  customErrorOverlayPlugin(),
      ...(isBuild ? [nodePolyfills()] : []),
    ],
  },
  // Use Vercel adapter for production builds
  adapter: isBuild ? vercel({ runtime: 'node' }) : undefined,
  devToolbar: {
    enabled: false,
  },
  image: {
    domains: ["static.wixstatic.com"],
  },
  server: {
    allowedHosts: true,
    host: true,
  },
});

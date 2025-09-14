// @ts-nocheck
// (Editor-only) Disable TS checking here to avoid Vite/Rollup plugin type drift noise.
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel";
import wix from "@wix/astro";
import react from "@astrojs/react";
import sourceAttrsPlugin from "@wix/babel-plugin-jsx-source-attrs";
import dynamicDataPlugin from "@wix/babel-plugin-jsx-dynamic-data";
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
              `(() => {
                if (window.__FRAMEWIRE_READY__) { return; }
                window.__FRAMEWIRE_READY__ = true;
                try {
                  import("@wix/framewire").then(({ init }) => {
                    if (typeof init === 'function') {
                      console.log("Framewire initialized");
                      init();
                    }
                  }).catch((err) => {
                    console.warn("Framewire initialization failed:", err);
                  });
                } catch (err) {
                  console.warn("Framewire import failed:", err);
                }
              })();`,
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
    ],
  },
  // Use Vercel adapter (serverless functions) for production builds
  adapter: isBuild ? vercel() : undefined,
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

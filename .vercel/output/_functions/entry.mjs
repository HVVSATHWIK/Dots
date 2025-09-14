import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_ZwYDLaNb.mjs';
import { manifest } from './manifest_EP_rzgeu.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/ai/caption.astro.mjs');
const _page2 = () => import('./pages/api/ai/chat.astro.mjs');
const _page3 = () => import('./pages/api/ai/design-variations.astro.mjs');
const _page4 = () => import('./pages/api/ai/generate.astro.mjs');
const _page5 = () => import('./pages/api/ai/image.astro.mjs');
const _page6 = () => import('./pages/api/ai/listing-pack.astro.mjs');
const _page7 = () => import('./pages/api/trust/mint.astro.mjs');
const _page8 = () => import('./pages/_---slug_.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/api/ai/caption.ts", _page1],
    ["src/pages/api/ai/chat.ts", _page2],
    ["src/pages/api/ai/design-variations.ts", _page3],
    ["src/pages/api/ai/generate.ts", _page4],
    ["src/pages/api/ai/image.ts", _page5],
    ["src/pages/api/ai/listing-pack.ts", _page6],
    ["src/pages/api/trust/mint.ts", _page7],
    ["src/pages/[...slug].astro", _page8]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./_noop-actions.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "5f46d296-67f8-474e-8e2c-3be32398f8a3",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };

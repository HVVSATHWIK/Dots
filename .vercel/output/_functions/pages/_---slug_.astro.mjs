/* empty css                                  */
import { e as createComponent, f as createAstro, k as renderComponent, l as renderHead, r as renderTemplate } from '../chunks/astro/server_39TLRhHP.mjs';
import 'kleur/colors';
import { SEO } from '@wix/seo/components';
import { loadSEOTagsServiceConfig } from '@wix/seo/services';
import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
export { renderers } from '../renderers.mjs';

const Head = () => {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("meta", { "data-source-location": "src\\\\components\\\\Head.tsx:4:6", charSet: "UTF-8" }),
    /* @__PURE__ */ jsx("meta", { "data-source-location": "src\\\\components\\\\Head.tsx:5:6", name: "viewport", content: "width=device-width, initial-scale=1.0" }),
    /* @__PURE__ */ jsx("link", { "data-source-location": "src\\\\components\\\\Head.tsx:7:6", rel: "preconnect", href: "https://static.parastorage.com" })
  ] });
};

const $$Astro = createAstro();
const $$ = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$;
  const seoTagsServiceConfig = await loadSEOTagsServiceConfig({
    pageUrl: Astro2.url.href,
    itemData: {
      pageName: "Home"
    }
  });
  return renderTemplate`<html lang="en" class="w-full h-full"> <head>${renderComponent($$result, "Head", Head, {})}${renderComponent($$result, "SEO.Tags", SEO.Tags, { "seoTagsServiceConfig": seoTagsServiceConfig, "slot": "seo-tags" })}${renderHead()}</head> <body class="w-full h-full"> <div id="root" class="w-full h-full"> ${renderComponent($$result, "AppRouter", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "@/components/Router", "client:component-export": "default" })} </div> </body></html>`;
}, "C:/Users/Veerendranath/OneDrive/Documents/Hackathons/GenAI Exchange Hackathon/Work/Dots/src/pages/[...slug].astro", void 0);

const $$file = "C:/Users/Veerendranath/OneDrive/Documents/Hackathons/GenAI Exchange Hackathon/Work/Dots/src/pages/[...slug].astro";
const $$url = "/[...slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

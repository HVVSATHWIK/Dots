import 'kleur/colors';
import { n as decodeKey } from './chunks/astro/server_39TLRhHP.mjs';
import 'clsx';
import 'cookie';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_B38EbWI4.mjs';
import 'es-module-lexer';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///C:/Users/Veerendranath/OneDrive/Documents/Hackathons/GenAI%20Exchange%20Hackathon/Work/Dots/","cacheDir":"file:///C:/Users/Veerendranath/OneDrive/Documents/Hackathons/GenAI%20Exchange%20Hackathon/Work/Dots/node_modules/.astro/","outDir":"file:///C:/Users/Veerendranath/OneDrive/Documents/Hackathons/GenAI%20Exchange%20Hackathon/Work/Dots/dist/","srcDir":"file:///C:/Users/Veerendranath/OneDrive/Documents/Hackathons/GenAI%20Exchange%20Hackathon/Work/Dots/src/","publicDir":"file:///C:/Users/Veerendranath/OneDrive/Documents/Hackathons/GenAI%20Exchange%20Hackathon/Work/Dots/public/","buildClientDir":"file:///C:/Users/Veerendranath/OneDrive/Documents/Hackathons/GenAI%20Exchange%20Hackathon/Work/Dots/dist/client/","buildServerDir":"file:///C:/Users/Veerendranath/OneDrive/Documents/Hackathons/GenAI%20Exchange%20Hackathon/Work/Dots/dist/server/","adapterName":"@astrojs/vercel","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/ai/caption","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/ai\\/caption\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"ai","dynamic":false,"spread":false}],[{"content":"caption","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/ai/caption.ts","pathname":"/api/ai/caption","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/ai/chat","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/ai\\/chat\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"ai","dynamic":false,"spread":false}],[{"content":"chat","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/ai/chat.ts","pathname":"/api/ai/chat","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/ai/design-variations","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/ai\\/design-variations\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"ai","dynamic":false,"spread":false}],[{"content":"design-variations","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/ai/design-variations.ts","pathname":"/api/ai/design-variations","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/ai/generate","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/ai\\/generate\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"ai","dynamic":false,"spread":false}],[{"content":"generate","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/ai/generate.ts","pathname":"/api/ai/generate","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/ai/generate-stream","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/ai\\/generate-stream\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"ai","dynamic":false,"spread":false}],[{"content":"generate-stream","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/ai/generate-stream.ts","pathname":"/api/ai/generate-stream","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/ai/image","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/ai\\/image\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"ai","dynamic":false,"spread":false}],[{"content":"image","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/ai/image.ts","pathname":"/api/ai/image","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/ai/listing-pack","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/ai\\/listing-pack\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"ai","dynamic":false,"spread":false}],[{"content":"listing-pack","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/ai/listing-pack.ts","pathname":"/api/ai/listing-pack","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/trust/mint","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/trust\\/mint\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"trust","dynamic":false,"spread":false}],[{"content":"mint","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/trust/mint.ts","pathname":"/api/trust/mint","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_slug_.BrFgLYko.css"},{"type":"inline","content":"@keyframes scanMask{0%{-webkit-mask-position:0% 200%;mask-position:0% 200%}to{-webkit-mask-position:0% -100%;mask-position:0% -100%}}img[src*=\"12d367_71ebdd7141d041e4be3d91d80d4578dd\"]{-webkit-mask-image:linear-gradient(to bottom,transparent 0%,rgba(255,255,255,1) 50%,transparent 100%);mask-image:linear-gradient(to bottom,transparent 0%,rgba(255,255,255,1) 50%,transparent 100%);-webkit-mask-size:100% 200%;mask-size:100% 200%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;animation:scanMask 2s linear infinite}\n"}],"routeData":{"route":"/[...slug]","isIndex":false,"type":"page","pattern":"^(?:\\/(.*?))?\\/?$","segments":[[{"content":"...slug","dynamic":true,"spread":true}]],"params":["...slug"],"component":"src/pages/[...slug].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["C:/Users/Veerendranath/OneDrive/Documents/Hackathons/GenAI Exchange Hackathon/Work/Dots/src/pages/[...slug].astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000noop-actions":"_noop-actions.mjs","\u0000@astro-page:src/pages/api/ai/caption@_@ts":"pages/api/ai/caption.astro.mjs","\u0000@astro-page:src/pages/api/ai/chat@_@ts":"pages/api/ai/chat.astro.mjs","\u0000@astro-page:src/pages/api/ai/design-variations@_@ts":"pages/api/ai/design-variations.astro.mjs","\u0000@astro-page:src/pages/api/ai/generate@_@ts":"pages/api/ai/generate.astro.mjs","\u0000@astro-page:src/pages/api/ai/generate-stream@_@ts":"pages/api/ai/generate-stream.astro.mjs","\u0000@astro-page:src/pages/api/ai/image@_@ts":"pages/api/ai/image.astro.mjs","\u0000@astro-page:src/pages/api/ai/listing-pack@_@ts":"pages/api/ai/listing-pack.astro.mjs","\u0000@astro-page:src/pages/api/trust/mint@_@ts":"pages/api/trust/mint.astro.mjs","\u0000@astro-page:src/pages/[...slug]@_@astro":"pages/_---slug_.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_BrIriMl3.mjs","C:/Users/Veerendranath/OneDrive/Documents/Hackathons/GenAI Exchange Hackathon/Work/Dots/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_B0eoo-t4.mjs","@/components/Router":"_astro/Router.BtJ8qLWh.js","@astrojs/react/client.js":"_astro/client.B3-l0Fcc.js","C:/Users/Veerendranath/OneDrive/Documents/Hackathons/GenAI Exchange Hackathon/Work/Dots/photo-theme.txt?raw":"_astro/photo-theme.CWvzUBAS.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/_slug_.BrFgLYko.css","/favicon.ico","/_astro/client.B3-l0Fcc.js","/_astro/index.BEFYBaWX.js","/_astro/photo-theme.CWvzUBAS.js","/_astro/Router.BtJ8qLWh.js"],"buildFormat":"directory","checkOrigin":true,"serverIslandNameMap":[],"key":"UBU+DCzVcyurPJYC4UK85d1SHf6D736HTI2CWsVbRlg="});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };

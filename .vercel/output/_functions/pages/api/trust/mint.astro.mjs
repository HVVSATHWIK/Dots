export { renderers } from '../../../renderers.mjs';

const prerender = false;
const POST = async () => {
  try {
    const json = {
      tokenId: "polygon:0xABCDEF...1234",
      qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https%3A%2F%2Fpolygonscan.com%2Ftx%2F0xABC",
      explorerUrl: "https://polygonscan.com/tx/0xABCDEF000..."
    };
    return new Response(JSON.stringify(json), {
      status: 200,
      headers: {
        "content-type": "application/json"
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({
      error: e?.message ?? "error"
    }), {
      status: 500
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

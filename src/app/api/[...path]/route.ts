export const dynamic = 'force-dynamic';

function getBackendBaseUrl() {
  const env = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (env && typeof env === 'string') return env.replace(/\/+$/, '');
  return 'https://backednnuevo.onrender.com';
}

function buildTargetUrl(req: Request, params: { path?: string[] }) {
  const backend = getBackendBaseUrl();
  const url = new URL(req.url);
  const path = Array.isArray(params.path) ? params.path.join('/') : '';
  const target = new URL(`${backend}/${path}`);
  target.search = url.search;
  return target;
}

function cloneHeaders(req: Request) {
  const headers = new Headers(req.headers);
  // These headers should not be forwarded.
  headers.delete('host');
  headers.delete('connection');
  headers.delete('content-length');
  headers.set('x-client-platform', 'web');
  return headers;
}

async function handle(req: Request, ctx: { params: { path?: string[] } }) {
  const targetUrl = buildTargetUrl(req, ctx.params);
  const method = req.method.toUpperCase();

  const init: RequestInit = {
    method,
    headers: cloneHeaders(req),
    // Forward body for non-GET/HEAD
    body: method === 'GET' || method === 'HEAD' ? undefined : await req.arrayBuffer(),
    redirect: 'manual',
    cache: 'no-store',
  };

  const upstream = await fetch(targetUrl, init);

  // Pass-through response (status + headers + body)
  const respHeaders = new Headers(upstream.headers);
  // Avoid leaking hop-by-hop headers
  respHeaders.delete('transfer-encoding');
  respHeaders.delete('connection');

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: respHeaders,
  });
}

export async function GET(req: Request, ctx: { params: { path?: string[] } }) {
  return handle(req, ctx);
}

export async function POST(req: Request, ctx: { params: { path?: string[] } }) {
  return handle(req, ctx);
}

export async function PUT(req: Request, ctx: { params: { path?: string[] } }) {
  return handle(req, ctx);
}

export async function PATCH(req: Request, ctx: { params: { path?: string[] } }) {
  return handle(req, ctx);
}

export async function DELETE(req: Request, ctx: { params: { path?: string[] } }) {
  return handle(req, ctx);
}

export async function OPTIONS(req: Request, ctx: { params: { path?: string[] } }) {
  return handle(req, ctx);
}

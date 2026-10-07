import { handle } from '../../server/core.js';

export const config = { path: '/api/analyze' };

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const body = await req.json().catch(() => ({}));
  const { status, json } = await handle({ password: req.headers.get('x-app-password'), body });
  return Response.json(json, { status });
};

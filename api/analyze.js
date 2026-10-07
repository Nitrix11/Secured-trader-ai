import { handle } from '../server/core.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { status, json } = await handle({ password: req.headers['x-app-password'], body: req.body });
  res.status(status).json(json);
}

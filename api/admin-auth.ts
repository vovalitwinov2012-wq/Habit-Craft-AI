import type { VercelRequest, VercelResponse } from '@vercel/node';
const ADMIN_SECRET = process.env.ADMIN_SECRET;
export default function handler(req: VercelRequest, res: VercelResponse) {
  const key = req.headers['x-admin-secret'] || null;
  if (!ADMIN_SECRET || key !== ADMIN_SECRET) return res.status(401).json({ ok:false });
  return res.status(200).json({ ok: true });
}

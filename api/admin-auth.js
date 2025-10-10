module.exports = (req,res)=>{
  const ADMIN = process.env.ADMIN_SECRET;
  const key = req.headers['x-admin-secret'] || null;
  if(!ADMIN || key !== ADMIN) return res.status(401).json({ ok:false });
  res.json({ ok:true });
}

module.exports = (req, res) => {
  res.send(req.headers['x-vercel-forwarded-for'] || req.headers['x-real-ip'] || req.ip);
}
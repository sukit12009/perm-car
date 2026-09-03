module.exports = async function handler(req, res) {
  const target = process.env.GOOGLE_SCRIPT_URL;

  if (!target) {
    return res.status(500).json({ ok: false, error: 'ยังไม่ได้ตั้งค่า GOOGLE_SCRIPT_URL' });
  }

  try {
    const incomingUrl = new URL(req.url || '/', 'https://vercel.local');
    const method = (req.method || 'GET').toUpperCase();
    const response = await fetch(`${target}${incomingUrl.search}`, {
      method,
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: method === 'GET' || method === 'HEAD'
        ? undefined
        : typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {})
    });

    const body = await response.text();
    res.status(response.status);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.send(body);
  } catch (error) {
    console.error(error);
    return res.status(502).json({ ok: false, error: 'เชื่อมต่อ Google Apps Script ไม่สำเร็จ' });
  }
};

export default async function handler(req: any, res: any) {
  const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL;
  if (!googleScriptUrl) {
    return res.status(500).json({ ok: false, error: 'ยังไม่ได้ตั้งค่า GOOGLE_SCRIPT_URL' });
  }

  try {
    // ใช้ query string จาก request โดยตรง รองรับทั้ง Vercel Node runtime และ local proxy
    const incoming = new URL(req.url || '/', 'https://vercel.local');
    const url = `${googleScriptUrl}${incoming.search}`;
    const method = String(req.method || 'GET').toUpperCase();
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: method === 'GET' || method === 'HEAD' ? undefined : typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {})
    });

    const text = await response.text();
    res.status(response.status).setHeader('Content-Type', 'application/json; charset=utf-8').send(text);
  } catch (error) {
    console.error('Google Apps Script proxy error:', error);
    res.status(502).json({ ok: false, error: 'เชื่อมต่อ Google Apps Script ไม่สำเร็จ' });
  }
}

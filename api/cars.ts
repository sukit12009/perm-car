const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL;

export default async function handler(req: any, res: any) {
  if (!googleScriptUrl) {
    return res.status(500).json({ ok: false, error: 'ยังไม่ได้ตั้งค่า GOOGLE_SCRIPT_URL' });
  }

  try {
    const query = new URLSearchParams(req.query as Record<string, string>).toString();
    const url = `${googleScriptUrl}${query ? `?${query}` : ''}`;
    const response = await fetch(url, {
      method: req.method,
      headers: { 'Content-Type': req.headers['content-type'] || 'text/plain;charset=utf-8' },
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : JSON.stringify(req.body)
    });

    const text = await response.text();
    res.status(response.status).setHeader('Content-Type', 'application/json; charset=utf-8').send(text);
  } catch {
    res.status(502).json({ ok: false, error: 'เชื่อมต่อ Google Apps Script ไม่สำเร็จ' });
  }
}

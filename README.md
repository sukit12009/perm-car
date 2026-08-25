# Vehicle Registration Search System

## Run locally

ต้องติดตั้ง Node.js 18+ ก่อน จากนั้นรัน:

```bash
npm install
npm run dev
```

หน้าเว็บมีข้อมูลตัวอย่างสำหรับทดสอบ Search, Detail, Add และ Edit ทันที โดยยังไม่เก็บข้อมูลถาวรเมื่อ refresh หน้า

## Google Apps Script

1. สร้าง Google Sheet และตั้งชื่อชีตเป็น `ข้อมูลรถ` (หรือแก้ `SHEET_NAME` ใน `apps-script/Code.gs`)
2. เปิด Extensions > Apps Script แล้ววางโค้ดจาก `apps-script/Code.gs`
3. Deploy เป็น Web app และกำหนด access ตามนโยบายขององค์กร
4. เชื่อม URL ของ Web app เข้ากับ frontend ก่อนใช้งาน production

API รองรับ `GET ?action=search&q=73`, `GET ?action=detail&id=...` และ POST actions `create`, `update` ตามสเปก

const SHEET_NAME = 'ข้อมูลรถ';
const HEADERS = ['id','ประทับเวลา','คำนำหน้า','ชื่อ-นามสกุล','หมายเลขโทรศัพท์','กลุ่มสาระการเรียนรู้','หน่วยงาน/ศูนย์','หมายเลขทะเบียนรถ','ยี่ห้อ/รุ่น','ประเภทรถ','สีรถ','NO.'];
function doGet(e){return json(route(e.parameter.action||'search',e.parameter));}
function doPost(e){const body=JSON.parse(e.postData.contents||'{}');return json(route(body.action,body));}
function route(action,p){if(action==='search')return search(p.keyword||p.q||'');if(action==='detail')return detail(p.id);if(action==='create')return create(p.data);if(action==='update')return update(p.id,p.data);throw Error('Unknown action');}
function sheet_(){const s=SpreadsheetApp.getActive().getSheetByName(SHEET_NAME)||SpreadsheetApp.getActive().getSheets()[0];if(s.getLastRow()===0)s.appendRow(HEADERS);return s;}
function normalize_(v){return String(v||'').toLowerCase().trim().replace(/[\\s-]/g,'');}
function rows_(){const s=sheet_(), values=s.getDataRange().getValues();return values.slice(1).map(r=>Object.fromEntries(HEADERS.map((h,i)=>[h,r[i]||''])));}
function search(keyword){const q=normalize_(keyword);return {ok:true,data:rows_().filter(r=>!q||Object.values(r).some(v=>normalize_(v).includes(q)))};}
function detail(id){return {ok:true,data:rows_().find(r=>r.id===id)||null};}
function create(data){if(!data.name||!data.plate)throw Error('กรุณากรอกชื่อและทะเบียนรถ');if(rows_().some(r=>normalize_(r['หมายเลขทะเบียนรถ'])===normalize_(data.plate)))throw Error('ทะเบียนรถซ้ำ');const id='CAR-'+Utilities.getUuid().slice(0,8).toUpperCase();sheet_().appendRow([id,new Date(),data.prefix,data.name,data.phone,data.department,data.unit,data.plate,data.model,data.type,data.color,data.no]);return detail(id);}
function update(id,data){const s=sheet_(), values=s.getDataRange().getValues(), i=values.findIndex(r=>r[0]===id);if(i<1)throw Error('ไม่พบข้อมูล');s.getRange(i+1,3,1,10).setValues([[data.prefix,data.name,data.phone,data.department,data.unit,data.plate,data.model,data.type,data.color,data.no]]);return detail(id);}
function json(data){return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);}

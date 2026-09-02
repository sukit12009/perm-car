const SHEET_NAME = 'ข้อมูลรถ';
const HEADERS = ['id','ประทับเวลา','คำนำหน้า','ชื่อ-นามสกุล','หมายเลขโทรศัพท์','กลุ่มสาระการเรียนรู้','หน่วยงาน/ศูนย์','หมายเลขทะเบียนรถ','ยี่ห้อ/รุ่น','ประเภทรถ','สีรถ','NO.'];
function doGet(e){return json(route(e.parameter.action||'search',e.parameter));}
function doPost(e){const body=JSON.parse(e.postData.contents||'{}');return json(route(body.action,body));}
function route(action,p){if(action==='search')return search(p.keyword||p.q||'');if(action==='detail')return detail(p.id);if(action==='create')return create(p.data);if(action==='update')return update(p.id,Object.assign({},p.data,{match:p.match}));throw Error('Unknown action');}
function sheet_(){const s=SpreadsheetApp.getActive().getSheetByName(SHEET_NAME)||SpreadsheetApp.getActive().getSheets()[0];if(s.getLastRow()===0)s.appendRow(HEADERS);return s;}
function normalize_(v){return String(v||'').toLowerCase().trim().replace(/[\s-]/g,'');}
function phoneEqual_(a,b){
  const x=String(a||'').replace(/\D/g,''), y=String(b||'').replace(/\D/g,'');
  return x===y || (x.length>=9 && y.length>=9 && x.slice(-9)===y.slice(-9));
}
function phoneValue_(v){
  const phone=String(v||'').trim();
  return /^\d{9}$/.test(phone) ? '0'+phone : phone;
}
function timestampValue_(v){
  const date=v instanceof Date ? v : (v ? new Date(v) : new Date());
  return Utilities.formatDate(date,'Asia/Bangkok','d/M/yyyy, HH:mm:ss');
}
// อย่าอิงตำแหน่งคอลัมน์ เพราะ Google Sheet อาจมี "ประทับเวลา" เป็นคอลัมน์แรก
// ให้อิงจากชื่อหัวตารางจริงแทน ป้องกันคำนำหน้าถูกอ่านเป็นประทับเวลา
function columnMap_(s){
  const actual=s.getRange(1,1,1,s.getLastColumn()).getDisplayValues()[0];
  const map=Object.fromEntries(actual.map((h,i)=>[String(h).trim(),i]));
  // รองรับหัวตารางทั้ง "กลุ่มสาระการเรียนรู้" และ
  // "กลุ่มสาระการเรียนรู้(สำหรับอาจารย์)"
  let staffUnitColumn;
  actual.forEach((h,i)=>{
    const key=String(h).replace(/[\s()]/g,'');
    if(key.startsWith('กลุ่มสาระการเรียนรู้'))map['กลุ่มสาระการเรียนรู้']=i;
    if(key.startsWith('หน่วยงาน/ศูนย์')){
      map['หน่วยงาน/ศูนย์']=i;
      if(key.includes('สำหรับเจ้าหน้าที่'))staffUnitColumn=i;
    }
  });
  // หากมีทั้งสองคอลัมน์ ให้ใช้คอลัมน์สำหรับเจ้าหน้าที่เป็นค่า unit
  if(staffUnitColumn!==undefined)map['หน่วยงาน/ศูนย์']=staffUnitColumn;
  return map;
}
function rows_(){
  const s=sheet_(), values=s.getDataRange().getValues(), map=columnMap_(s);
  return values.slice(1).map(r=>Object.fromEntries(HEADERS.map(h=>{
    const i=map[h];
    return [h, i===undefined ? '' : (h==='หมายเลขโทรศัพท์' ? phoneValue_(r[i]) : h==='ประทับเวลา' ? timestampValue_(r[i]) : (r[i] ?? ''))];
  })));
}
function search(keyword){const q=normalize_(keyword);return {ok:true,data:rows_().filter(r=>!q||Object.values(r).some(v=>normalize_(v).includes(q)))};}
function detail(id){return {ok:true,data:rows_().find(r=>r.id===id)||null};}
function recordValues_(data,id){return {'id':id,'ประทับเวลา':timestampValue_(data.timestamp),'คำนำหน้า':data.prefix,'ชื่อ-นามสกุล':data.name,'หมายเลขโทรศัพท์':phoneValue_(data.phone),'กลุ่มสาระการเรียนรู้':data.department,'หน่วยงาน/ศูนย์':data.unit,'หมายเลขทะเบียนรถ':data.plate,'ยี่ห้อ/รุ่น':data.model,'ประเภทรถ':data.type,'สีรถ':data.color,'NO.':data.no};}
function writeRecord_(s,row,data,id){
  const map=columnMap_(s), current=s.getRange(row,1,1,s.getLastColumn()).getValues()[0], values=recordValues_(data,id);
  Object.keys(values).forEach(h=>{if(map[h]!==undefined)current[map[h]]=values[h];});
  // บังคับเบอร์โทรศัพท์เป็นข้อความ เพื่อไม่ให้ Google Sheets ตัดเลข 0 ด้านหน้า
  if(map['หมายเลขโทรศัพท์']!==undefined)s.getRange(row,map['หมายเลขโทรศัพท์']+1).setNumberFormat('@');
  s.getRange(row,1,1,s.getLastColumn()).setValues([current]);
}
function create(data){
  if(!data.name||!data.plate)throw Error('กรุณากรอกชื่อและทะเบียนรถ');
  if(rows_().some(r=>normalize_(r['หมายเลขทะเบียนรถ'])===normalize_(data.plate)))throw Error('ทะเบียนรถซ้ำ');
  const s=sheet_(), id='CAR-'+Utilities.getUuid().slice(0,8).toUpperCase();
  s.appendRow(new Array(s.getLastColumn()).fill(''));
  writeRecord_(s,s.getLastRow(),data,id);
  return detail(id);
}
function update(id,data){
  const s=sheet_(), values=s.getDataRange().getValues(), map=columnMap_(s);
  const idCol=map['id'], nameCol=map['ชื่อ-นามสกุล'], phoneCol=map['หมายเลขโทรศัพท์'], plateCol=map['หมายเลขทะเบียนรถ'];
  const match=data.match||{};
  const i=values.findIndex((r,n)=>n>0 && ((id && idCol!==undefined && String(r[idCol])===String(id)) || (!id && match.name && nameCol!==undefined && String(r[nameCol]).trim()===String(match.name).trim() && (!match.phone || (phoneCol!==undefined && phoneEqual_(r[phoneCol],match.phone)))) || (!id && !match.name && nameCol!==undefined && phoneCol!==undefined && String(r[nameCol]).trim()===String(data.name).trim() && phoneEqual_(r[phoneCol],data.phone)) || (!id && !match.name && plateCol!==undefined && normalize_(r[plateCol])===normalize_(data.plate))));
  if(i<1)throw Error('ไม่พบข้อมูล');
  const actualId=id || (idCol===undefined ? '' : values[i][idCol]);
  writeRecord_(s,i+1,data,actualId);
  return detail(actualId);
}
function json(data){return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);}

import {conditionsFor} from './problem-models.mjs';
import {objectiveOptions,objectiveResult,objectiveWindow} from './problem-objectives.mjs';

const cache=new WeakMap();
const integerUnits=new Set(['lượt','nước','lần','vị trí','quyển','lá','viên','ngăn','phiếu','màu','ghế']);
const discreteIds=new Set([15,22,72,73,78,79]);
const contextual={
  22:'Trên bàn cờ 8 × 8, vua xuất phát ở d4. Mỗi bước đi sang một ô kề cạnh hoặc kề góc. Đếm các đường quay lại d4 sau đúng số nước đã cho.',
  78:'Trên bàn 5 × 5, quân mã đi theo quy tắc lệch một ô và hai ô theo hai phương. Đếm đường đi từ c3 về c3.',
  79:'Ếch xuất phát tại lá A, cần tới E. Các cặp lá nối nhau là AB, AC, BC, BD, CE và DE.',
  80:'Hai tay đua lấy hai vị trí khác nhau một cách ngẫu nhiên trên một vòng tròn. Xét biến cố hai vị trí liền nhau.',
  81:'Một ô có 2 bi đỏ, 6 bi xanh. Sau mỗi lần rút, viên bi quay lại ô. Xét biến cố có ít nhất một lượt rút đỏ.',
  82:'Đặt từng quyển sách độc lập vào một trong bốn ngăn, mỗi ngăn có cơ hội như nhau. Xét biến cố ngăn 1 có sách.',
  84:'Từ bộ 52 lá, chọn ngẫu nhiên một tay bài không hoàn lại. Xét biến cố tay bài có đủ bốn lá Át.',
  85:'Mười bảy bóng đèn hỏng độc lập với cùng xác suất. Xét biến cố có ít nhất một bóng hỏng.',
  86:'Trên bàn có chín viên mang số 1 đến 9. Lấy một nhóm viên không hoàn lại. Xét biến cố nhóm lấy có bi số chẵn.',
  88:'Chọn ba phiếu không hoàn lại từ một hộp 20 phiếu. Xét biến cố có đúng một phiếu trúng.',
  90:'Mỗi đỉnh của một lục giác được tô độc lập, chọn màu đồng xác suất. Xét biến cố mọi cặp đỉnh kề khác màu.',
  91:'Xếp ngẫu nhiên chỗ ngồi quanh một bàn tròn. Xét biến cố hai người A, B ngồi cạnh nhau.'
};
const limits={
  15:{x:[0,24]},22:{x:[0,15]},78:{x:[0,16]},79:{x:[0,20]},
  80:{x:[3,36]},81:{x:[1,12]},82:{x:[1,18]},91:{x:[3,36]},89:{x:[0,100]}
};
const concise=n=>String(Number(n.toPrecision(13)));
const displayNumber=new Intl.NumberFormat('vi-VN',{maximumFractionDigits:8});
const valueUnit=(value,unit)=>displayNumber.format(value)+(unit?' '+unit:'');
const baseState=base=>Object.fromEntries(base.controls.map(c=>[c.key,c.value]));
export const goalOptions=base=>objectiveOptions(base,base.result(baseState(base)));
const storageKey='toan-lab-3d-problems-v1';
const copy=obj=>({...obj});

export function studyProblem(base){
  if(!cache.has(base))cache.set(base,conditionsFor(base));
  return cache.get(base);
}
export function draftFor(base,previous){
  const definition=studyProblem(base);
  return {
    parameters:previous?copy(previous.parameters):Object.fromEntries(base.controls.map(c=>[c.key,c.value])),
    conditions:{...Object.fromEntries(Object.entries(definition?.conditions??{}).map(([key,field])=>[key,field.value])),...previous?.conditions},
    metric:previous?.metric??defaultGoal(base)
  };
}
function defaultGoal(base){
  const readings=base.result(baseState(base));
  if(goalOptions(base).length>readings.length)return readings.length;
  return Math.max(0,readings.findLastIndex(m=>typeof m.value==='number'));
}
function asNumber(raw){
  if(typeof raw==='number')return Number.isFinite(raw)?raw:null;
  const text=String(raw??'').trim();
  if(!/^[+-]?(?:\d+(?:[.,]\d{1,8})?|[.,]\d{1,8})$/.test(text))return null;
  const value=Number(text.replace(',','.'));
  return Number.isFinite(value)?value:null;
}
function integerControl(base,field){
  return integerUnits.has(field.unit)||discreteIds.has(base.id)||Boolean(base.discrete?.includes(field.key));
}
function stepFor(control,min,max,value,integer){
  if(integer)return 1;
  const old=control.step;
  const suggestions=[old,(max-min)/200];
  const raw=String(value);
  const decimals=(raw.split('.')[1]??'').length;
  if(decimals)suggestions.push(10**(-decimals));
  const usable=suggestions.filter(n=>n>0);
  return usable.length?Math.max(1e-8,Math.min(...usable)):1;
}
export function controlDomains(base,conditions){
  const domains={...limits[base.id],...studyProblem(base)?.ranges?.(conditions)};
  if(domains.x)domains.x=objectiveWindow(base,conditions,domains.x);
  return domains;
}
export function validateDraft(base,draft){
  const definition=studyProblem(base),conditions={},parameters={},errors={};
  const fields=definition?.conditions??{};
  for(const [key,field] of Object.entries(fields)){
    const value=asNumber(draft.conditions[key]);
    if(value===null||value<field.min-1e-10||value>field.max+1e-10||field.integer&&!Number.isInteger(value)){
      errors['conditions.'+key]='Nhập '+(field.integer?'số nguyên':'số')+' từ '+concise(field.min)+' đến '+concise(field.max)+'.';
    }else conditions[key]=value;
  }
  const relationship=Object.keys(errors).length?'':definition?.validate?.(conditions);
  if(relationship)return {errors,relationship,domains:{}};
  if(Object.keys(errors).length)return {errors,relationship:'',domains:{}};
  const domains=controlDomains(base,conditions);
  for(const field of base.controls){
    const [min,max]=domains[field.key]??[field.min,field.max];
    const value=asNumber(draft.parameters[field.key]);
    const integer=integerControl(base,field);
    if(value===null||value<min-1e-10||value>max+1e-10||integer&&!Number.isInteger(value)){
      errors['parameters.'+field.key]='Nhập '+(integer?'số nguyên':'số')+' từ '+concise(min)+' đến '+concise(max)+'.';
    }else parameters[field.key]=Math.max(min,Math.min(max,value));
  }
  const metric=Number(draft.metric);
  if(!Number.isInteger(metric)||metric<0||metric>=goalOptions(base).length){
    errors.metric='Chọn một đại lượng cần tìm.';
  }
  const data=!Object.keys(errors).length?{conditions,parameters,metric}:null;
  return {data,domains,errors,relationship:''};
}
const conditionalKnowledge={
  20:'Nhân xác suất của từng thứ tự với số cách đặt các lần thành công trước lượt cuối.',
  21:'Mắc nối tiếp cần cả hai linh kiện cùng tốt. Mắc song song hỏng khi tất cả các nhánh đều hỏng.',
  23:'Điểm 29 gồm đúng hai phát 10 và một phát 9. Xác suất đoạt vàng là tổng của các trường hợp điểm số loại trừ nhau.',
  24:'Xác suất có điều kiện lấy giao của hai biến cố chia xác suất của biến cố sau dấu gạch. Mẫu số phải dương.'
};
function buildMetrics(base,definition,state,conditions){
  if(!definition)return base.result(state);
  const template=base.result(Object.fromEntries(base.controls.map(c=>[c.key,c.value])));
  return definition.evaluate(state,conditions).map((value,i)=>{
    const {label,unit}=template[i];
    if(typeof value==='string')return {label,value:null,unit:value};
    if(value===null)return {label,value:null,unit:base.id===12?'Ống nằm ngoài mặt cầu':'Xác suất điều kiện không xác định'};
    return {label,value,unit};
  });
}
export function instantiateProblem(base,custom){
  if(!custom)return base;
  const definition=studyProblem(base),conditions=custom.conditions;
  const domains=controlDomains(base,conditions);
  const controls=base.controls.map(control=>{
    const {key}=control;
    const [min,max]=domains[key]??[control.min,control.max];
    const value=custom.parameters[key];
    const label=key==='x'?({21:'Xác suất linh kiện thứ nhất hoạt động',30:'Khoảng cách chân thang tới chắn'})[base.id]??control.label:control.label;
    const step=stepFor(control,min,max,value,integerControl(base,control));
    return {...control,label,min,max,step,value};
  });
  const result=state=>buildMetrics(base,definition,state,conditions);
  const metrics=result(custom.parameters);
  const objective=objectiveResult(base,controls,result,custom.parameters,conditions,custom.metric,metrics);
  const metric=objective?.answer??metrics[custom.metric];
  const formula=definition?.formulas??base.formula;
  const setupText=['Số liệu của đề',...controls.filter(c=>!objective||c.key!==objective.input.key).map(c=>c.label+' = '+valueUnit(c.value,c.unit))];
  for(const [key,field] of Object.entries(definition?.conditions??{})){
    if(key==='observation'){
      if(conditions[key])setupText.push('Chỉ quan sát '+valueUnit(conditions[key],field.unit)+' đầu tiên.');
    }else setupText.push(field.label+' = '+valueUnit(conditions[key],field.unit));
  }
  const context=definition?.describe??contextual[base.id]??(base.approvedExpansion?base.prompt:'Xét mô hình '+base.title.toLowerCase()+'.');
  const names={11:'Khoảng cách giữa hai máy bay',22:'Đường đi của quân vua',76:'Rút bi từ hộp '+conditions.total+' viên',85:'Dãy bóng đèn'};
  const condition=objective?.domain;
  const range=condition?'Với '+objective.input.label.toLowerCase()+
    (Number.isFinite(condition.max)?(condition.openMin?' dương và không vượt quá ':' từ '+valueUnit(condition.min,objective.input.unit)+' đến ')+valueUnit(condition.max,objective.input.unit):
      condition.openMin?' dương':' không âm')+', hãy xác định ':'Với bộ số liệu này, hãy xác định ';
  const question=range.trimStart()+metric.label.toLowerCase()+'.';
  const answer=metric.value===null?metric.unit:valueUnit(metric.value,metric.unit);
  const practice={
    question:question+' Dùng đúng các thông số ghi trong đề tùy chỉnh.',
    answer:metric.value,unit:metric.value===null?'':metric.unit,
    explanation:metric.label+' = '+answer+'.',
    tolerance:metric.value===null?.01:Math.max(.005,Math.abs(metric.value)*1e-6)
  };
  const steps=[
    {title:'Đọc số liệu',text:setupText.slice(1).join(' · ')+'.'},
    {title:'Lập công thức',text:formula.join('  |  ')}
  ];
  if(objective){
    steps.push({title:'Tìm ứng viên và so sánh',text:objective.reason+' '+objective.comparisons.map(({value,reading})=>
      'Tại '+valueUnit(value,objective.input.unit)+', '+reading.label.toLowerCase()+' bằng '+valueUnit(reading.value,reading.unit)).join('. ')+'.'});
  }else{
    steps.push({title:'Thay số',text:metrics.map(reading=>reading.label+' = '+(reading.value===null?reading.unit:valueUnit(reading.value,reading.unit))).join(' · ')+'.'});
  }
  steps.push({title:'Trả lời',text:metric.label+' — '+answer+'.'});
  const focusParameter=objective?.best.value??null,focusMetric=objective?.index??null;
  const extraReference=definition?.conditions.axial||definition?.conditions.scale?base.prompt:'';
  return {...base,title:names[base.id]??base.title,base,custom,conditions,controls,result,formula,steps,practice,focusParameter,focusMetric,
    scene:definition?.scene?x=>definition.scene(x,conditions):base.scene,
    knowledge:conditionalKnowledge[base.id]??base.knowledge,
    sample:base.sample,
    prompt:context,
    problemData:setupText.slice(1),
    problemQuestion:question,
    referenceProblem:extraReference
  };
}

export function readCustomProblems(lessons){
  try{
    const raw=JSON.parse(localStorage.getItem(storageKey)??'{}');
    if(!raw||typeof raw!=='object')return new Map();
    return new Map(lessons.flatMap(base=>{
      const item=raw[base.id];
      if(!item?.parameters||!item.conditions)return [];
      const {data}=validateDraft(base,draftFor(base,item));
      return data?[[base.id,data]]:[];
    }));
  }catch{return new Map();}
}
export function persistCustomProblems(problems){
  try{localStorage.setItem(storageKey,JSON.stringify(Object.fromEntries(problems)));return true;}
  catch{return false;}
}

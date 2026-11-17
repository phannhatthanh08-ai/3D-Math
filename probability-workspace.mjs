import {fmt} from './lessons.mjs';
import {walkOptions,walkPlace,walkStart,walkTarget} from './probability-lab.mjs';

const get=id=>document.getElementById(id);
const formatter=new Intl.NumberFormat('vi-VN',{maximumFractionDigits:4});
export const percent=value=>value===null?'—':formatter.format(value)+'%';

function element(tag,text,className){
  const node=document.createElement(tag);
  if(text!==undefined)node.textContent=text;
  if(className)node.className=className;
  return node;
}

function entries(list,values){
  list.replaceChildren(...values.map(([label,value])=>{
    const row=element('div');
    row.append(element('dt',label),element('dd',value));
    return row;
  }));
}

export function renderResults(lesson,stats,distribution,frequencies,lastCategory,scope){
  const {theory,conditional,trials,qualified,observed,event}=stats;
  const sample=conditional?qualified:trials;
  const eventRate=sample?percent(100*observed/sample)+' ('+fmt(observed)+'/'+fmt(sample)+')':'—';
  entries(get('prob-compare'),[
    ['Xác suất lý thuyết',percent(theory.value)],
    ['Tần suất của biến cố',eventRate],
    ['Tổng lượt thử',fmt(trials)],
    ['Tử số · Lượt đạt biến cố',fmt(observed)],
    ['Mẫu số · '+(conditional?'Lượt '+event.condition:'Tổng lượt thử'),fmt(sample)],
  ]);
  get('prob-empty').hidden=trials>0;
  get('prob-scope').hidden=!conditional;
  get('prob-qualified').textContent='Chỉ lượt '+(event.condition||'thỏa điều kiện');
  for(const button of get('prob-scope').querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.scope===scope));
  const subset=conditional&&scope==='qualified';
  const count=subset?qualified:trials;
  const weights=distribution.rows;
  const included=event.denominator??weights.map((_,i)=>i);
  const total=subset?included.reduce((sum,i)=>sum+weights[i][1],0):1;
  const note=subset?(total?'Tần suất được tính trên '+fmt(count)+' lượt thỏa điều kiện.':'Biến cố điều kiện có xác suất bằng 0.'):
    conditional?'Viền vàng đánh dấu các nhóm thuộc mẫu số. Chấm xanh đánh dấu các nhóm thuộc tử số.':'Mỗi hàng là một nhóm kết quả của cùng một lượt thử.';
  get('prob-distribution-note').textContent=note;
  get('prob-bars').replaceChildren(...weights.flatMap(([label,weight],i)=>{
    if(subset&&!included.includes(i))return [];
    const n=frequencies[i],seen=count?n/count:null;
    const expected=total?weight/total:null;
    const row=element('div',undefined,'prob-bar-row');
    if(i===lastCategory)row.dataset.recent='true';
    if(conditional&&included.includes(i))row.dataset.condition='true';
    if(event.numerator?.includes(i))row.dataset.numerator='true';
    const heading=element('div',undefined,'prob-bar-label');
    const name=element('strong',label);
    const values=element('span',percent(seen===null?null:100*seen)+(count?' ('+fmt(n)+')':'')+' · '+percent(expected===null?null:100*expected));
    values.setAttribute('aria-label','Thực nghiệm '+percent(seen===null?null:100*seen)+'. Lý thuyết '+percent(expected===null?null:100*expected));
    heading.append(name,values);
    const track=element('div',undefined,'prob-bar-track');
    track.setAttribute('aria-hidden','true');
    if(seen!==null)track.style.setProperty('--observed',100*seen+'%');
    if(expected!==null)track.style.setProperty('--expected',100*expected+'%');
    track.append(element('span'));
    if(expected!==null)track.append(element('i'));
    row.append(heading,track);
    return row;
  }));
}

export function renderWalkMap(id,stages,step,selection){
  const counts=stages[step],target=walkTarget(id),start=walkStart(id);
  const range=get('walk-map-range');
  range.max=stages.length-1;range.value=step;
  get('walk-map-step').value=String(step);
  const cells=get('walk-map-cells');
  const width=id===79?5:Math.sqrt(counts.length);
  cells.style.setProperty('--map-columns',width);
  const max=Math.max(1,...counts);
  cells.replaceChildren(...counts.map((n,i)=>{
    const button=element('button',undefined,'walk-cell');
    button.type='button';button.dataset.place=i;
    button.style.setProperty('--cell-strength',Math.sqrt(n/max).toFixed(3));
    button.setAttribute('aria-pressed',String(selection===i));
    if(i===target)button.dataset.target='';
    button.append(element('small',walkPlace(id,i)),element('strong',fmt(n)));
    return button;
  }));
  const label=walkPlace(id,selection);
  const previous=step?walkOptions(id,selection).map(i=>fmt(stages[step-1][i])):[];
  get('walk-map-equation').textContent=step?
    label+' · '+fmt(counts[selection])+' = '+previous.join(' + ')+' đường từ các vị trí nối tới ở bước '+(step-1)+'.':
    label+' · '+fmt(counts[selection])+' đường. Ở bước 0 chỉ có vị trí xuất phát '+walkPlace(id,start)+'.';
}

export function renderComparison(lesson,baseline,current){
  const delta=get('prob-ab-delta');
  const value=stats=>stats.theory.value===null?'Không xác định':stats.theory.unit==='%'?percent(stats.theory.value):fmt(stats.theory.value)+' '+stats.theory.unit;
  const cards=[['A · Đã lưu',baseline],['B · Hiện tại',current]].map(([label,stats])=>{
    const card=element('section',undefined,'prob-ab-card');
    card.append(element('h3',label));
    if(!stats){card.append(element('p','Chưa lưu cấu hình.'));return card;}
    const list=element('dl');
    const sample=stats.conditional?stats.qualified:stats.trials;
    entries(list,[
      ...lesson.controls.map(({key,label,unit})=>[label,fmt(stats.settings[key])+' '+unit]),
      [stats.theory.label,value(stats)],
      ...(stats.trials?[
        ['Lượt thử',fmt(stats.trials)],
        ['Thực nghiệm',sample?percent(100*stats.observed/sample)+' ('+fmt(stats.observed)+'/'+fmt(sample)+')':'Chưa có lượt thỏa điều kiện']
      ]:[])
    ]);
    card.append(list);
    return card;
  });
  get('prob-ab-cards').replaceChildren(...cards);
  get('prob-ab-save').textContent=baseline?'Lưu B làm A':'Lưu cấu hình A';
  get('prob-ab-load').hidden=!baseline;
  get('prob-ab-clear').hidden=!baseline;
  if(!baseline){delta.textContent='';return;}
  const a=baseline.theory.value,b=current.theory.value;
  delta.textContent=a===null||b===null?'Chênh lệch chưa xác định vì một cấu hình có xác suất điều kiện không xác định.':
    'Chênh lệch lý thuyết B − A  '+(b>a?'+':'')+fmt(b-a)+' '+(current.theory.unit==='%'?'điểm phần trăm':current.theory.unit)+'.';
}

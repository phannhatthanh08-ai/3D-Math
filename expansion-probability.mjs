import {C,M,lesson,block,panel,rod,edge,label,ring,rect,sample,trace,shell,metal,gold,glass,green,cream,ink,red,blue,stone,mix} from './expansion-kit.mjs';

import {hingedDoor,physicalDie} from './expansion-props.mjs';

const P=(...args)=>lesson(4,...args);
const select=(n,rng)=>Math.floor(n*rng());
const seq=n=>Array.from({length:n},(_,i)=>i);
const fmtRate=n=>(100*n).toFixed(2)+'%';
const reading=(condition,yes='Có',no='Không')=>condition?yes:no;
function permutation(n,rng){
  const values=seq(n);
  for(let i=n-1;i>0;i--){
    const j=select(i+1,rng);
    [values[i],values[j]]=[values[j],values[i]];
  }
  return values;
}
const step=(name,result,hit=false)=>[name,result,hit?'match':'neutral'];
const run=(category,success,detail,steps)=>({category,success,view:[],detail,steps});
const distribution=(labels,weights)=>({rows:labels.map((label,i)=>[label,weights[i]]),category:trial=>trial.category});
const event=(label,numerator,denominator)=>()=>({label,numerator,denominator});
const deck=(w=8.8,d=5.4)=>block(0,0,-.17,w,d,.16,stone);
function trialState({probability}){
  return {stage:probability?.step??0,progress:probability?.progress??1,data:probability?.detail};
}
function pedestal(cx,cy,z,color,shape=.22){
  return shell([ring(shape,z,cx,cy,14),ring(shape*.84,z+.07,cx,cy,14),ring(shape*.57,z+.25,cx,cy,14)],color);
}
function packet(x,y,z,color){
  return [block(x,y,z,.62,.48,.28,color),block(x,y,z+.282,.54,.062,.01,cream),block(x,y,z+.282,.095,.407,.013,cream)];
}
// Front-facing instruments share the same cabinet coordinate orientation.
function faceAudience(model){
  const point=([x,y,z])=>[x,-y,z];
  return {...model,blocks:model.blocks.map(b=>({...b,y:-b.y})),
    shells:model.shells?.map(s=>({...s,rings:s.rings.map(r=>r.map(point).reverse())})),
    rods:model.rods?.map(r=>({...r,from:point(r.from),to:point(r.to)})),
    panels:model.panels?.map(p=>({...p,points:p.points.map(point).reverse()})),
    lamps:model.lamps?.map(l=>({...l,at:point(l.at)})),
    surfaceMarks:model.surfaceMarks?.map(l=>({...l,at:point(l.at)})),
    labels:model.labels.map(l=>({...l,at:point(l.at)}))};
}
function lineFrame(points,color){
  return trace(points.concat([points[0]]),color,1.2);
}
function boxOutline(x,y,w,d,z,color){
  return lineFrame(rect(w,d,z,x,y),color);
}
function machine(x,labelText,light){
  return {
    blocks:[block(x,0,0,1.27,1.45,.16,ink),block(x-.49,.23,.15,.2,.84,1.03,metal),block(x+.49,.23,.15,.2,.84,1.03,metal),
      block(x,.24,1.09,1.22,.88,.21,metal),block(x,.02,1.29,.56,.42,.16,ink),block(x,-.206,1.327,.39,.031,.069,light??metal)],
    labels:[label(labelText,[x,-.24,1.62])],rods:[rod([x-.38,.08,1.05],[x+.38,.08,1.05],.019,light??glass)]
  };
}
const posterior=p=>[.9*p/(.9*p+.1*(1-p)),.855*p/(.855*p+.005*(1-p))];
const birth=n=>1-seq(n).reduce((q,i)=>q*(365-i)/365,1);
const gross=[0,0,0,2,2,8];
const failure=(p,q)=>p+(1-p)*q*q;
const rates=x=>[.4+.5*x/100,.8-.5*x/100];
const meeting=(a,b)=>1-((60-a)**2+(60-b)**2)/7200;
const factorial=n=>seq(n).reduce((v,i)=>v*(i+1),1);
const addDieLabel=([x,y,z])=>[x,y,z+.81];
const nonMatch=n=>seq(n+1).reduce((sum,i)=>sum+(i%2?-1:1)/factorial(i),0);
const isPin=digits=>digits.every((v,i)=>i===0||digits[i-1]<v&&!(v%2&&digits[i-1]%2));
const pinData=seq(6).map(n=>{
  if(n<1)return null;
  let good=0,increasing=0;
  for(let mask=1;mask<512;mask++){
    const digits=seq(9).filter(i=>mask&(1<<i)).map(i=>i+1);
    if(digits.length!==n)continue;
    increasing++;good+=Number(isPin(digits));
  }
  return {good,increasing,total:factorial(9)/factorial(9-n)};
});

export const probabilityExpansion=[
P('Hai lần sàng lọc Bayes','Cập nhật qua hai quan sát',
'Tỉ lệ kiện thật sự lỗi là p%. Nếu kiện lỗi, hai máy báo với xác suất 90% và 95%. Nếu kiện đạt, hai tỉ lệ báo nhầm là 10% và 5%. Hai máy độc lập có điều kiện theo trạng thái của kiện.',
C('Tỉ lệ kiện lỗi','%',0,35,.5,5),
({x})=>{const [a,b]=posterior(x/100);return [M('Kiện lỗi khi cả hai máy báo',100*b,'%'),M('Kiện lỗi khi máy 1 báo',100*a,'%')];},
['P(L | ++)=0,855p / [0,855p + 0,005(1 − p)]','P(L | +₁)=0,9p / [0,9p + 0,1(1 − p)]'],
'Nhân các xác suất quan sát trong từng nhóm. Điều kiện độc lập được áp dụng sau khi biết kiện lỗi hay đạt.',
[['Lập hai nhánh','Kiện lỗi có xác suất hai máy cùng báo 0,9×0,95, kiện đạt có 0,1×0,05.'],['Chia theo các lượt đủ điều kiện','Trong nhóm hai máy cùng báo, lấy phần kiện lỗi thật chia tổng.']],
(s,options)=>{
  const {stage,progress,data}=trialState(options),actual=stage>=4&&progress>=.94;
  const scanned=i=>data&&(stage>i+1||stage===i+1&&progress>=.86);
  const m1=machine(-1.65,'Máy 1',scanned(1)?(data.a?red:green):metal);
  const m2=machine(1.4,'Máy 2',scanned(2)?(data.b?red:green):metal);
  const positions=[-3.87,-3.55,-1.65,1.4,3.52];
  const travel=progress*progress*(3-2*progress);
  const u=mix([positions[Math.max(0,stage-1)],-.2,.19],[positions[stage],-.2,.19],travel);
  return faceAudience({blocks:[deck(),block(0,-.18,0,7.8,1,.19,ink),...m1.blocks,...m2.blocks,...packet(...u,actual?(data?.defect?red:green):gold)],
    rods:[...m1.rods,...m2.rods,...sample(-3.7,3.7,18,x=>rod([x,-.65,.202],[x,.31,.202],.024,metal))],
    lamps:[scanned(1)&&{at:[-1.65,-.23,1.36],r:.25,color:data.a?'#e87964':'#a0d09d'},
      scanned(2)&&{at:[1.4,-.23,1.36],r:.25,color:data.b?'#e87964':'#a0d09d'}].filter(Boolean),
    labels:[...m1.labels,...m2.labels]});
},{attempt:({x},rng=Math.random)=>{
  const defect=rng()<x/100,a=rng()<(defect?.9:.1),b=rng()<(defect?.95:.05),category=a&&b?Number(!defect):2;
  return run(category,category===0,{defect,a,b},[step('Đưa kiện vào','Chờ xét'),step('Máy 1',reading(a,'Báo lỗi','Qua')),step('Máy 2',reading(b,'Báo lỗi','Qua')),step('Mở kết quả thật',reading(defect,'Có lỗi','Đạt'),category===0)]);
},distribution:({x})=>{const a=.855*x/100,b=.005*(1-x/100);return distribution(['Lỗi · Hai máy báo','Đạt · Hai máy báo','Có máy không báo'],[a,b,1-a-b]);},
event:event('Kiện lỗi trong nhóm cả hai máy báo.',[0],[0,1]),experimentMetric:0,
practice:[{changes:{x:5},index:0},{changes:{x:5},index:1}]}),
P('Trùng sinh nhật trong nhóm','Biến cố đối và va chạm bất kỳ',
'Chọn n người, giả sử ngày sinh độc lập và đều trên 365 ngày. Tính xác suất có ít nhất hai người trùng ngày sinh.',
C('Số người','người',2,45,1,23),
({x})=>[M('Xác suất có ngày trùng',100*birth(x),'%'),M('Xác suất mọi ngày khác nhau',100*(1-birth(x)),'%')],
['P(trùng) = 1 − ∏ₖ₌₀ⁿ⁻¹ (365 − k)/365'],
'Phủ định của ít nhất một cặp trùng là mọi người có ngày khác nhau.',
[['Nhân xác suất tránh trùng','Người thứ k+1 còn 365−k ngày có thể dùng nếu k người trước đều khác nhau.'],['Lấy phần bù','Nhóm 23 người cho xác suất khoảng 50,73%.']],
({x},options)=>{
  const {stage,progress,data}=trialState(options),revealed=Math.max(0,stage-Number(progress<.57));
  const days=data?.days.slice(0,revealed)??[],cols=Math.min(9,x);
  const counts=days.reduce((m,v)=>(m.set(v,(m.get(v)??0)+1),m),new Map());
  const blocks=[{...deck(8.5,6.1),finish:'wood'}],surfaceMarks=[];
  for(let i=0;i<x;i++){
    const row=Math.floor(i/cols),n=Math.min(cols,x-row*cols);
    const cx=(i%cols-(n-1)/2)*.86,cy=-(row-(Math.ceil(x/cols)-1)/2)*.93;
    const day=days[i],dupe=counts.get(day)>1,z=i===stage-1?.23*Math.sin(Math.PI*progress):0;
    blocks.push({...block(cx,cy,z,.73,.72,.127,day?dupe?'#b66d51':'#397e78':'#496160'),finish:'enamel'});
    surfaceMarks.push(label(day?String(day):'·',[cx,cy,z+.147],dupe?'#fff0be':'#e7f4e6'));
  }
  return {blocks,surfaceMarks,labels:[label('Ngày sinh · 1 đến 365',[0,2.64,.19])]};
},{discrete:['x'],attempt:({x},rng=Math.random)=>{
  const days=seq(x).map(()=>1+select(365,rng));
  const success=new Set(days).size<x;
  return run(Number(!success),success,{days},days.map((v,i)=>step('Người '+(i+1),'Ngày '+v,days.slice(0,i).includes(v))));
},distribution:({x})=>distribution(['Có ngày trùng','Tất cả khác nhau'],[birth(x),1-birth(x)]),
event:event('Ít nhất hai người trùng ngày sinh.',[0]),experimentMetric:0}),
P('Tiền thưởng qua một lần gieo xúc xắc','Kỳ vọng và độ phân tán',
'Một xúc xắc đều cho tiền thưởng 0 ở mặt 1, 2, 3, thưởng 2 ở mặt 4, 5 và thưởng 8 ở mặt 6. Trừ phí tham gia f nghìn đồng để được lãi ròng.',
C('Phí mỗi lượt','nghìn đồng',0,8,.25,2),
({x})=>[M('Kỳ vọng lãi ròng',2-x,'nghìn đồng'),M('Phương sai lãi ròng',8,'(nghìn đồng)²'),M('Xác suất có lãi',100*gross.filter(v=>v>x).length/6,'%')],
['E(X) = (0+0+0+2+2+8)/6 − f = 2 − f','Var(X) = (0+0+0+4+4+64)/6 − 2² = 8'],
'Phí cố định dời mọi mức lãi ròng cùng một lượng, nên phương sai giữ nguyên.',
[['Tính trung bình','Lấy mỗi mặt với xác suất 1/6 và trừ phí.'],['Tính độ phân tán','Lấy kỳ vọng bình phương trừ bình phương kỳ vọng của tiền thưởng gộp.']],
({x},options)=>{
  const {stage,progress,data}=trialState(options);
  const face=stage>0?data?.face:null,marker=stage>1||progress===1?face:null;
  const die=physicalDie(stage===1?progress:stage>1?1:0,(face??0)+1);
  return {panels:die.panels,blocks:[deck(),...gross.flatMap((p,i)=>packet((i-2.5)*1.21,.87,0,marker===i?gold:blue))],
    shells:[...die.shells,...gross.map((v,i)=>shell([ring(.25,.26,(i-2.5)*1.21,.87),ring(.25,.27+.13*v,(i-2.5)*1.21,.87)],marker===i?gold:metal))],
    surfaceMarks:gross.map((_,i)=>label(String(i+1),[(i-2.5)*1.21,1.34,.16],cream)),
    labels:[...gross.map((v,i)=>label(String(v),[(i-2.5)*1.21,.87,.53+.13*v])),label('Xúc xắc',addDieLabel(die.at)),
      ...(stage===2&&data&&progress>=.69?[label('Lãi ròng '+data.net+' nghìn',[0,-1.86,.46])]:[])]};
},{attempt:({x},rng=Math.random)=>{
  const face=select(6,rng),net=gross[face]-x,category=net>0?0:net===0?1:2;
  return run(category,net>0,{face,net},[step('Gieo xúc xắc','Mặt '+(face+1)),step('Trừ phí','Lãi ròng '+net+' nghìn',net>0)]);
},distribution:({x})=>distribution(['Có lãi','Hòa vốn','Bị lỗ'],[gross.filter(v=>v>x).length/6,gross.filter(v=>v===x).length/6,gross.filter(v=>v<x).length/6]),
event:event('Lãi ròng dương.',[0]),experimentMetric:2}),
P('Hai thiết bị cùng hỏng vì chung nguồn','Phụ thuộc do một nguyên nhân chung',
'Hai thiết bị dùng chung nguồn có xác suất mất điện q%. Nếu còn điện, mỗi thiết bị tự hỏng với xác suất r% và hai lỗi riêng độc lập. Tính xác suất cả hai không hoạt động.',
[C('Nguy cơ mất nguồn q','%',0,60,1,10),C('Lỗi riêng khi còn điện r','%',0,50,1,20,'r')],
({x,r})=>[M('Xác suất cả hai dừng',100*failure(x/100,r/100),'%'),M('Tích hai xác suất dừng riêng',100*(x/100+(1-x/100)*r/100)**2,'%')],
['P(cả hai) = q + (1 − q)r²'],
'Nguồn mất làm cả hai dừng cùng lúc. Chỉ nhân r·r ở nhánh còn điện.',
[['Chia theo nguồn','Nguồn mất thì chắc chắn hai thiết bị dừng.'],['Tính nhánh còn điện','Lấy (1−q)·r² rồi cộng q.']],
(s,options)=>{
  const {stage,progress,data}=trialState(options);
  const on=stage===0||stage===1&&progress<.55?null:!data.out;
  const branches=[-2.46,2.46];
  const lamps=branches.map((x,i)=>{
    const tested=stage>i+2||stage===i+2&&progress>=.60;
    const color=on===false?'#d47159':tested?(data.failed[i]?'#d47159':'#98dfac'):null;
    return {at:[x,-1.59,.48],r:.29,color};
  });
  return faceAudience({
    blocks:[{...deck(8,5.0),finish:'wood'},block(0,1.3,0,2,1,.86,ink),
      block(0,1.25,.86,1.39,.67,.18,on===null?metal:on?green:red),
      ...branches.flatMap((x,i)=>[block(x,-.77,0,1.92,1.55,.77,ink),
        block(x,-.77,.78,1.52,1.07,.12,metal),block(x,-1.55,.35,.58,.09,.27,lamps[i].color??'#5a726d'),
        ...[-.48,-.24,0,.24,.48].map(dx=>block(x+dx,-.73,.91,.11,.65,.025,'#4e635f'))])],
    rods:branches.flatMap(x=>[rod([0,.72,.41],[x,.72,.41],.047,on?gold:metal),
      rod([x,.72,.41],[x,-.07,.41],.047,on?gold:metal)]),
    lamps:lamps.filter(l=>l.color),
    labels:[label('Nguồn chung',[0,1.3,1.28]),label('A',[-2.46,-.77,1.06]),label('B',[2.46,-.77,1.06])]
  });
},{attempt:({x,r},rng=Math.random)=>{
  const out=rng()<x/100,failed=[out||rng()<r/100,out||rng()<r/100];
  const category=out?0:failed.every(Boolean)?1:2;
  return run(category,category!==2,{out,failed},[step('Nguồn',reading(out,'Mất điện','Còn điện')),step('Thiết bị A',reading(failed[0],'Dừng','Chạy')),step('Thiết bị B',reading(failed[1],'Dừng','Chạy'),category!==2)]);
},distribution:({x,r})=>{const q=x/100,a=(1-q)*(r/100)**2;return distribution(['Hai máy dừng do nguồn','Hai máy tự hỏng','Còn thiết bị chạy'],[q,a,1-q-a]);},
event:event('Cả hai thiết bị dừng.',[0,1]),experimentMetric:0}),
P('Tỉ lệ đảo chiều khi gộp hai nhóm','Nghịch lý Simpson và trọng số',
'Trong nhóm dễ, A đạt 90% và B đạt 80%. Trong nhóm khó, A đạt 40% và B đạt 30%. Tỉ lệ hồ sơ dễ của A là w%, còn B là 100−w%. So sánh tỷ lệ chung.',
C('Hồ sơ dễ trong phương án A','%',0,100,1,30),
({x})=>{const [a,b]=rates(x);return [M('Tỉ lệ chung của A',100*a,'%'),M('Tỉ lệ chung của B',100*b,'%'),M('Chênh lệch A − B',100*(a-b),'điểm %')];},
['A = 0,40 + 0,50w','B = 0,80 − 0,50w','A < B khi w < 0,40'],
'Mỗi tỷ lệ chung là trung bình có trọng số. A tốt hơn ở cả hai nhóm nhưng có thể nhận nhiều hồ sơ khó hơn.',
[['Đọc hai nhóm','Giữ các tỷ lệ trong nhóm cố định.'],['Tính tỷ lệ chung','Nhân từng tỷ lệ với tỷ lệ hồ sơ tương ứng. Điểm ngang nhau là w=40%.']],
({x},options)=>{
  const {stage,progress,data}=trialState(options),[a,b]=rates(x);
  const blocks=[deck()];
  for(const [row,weights,success] of [[-1.17,[x/100,1-x/100],a],[1.17,[1-x/100,x/100],b]]){
    blocks.push(block(0,row,0,6,.8,.22,ink));
    let start=-3;
    weights.forEach((v,i)=>{
      const w=6*v;
      if(w>0)blocks.push(block(start+w/2,row,.22,w,.77,.17,i?red:glass));
      start+=w;
    });
    blocks.push(block(-3+success*3,row,.405,6*success,.13,.14,gold));
  }
  const labels=[label('A · '+fmtRate(a),[-3.46,-1.17,.58]),label('B · '+fmtRate(b),[-3.46,1.17,.58])];
  const surfaceMarks=[label('Dễ',[-1.52,0,.08],cream),label('Khó',[1.52,0,.08],cream)];
  if(stage&&data){
    const y=data.arm?-1.17:1.17,w=6*(data.arm?x/100:1-x/100);
    const px=data.easy?-3+w/2:w/2;
    const revealed=stage>=2&&(stage>2||progress>=.6);
    const judged=stage>=3&&progress>=.66;
    blocks.push(...packet(revealed?px:0,y,.68+Math.sin(progress*Math.PI)*.31,judged?(data.success?green:red):cream));
    labels.push(label(revealed?data.easy?'Dễ':'Khó':data.arm?'A':'B',[revealed?px:0,y,1.09]));
  }
  return {blocks,labels,surfaceMarks};
},{attempt:({x},rng=Math.random)=>{
  const arm=rng()<.5,easy=rng()<(arm?x/100:1-x/100),success=rng()<(arm?(easy?.9:.4):(easy?.8:.3));
  return run(2*Number(!arm)+Number(!success),success,{arm,easy,success},[step('Phương án',arm?'A':'B'),step('Nhóm hồ sơ',easy?'Dễ':'Khó'),step('Kết quả',reading(success,'Đạt','Trượt'),success)]);
},distribution:({x})=>{const [a,b]=rates(x);return distribution(['A đạt','A trượt','B đạt','B trượt'],[a/2,(1-a)/2,b/2,(1-b)/2]);},
event:event('Hồ sơ đạt khi đã chọn A.',[0],[0,1]),experimentMetric:0}),
P('Ba cánh cửa Monty Hall','Xác suất phụ thuộc luật mở cửa',
'Chọn một trong ba cửa, một cửa có quà. Người dẫn mở một cửa còn lại. Chế độ biết quà luôn mở cửa trống. Chế độ ngẫu nhiên chọn cửa bất kỳ và hủy lượt nếu lộ quà. So sánh giữ và đổi khi lượt tiếp tục.',
[C('Chiến lược: 0 giữ, 1 đổi','',0,1,1,1),C('Luật: 0 biết quà, 1 mở ngẫu nhiên','',0,1,1,0,'h')],
({x,h})=>[M('Xác suất thắng khi trò tiếp tục',h?50:100*(1+x)/3,'%'),M('Xác suất lượt tiếp tục',h?200/3:100,'%')],
['Luật biết quà: P(giữ)=1/3, P(đổi)=2/3','Luật ngẫu nhiên: P(tiếp tục)=2/3, P(thắng | tiếp tục)=1/2'],
'Kết quả phụ thuộc vào việc người dẫn biết cửa có quà hay chọn ngẫu nhiên.',
[['Luật biết quà','Đổi thắng đúng khi lựa chọn ban đầu sai.'],['Luật ngẫu nhiên','Lượt chọn đúng ban đầu luôn sống. Lượt chọn sai chỉ sống một nửa, làm hai nhóm sống có trọng số bằng nhau.']],
({x,h},options)=>{
  const {stage,progress,data}=trialState(options),blocks=[deck(8.6,4.4)],shells=[],rods=[],labels=[];
  for(let i=0;i<3;i++){
    const cx=(i-1)*2.45,isHost=stage>=2&&data?.host===i,isFinal=stage>=4&&i===data?.last;
    const open=isHost?(stage===2?progress:1):isFinal?progress:0;
    const reveal=isHost&&(stage>2||progress>.48)||isFinal&&progress>.48;
    const initial=stage>=1&&i===data?.first,chosen=stage>=3&&i===data?.last;
    const color=chosen?'#bd874f':initial?'#649798':'#917051';
    blocks.push(block(cx,0,0,1.75,1.38,.22,ink),block(cx,.62,.22,1.5,.15,2.12,ink),
      block(cx,.11,2.30,1.73,1,.14,metal));
    for(const s of [-1,1])blocks.push(block(cx+s*.78,.11,.22,.14,.90,2.12,metal));
    const door=hingedDoor(cx,open,color);
    if(reveal&&data?.prize===i)shells.push(pedestal(cx,.016,.24,gold,.32));
    if(reveal&&data?.prize===i)blocks.push(...packet(cx,.016,.34,red));
    shells.push(...door.shells);
    rods.push(...door.rods);
    labels.push(label('Cửa '+(i+1),[cx,-.46,2.6]));
  }
  if(stage>0&&data){
    const index=stage>=3?data.last:data.first;
    if(index>=0)shells.push(pedestal((index-1)*2.45,-1.62,.03,blue,.19));
  }
  return faceAudience({blocks,shells,rods,labels});
},{discrete:['x','h'],attempt:({x,h},rng=Math.random)=>{
  const prize=select(3,rng),first=select(3,rng);
  const choices=seq(3).filter(i=>i!==first&&(h||i!==prize)),host=choices[select(choices.length,rng)],aborted=host===prize;
  const last=aborted?-1:x?3-first-host:first,won=last===prize,category=aborted?2:Number(!won);
  const stages=[step('Chọn cửa','Cửa '+(first+1)),step('Người dẫn mở','Cửa '+(host+1)+(aborted?' · Lộ quà':' · Trống'))];
  if(!aborted)stages.push(step(x?'Đổi cửa':'Giữ cửa','Cửa '+(last+1)),step('Mở cửa đã chọn',reading(won,'Có quà','Trống'),won));
  return run(category,won,{prize,first,host,last},stages);
},distribution:({x,h})=>distribution(['Thắng','Thua','Lộ quà · Hủy lượt'],h?[1/3,1/3,1/3]:[(1+x)/3,(2-x)/3,0]),
event:event('Thắng trong các lượt được tiếp tục.',[0],[0,1]),experimentMetric:0,
practice:[{changes:{x:1,h:0},index:0,question:'Khi người dẫn luôn mở cửa trống, đổi cửa thắng với xác suất bao nhiêu?'},{changes:{x:0,h:1},index:0,question:'Khi người dẫn chọn ngẫu nhiên và lượt chưa bị hủy, giữ cửa thắng với xác suất bao nhiêu?'}]}),
P('Hai người đến điểm hẹn','Xác suất theo tỉ số diện tích',
'A và B đến độc lập, mỗi giờ đến phân bố đều trong 60 phút. A chờ a phút, B chờ b phút. Gặp nhau khi người đến sau kịp tới trước khi người đến trước rời đi.',
[C('Thời gian A chờ','phút',0,60,1,15),C('Thời gian B chờ','phút',0,60,1,15,'b')],
({x,b})=>[M('Xác suất gặp nhau',100*meeting(x,b),'%'),M('Diện tích miền gặp nhau',3600*meeting(x,b),'phút²')],
['−b ≤ t_B − t_A ≤ a','P = 1 − [(60 − a)² + (60 − b)²]/7.200'],
'Diện tích ngoài dải chờ gồm hai tam giác vuông. Cả hai thời điểm đến độc lập làm các điểm trong hình vuông phân bố đều.',
[['Vẽ dải gặp nhau','Tại mỗi cặp giờ đến, tính chênh lệch t_B−t_A.'],['Trừ hai tam giác','Cạnh góc vuông của chúng lần lượt là 60−a và 60−b.']],
({x,b},options)=>{
  const {stage,progress,data}=trialState(options),p=(a,b,z=.19)=>[(a/60-.5)*5.8,(b/60-.5)*5.8,z];
  const polygon=[p(0,0),p(b,0),p(60,60-b),p(60,60),p(60-x,60),p(0,x)];
  const colors=[blue,gold],points=stage>=2&&data?[p(data.a,data.b,.26)]:[];
  const edges=[...boxOutline(0,0,5.8,5.8,.20,cream),...lineFrame(polygon,glass)];
  const surfaceMarks=[];
  for(let minutes=0;minutes<=60;minutes+=15){
    edges.push(edge(p(minutes,0,.205),p(minutes,60,.205),'#adcbc356',.7),
      edge(p(0,minutes,.205),p(60,minutes,.205),'#adcbc356',.7));
    surfaceMarks.push(label(String(minutes),p(minutes,64,.03),cream),label(String(minutes),p(-4,minutes,.03),cream));
  }
  const settled=stage>=2&&data&&(stage>2||progress>=.71);
  if(stage>=1&&data)edges.push(edge(p(data.a,0,.222),p(data.a,stage===1?60*progress:60,.222),gold,1.5));
  if(stage>=2&&data)edges.push(edge(p(0,data.b,.222),p(stage===2?60*progress:60,data.b,.222),blue,1.5));
  return {blocks:[deck(7.3,7.3),block(0,0,0,5.8,5.8,.18,ink)],panels:[panel(polygon,green,.83)],
    edges,dots:settled?points:[],surfaceMarks,
    shells:settled?points.map(([x,y,z])=>pedestal(x,y,z,stage>=3?(data.success?gold:red):glass,.14)):[],
    labels:[label('Giờ A',[0,3.55,.27],colors[1]),label('Giờ B',[-3.54,0,.27],colors[0])]};
},{attempt:({x,b},rng=Math.random)=>{
  const a=60*rng(),timeB=60*rng(),diff=timeB-a,success=diff<=x&&diff>=-b;
  const category=success?0:diff>x?1:2;
  return run(category,success,{a,b:timeB,success},[step('A đến',a.toFixed(1)+' phút'),step('B đến',timeB.toFixed(1)+' phút'),step('Đối chiếu',reading(success,'Gặp nhau','Lỡ hẹn'),success)]);
},distribution:({x,b})=>distribution(['Gặp nhau','B tới quá muộn','A tới quá muộn'],[meeting(x,b),(60-x)**2/7200,(60-b)**2/7200]),
event:event('Hai người gặp nhau.',[0]),experimentMetric:0}),
P('Mã khóa với hai ràng buộc','Đếm điều kiện đồng thời',
'Chọn đều một dãy n chữ số từ 1 đến 9, không lặp. Mã đạt quy tắc khi tăng dần và không có hai chữ số lẻ đứng cạnh nhau.',
C('Độ dài mã','chữ số',2,5,1,5),
({x})=>[M('Xác suất mã đạt quy tắc',100*pinData[x].good/pinData[x].total,'%'),M('Số mã đạt quy tắc',pinData[x].good,'mã')],
['Số dãy có thứ tự = 9!/(9 − n)!','Mỗi tập n chữ số chỉ sinh một dãy tăng','P = số tập tạo mã hợp lệ / [9!/(9 − n)!]'],
'Đếm tập chữ số trước. Sắp xếp tăng dần xác định duy nhất thứ tự, rồi kiểm tra từng cặp lẻ liền kề.',
[['Tính không gian mẫu','Chọn lần lượt n chữ số phân biệt.'],['Lọc mã còn lại','Với n=5 có 62 mã hợp lệ trong 15.120 dãy.']],
({x},options)=>{
  const {stage,progress,data}=trialState(options),visible=Math.max(0,stage-Number(progress<.56));
  const digits=data?.digits.slice(0,visible)??[],blocks=[deck(8.6,4.6),block(0,.16,0,6.8,3.76,.21,ink)];
  const labels=[],edges=[],surfaceMarks=[];
  for(let i=0;i<x;i++){
    const u=(i-(x-1)/2)*1.03, v=digits[i],
      bad=stage>x&&i>0&&(digits[i-1]>=v||digits[i-1]%2&&v%2);
    blocks.push(block(u,.95,.215,.88,1,.15,bad?red:v?blue:metal));
    if(bad)edges.push(edge([u-1.03,.54,.39],[u,.54,.39],red,2.7));
    surfaceMarks.push(label(v?String(v):'·',[u,.95,.397],cream));
  }
  for(let j=0;j<9;j++){
    const key=j+1,a=(j%3-1)*.64,b=-.3-Math.floor(j/3)*.47;
    const pressing=stage>0&&stage<=x&&data?.digits[stage-1]===key&&progress<.75;
    blocks.push(block(a,b,.23,.51,.37,pressing?.055:.10,digits.includes(key)||pressing?gold:metal));
    surfaceMarks.push(label(String(key),[a,b,pressing?.29:.34],'#112a28'));
  }
  return {blocks,labels,edges,surfaceMarks};
},{discrete:['x'],attempt:({x},rng=Math.random)=>{
  const digits=permutation(9,rng).slice(0,x).map(v=>v+1);
  const incr=digits.every((v,i)=>!i||digits[i-1]<v),success=isPin(digits),cat=success?0:incr?1:2;
  return run(cat,success,{digits},digits.map((v,i)=>step('Vị trí '+(i+1),String(v))).concat([step('Kiểm tra',reading(success,'Đạt cả hai quy tắc','Vi phạm quy tắc'),success)]));
},distribution:({x})=>{const {good,increasing,total}=pinData[x];return distribution(['Đạt hai quy tắc','Tăng nhưng kề hai số lẻ','Không tăng'],[good/total,(increasing-good)/total,1-increasing/total]);},
event:event('Mã thỏa đồng thời hai quy tắc.',[0]),experimentMetric:0,
practice:[{changes:{x:5},index:1},{changes:{x:4},index:0}]}),
P('Trả nhầm toàn bộ hành lý','Hoán vị không có điểm cố định',
'Có n người và n kiện hành lý có nhãn chủ. Phát mỗi người đúng một kiện theo một hoán vị ngẫu nhiên đều. Tính xác suất mọi người đều nhận nhầm.',
C('Số người và số kiện','người',1,10,1,4),
({x})=>[M('Xác suất mọi người nhận nhầm',100*nonMatch(x),'%'),M('Số cách phát nhầm hết',Math.round(factorial(x)*nonMatch(x)),'cách')],
['P(không ai đúng) = Σⱼ₌₀ⁿ (−1)ʲ/j!','Dₙ = n!·P(không ai đúng)'],
'Các biến cố nhận đúng có thể cùng xảy ra. Dùng nguyên lý cộng trừ cho giao của các nhóm chủ.',
[['Cố định j người','Giữ đúng j kiện đã chỉ định để còn (n−j)! hoán vị.'],['Cộng trừ theo j','Lấy C(n,j)(n−j)!/n! = 1/j! với dấu xen kẽ.']],
({x},options)=>{
  const {stage,progress,data}=trialState(options),spacing=Math.min(1.2,7.65/x),left=-(x-1)*spacing/2,
    blocks=[deck(9,5.5),block(0,1.1,0,8.1,1.13,.20,ink),block(0,-1.3,0,8.1,1.32,.20,ink)],rods=[],labels=[],surfaceMarks=[];
  for(const y of [-1.3,1.1]){
    rods.push(...sample(-3.93,3.93,24,a=>rod([a,y-.45,.205],[a,y+.45,.205],.023,'#778783')));
    for(const side of [-1,1])rods.push(rod([-4.05,y+side*.54,.22],[4.05,y+side*.54,.22],.04,metal));
  }
  for(let i=0;i<x;i++){
    const cx=left+i*spacing,n=data?.order[i]??i, bagX=left+n*spacing,wasSent=data?.order.slice(0,stage).includes(i);
    const showBag=(u,y,z,v,color)=>{
      blocks.push(block(u,y,z,.58,.48,.31,color),block(u,y,z+.31,.37,.07,.035,ink));
      rods.push(rod([u-.13,y,z+.35],[u+.13,y,z+.35],.028,metal));
      for(const dx of [-.18,.18]){
        rods.push(rod([u+dx,y-.19,z+.015],[u+dx,y+.19,z+.015],.024,'#192626'));
        rods.push(rod([u+dx,y-.19,z+.323],[u+dx,y+.19,z+.323],.013,'#d4d4bb'));
      }
      surfaceMarks.push(label(String(v+1),[u,y,z+.407],cream));
    };
    if(!wasSent)showBag(cx,1.1,.205,i,blue);
    if(stage>i){
      const k=i===stage-1?progress:1;
      showBag(bagX+(cx-bagX)*k,1.10-2.4*k,.205+.54*Math.sin(Math.PI*k),n,k===1&&n===i?red:k===0?blue:gold);
    }
    labels.push(label('Chủ '+(i+1),[cx,-1.87,.43]));
  }
  return {blocks,rods,labels,surfaceMarks};
},{discrete:['x'],attempt:({x},rng=Math.random)=>{
  const order=permutation(x,rng),count=order.filter((v,i)=>v===i).length,success=count===0;
  return run(Math.min(2,count),success,{order},order.map((v,i)=>step('Chủ '+(i+1),'Kiện '+(v+1)+(i===v?' · Đúng':' · Nhầm'),i!==v)));
},distribution:({x})=>{const a=nonMatch(x),b=nonMatch(x-1);return distribution(['Không ai nhận đúng','Đúng một người','Từ hai người nhận đúng'],[a,b,Math.max(0,1-a-b)]);},
event:event('Mọi người đều nhận nhầm kiện.',[0]),experimentMetric:0})
];

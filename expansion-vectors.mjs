import {fmt} from './lessons.mjs';
import {C,M,lesson,block,panel,rod,edge,label,measure,ring,rect,sample,trace,shell,metal,gold,glass,green,stone,cream,ink,red,blue,radians,add,sub,norm,mul} from './expansion-kit.mjs';

import {cabinRoofRibs,quadDrone,solarCells} from './expansion-props.mjs';

const V=(...args)=>lesson(2,...args);
const short=n=>fmt(Number(n.toFixed(2)));
const model=(coords,extra)=>({axes:true,coordinates:Object.entries(coords).map(([text,at])=>label(text,at)),...extra});
const rays=(coords)=>Object.entries(coords).map(([text,at])=>label(text,add(at,[0,0,.25])));
function arrow(a,b,color){
  const d=sub(b,a),l=norm(d);
  if(l<1e-10)return [];
  const scale=Math.min(.23,l*.33),unit=mul(d,1/l),base=sub(b,mul(unit,scale));
  const n=norm([d[0],d[1]])>1e-8?mul([-d[1],d[0],0],.43*scale/Math.hypot(d[0],d[1])):[.43*scale,0,0];
  return [rod(a,b,.032,color),rod(add(base,n),b,.036,color),rod(sub(base,n),b,.036,color)];
}
function roundShell(at,r,color,alpha=.23){
  return shell(sample(-r,r,20,z=>ring(Math.sqrt(Math.max(0,r*r-z*z)),at[2]+z,at[0],at[1],30)),color,alpha);
}
const angleReflect=a=>{
  const t=2*radians(a);
  return [4*Math.cos(t)+3*Math.sin(t),0,3*Math.cos(t)-4*Math.sin(t)];
};
const roofPanel=(x,s)=>[-2,2].flatMap((y,i)=>i?[[x,y,3-s],[0,y,3]]:[[0,y,3],[x,y,3-s]]);
const cutLine=h=>[Math.max(-4,2*h-3),Math.min(4,2*h+3)];
const planeOffset=h=>h*h/2+2;
const project=(p,s)=>add(s,mul(sub(p,s),s[2]/(s[2]-p[2])));
const shadowModel=x=>{
  const z=3*Math.sin(radians(x)),d=3*Math.cos(radians(x)),s=[2,-2,6];
  const panel=[[0,0,0],[4,0,0],[4,d,z],[0,d,z]];
  return {s,panel,shadow:panel.map(p=>project(p,s))};
};
const shadowArea=s=>.5*(4+s[2][0]-s[3][0])*s[2][1];
const radarInterval=({x,h})=>x>5?null:Math.min(6,2*h,Math.sqrt(Math.max(0,25-x*x)));
const balanceVector=x=>[-.5,-.1,(-9-x)/10];

export const vectorExpansion=[
V('Tia sáng phản xạ trên gương xoay','Phản xạ vectơ qua mặt phẳng',
'Tia từ S(−4;0;3) chiếu vào tâm gương O. Gương nghiêng α quanh Oy. Màn hứng thẳng đứng tại x=6. Tính cao độ điểm tia phản xạ tới, lấy âm nếu tia đi dưới mép màn.',
C('Góc nghiêng gương','°',-15,20,.5,0),
({x})=>{const [a,,b]=angleReflect(x);return [M('Cao độ dự đoán trên mặt phẳng màn',6*b/a,'m'),M('Thành phần đứng của vectơ phản xạ',b)];},
['n⃗ = (sin α, 0, cos α)','r⃗ = d⃗ − 2(d⃗·n⃗)n⃗, d⃗ = (4,0,−3)','z_màn = 6r_z/r_x'],
'Trừ hai lần thành phần của vectơ tới theo pháp tuyến. Thành phần song song với gương được giữ lại.',
[['Tính hướng tia','Dùng pháp tuyến đơn vị n⃗ quay theo gương.'],['Giao với mặt phẳng màn','Điểm trên tia là t·r⃗. Lấy t=6/r_x rồi so cao độ với 0.']],
({x})=>{
  const [dx,,dz]=angleReflect(x),o=[0,0,0],s=[-4,0,3],result=[6,0,6*dz/dx];
  const a=radians(x),d=[Math.cos(a)*1.35,0,-Math.sin(a)*1.35],ends=[-1,1].flatMap((k,i)=>i?[-.95,.95].map(y=>[k*d[0],y,k*d[2]]):[.95,-.95].map(y=>[k*d[0],y,k*d[2]]));
  const normal=[Math.sin(a),0,Math.cos(a)];
  const border=[[6,-1.15,0],[6,1.15,0],[6,1.15,14.2],[6,-1.15,14.2]];
  const lightFrame=[rod([-4,-.29,3],[-4,.29,3],.12,ink)];
  return model({S:s,O:o,T:result},{origin:o,panels:[panel(ends,metal,.95),panel(border,glass,.28)],
    blocks:[block(-4,0,0,.54,.57,2.88,stone),block(6,0,-.14,.51,2.45,.13,ink)],
    rods:[...lightFrame,...border.map((p,i)=>rod(p,border[(i+1)%4],.043,metal)),
      ...ends.map((p,i)=>rod(p,ends[(i+1)%4],.06,ink)),
      ...arrow(s,o,gold),...arrow(o,result,result[2]>=0?glass:red),...arrow(o,normal,cream)],
    lamps:[{at:s,color:'#ffd896',r:.26},...result[2]>=0?[{at:result,color:'#b3eef1',r:.24}]:[]],
    dots:[s,o,result],labels:rays({S:s,O:o,T:result}),handle:ends[1]});
}),
V('Đoạn vuông góc chung giữa hai ống chéo','Khoảng cách hai đường thẳng chéo nhau',
'Trục ống thứ nhất P(t)=(t;0;1), trục thứ hai Q(s)=(2;s;h+s). Tìm đoạn ngắn nhất nối hai trục khi nâng ống Q.',
C('Cao độ h của ống Q','m',1,5,.1,3),
({x})=>[M('Khoảng cách giữa hai trục',(x-1)/Math.SQRT2,'m'),M('Tham số s ở chân vuông góc',(1-x)/2,'m')],
['PQ⃗·(1,0,0) = 0 và PQ⃗·(0,1,1) = 0','t = 2, s = (1 − h)/2','d = (h − 1)/√2'],
'Đoạn nối ngắn nhất vuông góc đồng thời với cả hai trục. Khi h=1, hai trục giao nhau.',
[['Viết vectơ nối','PQ⃗=(2−t,s,h+s−1).'],['Giải hai tích vô hướng','Từ đó tìm hai đầu đoạn rồi tính độ dài.']],
({x})=>{
  const a=[2,0,1],b=[2,(1-x)/2,(1+x)/2];
  const ends=[[-3,0,1],[3,0,1],[2,-2.7,x-2.7],[2,2.7,x+2.7]];
  const collars=ends.map((point,i)=>{
    const d=i===0?[.16,0,0]:i===1?[-.16,0,0]:i===2?[0,.12,.12]:[0,-.12,-.12];
    return rod(point,add(point,d),.196,metal);
  });
  return model({P:a,Q:b},{rods:[...collars,rod(ends[0],ends[1],.14,metal),rod(ends[2],ends[3],.14,blue),
    ...[[0,0,1],[2,2,x+2]].map(([x,y,z])=>rod([x,y,0],[x,y,z],.067,stone))],
    edges:[edge(a,b,gold,2.9)],dots:[a,b],labels:rays({P:a,Q:b}),handle:[2,0,x]});
}),
V('Góc mở hai tấm mái','Góc giữa hai mặt phẳng',
'Hai tấm mái chung sống theo Oy, có góc dốc α và 25° về hai phía. Rìa mái dài 3 m tính từ sống trong thiết diện vuông góc với sống.',
C('Độ dốc mái trái α','°',0,65,1,30),
({x})=>[M('Góc nhỏ giữa hai mặt phẳng',x+25,'°'),M('Góc mở phía dưới sống',155-x,'°')],
['Góc mở trong = 180° − α − 25°','Góc nhỏ giữa hai mặt phẳng = α + 25° trong miền khảo sát'],
'Lấy hai vectơ cùng vuông góc với giao tuyến. Góc trong và góc nhỏ giữa hai mặt phẳng bù nhau ở đây.',
[['Cắt vuông góc với sống','Trong lát, mỗi tấm thành một đoạn thẳng.'],['Cộng độ nghiêng','Hai độ nghiêng ở hai phía cùng làm giảm góc mở bên dưới.']],
({x})=>{
  const a=radians(x),b=radians(25),l=roofPanel(-3*Math.cos(a),3*Math.sin(a)),r=roofPanel(3*Math.cos(b),3*Math.sin(b));
  const o=[0,0,3],a0=[l[1][0],0,l[1][2]],b0=[r[1][0],0,r[1][2]];
  return model({S:o,A:a0,B:b0},{panels:[panel(l,red,.91),panel(r,blue,.90)],
    rods:[rod(l[0],l[3],.08,metal),...[-2,2].flatMap(y=>[rod([0,y,0],[0,y,3],.049,metal),
      rod([a0[0],y,0],[a0[0],y,a0[2]],.056,metal),rod([b0[0],y,0],[b0[0],y,b0[2]],.056,metal)]),...cabinRoofRibs(l,'#ba7e63'),...cabinRoofRibs(r,'#728c9c')],
    edges:[edge(o,a0,gold,2),edge(o,b0,gold,2),...trace(sample(Math.PI+a,2*Math.PI-b,24,t=>[.77*Math.cos(t),0,3+.77*Math.sin(t)]),glass,2)],
    dots:[o,a0,b0],handle:a0});
}),
V('Giao tuyến của hai bàn cắt','Giải hệ hai mặt phẳng và cắt theo khung',
'Hai bàn cắt biểu diễn z=2+x/2 và z=2+h+y/2. Khung quan sát có |x|≤4, |y|≤3 và 0≤z≤4. Tính chiều dài phần giao tuyến nằm trong khung.',
C('Độ lệch cao h','m',-4,4,.1,1),
({x})=>{const [lo,hi]=cutLine(x);return [M('Chiều dài giao tuyến trong khung',1.5*Math.max(0,hi-lo),'m'),M('Độ dài miền tham số',Math.max(0,hi-lo),'m')];},
['x=t, y=t−2h, z=2+t/2','t ∈ [−4,4] ∩ [2h−3,2h+3]','‖(1,1,½)‖ = 1,5'],
'Giải hệ để có đường thẳng vô hạn, rồi kiểm tra điều kiện của khung để biết đoạn nào được quan sát.',
[['Khử z','Suy ra x−y=2h.'],['Cắt theo từng điều kiện','Lấy giao hai khoảng tham số và nhân độ dài khoảng với chuẩn vectơ chỉ phương.']],
({x})=>{
  const p=t=>[t,t-2*x,2+t/2],f=(u,v)=>[u,v,2+u/2],g=(u,v)=>[u,v,2+x+v/2];
  const [lo,hi]=cutLine(x),yLo=Math.max(-3,-4-2*x),yHi=Math.min(3,4-2*x);
  const bottom=rect(8,6,0),top=rect(8,6,4);
  const ends=hi>=lo?[p(lo),p(hi)]:[];
  const firstTable=[f(-4,-3),f(4,-3),f(4,3),f(-4,3)];
  const secondTable=yHi>=yLo?[g(-4,yLo),g(4,yLo),g(4,yHi),g(-4,yHi)]:null;
  const tables=secondTable?[firstTable,secondTable]:[firstTable];
  return model(ends.length?{M:ends[0],N:ends[1]}:{O:[0,0,0],H:[0,0,4]},{panels:[
    ...tables.map((points,i)=>panel(points,i?gold:blue,.28))],
    rods:[...bottom.flatMap((p,i)=>[rod(p,top[i],.035,metal),rod(p,bottom[(i+1)%4],.048,metal)]),
      ...tables.flatMap((points,i)=>points.map((p,j)=>rod(p,points[(j+1)%4],.036,i?'#bfa16a':'#77aabd')))],
    edges:[...trace(bottom.concat([bottom[0]]),metal,.8),...trace(top.concat([top[0]]),metal,.8),
      ...bottom.map((p,i)=>edge(p,top[i],metal,.7)),...(ends.length?[edge(ends[0],ends[1],cream,3)]:[])],
    dimensions:ends.length?[measure(ends[0],ends[1],short(1.5*(hi-lo))+' m',cream)]:[],
    dots:ends,labels:hi===lo?[label('Tiếp xúc khung',ends[0])]:ends.length?rays({M:ends[0],N:ends[1]}):[label('Ngoài khung',[0,0,3.7])],handle:[0,0,2+x]});
}),
V('Dựng mặt cầu qua bốn mốc','Xác định tâm từ bốn điểm không đồng phẳng',
'Bốn mốc là O(0;0;0), A(4;0;0), B(0;6;0), C(0;0;h) với h>0. Dựng mặt cầu đi qua cả bốn điểm.',
C('Độ cao mốc C','m',1,8,.1,4),
({x})=>[M('Bán kính mặt cầu',Math.sqrt(13+x*x/4),'m'),M('Cao độ tâm mặt cầu',x/2,'m')],
['I = (2,3,h/2)','R = IO = √(13 + h²/4)'],
'Lấy hiệu từng phương trình khoảng cách bình phương với phương trình IO². Ba phương trình còn lại là tuyến tính.',
[['Lấy hiệu','IA²=IO² cho x_I=2. IB²=IO² cho y_I=3.'],['Dùng mốc cao','IC²=IO² cho z_I=h/2. Nếu h=0, mốc C trùng O nên mất ràng buộc.']],
({x})=>{
  const coords={O:[0,0,0],A:[4,0,0],B:[0,6,0],C:[0,0,x],I:[2,3,x/2]},values=Object.values(coords),center=coords.I;
  const radius=Math.sqrt(13+x*x/4);
  const rims=[0,1,2].flatMap(axis=>{
    const points=sample(0,2*Math.PI,52,t=>{
      const p=[...center];
      p[(axis+1)%3]+=radius*Math.cos(t);
      p[(axis+2)%3]+=radius*Math.sin(t);
      return p;
    });
    return trace(points,'#94cfd275',.9);
  });
  const bases=values.slice(0,4).map(([a,b,z])=>block(a,b,z-.145,.28,.28,.145,z>0?blue:metal));
  return model({I:center,...coords},{shells:[roundShell(center,radius,glass,.125)],blocks:bases,
    rods:values.slice(0,4).map(p=>rod(center,p,.028,gold)),edges:rims,dots:values,
    dimensions:[measure(center,coords.C,'R '+short(radius)+' m',cream)],labels:rays(coords),handle:coords.C});
}),
V('Mặt phẳng phân vùng giữa hai trạm','Quỹ tích cách đều hai điểm',
'Trạm A(−3;0;0) và B(3;h;2). Một thiết bị đi dọc C(s;1;1). Tìm vị trí chuyển sang gần trạm B hơn.',
[C('Tọa độ s của thiết bị','m',-4,4,.1,.5),C('Tọa độ y của B','m',0,4,.1,2,'h')],
({x,h})=>{
  const a=(x+3)**2+2,b=(x-3)**2+(1-h)**2+1;
  return [M('Hiệu bình phương CA² − CB²',a-b,'m²'),M('Hoành độ chuyển trạm',(h*h/2-h)/6,'m')];
},
['6x + hy + 2z = h²/2 + 2','CA² − CB² = 2(6s + h − h²/2)'],
'Mặt phẳng trung trực đi qua trung điểm AB, với pháp tuyến AB⃗. Dấu phần dư cho biết thiết bị đứng phía nào.',
[['Đặt hai khoảng cách bằng nhau','Khai triển và bỏ các hạng bậc hai giống nhau.'],['Thế đường thiết bị','Lấy y=z=1 và giải theo s.']],
({x,h})=>{
  const a=[-3,0,0],b=[3,h,2],c=[x,1,1];
  const p=(y,z)=>[(planeOffset(h)-h*y-2*z)/6,y,z];
  const plane=[p(-2,0),p(4,0),p(4,3),p(-2,3)];
  const stationSwitch=(h*h/2-h)/6,intersection=[stationSwitch,1,1];
  const active=Math.abs(x-stationSwitch)<1e-8?'Cách đều':x<stationSwitch?'Gần trạm A':'Gần trạm B';
  const stanchions=[a,b].flatMap(([x,y,z])=>[
    rod([x,y,z-.15],[x,y,z+.4],.049,metal),
    ...[-.14,.14].map(d=>rod([x,y+d,z+.22],[x,y+d,z+.44],.022,cream))
  ]);
  return model({A:a,B:b,C:c},{panels:[panel(plane,glass,.24)],
    blocks:[block(-3,0,-.18,.6,.62,.18,metal),block(3,h,-.18,.62,.62,.18,metal),block(x,1,.88,.34,.28,.22,green)],
    rods:[rod([3,h,0],b,.055,metal),...stanchions],lamps:[{at:c,r:.18,color:'#f4d08b'}],
    edges:[...trace(plane.concat([plane[0]]),'#9adfe1aa',1.1),edge(a,c,gold,x<stationSwitch?2.85:1.1),edge(b,c,glass,x>stationSwitch?2.85:1.1),
      edge([-4,1,1],intersection,gold,1.55),edge(intersection,[4,1,1],glass,1.55)],
    dots:[a,b,c,intersection],handles:{h:b},surfaceMarks:[label(active,add(c,[0,0,.35]),cream)],
    labels:rays({A:a,B:b,C:c}),handle:c});
}),
V('Bóng của tấm pin nghiêng','Phép chiếu xuyên tâm lên mặt đất',
'Tấm pin 4 × 3 m xoay quanh cạnh AB nằm trên đất. Nguồn điểm S(2;−2;6). Chiếu bốn đỉnh xuống Oxy để tính diện tích bóng theo góc nghiêng.',
C('Góc nghiêng tấm pin','°',0,75,1,30),
({x})=>{const {shadow}=shadowModel(x);return [M('Diện tích bóng',shadowArea(shadow),'m²'),M('Cạnh xa của bóng',shadow[2][0]-shadow[3][0],'m')];},
['Q = S + [6/(6 − P_z)](P − S)','S_bóng = (AB + C′D′)·chiều cao hình thang / 2'],
'Với mỗi đỉnh P, bóng nằm trên tia SP tại z=0. Cạnh bản lề vẫn giữ nguyên vị trí trên đất.',
[['Viết phương trình tia qua từng đỉnh','Giải thành phần z của Q bằng 0.'],['Tính diện tích hình thang','Hai cạnh song song là cạnh bản lề và ảnh của cạnh đối diện.']],
({x})=>{
  const {s,panel:surface,shadow}=shadowModel(x), cells=solarCells(surface);
  return model({A:surface[0],B:surface[1],C:surface[2],D:surface[3]},{
    coordinates:surface.map((at,i)=>({...label('ABCD'[i],at),projection:shadow[i]})),
    panels:[panel(shadow,'#1b2529',.93,{outline:false,ground:true}),...cells.panels],
    blocks:[block(s[0],s[1],-.14,.46,.46,.14,stone)],
    rods:[rod([s[0],s[1],0],s,.043,metal),rod(surface[0],surface[1],.059,metal),
      ...[.22,3.78].map(a=>rod([a,Math.min(.42,surface[2][1]),0],[a,surface[2][1],surface[2][2]],.044,metal)),
      ...surface.map((p,i)=>rod(p,surface[(i+1)%4],.043,cream))],
    edges:[...trace(shadow.concat([shadow[0]]),'#e5d7a4a8',1.25),...surface.map((p,i)=>edge(s,shadow[i],gold,1.15)),...cells.edges],
    lamps:[{at:s,r:.26,color:'#ffe7a9'}],
    dimensions:[measure(shadow[3],shadow[2],short(shadow[2][0]-shadow[3][0])+' m',gold,[0,.20,.025])],
    dots:[s,...surface],labels:rays({S:s,'C′':shadow[2],'D′':shadow[3]}),handle:surface[2]});
},{projectionLabel:'Tọa độ bóng trên Oxy'}),
V('Định vị thiết bị từ bốn vệ tinh','Giao các mặt cầu khoảng cách',
'Trong mô hình đơn giản, ba trạm O(0;0;0), A(6;0;0), B(0;8;0) cùng đo bình phương khoảng cách q tới thiết bị. Trạm D(0;0;5) xác nhận thiết bị ở ứng viên phía trên.',
[C('Bình phương khoảng cách q','km²',25,41,.25,29),C('Số trạm đang hiển thị','trạm',3,4,1,4,'n')],
({x,n})=>{const h=Math.sqrt(x-25);return [M('Cao độ của ứng viên phía trên',h,'km'),M('Khoảng cách ứng viên trên tới D',Math.hypot(5,5-h),'km'),M('Số vị trí còn phù hợp',n===4||h===0?1:2,'nghiệm')];},
['x_M = 3, y_M = 4 từ hiệu các bình phương','z_M² = q − 25','DM² = 25 + (5 − z_M)²'],
'Ba khoảng cách có thể tạo hai nghiệm đối xứng qua mặt phẳng chứa ba trạm. Phép đo thứ tư phân biệt hai nghiệm.',
[['Trừ các phương trình mặt cầu','Bỏ phần bậc hai chung để tìm x và y.'],['Đối chiếu trạm thứ tư','Thế hai giá trị z đối nhau vào DM. Nếu q=25, hai ứng viên trùng nhau.']],
({x,n})=>{
  const a=[0,0,0],b=[6,0,0],c=[0,8,0],d=[0,0,5],z=Math.sqrt(x-25);
  const p=[3,4,z],q=[3,4,-z],points=[a,b,c,...n===4?[d]:[]];
  const colors=[glass,blue,green,gold];
  const device=(at,color)=>block(at[0],at[1],at[2]-.133,.44,.41,.265,color);
  const radii=points.map((at,i)=>n===4&&i===3?norm(sub(p,d)):Math.sqrt(x));
  const horizons=points.flatMap(([x,y,z],i)=>{
    const lip=ring(radii[i],z,x,y,42);
    return trace(lip.concat([lip[0]]),colors[i]+'79',.9);
  });
  return model({O:a,A:b,B:c,...n===4?{D:d}:{},'M₊':p,...n===3&&z>0?{'M₋':q}:{}},{
    shells:points.map((at,i)=>roundShell(at,radii[i],colors[i],.075)),
    blocks:[...points.map((at,i)=>device(at,colors[i])),device(p,cream),...n===3&&z>0?[device(q,red)]:[]],
    framePoints:[[-6,-6,-7],[12,14,12]],dimensions:[measure([3,4,0],p,short(z)+' km',cream,[.35,0,0])],
    edges:[...horizons,...points.map((v,i)=>edge(v,p,colors[i],1.85)),...n===3&&z>0?points.map(v=>edge(v,q,red,1)):[]],
    dots:[...points,p,...n===3&&z>0?[q]:[]],labels:rays({O:a,A:b,B:c,...n===4?{D:d}:{},'M₊':p,...n===3&&z>0?{'M₋':q}:{}}),handle:p});
},{discrete:['n'],practice:[{changes:{x:29,n:4},index:0,question:'Khi q = 29 km², tính cao độ của ứng viên được trạm D xác nhận.'},
 {changes:{x:25,n:3},index:2,question:'Khi q = 25 km², ba phép đo còn cho bao nhiêu vị trí phân biệt?'}]}),
V('Bổ sung lực để cân bằng kiện hàng','Tổng vectơ và lực bù',
'Ba lực tác dụng lên một kiện hàng tại cùng điểm có tọa độ (8;0;6), (−2;4;3), (−1;−3;k), đơn vị N. Tìm lực thứ tư để kiện hàng cân bằng.',
C('Thành phần đứng k','N',-12,4,1,-5),
({x})=>[M('Độ lớn lực cần bổ sung',10*norm(balanceVector(x)),'N'),M('Thành phần đứng của lực bổ sung',-9-x,'N')],
['F₄ = −(F₁ + F₂ + F₃) = (−5,−1,−9−k)','‖F₄‖ = √[26 + (9 + k)²]'],
'Lực bù ngược hướng hợp lực và có cùng độ lớn. Cộng riêng từng thành phần Oxyz.',
[['Cộng ba lực','Hợp lực là (5;1;9+k).'],['Đổi dấu và lấy độ dài','Lực thứ tư triệt tiêu hợp lực.']],
({x})=>{
  const o=[0,0,1.25],vectors=[[.8,0,.6],[-.2,.4,.3],[-.1,-.3,x/10],balanceVector(x)];
  const ends=vectors.map(v=>add(o,mul(v,2.25)));
  const strips=[-.39,.39].map(x=>block(x,0,1.204,.115,1.12,.018,'#dabc87'));
  const corners=rect(1.59,1.09,1.21);
  const names=['F₁','F₂','F₃','F₄'];
  const coordinates=ends.map((at,i)=>({at,text:names[i],actual:mul(vectors[i],10),projectedActual:mul([vectors[i][0],vectors[i][1],0],10)}));
  const ghost=add(o,mul(vectors[3],-2.25));
  return model({}, {coordinates,origin:o,blocks:[
    {...block(0,0,-.05,1.6,1.1,1.25,'#a68460'),finish:'paper'},...strips
  ],panels:[panel([[.24,.557,.51],[.62,.557,.51],[.62,.557,.79],[.24,.557,.79]],cream,.94,{outline:false})],
    edges:[...trace(corners.concat([corners[0]]),'#c5a878',1.15),...trace(sample(0,1,13,t=>add(o,mul(sub(ghost,o),t))).filter((_,i)=>i%2===0),'#fff1b282',1)],
    dimensions:[measure(o,ends[3],short(norm(vectors[3])*10)+' N',gold)],
    rods:ends.flatMap((p,i)=>arrow(o,p,[blue,green,glass,gold][i])),
    dots:[o,...ends],labels:ends.map((p,i)=>label('F'+(i+1),add(p,[0,0,.17]))),handle:ends[2]});
}),
V('Đoạn bay trong radar và hành lang','Giao hai điều kiện không gian',
'Drone có P(t)=(t;b;3+t/2) km với −6≤t≤6. Vùng radar thẳng đứng thỏa x²+y²≤25. Hành lang bay thỏa |z−3|≤H. Tính chiều dài đoạn cùng thỏa hai điều kiện.',
[C('Độ lệch ngang b','km',0,6,.1,3),C('Nửa chiều cao H','km',.25,2.5,.05,1.5,'h'),C('Vị trí dọc đường bay t','km',-6,6,.05,0,'t')],
s=>[M('Chiều dài đoạn bay chung',Math.sqrt(5)*(radarInterval(s)??0),'km'),M('Thời đoạn tham số trong vùng',2*(radarInterval(s)??0))],
['Radar: |t| ≤ √(25 − b²) khi b ≤ 5','Hành lang: |t| ≤ 2H','L = 2 min(6, √(25 − b²), 2H)·√5/2'],
'Miền cho phép là giao, nên phải thỏa từng điều kiện cùng lúc. Tiếp xúc tại một điểm có chiều dài 0.',
[['Giải hai bất đẳng thức','Thế đường bay lần lượt vào hình trụ và cặp mặt phẳng.'],['Lấy giao','Cắt thêm miền −6≤t≤6 rồi nhân độ dài khoảng tham số với chuẩn vectơ chỉ phương.']],
(s,{motion})=>{
  const p=t=>[t,s.x,3+t/2],k=radarInterval(s),ends=k!==null?[p(-k),p(k)]:[],at=p(s.t);
  const drone=quadDrone(at,motion?.key==='t'?motion.time:0);
  const enlarge=p=>p.map((n,i)=>at[i]+1.43*(n-at[i]));
  const boundary=[3-s.h,3+s.h].flatMap(z=>{
    const rim=ring(5,z);
    return trace(rim.concat([rim[0]]),'#8dd0d078',1.15);
  });
  return model({A:p(-6),B:p(6),...ends.length?{M:ends[0],N:ends[1]}:{}},{
    shells:[shell([ring(5,0),ring(5,6)],glass,.115,{closed:false,finish:'glass'}),
      ...drone.shells.map(q=>({...q,rings:q.rings.map(r=>r.map(enlarge))}))],
    panels:[panel(rect(11,11,3-s.h),blue,.10),panel(rect(11,11,3+s.h),blue,.10),
      ...drone.panels.map(q=>({...q,points:q.points.map(enlarge)}))],
    rods:drone.rods.map(r=>({...r,from:enlarge(r.from),to:enlarge(r.to),radius:r.radius*1.43})),
    edges:[...boundary,edge(p(-6),p(6),metal,1.65),...ends.length?[edge(ends[0],ends[1],gold,3.2)]:[]],
    lamps:[{at,color:k!==null&&Math.abs(s.t)<=k+1e-9?'#a9dcc1':'#e6aa80',r:.22}],
    dimensions:k>0?[measure(ends[0],ends[1],short(k*Math.sqrt(5))+' km',gold,[0,.43,.13])]:[],
    dots:ends,labels:[label(k===null||s.x**2+s.t**2>25+1e-9?'Ngoài radar':Math.abs(s.t)>2*s.h+1e-9?'Ngoài hành lang':k===0?'Chạm biên radar':'Trong vùng bay chung',add(at,[0,0,.47]))],handle:at,handles:{t:at}});
},{practice:[{changes:{x:3,h:1.5},index:0},{changes:{x:5,h:1.5},index:0,question:'Khi b = 5 km, đoạn bay chung dài bao nhiêu?'}]})
];

import {fmt} from './lessons.mjs';
import {C,M,lesson,block,panel,rod,edge,label,measure,ring,rect,sample,trace,shell,metal,gold,glass,green,cream,ink,red,blue,stone,radians} from './expansion-kit.mjs';

import {spurGear} from './expansion-props.mjs';

const S=(...args)=>lesson(3,...args);
const short=n=>fmt(Number(n.toFixed(2)));
const cash=({x,r,i})=>[10*(1+r/100)**x,10*((1+r/100)/(1+i/100))**x];
const height=({x,a,b})=>x/(1/Math.tan(radians(a))-1/Math.tan(radians(b)));
const route=({x,a,b})=>Math.sqrt(a*a+b*b-2*a*b*Math.cos(radians(x)));
const tile=({x,d})=>Math.ceil(x/.6-1e-10)*Math.ceil(d/.6-1e-10);

export const schoolExpansion=[
S('Hai bánh răng ăn khớp','Tỉ số truyền qua số răng',
'Bánh dẫn có 12 răng, bánh bị dẫn có n răng cùng bước răng. Quay bánh dẫn x vòng. Tìm số vòng và góc quay có dấu của bánh bị dẫn.',
[C('Vòng quay bánh dẫn','vòng',0,3,.025,1),C('Răng bánh bị dẫn','răng',12,28,1,20,'n')],
({x,n})=>[M('Số vòng bánh bị dẫn',12*x/n,'vòng'),M('Góc quay có dấu',-4320*x/n,'°')],
['n₁·θ₁ + n₂·θ₂ = 0','θ₂ = −12θ₁/n'],
'Hai bánh răng ngoài quay ngược chiều. Tại điểm ăn khớp, vận tốc tiếp tuyến có cùng độ lớn.',
[['Đếm răng đi qua điểm ăn khớp','Sau x vòng bánh dẫn có 12x lượt răng đi qua.'],['Đổi tỉ lệ','Chia 12x cho n, lấy dấu âm nếu đo góc cùng chiều dương ban đầu.']],
({x,n})=>{
  const c=.105*n+.105*12, off=c/2, a=2*Math.PI*x, b=Math.PI-Math.PI/n-a*12/n;
  const drive=spurGear(12,-off,a,gold), driven=spurGear(n,off,b,blue);
  const w=c*1.92,d=.21*n+.63;
  const fasteners=[-1,1].flatMap(k=>[-1,1].map(q=>rod([k*(w/2-.18),q*(d/2-.17),.15],[k*(w/2-.18),q*(d/2-.17),.25],.064,metal)));
  const pitch=[[-off,1.26],[off,.105*n]].flatMap(([cx,r])=>{
    const rim=ring(r,.70,cx,0,48);
    return trace(rim.concat([rim[0]]),'#f2dbab77',.68);
  });
  const contact=[-off+1.26,0,.70];
  return {shells:[...drive.shells,...driven.shells],panels:[...drive.panels,...driven.panels],
    blocks:[{...block(0,0,0,w,d,.17,'#546260'),finish:'iron'}],
    rods:[...drive.rods,...driven.rods,...fasteners,rod([-off,0,0],[-off,0,.42],.22,ink),rod([off,0,0],[off,0,.42],.22,ink)],
    edges:pitch,lamps:[{at:contact,r:.24,color:'#fae8a5'}],
    handles:{n:[off+.105*n,0,.72]},
    dots:[[-off+.67*Math.cos(a),.67*Math.sin(a),.84],[off+.72*Math.cos(b),.72*Math.sin(b),.84]],
    labels:[label('12 răng',[-off,1.44,.93]),label(n+' răng',[off,.105*n+.17,.93])],handle:[-off+.67*Math.cos(a),.67*Math.sin(a),.86]};
},{discrete:['n']}),
S('Lãi kép và sức mua','Tỉ số tăng trưởng theo lạm phát',
'Gửi 10 triệu đồng, lãi nhập gốc mỗi năm với lãi suất r%. Giá một giỏ hàng cố định tăng i% mỗi năm. Tính số tiền danh nghĩa và sức mua quy về giá năm đầu.',
[C('Số năm','năm',0,18,1,5),C('Lãi suất','%',0,14,.5,7,'r'),C('Lạm phát','%',0,14,.5,4,'i')],
s=>{const [nominal,real]=cash(s);return [M('Tiền danh nghĩa',nominal,'triệu đồng'),M('Sức mua năm đầu',real,'triệu đồng')];},
['N = 10(1 + r/100)ⁿ','S = N/(1 + i/100)ⁿ'],
'Lãi kép nhân số dư theo từng năm. Quy về giá ban đầu bằng cách chia cho hệ số tăng giá.',
[['Lập hai hệ số','Số tiền và chỉ số giá tăng theo hai cấp số nhân riêng.'],['So sánh','Sức mua tăng nếu r>i, giữ nguyên nếu r=i.']],
s=>{
  const h=cash(s).map(v=>v/8),centres=[-1.38,1.38],hues=[gold,'#bdc6be'];
  const stacks=h.flatMap((z,k)=>{
    const cx=centres[k],color=hues[k],layers=Math.min(32,Math.max(3,Math.round(z*10))),step=z/layers;
    return Array.from({length:layers},(_,i)=>{
      const lo=.18+i*step,top=lo+step*.98;
      return shell([ring(.69,lo,cx,0,26),ring(.745,lo+step*.15,cx,0,26),ring(.745,top-step*.08,cx,0,26),ring(.70,top,cx,0,26)],
        color,1,{finish:k?'steel':'brass',closed:i===layers-1});
    });
  });
  return {blocks:[{...block(0,0,0,5,2.75,.18,'#635742'),finish:'wood'}],
    dimensions:centres.map((cx,i)=>measure([cx,.77,.18],[cx,.77,.18+h[i]],short(h[i]*8)+' tr',i?glass:gold,[i?.59:-.59,.07,0])),
    shells:stacks,edges:centres.flatMap((cx,k)=>{
      const z=.183+h[k],ringPath=ring(.46,z,cx,0,28);
      return trace(ringPath.concat([ringPath[0]]),k?'#6d837e':'#fff1ad',.9);
    }),labels:[label('Danh nghĩa',[-1.38,.58,.50+h[0]]),label('Sức mua',[1.38,.58,.50+h[1]])],
    handle:[-1.38,.62,.18+h[0]]};
},{discrete:['x']}),
S('Đo tháp bằng hai góc nâng','Lượng giác ngược trên một đường thẳng',
'Hai máy đo ở cùng cao độ với chân tháp và cùng phía, cách nhau x mét. Góc nâng tại trạm xa là a, tại trạm gần là b với b>a. Đo chiều cao của tháp.',
[C('Khoảng cách hai trạm','m',4,20,.5,8),C('Góc trạm xa a','°',18,33,1,25,'a'),C('Góc trạm gần b','°',39,60,1,45,'b')],
s=>[M('Chiều cao tháp',height(s),'m'),M('Trạm gần đến chân tháp',height(s)/Math.tan(radians(s.b)),'m')],
['d = H cot b','d + x = H cot a','H = x/(cot a − cot b)'],
'Hai tam giác vuông chung chiều cao. Hai cạnh kề chênh đúng một khoảng x.',
[['Viết hai phương trình','Cạnh kề lần lượt là H/tan b và H/tan a.'],['Khử d','Lấy phương trình thứ hai trừ thứ nhất rồi chia cho hiệu hai cotang.']],
s=>{
  const h=height(s),d=h/Math.tan(radians(s.b));
  const peak=[0,0,h],stations=[d,d+s.x],span=Math.min(1.45,h*.15),ribs=sample(0,h,9,z=>z);
  const crossbars=ribs.slice(0,-1).flatMap((z,i)=>{
    const next=ribs[i+1],w=span*(1-.55*z/h),u=span*(1-.55*next/h);
    return [-1,1].flatMap(side=>[
      rod([side*w,-w,z],[side*u,u,next],.052,metal),
      rod([side*w,-w,z],[side*w,w,z],.055,metal),
      rod([-w,side*w,z],[w,side*w,z],.055,metal)
    ]);
  });
  const angles=stations.flatMap((x,i)=>{
    const angle=radians(i?s.a:s.b),r=Math.min(1.8,d*.28);
    return trace(sample(0,angle,17,t=>[x-r*Math.cos(t),0,r*Math.sin(t)]),i?gold:glass,1.4);
  });
  return {blocks:[block(0,0,-.18,span*2.6,span*2.6,.18,stone),block(0,0,h-.35,span,span,.25,'#8f7060')],
    rods:[...[-1,1].flatMap(a=>[-1,1].map(b=>rod([a*span,b*span,0],[a*span*.45,b*span*.45,h-.16],.09,metal))),
      ...crossbars,...stations.flatMap(x=>[[-.33,-.28],[.33,-.28],[0,.34]].map(([u,y])=>rod([x+u,y,0],[x,0,.22],.041,metal)))],
    edges:[...angles,...stations.map((x,i)=>edge([x,0,0],peak,i?gold:glass,2)),edge([0,0,0],[d+s.x,0,0],cream,1.3)],
    dimensions:[measure([0,0,0],peak,short(h)+' m',cream,[-span*.95,0,0]),
      measure([d,0,0],[d+s.x,0,0],short(s.x)+' m',gold,[0,Math.min(.79,d*.2),0])],
    dots:[[0,0,0],peak,...stations.map(x=>[x,0,0])],
    labels:[label('Trạm gần · b',[d,.3,.53]),label('Trạm xa · a',[d+s.x,.3,.53])],handle:[d+s.x,0,.18]};
}),
S('Hai hải trình và đường nối trực tiếp','Định lý cosin theo góc đổi hướng',
'Từ phao O, hai tàu đi thẳng tới A và B, cách O lần lượt a và b hải lý. Hai hướng hợp góc θ. Tính khoảng cách AB.',
[C('Góc giữa hai hướng','°',20,160,1,75),C('Chặng OA','hải lý',2,9,.5,6,'a'),C('Chặng OB','hải lý',2,9,.5,7,'b')],
s=>[M('Khoảng cách AB',route(s),'hải lý'),M('Hiệu đi vòng và đi thẳng',s.a+s.b-route(s),'hải lý')],
['AB² = a² + b² − 2ab cos θ'],
'Góc θ là góc giữa hai cạnh có độ dài đã biết tại cùng điểm xuất phát.',
[['Dựng tam giác','Cạnh đối diện góc θ là AB.'],['Tính căn','Ưu tiên đơn vị góc độ khi thay θ.']],
s=>{
  const angle=radians(s.x),a=[s.a,0,.09],b=[s.b*Math.cos(angle),s.b*Math.sin(angle),.09],o=[0,0,.09];
  const ship=(at,heading,color)=>{
    const p=([x,y,z])=>[at[0]+x*Math.cos(heading)-y*Math.sin(heading),at[1]+x*Math.sin(heading)+y*Math.cos(heading),z];
    const shape=[[-.66,-.19],[.39,-.19],[.75,0],[.39,.19],[-.66,.19]];
    return [
      shell([shape.map(([x,y])=>p([x*.90,y*.85,.018])),shape.map(([x,y])=>p([x,y,.22]))],color,1,{finish:'enamel'}),
      shell([rect(.48,.25,.22,-.11),rect(.43,.22,.39,-.13)].map(r=>r.map(p)),cream,.98,{finish:'enamel'})
    ];
  };
  const wakes=[[a,0],[b,angle]].flatMap(([[x,y],heading])=>[-1,1].map(side=>edge(
    [x-.60*Math.cos(heading),y-.60*Math.sin(heading),.04],
    [x-1.24*Math.cos(heading)-side*.23*Math.sin(heading),y-1.24*Math.sin(heading)+side*.23*Math.cos(heading),.04],'#d7efdbb5',1.2)));
  return {panels:[panel(rect(19.5,11.6,0,0,4.05),'#427d8b',.84,{water:true,ground:true})],
    shells:[shell([ring(.18,.08),ring(.18,.32),ring(.075,.55)],red,1,{finish:'enamel'}),...ship(a,0,'#327e94'),...ship(b,angle,'#bc734d')],
    edges:[...wakes,edge(o,a,glass,2),edge(o,b,glass,2),edge(a,b,gold,2.6),...trace(sample(0,angle,23,t=>[Math.cos(t),Math.sin(t),.15]),red)],
    dimensions:[measure(a,b,short(route(s))+' hải lý',gold,[0,0,.21])],
    handles:{a,b},dots:[o,a,b],labels:[label('O',[0,0,.78]),label('A',[a[0],a[1],.75]),label('B',[b[0],b[1],.75])],handle:b};
}),
S('Bản đồ và diện tích thật','Hệ số diện tích theo tỉ lệ bản đồ',
'Mảnh đất chữ nhật dài 120 m và rộng 80 m. Bản đồ có tỉ lệ 1:k. Tính chiều dài và diện tích trên bản đồ theo cm và cm².',
C('Mẫu số tỉ lệ k','',500,4000,50,1500),
({x})=>[M('Diện tích trên bản đồ',96000000/x**2,'cm²'),M('Chiều dài trên bản đồ',12000/x,'cm')],
['L_bản đồ = L_thật/k','A_bản đồ = A_thật/k²'],
'Đổi cả hai cạnh sang cm rồi chia mỗi cạnh cho k.',
[['Đổi đơn vị','Hai cạnh thật là 12.000 cm và 8.000 cm.'],['Tính hai chiều','Nhân hai cạnh đã chia k, nên diện tích chia k².']],
({x})=>{
  const w=18*500/x,d=12*500/x;
  const outline=rect(w,d,.234);
  const scale=2250/x, rulerX=-8.55,rulerY=5.87;
  return {blocks:[{...block(0,0,0,21,15,.18,'#a6a178'),finish:'paper'},
    {...block(0,0,.18,19.3,13.55,.035,'#d6d1aa'),finish:'paper'},block(0,0,.216,w,d,.014,green)],
    panels:[panel([[-9.58,3.8,.221],[-5.8,2.85,.221],[-2.5,4.6,.221],[1,3.95,.221],[6.8,5.3,.221],[9.6,4.1,.221],
      [9.6,4.72,.221],[6.82,5.89,.221],[1,4.62,.221],[-2.62,5.24,.221],[-5.7,3.64,.221],[-9.58,4.48,.221]],blue,.75,{outline:false})],
    edges:[...trace(outline.concat([outline[0]]),cream,1.7),
      ...sample(-1,1,8,t=>edge([-w/2,t*d/2,.24],[w/2,t*d/2,.24],'#b6d69b',.75)),
      edge([rulerX,rulerY,.235],[rulerX+scale,rulerY,.235],ink,2.35),
      ...[rulerX,rulerX+scale].map(u=>edge([u,rulerY-.15,.235],[u,rulerY+.15,.235],ink,1.4))],
    dimensions:[measure([-w/2,d/2,.24],[w/2,d/2,.24],short(12000/x)+' cm',gold,[0,.42,.02])],
    labels:[label('1 : '+x,[0,d/2,.61]),label('30 m',[rulerX+scale/2,rulerY,.48])],handle:[w/2,d/2,.24]};
}),
S('Sắp ghế theo tầng khán đài','Tổng cấp số cộng',
'Hàng đầu có 12 ghế. Mỗi hàng sau thêm 2 ghế. Khi lắp n hàng, tính số ghế toàn khán đài và số ghế hàng cuối.',
C('Số hàng','hàng',1,11,1,6),
({x})=>[M('Tổng số ghế',x*(11+x),'ghế'),M('Ghế ở hàng cuối',12+2*(x-1),'ghế')],
['uₙ = 12 + 2(n − 1)','Sₙ = n(12 + uₙ)/2 = n(n + 11)'],
'Tổng hàng đầu và hàng cuối bằng tổng các cặp đối xứng khác.',
[['Xác định công sai','Hàng n có 12+2(n−1) ghế.'],['Ghép cặp','Trung bình số ghế mỗi hàng là (u₁+uₙ)/2.']],
({x})=>{
  const blocks=[],rods=[],panels=[];
  for(let i=0;i<x;i++){
    const count=12+2*i,y=(i-(x-1)/2)*.42,z=.12+i*.17,w=.215*count;
    blocks.push({...block(0,y,0,w+.3,.41,z,stone),finish:'stone'});
    for(const side of [-1,1]){
      const aisle=side*(w/2+.30);
      blocks.push(block(aisle,y-.09,0,.36,.22,z*.87,'#919489'));
      rods.push(rod([aisle,y,z],[aisle,y,z+.31],.021,metal));
      if(i){
        const previous=aisle-side*.215;
        rods.push(rod([previous,y-.42,z+.14],[aisle,y,z+.31],.014,metal));
      }
    }
    for(let j=0;j<count;j++){
      const u=(j-(count-1)/2)*.215,m=i===x-1?gold:green;
      blocks.push(block(u,y,z,.167,.18,.07,m));
      rods.push(rod([u-.074,y+.07,z+.065],[u-.074,y+.105,z+.2],.014,metal),rod([u+.074,y+.07,z+.065],[u+.074,y+.105,z+.2],.014,metal));
      panels.push(panel([[u-.071,y+.071,z+.07],[u+.071,y+.071,z+.07],[u+.068,y+.106,z+.196],[u-.068,y+.106,z+.196]],m,1,{finish:'enamel',outline:'#a1c4b571'}));
    }
  }
  const rowY=(x-1)*.21;
  return {blocks,rods,panels,surfaceMarks:[label((10+2*x)+' ghế',[0,rowY+.02,zTop(x)],cream)],
    labels:[label('Hàng '+x,[0,rowY,zTop(x)])],handle:[0,(x-1)*.21,zTop(x)-.18]};
},{discrete:['x']}),
S('Lát sàn với hàng cuối phải cắt','Làm tròn số hàng và cột',
'Phòng chữ nhật dài x mét, rộng d mét. Lát gạch vuông 60 cm, mỗi ô sát mép cần một viên riêng và phần cắt thừa bỏ đi. Tính số viên mua và diện tích bỏ.',
[C('Chiều dài phòng','m',1.2,5.4,.1,3.4),C('Chiều rộng phòng','m',1.2,4.2,.1,2.3,'d')],
s=>[M('Số viên phải mua',tile(s),'viên'),M('Diện tích gạch thừa',Math.max(0,.36*tile(s)-s.x*s.d),'m²')],
['N = ⌈x/0,6⌉·⌈d/0,6⌉','A_thừa = 0,36N − xd'],
'Làm tròn từng chiều riêng biệt vì còn một phần hàng cũng cần viên gạch mới.',
[['Tách theo hai chiều','Tìm số hàng và số cột dùng phép làm tròn lên.'],['Tính phế liệu','Lấy tổng diện tích các viên mua trừ diện tích phòng.']],
s=>{
  const nx=Math.ceil(s.x/.6-1e-10),ny=Math.ceil(s.d/.6-1e-10),blocks=[block(s.x/2,s.d/2,-.1,s.x,s.d,.1,stone)];
  for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){
    const w=Math.min(.6,s.x-i*.6),d=Math.min(.6,s.d-j*.6);
    blocks.push({...block(i*.6+w/2,j*.6+d/2,0,w*.96,d*.96,.06,w<.599||d<.599?gold:(i+j)%2?ink:cream),finish:'tile'});
  }
  const cutX=s.x<.6*nx-1e-9,cutY=s.d<.6*ny-1e-9;
  const exampleWidth=s.x-.6*(nx-1),exampleDepth=s.d-.6*(ny-1);
  const waste=[];
  if(cutX)waste.push(block(s.x+(.6-exampleWidth)/2+.17,s.d-exampleDepth/2,0,.6-exampleWidth,exampleDepth,.044,'#b26f57'));
  if(cutY)waste.push(block(s.x-exampleWidth/2,s.d+(.6-exampleDepth)/2+.17,0,exampleWidth,.6-exampleDepth,.044,'#b26f57'));
  if(cutX&&cutY)waste.push(block(s.x+(.6-exampleWidth)/2+.17,s.d+(.6-exampleDepth)/2+.17,0,.6-exampleWidth,.6-exampleDepth,.044,'#b26f57'));
  const boundary=[[0,0,.071],[s.x,0,.071],[s.x,s.d,.071],[0,s.d,.071],[0,0,.071]];
  return {blocks:[...blocks,...waste],edges:[
    ...trace(boundary,'#e3d7bc',1.1),
    ...cutX?[edge([s.x,0,.073],[s.x,s.d,.073],gold,2.1)]:[],
    ...cutY?[edge([0,s.d,.073],[s.x,s.d,.073],gold,2.1)]:[]
  ],dimensions:[measure([0,0,0],[s.x,0,0],short(s.x)+' m',cream,[0,-.21,.06]),
    measure([s.x,0,0],[s.x,s.d,0],short(s.d)+' m',cream,[.17,0,.06])],
    handles:{d:[0,s.d,.12]},labels:[label(cutX||cutY?'Mép cắt':'Vừa viên nguyên',[s.x,s.d,.20]),
      ...waste.length?[label('Phần bỏ của viên góc',[s.x+.22,s.d+.20,.10])]:[]],handle:[s.x,s.d,.12]};
})
];
const zTop=n=>.48+(n-1)*.17;

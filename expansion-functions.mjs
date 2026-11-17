import {conveyorProps,dataProps,dispatchProps} from './chart-props.mjs';
import {fmt} from './lessons.mjs';
import {chart,curve as cv} from './expansion-chart.mjs';
import {C,M,lesson,block,panel,rod,edge,label,measure,rect,sample,trace,bisect,metal,gold,glass,green,cream,ink,red,blue} from './expansion-kit.mjs';

const F=(...args)=>lesson(0,...args);
const amount=n=>Math.floor(120/(n-20))+1;
const third=x=>x**3-3*x;
const roots=m=>[[-3,-1],[-1,1],[1,3]].filter(([a,b])=>(third(a)-m)*(third(b)-m)<=0)
  .map(([a,b])=>bisect(x=>third(x)-m,a,b)).filter((x,i,a)=>!i||x-a[i-1]>1e-7);

export const functionExpansion=[
F('Đường dốc thay đổi theo tham số','Đơn điệu trên một đoạn',
'Đường tâm của dốc có cao độ h(s)=3+s³+ms trên đoạn −1 ≤ s ≤ 1 m. Xác định độ dốc tại vị trí khảo sát và tìm điều kiện để cả đoạn không đi xuống.',
[C('Hệ số m','',-1.5,2,.05,.5),C('Vị trí s','m',-1,1,.05,.4,'s')],
({x,s})=>[M('Độ dốc nhỏ nhất',x),M('Độ dốc tại s',3*s*s+x)],
['h′(s) = 3s² + m','min h′ = m tại s = 0'],
'Dấu của h′ cho biết cao độ đang tăng hay giảm theo chiều đi.',
[['Lấy đạo hàm','Bình phương 3s² không âm.'],['Xét điểm thấp nhất của độ dốc','Điểm s = 0 thuộc đoạn. Đường dốc không xuống khi m ≥ 0.']],
({x,s})=>{
  const h=t=>3+t**3+x*t;
  const levels=sample(-1,1,30,t=>[[t,-.55,h(t)],[t,.55,h(t)],[t,.55,h(t)-.09],[t,-.55,h(t)-.09]]);
  const supports=[-.56,.56].flatMap(y=>sample(-1,1,6,t=>rod([t,y,-.01],[t,y,h(t)-.08],.028,metal)));
  const posts=[-.56,.56].flatMap(y=>sample(-1,1,8,t=>rod([t,y,h(t)-.02],[t,y,h(t)+.15],.013,metal)));
  const rails=[-.56,.56].flatMap(y=>sample(-1,1,24,t=>[t,y,h(t)+.149])
    .slice(1).map((to,i)=>{const q=-1+i/12;return rod([q,y,h(q)+.149],to,.011,metal);}));
  const slope=3*s*s+x,footings=[-.56,.56].flatMap(y=>sample(-1,1,6,t=>block(t,y,-.14,.18,.23,.14,stoneColor)));
  const centre=sample(-1,1,40,t=>[t,0,h(t)+.012]);
  const start=Math.max(-1,s-.23),end=Math.min(1,s+.23);
  return {blocks:[block(0,0,-.19,2.75,1.75,.045,'#777c67'),...footings],
    shells:[{rings:levels,color:'#77776d',finish:'stone'}],rods:[...supports,...posts,...rails],
    edges:[...trace(centre,'#f0e1ab',1.7),edge([start,.13,h(s)+(start-s)*slope+.03],[end,.13,h(s)+(end-s)*slope+.03],gold,3.3)],
    dimensions:[measure([s,.55,0],[s,.55,h(s)],fmt(Number(h(s).toFixed(2)))+' m',cream,[0,.37,0])],
    surfaceMarks:[label(slope===0?'Ngang':slope>0?'Lên':'Xuống',[s,.07,h(s)+.22],slope<0?red:cream)],
    handles:{s:[s,0,h(s)]},dots:[[s,0,h(s)+.035]],labels:[label('Tiếp tuyến',[s,0,h(s)+.26])],handle:[s,0,h(s)]};
},{focusMetric:1}),
F('Phí giao hàng bình quân','Tiệm cận và ngưỡng nguyên',
'Một chuyến giao hàng tốn 120 nghìn đồng chi phí chung và 20 nghìn đồng cho mỗi đơn. Tính phí bình quân và số đơn ít nhất để phí nhỏ hơn ngưỡng đã chọn.',
[C('Số đơn','đơn',1,40,1,8),C('Ngưỡng phí','nghìn đồng',24,50,1,32,'p')],
({x,p})=>[M('Phí bình quân',20+120/x,'nghìn đồng'),M('Số đơn ít nhất',amount(p),'đơn')],
['C(n) = 20 + 120/n','C < p ⇔ n > 120/(p − 20)'],
'Ngưỡng nhỏ hơn là bất đẳng thức nghiêm, nên phải lấy số nguyên kế tiếp cả khi thương đã nguyên.',
[['Tách chi phí','Chia 120 + 20n cho n.'],['So sánh với ngưỡng','C(n) giảm về 20 nghìn. Với p > 20, lấy ⌊120/(p − 20)⌋ + 1.']],
({x,p})=>{
  const n=amount(p),cost=20+120/x;
  return chart([cv(1,40,n=>20+120/n),cv(1,40,()=>p,gold),cv(1,40,()=>20,green)],{
    points:[[x,cost],[n,20+120/n]],guides:[[x,cost]],handle:[x,cost],handles:{p:[29,p]},
    axis:'Số đơn',unit:'Nghìn đồng',note:x>=n?'Đã dưới ngưỡng':'Cần ít nhất '+n+' đơn',props:dispatchProps(x,n),tags:[['Mức 20',[34,11],green],['Ngưỡng',[35,p+8],gold]]
  });
},{discrete:['x'],focusMetric:1}),
F('Biểu phí theo hai ca','Cực trị ở điểm gãy',
'Chi phí khởi động giảm theo số lô cho đến lô thứ 10, rồi phụ phí nhân sự làm chi phí tăng. Mô hình C(x)=120−6x khi x≤10 và C(x)=60+4(x−10) khi x≥10, đơn vị nghìn đồng.',
C('Số lô','lô',0,20,1,9),
({x})=>[M('Chi phí theo số lô',x<=10?120-6*x:60+4*(x-10),'nghìn đồng'),M('Chi phí thấp nhất',60,'nghìn đồng')],
['C(x) = 120 − 6x (x ≤ 10), 60 + 4(x − 10) (x ≥ 10)'],
'Hàm giảm ở phía trái, tăng ở phía phải và có góc gãy tại x = 10.',
[['Đọc theo đoạn','Độ dốc lần lượt là −6 và +4.'],['Chọn điểm đổi chiều','Tại 10 lô, C = 60 nghìn đồng. Hai đạo hàm một phía khác nhau.']],
({x})=>{
  const cost=x<=10?120-6*x:60+4*(x-10);
  return chart([cv(0,10,t=>120-6*t),cv(10,20,t=>60+4*(t-10),gold)],{
    points:[[x,cost],[10,60]],guides:[[x,cost],[10,60]],axis:'Số lô',unit:'Nghìn đồng',note:x===10?'Đổi ca · 60 nghìn đồng':x<10?'Ca 1 · Chi phí giảm':'Ca 2 · Chi phí tăng',props:conveyorProps(x,x>10?1:0),
    tags:[['Ca 1',[4,109],glass],['Ca 2',[15,93],gold],['Đổi ca',[10,49]]]
  });
},{discrete:['x']}),
F('Bể chuyển từ dâng sang hạ','Dấu của tốc độ biến thiên',
'Bể đáy 5 m² ban đầu chứa 30 m³. Máy bơm cấp 6 m³/phút, đường xả cho ra 2+t m³/phút. Quan sát trong 8 phút đầu để tìm lúc mực nước ngừng tăng.',
C('Thời gian t','phút',0,8,.1,3),
({x})=>[M('Chiều sâu nước',(30+4*x-x*x/2)/5,'m'),M('Tốc độ dâng có dấu',(4-x)/5,'m/phút')],
['h(t) = (30 + 4t − t²/2)/5','h′(t) = (4 − t)/5'],
'Lưu lượng ròng bằng lưu lượng vào trừ lưu lượng ra.',
[['So sánh lưu lượng','Q_ròng = 4 − t.'],['Đọc dấu','Mực nước dâng trước phút 4, đạt 7,6 m tại phút 4 và hạ sau đó.']],
({x},{motion})=>{
  const h=(30+4*x-x*x/2)/5, side=Math.sqrt(5), a=side/2;
  const walls=rect(side,side,0);
  const panels=walls.map((p,i)=>{
    const q=walls[(i+1)%4];return panel([p,q,[q[0],q[1],8.25],[p[0],p[1],8.25]],glass,.23);
  });
  const time=motion?.time??0,top=8.25;
  const corners=walls.map(([x,y])=>[x,y,top]);
  const waterline=rect(side,side,h);
  const outlet=2+x, flow=sample(0,1,6,(_,i)=>{
    const p=(time*(.52+outlet*.065)+i/7)%1;
    return [2.13+p*.37,0,.52-.44*p*p];
  });
  return {panels:[...panels,panel(waterline,glass,.65,{water:true})],
    blocks:[block(0,0,-.18,3.05,2.95,.18,'#737c74'),block(-2.1,.3,8.36,.49,.53,.33,blue),
      block(1.77,0,.07,.52,.48,.63,'#6a7873')],
    shells:[{rings:[rect(side,side,0),waterline],color:blue,alpha:.29,closed:false,finish:'water'}],
    rods:[...walls.flatMap((p,i)=>[rod(p,corners[i],.067,metal),rod(corners[i],corners[(i+1)%4],.058,metal)]),
      rod([-2.35,.3,8.52],[-.77,.3,8.52],.14,metal),rod([-.77,.3,8.52],[-.77,.3,8.34],.14,metal),
      rod([a,0,.52],[2.14,0,.52],.14,metal),rod([-.77,.3,8.34],[-.77,.3,h],.058,glass)],
    edges:[...trace(waterline.concat([waterline[0]]),'#c3f6f2',1.5),
      ...sample(0,8,8,z=>edge([a,-a,z],[a,-a+.21,z],cream,.8))],
    balls:[...sample(0,1,5,(_,i)=>[-.77,.3,8.34-(8.34-h)*((i/6+time)%1)**2]),...flow]
      .map(at=>({at,r:.045,color:glass})),
    dimensions:[measure([a,a,0],[a,a,h],fmt(Number(h.toFixed(2)))+' m',cream,[.28,.10,0])],
    surfaceMarks:[label(x<4?'Dâng':x>4?'Hạ':'Mực cao nhất',[0,0,h+.17],cream)],
    labels:[label('Cấp 6 m³/phút',[-2.1,.3,8.8]),label('Xả '+(2+x).toFixed(1)+' m³/phút',[2.25,0,.95]),label('Mực nước',[a,a,h])],
    handle:[a,a,h]};
}),
F('Chi phí bình quân của một lô','Cực tiểu chi phí trên một đơn vị',
'Tổng chi phí sản xuất x lô là C(x)=36+14x+2x² triệu đồng. Xét x liên tục để tìm quy mô có chi phí trung bình nhỏ nhất.',
C('Quy mô x','lô',1,12,.05,4),
({x})=>[M('Chi phí bình quân',36/x+14+2*x,'triệu đồng/lô'),M('Chi phí biên',14+4*x,'triệu đồng/lô')],
['A(x) = C(x)/x = 36/x + 14 + 2x','A′(x) = (xC′(x) − C(x))/x²'],
'Điểm tối ưu của chi phí bình quân xảy ra khi chi phí biên bằng chi phí bình quân.',
[['Tính đạo hàm','A′(x)=2−36/x².'],['Đối chiếu hai đường','Hai chi phí bằng nhau ở x = √18, chi phí bình quân đổi từ giảm sang tăng.']],
({x})=>{
  const optimal=Math.sqrt(18),average=36/x+14+2*x;
  return chart([cv(1,12,n=>36/n+14+2*n),cv(1,12,n=>14+4*n,gold)],{
    points:[[x,average],[optimal,14+4*optimal]],guides:[[x,average],[optimal,14+4*optimal]],
    axis:'Số lô',unit:'Triệu đồng/lô',note:'Cực tiểu tại √18 lô',props:conveyorProps(x,x<optimal?0:1),
    tags:[['Bình quân',[9,30],glass],['Biên',[9,54],gold]]
  });
}),
F('Tốc độ đỉnh của thang nâng','Cực đại đạo hàm của quãng đường',
'Sàn nâng khởi hành ở z=0, có z(t)=3t²−t³/3 mét trong 6 giây. Tính vận tốc, gia tốc và thời điểm vận tốc lớn nhất.',
C('Thời gian t','giây',0,6,.05,3),
({x})=>[M('Vận tốc',6*x-x*x,'m/s'),M('Gia tốc',6-2*x,'m/s²'),M('Cao độ',3*x*x-x**3/3,'m')],
['v(t) = 6t − t²','a(t) = 6 − 2t'],
'Vận tốc lớn nhất khi gia tốc đổi từ dương sang âm và hai biên cho vận tốc bằng 0.',
[['Lấy đạo hàm vị trí','Đạo hàm thứ nhất là v, thứ hai là a.'],['So sánh','Tại t = 3 s, v = 9 m/s.']],
({x})=>{
  const z=(3*x*x-x**3/3)/7, top=6.64,base=-.14,v=(6*x-x*x)/12;
  const deck=rect(2.24,1.51,z+.15), railZ=z+.93;
  const carriage=deck.flatMap(([a,b,h],i)=>i<2?[]:[rod([a,b,h],[a,b,railZ],.047,metal)]);
  const frame=[-1.26,1.26].flatMap(a=>[
    rod([a,.8,0],[a,.8,top],.083,metal),
    rod([a,1.07,0],[a,1.07,top],.038,ink),
    ...sample(0,top,7,h=>rod([a,.8,h],[a,1.07,h],.032,metal))
  ]);
  const peak=(3*3*3-3**3/3)/7;
  return {blocks:[
    block(0,0,base,3.15,2.23,.14,stoneColor),block(0,0,z,2.2,1.5,.16,'#a5aeac'),
    block(0,0,z+.154,2.1,1.41,.043,'#566661'),
    block(0,.81,top,2.94,.68,.25,blue),block(0,1.16,top-z-.45,.43,.32,.39,ink)
  ],panels:[panel([[-1.1,-.71,z+.17],[1.1,-.71,z+.17],[1.1,-.71,railZ],[-1.1,-.71,railZ]],glass,.29)],
    rods:[...frame,...carriage,rod([-1.31,.8,top],[1.31,.8,top],.10,metal),
      ...[-.61,.61].map(a=>rod([a,.64,z+.11],[a,.64,top],.023,ink)),
      rod([0,1.16,top-z-.06],[0,1.16,top],.024,ink),
      rod([-1.1,.71,railZ],[1.1,.71,railZ],.046,gold)],
    edges:[...sample(-.94,.94,10,a=>edge([a,-.68,z+.2],[a,.63,z+.2],'#d3ddd47d',.65)),
      edge([1.48,.65,z],[1.48,.65,z+v],gold,2.6),edge([1.13,.86,peak],[1.51,.86,peak],cream,1.9)],
    dimensions:[measure([-1.11,.76,0],[-1.11,.76,z],fmt(Number((7*z).toFixed(2)))+' m',cream,[-.35,.08,0])],
    labels:[label('Vận tốc',[1.5,.65,z+v+.18])],handle:[0,.74,z+.18]};
}),
F('Chọn gói cước theo mức dùng','So sánh hai đồ thị chi phí',
'Hai gói có chi phí A(x)=40+3x và B(x)=16+6x nghìn đồng. Chọn gói rẻ hơn theo mức sử dụng x và xác định điểm hòa phí.',
C('Mức dùng','GB',0,20,.1,8),
({x})=>[M('Chênh lệch A − B',24-3*x,'nghìn đồng'),M('Chi phí thấp hơn',Math.min(40+3*x,16+6*x),'nghìn đồng')],
['A − B = 24 − 3x','A = B tại x = 8'],
'Đồ thị có tung độ nhỏ hơn biểu diễn gói rẻ hơn tại cùng mức dùng.',
[['Tính giao điểm','Hai gói cùng 64 nghìn ở 8 GB.'],['Chọn theo dấu','B rẻ hơn khi x < 8. A rẻ hơn khi x > 8.']],
({x})=>{
  const a=40+3*x,b=16+6*x,choice=x<8?1:x>8?0:null;
  return chart([cv(0,20,t=>40+3*t,glass),cv(0,20,t=>16+6*t,gold)],{
    points:[[x,a],[x,b],[8,64]],guides:[[x,Math.max(a,b)]],
    lines:a===b?[]:[[[x,a],[x,b],cream,2.6]],axis:'Mức dùng · GB',unit:'Nghìn đồng',
    note:choice===null?'Hai gói cùng 64 nghìn đồng':choice===0?'Gói A rẻ hơn':'Gói B rẻ hơn',props:dataProps(x,choice),
    tags:[['A',[17,82],glass],['B',[17,125],gold]]
  });
}),
F('Đồ thị bậc ba và đường mức','Biện luận số nghiệm theo m',
'Xét phương trình x³−3x=m. Kéo đường mức qua hai cực trị để đếm nghiệm thực phân biệt.',
C('Đường mức m','',-3.25,3.25,.05,0),
({x})=>[M('Số nghiệm phân biệt',roots(x).length,'nghiệm'),M('Nghiệm lớn nhất',roots(x).at(-1))],
['f′(x) = 3(x² − 1)','f(−1) = 2, f(1) = −2'],
'Nghiệm là hoành độ giao với y=m. Tiếp xúc tại cực trị chỉ tính một nghiệm phân biệt.',
[['Chia theo tính đơn điệu','Xét ba khoảng tách tại −1 và 1.'],['Biện luận','Có 3 nghiệm khi −2 < m < 2, 2 nghiệm khi m = ±2 và 1 nghiệm ở ngoài.']],
({x})=>{
  const hits=roots(x).map(v=>[v,x]);
  return chart([cv(-2.3,2.3,third),cv(-2.3,2.3,()=>x,gold)],{
    points:hits,guides:hits,range:[-4.15,4.15],note:hits.length+' giao điểm phân biệt',
    handle:[1.87,x],tags:[['y = m',[1.03,x+(x>2.65?-.68:.68)],gold]]
  });
},
{practice:[{changes:{x:2},index:0,question:'Khi đường mức đi qua cực đại, phương trình có bao nhiêu nghiệm phân biệt?'},{changes:{x:-2},index:1,question:'Khi m = −2, nghiệm lớn nhất là bao nhiêu?'}]}),
F('Hai dây căng tiếp xúc biên cong','Tiếp tuyến qua điểm cho trước',
'Mặt phẳng đứng có biên cong y=x². Hai dây thẳng đi qua điểm neo P(0,−a) và vừa chạm biên. Xác định các tiếp điểm.',
C('Độ sâu điểm neo a','m',0,3,.05,1.4),
({x})=>[M('Hoành độ tiếp điểm bên phải',Math.sqrt(x),'m'),M('Hệ số góc dây bên phải',2*Math.sqrt(x))],
['Tiếp tuyến tại u: y = 2ux − u²','P(0,−a) thuộc tiếp tuyến ⇔ u² = a'],
'Hai hướng tiếp tuyến nhập thành một khi điểm neo đặt đúng tại gốc.',
[['Chọn tiếp điểm','Điểm (u,u²) cho hệ số góc 2u.'],['Thay tọa độ neo','Tìm u=±√a và viết hai phương trình tương ứng.']],
({x})=>{
  const d=Math.sqrt(x),join=d===0?[0]:[-d,d];
  return chart([cv(-2,2,v=>v*v),...join.map(u=>cv(Math.min(0,u),Math.max(0,u),t=>2*u*t-x,gold))],{
    domain:[-2,2],range:[-3.9,4.5],points:[[0,-x],...join.filter(u=>u!==0).map(u=>[u,x])],
    note:x===0?'Hai dây trùng tại gốc':'Hai tiếp điểm đối xứng',guides:join.filter(u=>u!==0).map(u=>[u,x]),tags:[['Neo P',[.3,-x-.3]]],
    lines:x===0?[[[-.6,0],[.6,0],gold]]:[],handle:[0,-x]
  });
}),
F('Tam giác giữa tiếp tuyến và hai tiệm cận','Giao điểm của ba đường',
'Cho f(x)=x+1+4/(x−1), x>1. Tiếp tuyến tại u>1 cắt hai tiệm cận, tạo thành một tam giác cùng giao điểm hai tiệm cận. Diện tích tam giác thay đổi thế nào?',
C('Hoành độ tiếp điểm u','',1.8,4,.05,3),
({x})=>[M('Diện tích tam giác',8,'đv²'),M('Cạnh dọc trên tiệm cận đứng',8/(x-1),'đv')],
['x = 1 và y = x + 1','B(1, 2 + 8/(u − 1)); C(2u − 1, 2u)','S = ½·[8/(u − 1)]·[2(u − 1)] = 8'],
'Chiều cao của tam giác tính theo cạnh đứng là khoảng cách ngang của giao điểm còn lại đến x=1.',
[['Tìm các giao điểm','Dùng tiếp tuyến y=f(u)+f′(u)(x−u), lần lượt thế x=1 và y=x+1.'],['Tính diện tích','Hai thừa số phụ thuộc u triệt tiêu, nên diện tích bằng 8.']],
({x})=>{
  const b=2+8/(x-1), end=2*x-1;
  return chart([cv(1.48,7.3,t=>t+1+4/(t-1)),cv(.4,7.3,t=>t+1,green),cv(1,end,t=>b+(1-4/(x-1)**2)*(t-1),gold)],
    {lines:[[[1,0],[1,12.6],rose]],fill:{points:[[1,2],[1,b],[end,end+1]],color:'#c39a573f'},points:[[x,x+1+4/(x-1)],[end,end+1],[1,b],[1,2]],range:[0,13],note:'Diện tích tam giác cố định bằng 8',tags:[['x = 1',[1.35,12],rose],['S = 8',[1+(end-1)/3,(b+end+3)/3]]]});
}),
F('Cực trị hàm hợp qua hai lớp đồ thị','Đạo hàm hàm hợp',
'Khảo sát H(x)=f(x²−m) với f(u)=u³−3u. Thay m để quan sát các điểm cực trị của H sinh ra hoặc nhập vào gốc.',
C('Tham số m','',-1.5,2.5,.05,.4),
({x})=>[M('Số điểm cực trị',1+2*Number(x>-1)+2*Number(x>1),'điểm'),M('Giá trị tại x = 0',third(-x))],
['H′(x) = 6x[(x² − m)² − 1]','Điểm tới hạn: x = 0 hoặc x² = m ± 1'],
'Xét đổi dấu quanh nghiệm của đạo hàm, nhất là khi nghiệm x²=m±1 trùng với x=0.',
[['Liệt kê ứng viên','Mỗi phương trình bình phương có thêm hai nghiệm nếu vế phải dương.'],['Xét mốc','Tại m=±1, nghiệm mới trùng x=0. Số cực trị lần lượt là 1, 3 hoặc 5.']],
({x})=>{
  const points=[0,...[x-1,x+1].filter(z=>z>0).flatMap(z=>[-Math.sqrt(z),Math.sqrt(z)])];
  const y0=third(-x),visible=[Math.min(-3.1,y0-1),Math.max(3.8,y0+1)];
  const extrema=points.map(u=>[u,third(u*u-x)]);
  return chart([cv(-2.02,2.02,u=>third(u*u-x),glass)],{
    range:visible,points:extrema,guides:extrema,handle:[0,y0],note:points.length+' cực trị · m = '+fmt(x),
    tags:[['H(x)',[-1.51,visible[1]-.67]]]
  });
},{practice:[{changes:{x:1},index:0,question:'Tại m = 1, có bao nhiêu điểm cực trị phân biệt?'}]})
];
const stoneColor= '#a69783',rose='#da7b71';

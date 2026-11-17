import {drawWithReplacement} from './o-an-quan.mjs';
import {choose, fmt} from './lessons.mjs';
import {functionExpansion} from './expansion-functions.mjs';
import {integralExpansion} from './expansion-integrals.mjs';
import {vectorExpansion} from './expansion-vectors.mjs';
import {schoolExpansion} from './expansion-school.mjs';
import {probabilityExpansion} from './expansion-probability.mjs';

const pi = Math.PI;
const sq = x => x*x;
const metric = (label,value,unit) => ({label,value,unit});
const span = (label,unit,min,max,step,value) => ({key:'x',label,unit,min,max,step,value});
const point = (x,y,z) => [x,y,z];
const edge = (from,to) => ({from,to});
const block = (x,y,z,w,d,h) => ({x,y,z,w,d,h});
const data = ({group,title,tag,prompt,control,measure,unit,solve,formula,knowledge,steps,exercise,scene,graph=false,sample}) => ({
  group,title,tag,mode:'extension',prompt,controls:[control],result:({x})=>[metric(measure,solve(x),unit)],
  formula:[formula],knowledge,steps:steps.map(([title,text])=>({title,text})),
  practice:{question:exercise[0],answer:solve(exercise[1]),unit,explanation:exercise[2],tolerance:exercise[3]??.0051},
  extension:true,scene,sample,
  plot:graph?{label:control.label+' ('+control.unit+')',min:control.min,max:control.max,yLabel:measure+' ('+unit+')',fn:solve}:null
});

function challenge(group,title,tag,prompt,control,measure,unit,solve,formula,knowledge,steps,exercise,scene,graph=true) {
  return data({group,title,tag,prompt,control,measure,unit,solve,formula,knowledge,steps,exercise,scene,graph});
}
const G=(...args)=>challenge(0,...args);
const sp=(...args)=>challenge(2,...args);
const school=(...args)=>challenge(3,...args);
const extrema=[
G('Bể cá kính','Tối ưu vật liệu','Bể không nắp, đáy vuông cạnh x dm, chứa 32 dm³. Với x = 4 dm cần bao nhiêu kính? Kiểm tra kích thước này có dùng ít kính nhất không.',
span('Cạnh đáy','dm',2,7,.1,4),'Diện tích kính','dm²',x=>x*x+128/x,'S = x² + 128/x',
'Diện tích kính là đáy cộng bốn mặt bên. Dùng thể tích để rút chiều cao.',
[['Ràng buộc','h = 32/x² với x > 0.'],['Lập biểu thức','S = x² + 4xh. Tại x = 4, S = 16 + 32 = 48 dm².'],['Xét cực trị','S′ = 2x − 128/x² đổi từ âm sang dương tại x = 4.']],
['Nếu cạnh đáy bằng 5 dm thì diện tích kính là bao nhiêu?',5,'Thế x = 5 vào x² + 128/x.'],x=>({blocks:[{...block(0,0,0,x,x,32/x**2),open:true}]})),
G('Thùng đá','Tối ưu hình trụ','Thùng đá mô hình hóa bằng hình trụ kín, thể tích 54π dm³. So sánh diện tích vỏ khi đổi bán kính. Tìm kích thước dùng ít vật liệu nhất.',
span('Bán kính','dm',2,5,.1,3),'Diện tích vỏ','dm²',r=>2*pi*(r*r+54/r),'S = 2π(r² + 54/r)',
'Vỏ kín có hai đáy. Mặt xung quanh có diện tích 2πrh.',
[['Rút chiều cao','Từ πr²h = 54π suy ra h = 54/r².'],['Đạo hàm','S′/2π = 2r − 54/r² đổi dấu tại r = 3.'],['Kết luận','Chọn r = 3, h = 6 dm, diện tích nhỏ nhất là 54π dm².']],
['Với r = 4 dm, tính diện tích vỏ đến 2 chữ số thập phân.',4,'Dùng h = 54/16 và cộng diện tích hai đáy với mặt xung quanh.'],r=>({lathe:{height:54/r**2,radius:()=>r,closed:true}})),
G('Đèn LED bàn tròn','Tối ưu độ rọi','Bàn tròn bán kính 1 m. Đèn điểm cách tâm bàn theo phương đứng h m. Độ rọi tại mép bàn lấy theo E = 120h/(1+h²)^(3/2). Chọn h để mép bàn sáng nhất.',
span('Độ cao đèn','m',.2,3,.01,1),'Độ rọi mép','lux',h=>120*h/(1+h*h)**1.5,'E(h) = 120h/(1 + h²)^(3/2)',
'Khoảng cách đèn tới mép là √(1+h²). Góc chiếu làm độ rọi giảm ở tia xiên.',
[['Lập đạo hàm','E′ = 120(1−2h²)/(1+h²)^(5/2).'],['Xét dấu','E tăng đến h = 1/√2 rồi giảm.'],['Kết luận','Đặt đèn cao khoảng 0,707 m tính từ mặt bàn.']],
['Nếu đặt đèn cao 2 m, độ rọi mép bàn bằng bao nhiêu? Làm tròn 2 chữ số.',2,'Thế h = 2 vào E(h).'],h=>({lathe:{height:.1,radius:()=>1,closed:true},dots:[point(0,0,h)],edges:[edge(point(0,0,h),point(1,0,.1)),edge(point(0,0,h),point(0,0,.1))]})),
G('Cầu qua hẻm núi','Tối ưu mặt cầu','Mô hình hai bờ ở x = ±12 m. Khoảng hở dưới cầu mô tả bởi y = 9−x²/16. Một cửa kỹ thuật hình chữ nhật đặt cân giữa, hai góc trên chạm vòm. Tìm diện tích lớn nhất.',
span('Nửa chiều rộng','m',0,12,.1,6),'Diện tích cửa','m²',x=>2*x*(9-x*x/16),'A = 2x(9 − x²/16)',
'Hoành độ hai góc trên đối nhau. Chiều cao cửa bằng tung độ của vòm tại góc.',
[['Lập hàm','A(x) = 18x − x³/8, 0 ≤ x ≤ 12.'],['Tìm cực đại','A′ = 18 − 3x²/8 đổi dấu tại x = 4√3.'],['Tính diện tích','Chiều cao 6 m, nên diện tích lớn nhất 48√3 m².']],
['Với cửa rộng 16 m, tính diện tích.',8,'Nửa chiều rộng x = 8, chiều cao 5 m.'],x=>({arch:{width:24,depth:5,profile:t=>9*(1-t*t)},blocks:[block(0,-1,0,2*x,1,9-x*x/16)]})),
G('Khúc gỗ xẻ xà','Tối ưu tiết diện','Khúc gỗ tròn đường kính 20 cm. Xẻ thanh xà có tiết diện chữ nhật nội tiếp. Tìm kích thước thanh xà để tiết diện lớn nhất.',
span('Chiều rộng xà','cm',1,20,.1,12),'Tiết diện xà','cm²',x=>x*Math.sqrt(400-x*x),'A = x√(400 − x²)',
'Đường chéo hình chữ nhật nội tiếp bằng đường kính của đường tròn.',
[['Tìm chiều cao','Hai cạnh x,y thỏa x²+y² = 400.'],['Chặn diện tích','Từ (x−y)² ≥ 0 có 2xy ≤ x²+y² = 400.'],['Kết luận','Dấu bằng khi x = y = 10√2 cm. Diện tích lớn nhất là 200 cm².']],
['Nếu chiều rộng 16 cm thì tiết diện bằng bao nhiêu?',16,'Chiều cao √(400−256) = 12 cm.'],x=>({lathe:{height:20,radius:()=>10,closed:false},blocks:[block(0,0,0,x,Math.sqrt(400-x*x),20)]})),
G('Thang tựa tường','Tối ưu chiều dài','Thang vượt qua mép hàng chắn cao 1 m, cách tường 2 m. Gọi x là khoảng từ chân thang đến chân chắn. Tìm chiều dài thang nhỏ nhất.',
span('Chân thang đến chắn','m',.35,5,.01,1.25),'Chiều dài thang','m',x=>Math.hypot(x+2,(x+2)/x),'L = (x + 2)√(1 + 1/x²)',
'Đường thang đi qua mép chắn. Hai tam giác vuông đồng dạng cho chiều cao đầu thang trên tường.',
[['Lập tam giác','Tỉ số độ cao và chân ngang là 1/x. Đầu thang cao (x+2)/x.'],['Tối ưu','L′ = (x³−2)/(x²√(1+x²)). Dấu đổi từ âm sang dương ở x = ∛2.'],['Kết luận','Thế x = ∛2 vào L được (1+2^(2/3))^(3/2) m.']],
['Nếu chân thang cách chân chắn 2 m, thang dài bao nhiêu? Làm tròn 2 chữ số.',2,'Hai cạnh tam giác vuông là 4 m và 2 m.'],x=>{
  const top=(x+2)/x;
  const rod=(from,to,radius,color)=>({from,to,radius,color});
  const rung=t=>[x-(x+2)*t,top*t];
  const rails=[-.2,.2].map(y=>rod([x,y,0],[-2,y,top],.047,'#e0ae6b'));
  const steps=Array.from({length:9},(_,i)=>{
    const [px,pz]=rung((i+1)/10);
    return rod([px,-.2,pz],[px,.2,pz],.034,'#f0d0a2');
  });
  return {
    blocks:[{...block(-2.08,0,0,.16,2.5,top+.25),color:'#739b91',alpha:.74},
      {...block(0,0,0,.12,.88,1),color:'#416f64'}],
    rods:[...rails,...steps],
    dots:[[0,0,1]],
    labels:[{at:[-2,-1.23,top+.25],text:'Tường'},{at:[0,0,1.16],text:'Mép chắn · 1 m'},
      {at:[x,0,-.06],text:'Chân thang'}],
    edges:[edge([-2,0,0],[x,0,0])]
  };
}),
G('Hộp gấp từ bìa','Tối ưu thể tích','Tấm bìa 120 × 50 cm. Cắt bốn góc vuông cạnh x rồi gấp thành hộp. Cắt bao nhiêu để thể tích lớn nhất?',
span('Cạnh vuông cắt','cm',0,25,.01,8),'Thể tích','cm³',x=>x*(120-2*x)*(50-2*x),'V = x(120 − 2x)(50 − 2x)',
'Mỗi chiều đáy mất hai đoạn x. Thành hộp cao x sau khi gấp.',
[['Lập miền','Hộp có đáy và chiều cao dương khi 0 < x < 25. Hai biên cho thể tích 0.'],['Tìm điểm dừng','V′ = 12x² − 680x + 6.000. Nghiệm trong miền là (85−5√109)/3.'],['Kết luận','Cắt khoảng 10,93 cm. V lớn nhất xấp xỉ 30.185 cm³.']],
['Nếu cắt cạnh 15 cm thì thể tích bao nhiêu?',15,'Thay x = 15, đáy 90 × 20 cm.'],x=>({blocks:[{...block(0,0,0,120-2*x,50-2*x,x),open:true}]})),
G('Hàng rào chữ E','Tối ưu diện tích','Dùng 120 m rào làm hai ô chữ nhật bằng nhau dựa vào tường. Cần ba đoạn vuông góc tường dài x và một đoạn song song dài y. Chia kích thước thế nào để tổng diện tích lớn nhất?',
span('Chiều sâu x','m',0,40,.5,15),'Diện tích hai ô','m²',x=>x*(120-3*x),'A = x(120 − 3x)',
'Đoạn giữa là vách dùng chung giữa hai ô. Bức tường làm cạnh đối diện đoạn y.',
[['Ràng buộc','Ba đoạn dài x và cạnh y dùng hết 120 m, nên y = 120−3x.'],['Tìm đỉnh','A = −3x²+120x có đỉnh tại x = 20.'],['Kết luận','Chọn y = 60 m. Tổng diện tích là 1.200 m².']],
['Nếu chiều sâu mỗi ô là 10 m, diện tích hai ô là bao nhiêu?',10,'Chiều dọc còn 120−30 = 90 m.'],x=>{const y=120-3*x;return {panels:[{points:[[-y/2,0,0],[y/2,0,0],[y/2,x,0],[-y/2,x,0]]}],edges:[-y/2,0,y/2].map(a=>edge(point(a,0,0),point(a,x,0))).concat(edge(point(-y/2,x,0),point(y/2,x,0)))};}),
G('Thuyền vào bờ','Tối ưu thời gian','Thuyền ở cách bờ thẳng 3 km, điểm đích ở trên bờ cách chân đường vuông góc 6 km. Chèo 3 km/h, đi bộ 5 km/h. Chọn chỗ cập bờ cách chân vuông góc x km về phía đích.',
span('Điểm cập bờ','km',0,6,.01,2),'Tổng thời gian','giờ',x=>Math.hypot(x,3)/3+(6-x)/5,'T = √(x² + 9)/3 + (6 − x)/5',
'Đoạn chèo là cạnh huyền. Tổng thời gian bằng tổng quãng đường chia cho vận tốc tương ứng.',
[['Lập hàm','Tổng thời gian là hàm T trên đoạn [0;6].'],['Giải đạo hàm','T′ = x/(3√(x²+9)) − 1/5, đổi dấu từ âm sang dương tại x = 2,25.'],['Kết luận','Cập bờ cách chân vuông góc 2,25 km về phía đích.']],
['Nếu cập bờ tại chân vuông góc, tổng thời gian là bao nhiêu?',0,'Đi thuyền 1 giờ, đi bộ thêm 6/5 giờ.'],x=>({panels:[{points:[[0,-3,0],[6,-3,0],[6,0,0],[0,0,0]]}],dots:[point(0,-3,.1),point(x,0,.1),point(6,0,.1)],edges:[edge(point(0,-3,.1),point(x,0,.1)),edge(point(x,0,.1),point(6,0,.1))]})),
G('Bể nón cụt ngược','Tốc độ nước dâng','Bể nón cụt có bán kính đáy 1 m và miệng bán kính 3 m, cao 4 m. Bơm 2 m³/phút. Tính tốc độ dâng khi nước sâu 2 m.',
span('Mực nước','m',0,3.99,.01,2),'Tốc độ dâng','m/phút',h=>2/(pi*sq(1+h/2)),'dh/dt = 2/[π(1 + h/2)²]',
'Tăng độ cao một lượng dh thì thể tích tăng gần bằng diện tích mặt nước nhân dh.',
[['Tìm bán kính','Bán kính tăng tuyến tính từ 1 lên 3 trong 4 m. r(h) = 1+h/2.'],['Lấy đạo hàm','dV/dh = πr(h)². Vậy 2 = πr²·dh/dt.'],['Thế số','Khi h = 2, dh/dt = 1/(2π) ≈ 0,159 m/phút.']],
['Khi nước sâu 1 m, tốc độ dâng bao nhiêu? Làm tròn 3 chữ số.',1,'r = 1,5 m, nên tốc độ 2/(2,25π).',.0006],h=>({lathe:{height:4,radius:z=>1+z/2,cut:h,fill:true}})),
G('Bể bơi đáy dốc','Tốc độ nước dâng','Bể rộng 4 m có đáy dốc đều, chênh 2 m trên chiều dài 10 m. Nước sâu h tại đầu thấp và chưa chạm đầu cao. Bơm đều 3 m³/phút. Tính tốc độ dâng khi h = 1 m.',
span('Độ sâu đầu thấp','m',.2,2,.01,1),'Tốc độ dâng','m/phút',h=>3/(20*h),'dh/dt = 3/(20h)',
'Diện tích mặt thoáng thay đổi theo mực nước. Mặt cắt dọc của phần nước là tam giác.',
[['Đồng dạng','Nước phủ chiều dài 5h. Khi h = 2, vừa chạm mép đáy đầu cao.'],['Lập thể tích','V = 4·(5h·h/2) = 10h².'],['Suy ra tốc độ','3 = 20h·dh/dt, tại h = 1 được 0,15 m/phút.']],
['Khi độ sâu là 1,5 m, tốc độ dâng bằng bao nhiêu?',1.5,'Thế h = 1,5 vào 3/(20h).'],h=>({panels:[{points:[[0,-2,0],[10,-2,2],[10,2,2],[0,2,0]]},{points:[[0,-2,h],[5*h,-2,h],[5*h,2,h],[0,2,h]],highlight:true}]}))
];

function integral(title,tag,axis,axisUnit,length,position,area,primitive,areaFormula,primitiveFormula,context,derivation,shape,practiceAt,units) {
  const [areaUnit,volumeUnit]=units;
  const total=primitive(length)-primitive(0);
  const areaScene=x=>shape(x);
  const lesson=data({
    group:1,title,tag,prompt:context+' Tìm thể tích bằng tích phân trên đoạn từ 0 đến '+fmt(length)+' '+axisUnit+'.',
    control:span(axis,axisUnit,0,length,length/100,position),measure:'Diện tích lát cắt',unit:areaUnit,solve:area,
    formula:'A(x) = '+areaFormula+';  F(x) = '+primitiveFormula,
    knowledge:'Chia vật thể thành những lát mỏng vuông góc với trục đang xét. Một lát có thể tích gần bằng A(x)Δx. Lấy giới hạn tổng này cho V = ∫A(x)dx.',
    steps:[['Lập diện tích lát cắt',derivation],['Tính nguyên hàm','Dùng F(x) = '+primitiveFormula+'. Lấy đạo hàm F để kiểm tra lại A(x).'],['Thay hai cận','V = F('+fmt(length)+') − F(0) ≈ '+fmt(total)+' '+volumeUnit+'.']],
    exercise:['Tại x = '+fmt(practiceAt)+' '+axisUnit+', diện tích lát cắt bằng bao nhiêu? Làm tròn đến 2 chữ số thập phân.',practiceAt,'Thế x = '+fmt(practiceAt)+' vào A(x) = '+areaFormula+'.'],
    scene:areaScene,graph:true
  });
  lesson.result=({x})=>[metric('Diện tích lát cắt',area(x),areaUnit),metric('Thể tích đến lát cắt',primitive(x)-primitive(0),volumeUnit),metric('Tổng thể tích',total,volumeUnit)];
  return lesson;
}

function lathe(title,length,position,r2,primitive,areaFormula,primitiveFormula,context,derivation,practiceAt,unit='cm') {
  return integral(title,'Khối tròn xoay','Cao độ lát cắt',unit,length,position,x=>pi*r2(x),x=>pi*primitive(x),piFormula(areaFormula),piFormula(primitiveFormula),context,derivation,
    x=>{
      const radius=z=>Math.sqrt(Math.max(0,r2(z)));
      const lathe={height:length,radius,cut:x,unit};
      if(title==='Cốc rượu vang'){
        const stem={from:[0,0,-2.8],to:[0,0,.28],radius:.19,color:'#a9cfc2'};
        const foot={bottom:regular(40,2.35,-3.05),top:regular(40,2.12,-2.8)};
        return {lathe,rods:[stem],lofts:[{...foot,color:'#96c3b4'}]};
      }
      if(title==='Mũ Noel'){
        lathe.color='#a14a4c';
        return {lathe,balls:[{at:[0,0,length],r:.73,color:'#e6e9da'}],
          lofts:[{bottom:regular(48,radius(0)*1.03,-.58),top:regular(48,radius(0)*1.03,0),color:'#dadfd1'}]};
      }
      if(title==='Đế quả cầu pha lê'){
        const ball=Math.min(radius(length)*.78,length*.38);
        return {lathe,framePoints:[[-ball,-ball,length],[ball,ball,length+2*ball]]};
      }
      if(title==='Quần tất')lathe.color='#ba9471';
      if(title==='Ống sữa chua')lathe.color='#a6cbd2';
      if(title==='Lọ nước của quạ')lathe.color='#7e9d75';
      if(title==='Thùng rượu')lathe.color='#b17b50';
      if(title==='Hộp kẹo quả trứng')lathe.color='#bb9a61';
      return {lathe};
    },practiceAt,[unit+'²',unit+'³']);
}
function piFormula(text){return 'π('+text+')';}
function parabolic(title,width,depth,height,position,context) {
  return integral(title,'Lát cắt dưới parabol','Vị trí lát cắt','m',width,position,
    x=>depth*height*(1-sq(2*x/width-1)),x=>depth*height*(2*x*x/width-4*x**3/(3*width**2)),
    fmt(depth*height)+'[1 − (2x/'+width+' − 1)²]',fmt(depth*height)+'(2x²/'+width+' − 4x³/'+3*width**2+')',
    context+' Bề rộng '+width+' m, chiều sâu '+depth+' m, đỉnh cao '+height+' m.',
    'Chọn x từ mép trái. Parabol đối xứng qua x = '+fmt(width/2)+' và bằng 0 ở hai mép. Lát đứng có diện tích bằng chiều sâu nhân chiều cao y(x).',
    x=>({arch:{width,depth,profile:t=>height*(1-t*t),cut:2*x/width-1}}),width/4,['m²','m³']);
}
const integrals=[
lathe('Tháp hóa chất',8,4,x=>4+x*x/16,x=>4*x+x**3/48,'4 + x²/16','4x + x³/48','Tháp cao 8 m, bán kính trong tại cao độ x là √(4+x²/16) m.','Lát ngang là đĩa. Bình phương bán kính bằng 4+x²/16.',2,'m'),
lathe('Bồn nước parabol',6,3,x=>1.5*x,x=>.75*x*x,'3x/2','3x²/4','Bồn cao 6 m có tiết diện qua trục là parabol với r² = 3x/2, x đo từ đáy.','Cắt ngang ở cao độ x cho đĩa có bán kính √(3x/2).',4,'m'),
integral('Bồn dầu nằm ngang','Mặt cắt tròn','Vị trí dọc bồn','m',8,4,()=>4*pi,x=>4*pi*x,'4π','4πx',
'Bồn dầu hình trụ nằm ngang dài 8 m và bán kính 2 m. Xét thể tích toàn bộ bồn.','Cắt vuông góc với trục dài cho đĩa bán kính 2 m, diện tích 4π m².',
x=>({horizontal:{length:8,radius:()=>2,cut:x}}),2,['m²','m³']),
integral('Tường cong X-Game','Tích phân diện tích lát cắt','Vị trí ngang','m',6,3,x=>x*x/6,x=>x**3/18,'x²/6','x³/18',
'Phần đặc dưới dốc rộng 2 m theo chiều sâu. Mặt dốc có độ cao y = x²/12 m tại vị trí x chạy từ 0 đến 6 m.',
'Lát đứng vuông góc trục x là hình chữ nhật rộng 2 m, cao x²/12 m.',
x=>({arch:{width:6,depth:2,profile:t=>sq(3*(t+1))/12,cut:x/3-1}}),4,['m²','m³']),
parabolic('Trại dã ngoại',8,5,4,2,'Khu trú dã ngoại có mái vòm parabol chạy đều theo chiều sâu.'),
lathe('Cốc rượu vang',9,4.5,x=>x+.04*x*x,x=>x*x/2+.04*x**3/3,'x + 0,04x²','x²/2 + x³/75','Phần lòng cốc sâu 9 cm. Bình phương bán kính trong ở độ cao x bằng x+0,04x² cm².','Diện tích phần chứa tại mỗi cao độ là πr².',3),
parabolic('Chòi mái cong',6,4,2.4,2.1,'Không gian dưới mái chòi có mặt cắt vòm parabol và chân vòm cùng cao độ.'),
parabolic('Lều hội chợ',10,12,4,3.5,'Lều hội chợ có hai đầu hồi dạng parabol giống nhau, mái giữ nguyên tiết diện theo chiều sâu.'),
lathe('Hộp kẹo quả trứng',12,4,x=>16*(1-sq((x-6)/6)),x=>16*(x-(x-6)**3/108),'16[1 − (x−6)²/36]','16[x − (x−6)³/108]','Hộp hình ellipsoid tròn xoay cao 12 cm, bán kính lớn nhất 4 cm ở giữa.','Từ elip tiết diện dọc có (x−6)²/36 + r²/16 = 1.',3),
lathe('Quân tốt',6,3.3,x=>1.2+2*(1-x/6)**2+.6*(x/6)**4,x=>3.2*x-x*x/3+x**3/54+x**5/10800,'1,2 + 2(1−x/6)² + 0,6(x/6)⁴','3,2x − x²/3 + x³/54 + x⁵/10.800','Một phôi quân tốt cao 6 cm có biên dạng tròn xoay. Bình phương bán kính tại cao độ x là 1,2 + 2(1−x/6)² + 0,6(x/6)⁴ cm².','Nhân bình phương bán kính với π. Khai triển các lũy thừa trước khi lấy nguyên hàm.',3),
lathe('Đế quả cầu pha lê',5,2.5,x=>9-.8*x,x=>9*x-.4*x*x,'9 − 0,8x','9x − 0,4x²','Đế pha lê cao 5 cm. Đường sinh có bán kính √(9−0,8x) cm ở cao độ x.','Cắt ngang được hình tròn có bình phương bán kính 9−0,8x.',2),
lathe('Ống sữa chua',10,5,x=>sq(2+x/10),x=>4*x+x*x/5+x**3/300,'(2 + x/10)²','4x + x²/5 + x³/300','Ruột ống cao 10 cm, bán kính tăng đều từ 2 cm ở đáy lên 3 cm ở miệng.','Biến thiên tuyến tính cho r(x)=2+x/10. Khai triển bình phương để tích phân.',5),
lathe('Lọ nước của quạ',12,6,x=>16-x*x/12,x=>16*x-x**3/36,'16 − x²/12','16x − x³/36','Lọ cao 12 cm và hẹp dần về miệng. Mặt trong được mô hình hóa bởi r² = 16−x²/12 cm².','Diện tích mặt nước ở x bằng π(16−x²/12), cũng là đạo hàm của thể tích theo mực nước.',6),
lathe('Mũ Noel',15,7.5,x=>25*sq(1-x/15),x=>25*(x-x*x/15+x**3/675),'25(1 − x/15)²','25(x − x²/15 + x³/675)','Không gian trong mũ được coi là hình nón cao 15 cm, bán kính đáy 5 cm.','Đồng dạng tại lát ngang cho r(x) = 5(1−x/15).',7.5),
lathe('Thùng rượu',10,5,x=>9-.2*sq(x-5),x=>9*x-(x-5)**3/15,'9 − (x − 5)²/5','9x − (x−5)³/15','Thùng cao 10 dm. Bình phương bán kính trong tại cao độ x là 9−(x−5)²/5 dm².','Lát ngang rộng nhất ở giữa thùng. Áp dụng diện tích đĩa πr².',2,'dm')
];

const deg = x => x*180/pi;
const xyz = (edges,dots,rest={})=>({edges,dots,axes:true,...rest});
const space=[
sp('Máng trượt nước','Vectơ và góc nghiêng','Máng thẳng bắt đầu tại (0;0;12) m, kết thúc ở (x;8;0). Nếu x = 9 m, tính góc máng với mặt đất.',
span('Tọa độ x của chân máng','m',0,18,.5,9),'Góc nghiêng','°',x=>deg(Math.atan2(12,Math.hypot(x,8))),'tan α = 12/√(x²+8²)',
'Góc giữa đường và mặt phẳng bằng góc giữa đường và hình chiếu vuông góc của nó.',
[['Chiếu xuống đất','Chiều dài hình chiếu là √(x²+8²).'],['Lập tam giác vuông','Cạnh đứng là 12 m, nên tan α = 12/√(x²+64).'],['Thế tọa độ','Tại x=9, α = arctan(12/√145) ≈ 44,90°.']],
['Khi x = 6 m, góc nghiêng bằng bao nhiêu độ? Làm tròn 2 chữ số.',6,'Hình chiếu dài √(36+64) = 10 m.'],x=>xyz([edge([0,0,12],[x,8,0]),edge([0,0,0],[x,8,0]),edge([0,0,0],[0,0,12])],[[x,8,0]])),
sp('Đèn treo ba dây','Độ dài vectơ','Đèn treo tại P(0;0;z). Ba điểm neo cùng nằm ở độ cao 6 m và cách hình chiếu của P trên trần 2 m. Tính tổng chiều dài dây khi đèn ở độ cao 3 m.',
span('Độ cao đèn','m',1,6,.1,3),'Tổng chiều dài dây','m',z=>3*Math.hypot(2,6-z),'L = 3√[4+(6−z)²]',
'Ba dây bằng nhau vì ba điểm neo cùng độ cao và có cùng độ lệch ngang.',
[['Chọn tâm','Lấy P làm mốc ngang. Khoảng cách ngang mỗi dây là 2 m, độ chênh đứng 6−z.'],['Tính một dây','Dùng Pythagore để được √[4+(6−z)²].'],['Cộng','Ở z = 3, tổng là 3√13 ≈ 10,82 m.']],
['Đưa đèn lên độ cao 4 m. Tổng chiều dài dây bằng bao nhiêu? Làm tròn 2 chữ số.',4,'Mỗi dây dài √8 m. Nhân 3.'],z=>{const p=[0,0,z];const anchors=Array.from({length:3},(_,i)=>[2*Math.cos(i*2*pi/3),2*Math.sin(i*2*pi/3),6]);return xyz(anchors.map(a=>edge(a,p)),[p,...anchors]);}),
sp('Bể nước chân sắt','Đường chéo không gian','Giằng nối chân khung ở (0;0;0) đến góc đối diện dưới đáy bể ở (4;3;h) m. Tính chiều dài giằng nếu đáy bể cao 12 m.',
span('Cao độ đáy bể','m',2,15,.5,12),'Chiều dài giằng','m',h=>Math.hypot(4,3,h),'L = √(4²+3²+h²)',
'Bình phương độ dài bằng tổng bình phương ba độ chênh tọa độ.',
[['Chiếu giằng','Trong mặt đất, đoạn chiếu là đường chéo 4×3, dài 5 m.'],['Gắn chiều cao','Giằng là cạnh huyền của tam giác có hai cạnh góc vuông 5 và h.'],['Thế số','h = 12 cho L = √169 = 13 m.']],
['Nếu chỉ nâng đáy 7 m, giằng dài bao nhiêu? Làm tròn 2 chữ số.',7,'Dùng √(25+49).'],h=>xyz([edge([0,0,0],[4,3,h]),...[0,4].flatMap(x=>[0,3].map(y=>edge([x,y,0],[x,y,h])))],[[4,3,h]],{blocks:[block(2,1.5,h,4,3,2)]})),
sp('Tòa nhà lăng trụ','Khoảng cách hai điểm','Tòa nhà là hộp chữ nhật dài 8 m, rộng 6 m và cao h m. Một dây nối góc dưới với góc trên đối diện. Tính độ dài nếu h = 24 m.',
span('Chiều cao tòa nhà','m',4,36,1,24),'Đường chéo','m',h=>Math.hypot(10,h),'d = √(8²+6²+h²)',
'Từ đường chéo đáy dài 10 m, dựng một tam giác vuông có cạnh đứng bằng chiều cao.',
[['Tính đường chéo đáy','√(8²+6²) = 10.'],['Lập biểu thức','d² = 10²+h².'],['Thế số','h = 24 cho d = 26 m.']],
['Nếu tòa nhà cao 18 m, đường chéo dài bao nhiêu? Làm tròn 2 chữ số.',18,'d = √424 m.'],h=>xyz([edge([-4,-3,0],[4,3,h])],[[-4,-3,0],[4,3,h]],{blocks:[{...block(0,0,0,8,6,h),open:true,alpha:.35}]})),
sp('Chim bói cá','Giao đường thẳng và mặt phẳng','Chim từ (0;0;z) lao theo vectơ (2;1;−3). Mặt nước là z = 0. Với z = 6 m, chim bay bao nhiêu mét trước khi chạm nước?',
span('Cao độ xuất phát','m',0,12,.5,6),'Quãng đường bay','m',z=>z*Math.sqrt(14)/3,'t = z₀/3; d = t√14',
'Điểm trên tia có dạng A + tv với t ≥ 0.',
[['Tìm giao','Thành phần cao độ z₀−3t bằng 0 khi t = z₀/3.'],['Tính độ dài','Vectơ chỉ phương có chuẩn √14.'],['Thế số','z₀ = 6 cho d = 2√14 ≈ 7,48 m.']],
['Nếu xuất phát ở cao độ 9 m, quãng đường bằng bao nhiêu? Làm tròn 2 chữ số.',9,'Dùng t = 3 và nhân √14.'],z=>xyz([edge([0,0,z],[2*z/3,z/3,0])],[[0,0,z],[2*z/3,z/3,0]],{panels:[{points:[[0,-2,0],[8,-2,0],[8,5,0],[0,5,0]]}]})),
sp('Hai khinh khí cầu','Khoảng cách đồng thời','Hai khí cầu ở A(t;0;3) và B(4;3;6) km, t là số km dọc đường bay của A. Tìm khoảng cách ngắn nhất khi 0 ≤ t ≤ 8.',
span('Vị trí dọc đường của A','km',0,8,.1,2),'Khoảng cách','km',t=>Math.hypot(t-4,3,3),'d² = (t−4)²+18',
'Tối ưu bình phương khoảng cách cho cùng điểm tối ưu với khoảng cách.',
[['Trừ tọa độ','Hai thành phần cố định có độ lớn 3 và 3.'],['Tìm điểm gần nhất','Bình phương (t−4)² nhỏ nhất bằng 0 ở t = 4.'],['Kết luận','dmin = √18 ≈ 4,24 km.']],
['Tại t = 1, hai khí cầu cách nhau bao nhiêu? Làm tròn 2 chữ số.',1,'d = √(9+18) = √27 km.'],t=>xyz([edge([0,0,3],[8,0,3]),edge([t,0,3],[4,3,6])],[[t,0,3],[4,3,6]])),
sp('Máy tập cáp chéo','Độ dài đoạn thẳng','Hai điểm của cáp cách nhau 3 m theo trục x, 1 m theo trục y và h m theo phương đứng. Tính chiều dài khi h = 2 m.',
span('Chênh lệch độ cao','m',0,4,.1,2),'Chiều dài cáp','m',h=>Math.hypot(3,1,h),'L = √(10+h²)',
'Cộng bình phương độ chênh trên ba trục vuông góc.',
[['Lập vectơ nối','Từ A đến B được vectơ (3;1;h).'],['Tính chuẩn','Chuẩn vectơ là √(3²+1²+h²).'],['Thế số','h = 2 cho L = √14 ≈ 3,74 m.']],
['Khi h = 3 m, chiều dài cáp bằng bao nhiêu? Làm tròn 2 chữ số.',3,'Thế vào √(10+9).'],h=>xyz([edge([0,0,0],[3,1,h]),edge([0,0,0],[0,0,3]),edge([3,1,0],[3,1,4])],[[0,0,0],[3,1,h]])),
sp('Tia sáng qua kính','Giao tia và mặt phẳng','Tia xuất phát tại O theo hướng (2;1;2). Tấm kính phẳng nằm trên mặt z = h, đủ rộng để tia gặp kính. Nếu h = 4 m, tia đi bao xa trước khi chạm kính?',
span('Độ cao kính','m',1,8,.1,4),'Độ dài tia tới kính','m',h=>1.5*h,'t = h/2; d = 3h/2',
'Thế phương trình tham số của tia vào phương trình mặt phẳng.',
[['Viết tia','Điểm trên tia có tọa độ (2t;t;2t) với t ≥ 0.'],['Tìm giao điểm','Mặt kính z = h cho t = h/2.'],['Đo độ dài','Vectơ chỉ phương dài 3, nên d = 3h/2. Với h = 4, d = 6 m.']],
['Đưa kính lên h = 6 m. Tia dài bao nhiêu tới kính?',6,'Tính 3×6/2.'],h=>xyz([edge([0,0,0],[h,h/2,h])],[[h,h/2,h]],{panels:[{points:[[0,0,h],[9,0,h],[9,5,h],[0,5,h]]}]})),
sp('Bình cá cảnh','Mặt cầu cắt mặt phẳng','Bình cầu bán kính 5 dm, tâm O. Mặt nước là mặt phẳng ngang cắt bình ở cao độ z so với tâm. Tính diện tích mặt thoáng khi z = 3 dm.',
span('Cao độ so với tâm','dm',-5,5,.1,3),'Diện tích mặt thoáng','dm²',z=>pi*(25-z*z),'A = π(25−z²)',
'Tâm đường tròn giao tuyến là hình chiếu của tâm cầu lên mặt phẳng.',
[['Lập phương trình','Mặt cầu x²+y²+z²=25.'],['Thế cao độ','Mặt cắt cho bán kính √(25−z²).'],['Thế số','z = 3 cho bán kính 4 dm và diện tích 16π ≈ 50,27 dm².']],
['Khi z = −4 dm, tính diện tích mặt thoáng. Làm tròn 2 chữ số.',-4,'Bình phương bán kính là 25−16 = 9.'],z=>({axes:true,origin:[0,0,5],lathe:{height:10,radius:h=>Math.sqrt(Math.max(0,25-(h-5)**2)),cut:z+5,fill:true}})),
sp('Giá đỡ nhà kho','Trung điểm và vectơ','Một thanh nối điểm A(0;0;0) và B(6;2;h) m. Một dây treo thẳng đứng hạ từ trung điểm thanh xuống sàn. Tính độ dài dây khi h = 6 m.',
span('Độ cao đầu B','m',1,10,.5,6),'Chiều dài dây đứng','m',h=>h/2,'M = (3; 1; h/2)',
'Tọa độ trung điểm bằng trung bình cộng hai đầu mút. Độ dài dây đứng bằng hiệu cao độ.',
[['Tìm M','Trung bình từng tọa độ của A và B được M(3;1;h/2).'],['Chiếu xuống sàn','Hình chiếu là H(3;1;0).'],['Đọc chiều dài','MH = h/2, với h = 6 thì dây dài 3 m.']],
['Nếu đầu B cao 9 m thì dây dài bao nhiêu?',9,'Lấy trung bình cộng cao độ hai đầu.'],h=>xyz([edge([0,0,0],[6,2,h]),edge([3,1,0],[3,1,h/2])],[[3,1,h/2],[6,2,h]])),
sp('Bóng lăn Zorbing','Khoảng cách điểm đến mặt phẳng','Mặt dốc có phương trình 3x+4z=0. Tâm quả cầu ở (0;0;h). Quả cầu tiếp xúc dốc. Tính bán kính nếu h = 5 m.',
span('Cao độ tâm','m',1,9,.1,5),'Bán kính tiếp xúc','m',h=>4*h/5,'r = |3x₀+4z₀|/√(3²+4²)',
'Khi mặt cầu tiếp xúc một mặt phẳng, độ dài bán kính bằng khoảng cách từ tâm tới mặt phẳng.',
[['Nhận pháp tuyến','Mặt phẳng có vectơ pháp tuyến (3;0;4), chuẩn 5.'],['Thế tọa độ','Tử số bằng |4h|.'],['Kết luận','r = 4h/5, nên h = 5 cho r = 4 m.']],
['Nếu tâm ở độ cao 7,5 m, bán kính bằng bao nhiêu?',7.5,'Nhân 7,5 với 4/5.'],h=>xyz([edge([0,0,h],[-.48*h,0,.36*h])],[[0,0,h],[-.48*h,0,.36*h]],{balls:[{at:[0,0,h],r:.8*h}],panels:[{points:[[-9,-6,6.75],[5,-6,-3.75],[5,6,-3.75],[-9,6,6.75]]}]})),
sp('Mối hàn góc tường','Góc giữa đường và mặt phẳng','Đường hàn có vectơ chỉ phương (3;0;h), với h > 0. Tính góc đường hàn với sàn z = 0 khi h = 4.',
span('Thành phần đứng h','đơn vị',1,8,.1,4),'Góc với sàn','°',h=>deg(Math.atan2(h,3)),'tan α = h/3',
'Chiếu đường hàn xuống sàn, thành phần z mất đi. Góc lấy giữa vectơ và hình chiếu.',
[['Tìm hình chiếu','Vectơ chiếu là (3;0;0), dài 3.'],['Dùng tỉ số','Cạnh đứng dài h, nên α = arctan(h/3).'],['Thế số','h = 4 cho α ≈ 53,13°.']],
['Nếu thành phần đứng là 3, góc với sàn là bao nhiêu?',3,'arctan(1) = 45°.'],h=>xyz([edge([0,0,0],[3,0,h]),edge([0,0,0],[3,0,0])],[[3,0,h]],{panels:[{points:[[0,0,0],[6,0,0],[6,0,8],[0,0,8]]}]})),
sp('Vòm lều trong Oxyz','Góc giữa hai vectơ','Hai thanh từ đỉnh S(0;0;h) xuống A(−3;0;0) và B(3;0;0). Tính góc ASB khi h = 4 m.',
span('Độ cao đỉnh lều','m',1,8,.1,4),'Góc giữa thanh','°',h=>deg(2*Math.atan2(3,h)),'cos ∠ASB = (h²−9)/(h²+9)',
'Tích vô hướng cho cos góc. Do đối xứng, đường cao chia đôi góc ở đỉnh.',
[['Lấy hai vectơ','SA = (−3;0;−h), SB = (3;0;−h).'],['Tính cos','Tử h²−9, mẫu h²+9. Có thể dùng 2arctan(3/h).'],['Thế số','h = 4 cho góc ≈ 73,74°.']],
['Nếu đỉnh cao 3 m, góc giữa hai thanh bằng bao nhiêu?',3,'Hai vectơ có tích vô hướng 0, góc bằng 90°.'],h=>xyz([edge([0,0,h],[-3,0,0]),edge([0,0,h],[3,0,0]),edge([0,0,h],[0,0,0])],[[0,0,h]],{panels:[{points:[[-3,0,0],[3,0,0],[0,0,h]]}]}))
];

const regular=(n,r,z)=>Array.from({length:n},(_,i)=>[r*Math.cos(i*2*pi/n),r*Math.sin(i*2*pi/n),z]);
function frustum(n,lower,upper,height) {return {lofts:[{bottom:regular(n,lower,0),top:regular(n,upper,height)}]};}
const schoolMath=[
school('Sọt chóp cụt','Thể tích chóp cụt','Sọt có hai đáy vuông song song cạnh 20 cm và 30 cm. Tính dung tích khi chiều cao 24 cm.',
span('Chiều cao sọt','cm',8,40,1,24),'Dung tích','cm³',h=>1900*h/3,'V = h(S₁+√(S₁S₂)+S₂)/3',
'Hai đáy đồng dạng. Trong công thức thể tích, dùng diện tích mỗi đáy.',
[['Tính diện tích đáy','S₁ = 400, S₂ = 900 cm².'],['Thế vào công thức','√(400×900)=600. V = (400+600+900)h/3.'],['Kết luận','V = 15.200 cm³ = 15,2 lít tại h = 24 cm.']],
['Nếu chiều cao là 30 cm, thể tích bằng bao nhiêu cm³?',30,'Nhân 1.900 với 30/3.'],h=>frustum(4,20/Math.sqrt(2),30/Math.sqrt(2),h)),
school('Lều lăng trụ','Thể tích lăng trụ đứng','Lều dài 5 m, hai đầu hồi là tam giác có đáy 4 m và cao h. Tính thể tích khi h = 2 m.',
span('Chiều cao lều','m',.5,3,.1,2),'Thể tích','m³',h=>10*h,'V = (4h/2)·5',
'Thể tích lăng trụ bằng diện tích mặt đáy tam giác nhân khoảng cách giữa hai mặt đáy.',
[['Tính diện tích đầu hồi','S = 4h/2 = 2h.'],['Nhân chiều dài','V = 2h×5 = 10h.'],['Thế số','h = 2 cho V = 20 m³.']],
['Nếu nâng chiều cao lên 2,5 m thì thể tích bằng bao nhiêu?',2.5,'Tính 10×2,5.'],h=>({lofts:[{bottom:[[-2,-2.5,0],[2,-2.5,0],[0,-2.5,h]],top:[[-2,2.5,0],[2,2.5,0],[0,2.5,h]]}]})),
school('Cây đu hội Lim','Lượng giác trong tam giác','Xích đu dài 4 m. Tại vị trí góc θ so với phương thẳng đứng, ghế cao hơn vị trí thấp nhất bao nhiêu? Xét θ = 60°.',
span('Góc lệch','°',0,80,1,60),'Độ cao tăng','m',a=>4*(1-Math.cos(a*pi/180)),'Δh = 4(1−cos θ)',
'Hình chiếu thẳng đứng của dây dài 4 m bằng 4cos θ.',
[['Giá trị thấp nhất','Khi dây thẳng đứng, ghế cách trục treo 4 m theo phương đứng.'],['Xét góc θ','Khoảng cách đứng còn 4cos θ.'],['Thế góc','Khi θ = 60°, Δh = 4(1−1/2) = 2 m.']],
['Ở θ = 30°, ghế cao thêm bao nhiêu? Làm tròn 2 chữ số.',30,'Thay cos 30° = √3/2.'],a=>{const A=[0,0,5], B=[4*Math.sin(a*pi/180),0,5-4*Math.cos(a*pi/180)];return {edges:[edge(A,B),edge(A,[0,0,1]),edge([0,-2,0],A),edge([0,2,0],A)],blocks:[block(B[0],B[1],B[2]-.1,.85,1,.11)]};}),
school('Máy nước nóng','Thể tích hình trụ','Bình nước nóng hình trụ dài 1,2 m, bán kính trong r m. Tính dung tích theo lít với r = 0,25 m.',
span('Bán kính','m',.15,.45,.01,.25),'Dung tích','lít',r=>1200*pi*r*r,'V = 1.200πr² (lít)',
'Thể tích trụ bằng diện tích đáy nhân chiều dài. 1 m³ = 1.000 lít.',
[['Tính m³','V = πr²·1,2.'],['Đổi đơn vị','Nhân thêm 1.000 để đổi ra lít.'],['Thế số','r = 0,25 cho 75π ≈ 235,62 lít.']],
['Với bán kính 0,30 m, dung tích là bao nhiêu lít? Làm tròn 2 chữ số.',.3,'Tính 1.200π·0,3².'],r=>({horizontal:{length:1.2,radius:()=>r,cut:.6}})),
school('Đền Kukulcan','Thể tích chóp cụt xếp tầng','Dựng mô hình ba khối chóp cụt vuông với các cạnh ngang lần lượt 12, 9, 6, 3 dm từ đáy lên. Các tầng cao bằng nhau. Nếu mỗi tầng cao 2 dm, thể tích cả mô hình bằng bao nhiêu?',
span('Chiều cao mỗi tầng','dm',.5,4,.1,2),'Thể tích','dm³',h=>189*h,'V = h[(144+108+81)+(81+54+36)+(36+18+9)]/3',
'Mỗi tầng dùng công thức chóp cụt. Thể tích toàn bộ bằng tổng của ba tầng liên tiếp.',
[['Liệt kê diện tích','Các mặt vuông có diện tích 144, 81, 36 và 9 dm².'],['Tính theo tầng','Ba tầng lần lượt có thể tích 111h, 57h và 21h.'],['Cộng','Tổng 189h. Với h = 2, V = 378 dm³.']],
['Nếu mỗi tầng cao 3 dm, thể tích toàn bộ là bao nhiêu?',3,'Nhân 189×3.'],h=>({lofts:[12,9,6].map((side,i)=>({bottom:regular(4,side/Math.sqrt(2),i*h),top:regular(4,(side-3)/Math.sqrt(2),(i+1)*h)}))})),
school('Nhà mái Thái','Diện tích hai mặt mái','Nhà dài 12 m, rộng 8 m. Mái đối xứng, đỉnh cao hơn mép mái h m. Bỏ qua phần đua mái. Tính tổng diện tích hai mặt mái khi h = 3 m.',
span('Độ cao đỉnh mái','m',1,7,.1,3),'Diện tích mái','m²',h=>24*Math.hypot(4,h),'S = 24√(4²+h²)',
'Cạnh nghiêng mái là cạnh huyền trong nửa tam giác đầu hồi. Mỗi mặt mái là hình chữ nhật.',
[['Chia đôi mặt cắt','Nửa bề rộng nhà là 4 m. Độ nghiêng có chiều dài √(16+h²).'],['Tính diện tích','Mỗi mặt có diện tích 12√(16+h²).'],['Thế số','Với h = 3, hai mặt có tổng 120 m².']],
['Nếu đỉnh cao hơn mép 5 m, diện tích là bao nhiêu? Làm tròn 2 chữ số.',5,'Tính 24√41.'],h=>({lofts:[{bottom:[[-4,-6,0],[4,-6,0],[0,-6,h]],top:[[-4,6,0],[4,6,0],[0,6,h]]}]})),
school('Đèn chóp tam giác','Thể tích hình chóp','Đáy một chụp đèn là tam giác đều cạnh 6 cm. Đỉnh cách đáy h cm theo phương vuông góc. Tính thể tích khi h = 12 cm.',
span('Chiều cao chóp','cm',3,18,1,12),'Thể tích','cm³',h=>3*Math.sqrt(3)*h,'V = (1/3)(6²√3/4)h',
'Diện tích tam giác đều cạnh a là a²√3/4. Thể tích chóp bằng một phần ba lăng trụ cùng đáy và chiều cao.',
[['Diện tích đáy','S = 36√3/4 = 9√3 cm².'],['Lập thể tích','V = Sh/3 = 3√3h.'],['Thế số','h = 12 cho V = 36√3 ≈ 62,35 cm³.']],
['Với h = 10 cm, tính thể tích. Làm tròn 2 chữ số.',10,'V = 30√3 cm³.'],h=>frustum(3,6/Math.sqrt(3),0,h)),
school('Giá ba chân','Tam giác vuông trong không gian','Ba chân của giá cách hình chiếu của đỉnh trên sàn một khoảng 0,8 m. Đỉnh cao h m. Tính tổng chiều dài ba chân nếu h = 1,5 m.',
span('Chiều cao giá','m',.4,2.2,.1,1.5),'Tổng chiều dài chân','m',h=>3*Math.hypot(.8,h),'L = 3√(0,8²+h²)',
'Ba chân tạo ba tam giác vuông bằng nhau với cạnh đứng h.',
[['Tính một chân','Cạnh huyền có độ dài √(0,64+h²).'],['Thế số','h = 1,5 cho một chân dài √2,89 = 1,7 m.'],['Cộng','Tổng chiều dài là 5,1 m.']],
['Nếu h = 1 m, tổng chiều dài là bao nhiêu? Làm tròn 2 chữ số.',1,'Nhân √1,64 với 3.'],h=>({edges:regular(3,.8,0).map(p=>edge(p,[0,0,h])),dots:[[0,0,h]]})),
school('Ao cá hồi','Quy hoạch tuyến tính','Giả sử đã bố trí x ngăn cá hồi và y ngăn cá giống khác. Tổng tối đa 20 ngăn. Mỗi ngăn cá hồi dùng 2 suất lọc, mỗi ngăn còn lại dùng 1 suất, tối đa 30 suất. Lãi lần lượt 5 và 3 triệu đồng/ngăn. Với mỗi x nguyên, dùng số y lớn nhất. Chọn x,y để lãi cao nhất.',
span('Số ngăn cá hồi','ngăn',0,15,1,8),'Lãi lớn nhất với x','triệu đồng',x=>5*x+3*Math.min(20-x,30-2*x),'y = min(20−x, 30−2x); L = 5x+3y',
'Lãi tăng theo y với x cố định. Hai ràng buộc tạo hai đoạn biên của miền khả thi.',
[['Tìm điểm gãy','20−x = 30−2x tại x = 10.'],['So sánh hai miền','Khi x ≤ 10, L = 60+2x tăng. Khi x ≥ 10, L = 90−x giảm.'],['Kết luận','Chọn x = 10 và y = 10, lãi bằng 80 triệu đồng.']],
['Nếu đã chọn 12 ngăn cá hồi, lãi lớn nhất là bao nhiêu triệu đồng?',12,'Còn 30−24 = 6 suất lọc, nên y = 6.'],x=>{const y=Math.min(20-x,30-2*x);return {tokens:{count:x+y,marked:x,label:'Cá hồi / ngăn khác'}};}),
school('Vở và bút bi','Tối ưu nguyên','Ngân sách 120 nghìn đồng. Vở giá 12 nghìn, bút giá 5 nghìn. Nếu chọn x quyển vở, mua số bút tối đa với ngân sách còn lại. Tính tổng số món khi x = 6.',
span('Số vở','quyển',0,10,1,6),'Tổng số món','món',x=>x+Math.floor((120-12*x)/5),'N = x + ⌊(120−12x)/5⌋',
'Số lượng phải nguyên. Lấy phần nguyên của ngân sách còn lại chia cho giá bút.',
[['Tính tiền vở','6 quyển hết 72 nghìn đồng.'],['Tính số bút','Còn 48 nghìn, mua được ⌊48/5⌋ = 9 bút.'],['Cộng','Tổng 15 món, dư 3 nghìn đồng.']],
['Nếu chọn 7 quyển vở, tổng số món nhiều nhất là bao nhiêu?',7,'Còn 36 nghìn nên mua được 7 bút.'],x=>({tokens:{count:x+Math.floor((120-12*x)/5),marked:x,label:'Vở / bút'}})),
school('Lều chóp','Thể tích chóp đáy vuông','Lều có đáy vuông cạnh 3 m, đỉnh ở trên tâm đáy và cao h m. Hỏi thể tích khi h = 2 m.',
span('Chiều cao','m',.5,4,.1,2),'Thể tích','m³',h=>3*h,'V = 3²h/3',
'Thể tích chóp là một phần ba diện tích đáy nhân đường cao.',
[['Tính đáy','Diện tích 9 m².'],['Tính thể tích','V = 9h/3 = 3h.'],['Thế số','Tại h = 2, thể tích là 6 m³.']],
['Nếu đỉnh cao 2,7 m, thể tích là bao nhiêu?',2.7,'Nhân 3×2,7.'],h=>frustum(4,3/Math.sqrt(2),0,h)),
school('Cầu cổng vòm','Mô hình hàm bậc hai','Vòm cao 8 m tại tâm và có hai chân cách nhau 16 m. Tại điểm cách tâm ngang x m, chiều cao của vòm bằng bao nhiêu? Xét x = 4.',
span('Khoảng ngang từ tâm','m',0,8,.1,4),'Chiều cao vòm','m',x=>8-x*x/8,'h(x) = 8 − x²/8',
'Parabol nhận trục đứng qua đỉnh làm trục đối xứng. Từ chân vòm xác định hệ số bậc hai.',
[['Đặt hàm','Vì đỉnh ở (0;8), dùng y = 8 + ax².'],['Tìm a','Tại x = 8 thì y = 0 nên a = −1/8.'],['Thế số','x = 4 cho h = 6 m.']],
['Cách tâm 6 m thì vòm cao bao nhiêu?',6,'h = 8 − 36/8 = 3,5 m.'],x=>({arch:{width:16,depth:3,profile:t=>8*(1-t*t),cut:x/8}}))
];

const bern=(n,p,rng)=>Array.from({length:n},()=>rng()<p);
const successes=xs=>xs.filter(Boolean).length;
const draw=(n,g,k,rng)=>{
  const result=[];
  for(let i=0;i<k;i++){
    const hit=rng()<g/(n-i);
    result.push(hit);
    if(hit)g--;
  }
  return result;
};
const shuffle=(n,rng)=>{
  const xs=Array.from({length:n},(_,i)=>i);
  for(let i=n-1;i>0;i--){
    const j=Math.floor(rng()*(i+1));[xs[i],xs[j]]=[xs[j],xs[i]];
  }
  return xs;
};
const tokens=(count,marked,label,kind)=>({tokens:{count,marked,label,kind}});
function probability(title,tag,prompt,control,calc,formula,knowledge,steps,exercise,scene,trial) {
  const sample=trial?({x},rng=Math.random)=>trial(x,rng):undefined;
  return data({group:4,title,tag,prompt,control,measure:'Xác suất lý thuyết',unit:'%',solve:x=>100*calc(x),formula,knowledge,steps,
    exercise:[exercise[0]+' Nhập kết quả theo phần trăm, làm tròn 2 chữ số.',exercise[1],exercise[2]],scene,sample});
}
const count=(title,tag,prompt,control,measure,unit,calc,formula,knowledge,steps,exercise,scene)=>challenge(4,title,tag,prompt,control,measure,unit,calc,formula,knowledge,steps,exercise,scene,false);
const trial=(outcomes,success,detail)=>({view:outcomes,success,detail});
const jumpGraph=[[1,2],[0,2,3],[0,1,4],[1,4],[2,3]];
function paths(n,links,start) {
  let states=links.map((_,i)=>Number(i===start));
  for(let step=0;step<n;step++){
    const next=links.map(()=>0);
    links.forEach((adj,i)=>adj.forEach(j=>{next[j]+=states[i];}));
    states=next;
  }
  return states;
}
const knightGraph=Array.from({length:25},(_,i)=>Array.from({length:25},(_,j)=>j).filter(j=>{
  const dx=Math.abs(i%5-j%5),dy=Math.abs(Math.floor(i/5)-Math.floor(j/5));
  return dx*dy===2;
}));
const edgeList=links=>links.flatMap((adj,i)=>adj.filter(j=>j>i).map(j=>[i,j]));
const probabilityLessons=[
probability('Hộp 30 viên bi','Xác suất cổ điển','Hộp có 30 viên bi, trong đó g viên xanh. Rút đồng thời hai viên. Tính xác suất cả hai xanh khi g = 12.',
span('Số bi xanh','viên',0,30,1,12),g=>choose(g,2)/choose(30,2),'P = C(g,2)/C(30,2)',
'Chọn hai viên không hoàn lại và không quan tâm thứ tự. Mọi cặp viên cụ thể có xác suất như nhau.',
[['Đếm mẫu','Có C(30,2) = 435 cặp.'],['Đếm thuận lợi','Với g = 12, có C(12,2)=66 cặp xanh.'],['Chia','P = 66/435 ≈ 15,17%.']],
['Nếu hộp có 15 viên xanh, xác suất cả hai xanh bao nhiêu?',15,'Tính C(15,2)/435 × 100.'],
g=>tokens(30,g,'Bi xanh / bi nâu','ball'),(g,rng)=>{const a=draw(30,g,2,rng);return trial(a,a.every(Boolean));}),
probability('Tung bốn đồng xu','Phân phối nhị thức','Tung bốn đồng xu độc lập, mỗi xu có xác suất ngửa p. Khi xu công bằng, xác suất có đúng hai mặt ngửa là bao nhiêu?',
span('Xác suất ngửa','%',0,100,1,50),p=>6*sq(p/100)*sq(1-p/100),'P(X=2) = 6p²(1−p)²',
'Với đúng hai ngửa, chọn hai vị trí ngửa rồi nhân xác suất của một chuỗi.',
[['Đếm chuỗi','C(4,2) = 6 chuỗi.'],['Tính một chuỗi','p²(1−p)² theo tính độc lập.'],['Nhân','Khi p = 1/2, P = 6/16 = 37,5%.']],
['Nếu p = 60%, xác suất có đúng hai mặt ngửa là bao nhiêu?',60,'Thay p = 0,6 vào 6p²(1−p)².'],
p=>tokens(4,Math.round(4*p/100),'Xu · tỷ lệ màu minh họa','coin'),(p,rng)=>{const a=bern(4,p/100,rng);return trial(a,successes(a)===2);}),
count('Ngựa nhảy đỉnh','Đếm đường đi trên bàn cờ','Quân mã xuất phát tại ô c3 trên bàn cờ 5×5. Mỗi nước đi lệch 1 ô theo một trục và 2 ô theo trục kia. Tính số đường trở về c3 sau đúng 4 nước.',
span('Số nước đi','nước',0,8,1,4),'Số đường về c3','đường',n=>paths(n,knightGraph,12)[12],
'F₀(c3)=1;  Fₖ₊₁(v)=Σ Fₖ(u), với u có thể nhảy tới v',
'Quy hoạch động đếm đường đi theo điểm cuối. Ô ngoài bàn bị loại.',
[['Khởi tạo','Chỉ c3 có giá trị 1 khi k = 0.'],['Cập nhật','Tại mỗi lượt, chuyển số đường của một ô sang từng ô mã có thể đến.'],['Đọc ô c3','Ở bước 4, kết quả là '+fmt(paths(4,knightGraph,12)[12])+' đường.']],
['Nếu chỉ đi đúng 2 nước thì có bao nhiêu đường quay lại c3?',2,'Từ c3 có 8 nước mã. Mỗi nước có đúng một cách đi ngược.'],
n=>({board:{size:5,values:paths(n,knightGraph,12),start:12}})),
count('Ếch nhảy lá sen','Đếm đường đi trên đồ thị','Năm lá A, B, C, D, E có các cầu nối AB, AC, BC, BD, CE, DE. Mỗi lần ếch nhảy qua đúng một cầu. Tính số đường đi từ A tới E sau đúng 3 lần.',
span('Số lần nhảy','lần',0,8,1,3),'Số đường từ A tới E','đường',n=>paths(n,jumpGraph,0)[4],
'F₀(A)=1;  Fₖ₊₁(v)=Σ Fₖ(u) trên các lá nối với v',
'Đếm các đường đi có thứ tự. Một lá có thể được thăm nhiều lần.',
[['Lượt 1','Từ A tới B hoặc C.'],['Lượt 2','Số đường tới A,B,C,D,E lần lượt 2,1,1,1,1.'],['Lượt 3','E nối C và D, nên có 1+1=2 đường.']],
['Sau đúng 2 lần nhảy, có bao nhiêu đường từ A tới E?',2,'Chỉ có A → C → E.'],
n=>({network:{points:[[-3,0,0],[-1,2,0],[-1,-2,0],[2,2,0],[3,0,0]],edges:edgeList(jumpGraph),values:paths(n,jumpGraph,0),labels:['A','B','C','D','E']}})),
probability('Đường đua tròn','Xác suất cổ điển','Hai tay đua được bốc thăm hai vị trí khác nhau trên vòng tròn có n vị trí đều nhau. Khi n = 10, xác suất đứng ở hai vị trí kề nhau bằng bao nhiêu?',
span('Số vị trí','vị trí',3,24,1,10),n=>2/(n-1),'P = 2/(n−1)',
'Cố định vị trí người thứ nhất bằng đối xứng. Chỉ hai vị trí trong số n−1 vị trí còn lại là kề.',
[['Cố định vị trí','Đặt người thứ nhất ở ô 0.'],['Đếm thuận lợi','Người thứ hai ở ô 1 hoặc n−1.'],['Chia','Với n = 10, P = 2/9 ≈ 22,22%.']],
['Khi có 9 vị trí, xác suất đứng kề là bao nhiêu?',9,'Chia 2 cho 8 rồi đổi sang phần trăm.'],
n=>({network:{points:regular(n,4,0),edges:Array.from({length:n},(_,i)=>[i,(i+1)%n]),values:Array.from({length:n},(_,i)=>Number(i===1||i===n-1)),labels:[]}}),
(n,rng)=>{const j=1+Math.floor(rng()*(n-1));return trial([j===1,j===n-1],j===1||j===n-1,{position:j});}),
probability('Ô ăn quan','Rút có hoàn lại','Trong thí nghiệm, dùng một ô trên bàn ô ăn quan để đựng 2 viên đỏ và 6 viên xanh. Rút n lượt, mỗi lượt trả viên lại trước khi rút tiếp. Tính xác suất thấy ít nhất một viên đỏ sau 3 lượt.',
span('Số lượt rút','lượt',1,8,1,3),n=>1-.75**n,'P(ít nhất một đỏ) = 1 − (3/4)ⁿ',
'Biến cố đối là tất cả lượt đều xanh. Hoàn lại giúp các lượt độc lập.',
[['Tính một lượt xanh','6/8 = 3/4.'],['Tính biến cố đối','Ba lượt toàn xanh có xác suất (3/4)³ = 27/64.'],['Lấy phần bù','P = 37/64 ≈ 57,81%.']],
['Nếu rút 4 lượt, xác suất thấy ít nhất một đỏ bằng bao nhiêu?',4,'Tính 1 − (3/4)⁴.'],
n=>({boards:[{count:8,marked:2,kind:'ball',label:'2 đỏ · 6 xanh'},{count:n,marked:0,label:'Lượt rút'}]}),drawWithReplacement),
probability('Giá sách bốn ngăn','Biến cố đối','Phân độc lập n quyển sách phân biệt vào bốn ngăn, mỗi ngăn đồng xác suất. Tính xác suất ngăn 1 có sách khi n = 5.',
span('Số sách','quyển',1,12,1,5),n=>1-.75**n,'P(ngăn 1 có sách) = 1 − (3/4)ⁿ',
'Một quyển vào bất kỳ ngăn nào với xác suất 1/4. Xét biến cố ngăn 1 trống.',
[['Tính một lượt','Một quyển tránh ngăn 1 với xác suất 3/4.'],['Tính n lượt','Xác suất mọi quyển tránh ngăn 1 là (3/4)ⁿ.'],['Trả lời','Với 5 quyển, P = 1−243/1.024 ≈ 76,27%.']],
['Nếu chỉ xếp 2 quyển, xác suất ngăn 1 có sách bằng bao nhiêu?',2,'Lấy bù 1 − 9/16.'],
n=>({blocks:[0,1,2,3].map(i=>({...block((i-1.5)*1.6,0,0,1.5,2,1.25),open:true})),tokens:{count:n,marked:0,label:'Sách cần xếp',kind:'block'}}),
(n,rng)=>{const shelves=Array.from({length:n},()=>Math.floor(4*rng()));const a=shelves.map(n=>n===0);return trial(a,a.some(Boolean),{shelves});}),
probability('Cam hai nông trại','Xác suất toàn phần','Siêu thị lấy p% cam từ trại A và phần còn lại từ B. Tỷ lệ cam loại I lần lượt là 90% và 70%. Khi p = 60%, chọn ngẫu nhiên một quả thì xác suất là cam loại I bằng bao nhiêu?',
span('Tỷ trọng từ trại A','%',0,100,1,60),p=>.7+.2*p/100,'P(I) = 0,9P(A) + 0,7P(B)',
'Hai nguồn loại trừ nhau và bao phủ toàn bộ cam. Nhân xác suất theo từng nhánh rồi cộng.',
[['Nhánh A','0,6 × 0,9 = 0,54.'],['Nhánh B','0,4 × 0,7 = 0,28.'],['Cộng','P(I) = 0,82 = 82%.']],
['Khi trại A cung cấp 80%, xác suất gặp cam loại I là bao nhiêu?',80,'Tính 0,8×0,9 + 0,2×0,7.'],
p=>tokens(20,Math.round(p/5),'Nguồn A / nguồn B','ball'),
(p,rng)=>{const a=rng()<p/100,b=rng()<(a ? .9 : .7);return trial([b],b,{farm:a});}),
probability('Vàng tứ quý','Xác suất tổ hợp','Bộ 52 lá, rút đồng thời n lá. Tính xác suất có đủ cả bốn lá Át khi n = 5.',
span('Kích thước tay bài','lá',4,12,1,5),n=>choose(48,n-4)/choose(52,n),'P = C(48,n−4)/C(52,n)',
'Bốn lá Át đã được cố định. Chỉ còn chọn các lá khác để đủ kích thước tay bài.',
[['Đếm mẫu','Có C(52,n) tay bài n lá.'],['Đếm thuận lợi','Chọn cả 4 Át và n−4 lá còn lại trong 48 lá.'],['Thế n','Với n = 5, P = 48/C(52,5).']],
['Nếu rút 10 lá, xác suất có đủ bốn Át bao nhiêu?',10,'Chia C(48,6) cho C(52,10), nhân 100.'],
n=>tokens(n,4,'Bốn lá Át cần có','card'),(n,rng)=>{const cards=shuffle(52,rng).slice(0,n);const a=cards.map(c=>c%13===0);return trial(a,successes(a)===4,{cards});}),
probability('Biển 17 bóng đèn','Biến cố đối','Biển dùng 17 bóng hoạt động độc lập. Xác suất hỏng của mỗi bóng là p. Với p = 5%, tính xác suất có ít nhất một bóng hỏng.',
span('Xác suất hỏng mỗi bóng','%',0,100,1,5),p=>1-(1-p/100)**17,'P(có bóng hỏng) = 1 − (1−p)¹⁷',
'Biến cố đối là cả 17 bóng tốt. Tính xác suất biến cố đó bằng quy tắc nhân.',
[['Một bóng tốt','Xác suất 1−p.'],['Cả biển tốt','Do độc lập, xác suất là (1−p)¹⁷.'],['Tính bù','Khi p = 5%, P = 1−0,95¹⁷ ≈ 58,19%.']],
['Khi p = 10%, xác suất có ít nhất một bóng hỏng là bao nhiêu?',10,'Tính 1 − 0,9¹⁷ rồi đổi sang phần trăm.'],
p=>tokens(17,Math.round(17*p/100),'Bóng đèn · tỷ lệ màu minh họa','ball'),(p,rng)=>{const a=bern(17,p/100,rng);return trial(a,a.some(Boolean));}),
probability('Chín viên bi bida','Rút không hoàn lại','Chín bi đánh số 1 đến 9, có 4 bi số chẵn. Rút ngẫu nhiên k bi không hoàn lại. Với k = 3, tính xác suất có ít nhất một bi chẵn.',
span('Số bi rút','viên',1,9,1,3),k=>1-choose(5,k)/choose(9,k),'P = 1 − C(5,k)/C(9,k)',
'Biến cố đối là tất cả các viên đã rút đều mang số lẻ.',
[['Đếm không gian mẫu','Có C(9,k) tập k viên.'],['Đếm toàn lẻ','Có C(5,k) tập, bằng 0 khi k > 5.'],['Thế số','Khi k = 3, P = 1−10/84 ≈ 88,10%.']],
['Khi rút 2 viên, xác suất có ít nhất một viên chẵn là bao nhiêu?',2,'Tính 1 − C(5,2)/C(9,2).'],
k=>({...tokens(9,4,'Bi chẵn / bi lẻ','ball'),note:'Rút '+k+' viên'}),(k,rng)=>{const numbers=shuffle(9,rng).slice(0,k).map(i=>i+1);const a=numbers.map(n=>n%2===0);return trial(a,a.some(Boolean),{numbers});}),
probability('Hai cây táo','Biến cố độc lập','Hai cây ra quả độc lập. Cây A có xác suất ra quả 75%, cây B có xác suất p. Khi p = 60%, xác suất đúng một cây ra quả là bao nhiêu?',
span('Cơ hội cây B ra quả','%',0,100,1,60),p=>.75*(1-p/100)+.25*p/100,'P = 0,75(1−p) + 0,25p',
'“Đúng một” gồm hai biến cố loại trừ nhau. Trong mỗi nhánh, nhân vì hai cây độc lập.',
[['Chỉ A','0,75(1−p).'],['Chỉ B','0,25p.'],['Cộng','p = 0,6 cho 0,30 + 0,15 = 45%.']],
['Nếu cơ hội cây B ra quả là 40%, tính xác suất đúng một cây ra quả.',40,'Tính 0,75×0,60 + 0,25×0,40.'],
p=>({blocks:[block(-2,0,0,.3,.3,2),block(2,0,0,.3,.3,2)],balls:[{at:[-2,0,2.1],r:1.1},{at:[2,0,2.1],r:1.1}],note:'A: 75% · B: '+p+'%'}),
(p,rng)=>{const a=[rng()<.75,rng()<p/100];return trial(a,successes(a)===1);}),
probability('Hộp rút thăm','Xác suất cổ điển','Hộp có 20 phiếu, trong đó k phiếu trúng. Rút 3 phiếu không hoàn lại. Với k = 5, xác suất có đúng một phiếu trúng là bao nhiêu?',
span('Số phiếu trúng','phiếu',0,20,1,5),k=>choose(k,1)*choose(20-k,2)/choose(20,3),'P = C(k,1)C(20−k,2)/C(20,3)',
'Đúng một phiếu trúng nghĩa là hai phiếu còn lại phải đến từ nhóm không trúng.',
[['Đếm thuận lợi','Có C(k,1) cách chọn phiếu trúng và C(20−k,2) cách bổ sung hai phiếu còn lại.'],['Đếm mẫu','Có C(20,3)=1.140 bộ.'],['Thế số','k = 5 cho 525/1.140 ≈ 46,05%.']],
['Nếu có 8 phiếu trúng, tính xác suất đúng một phiếu trúng.',8,'Tính C(8,1)C(12,2)/1.140.'],
k=>tokens(20,k,'Phiếu trúng / phiếu thường','card'),(k,rng)=>{const a=draw(20,k,3,rng);return trial(a,successes(a)===1);}),
probability('Kiểm định thép','Bayes','Tỷ lệ thanh lỗi là p. Máy báo lỗi đúng trên 95% thanh lỗi và báo nhầm trên 4% thanh tốt. Khi p = 2%, một thanh đã bị báo lỗi thực sự lỗi với xác suất bao nhiêu?',
span('Tỷ lệ thanh lỗi','%',0,20,.5,2),p=>.95*p/(.95*p+.04*(100-p)),
'P(L|B) = 0,95p / [0,95p + 0,04(1−p)]',
'Phải phân biệt xác suất máy báo khi có lỗi với xác suất có lỗi khi máy báo.',
[['Tử số','Lỗi và máy báo có xác suất 0,95×0,02=0,019.'],['Mẫu số','Máy báo gồm lỗi thật và báo nhầm: 0,019 + 0,04×0,98 = 0,0582.'],['Chia','0,019/0,0582 ≈ 32,65%.']],
['Nếu tỷ lệ lỗi tăng lên 5%, tính xác suất thanh đã báo bị lỗi thật.',5,'Đưa 0,05 vào cả tử số và mẫu số của Bayes.'],
p=>tokens(20,Math.round(p/5),'Lỗi / đạt · tỷ lệ màu minh họa','block'),
(p,rng)=>{const defect=rng()<p/100,flag=rng()<(defect ? .95 : .04);return {...trial([defect,flag],defect&&flag),condition:flag};}),
probability('Tô màu lục giác','Đếm cách tô vòng','Tô độc lập 6 đỉnh của lục giác bằng k màu đồng xác suất. Các đỉnh có vị trí phân biệt. Với k = 3, tính xác suất mọi cặp đỉnh kề khác màu.',
span('Số màu','màu',2,6,1,3),k=>((k-1)**6+(k-1))/k**6,
'P = [(k−1)⁶ + (k−1)]/k⁶',
'Với đỉnh đầu đã cố định, theo dõi số cách đỉnh cuối trùng màu đầu và khác màu đầu.',
[['Khởi tạo','Ở đỉnh đầu, số cách cùng màu là 1 và khác màu là 0.'],['Cập nhật vòng','Gọi E, D là số chuỗi kết thúc cùng hoặc khác màu đầu. Bước tiếp theo cho E′=D và D′=(k−1)E+(k−2)D.'],['Đóng cạnh cuối','D ở đỉnh 6 nhân k cho (k−1)⁶+(k−1). Với 3 màu có 66 cách trong 729 cách.']],
['Nếu tô ngẫu nhiên bằng 2 màu, xác suất hai đỉnh kề luôn khác màu là bao nhiêu?',2,'Chỉ có hai cách tô xen kẽ trong 2⁶ cách.'],
k=>({network:{points:regular(6,3.25,0),edges:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0]],values:Array.from({length:6},(_,i)=>1+i%k),labels:[],colors:true},note:k+' màu'}),
(k,rng)=>{const a=Array.from({length:6},()=>Math.floor(rng()*k));return trial(a,a.every((v,i)=>v!==a[(i+1)%6]));}),
probability('Bàn tròn hội nghị','Hoán vị vòng tròn','Xếp ngẫu nhiên n người vào n ghế quanh bàn tròn. Tính xác suất hai người A và B ngồi cạnh nhau khi n = 8.',
span('Số ghế','ghế',3,18,1,8),n=>2/(n-1),'P(A kề B) = 2/(n−1)',
'Các vị trí tương đối của B với A là đồng khả năng. A có hai ghế kề.',
[['Cố định A','Có n−1 vị trí cho B.'],['Đếm hai ghế kề','B có thể ở bên trái hoặc bên phải A.'],['Chia','Với 8 ghế, P = 2/7 ≈ 28,57%.']],
['Nếu có 6 ghế, xác suất A và B ngồi cạnh nhau là bao nhiêu?',6,'Tính 2/(6−1) và nhân 100.'],
n=>({lathe:{height:.25,radius:()=>2.6,closed:true},network:{points:regular(n,3.65,0),edges:[],values:Array.from({length:n},(_,i)=>Number(i===1||i===n-1)),labels:['A']}}),
(n,rng)=>{const j=shuffle(n-1,rng)[0]+1;return trial([j===1,j===n-1],j===1||j===n-1,{position:j});})
];

export const extraLessons=[...extrema,...integrals,...space,...schoolMath,...probabilityLessons,
  ...functionExpansion,...integralExpansion,...vectorExpansion,...schoolExpansion,...probabilityExpansion]
  .map((lesson,index)=>({...lesson,id:index+25}));

import {powerProps} from './chart-props.mjs';
import {fmt} from './lessons.mjs';
import {chart,curve} from './expansion-chart.mjs';
import {C,M,lesson,block,panel,rod,edge,label,measure,ring,rect,sample,trace,shell,integral,bisect,metal,gold,glass,green,stone,cream,ink,red,blue,radians} from './expansion-kit.mjs';

const I=(...args)=>lesson(1,...args);
const short=n=>fmt(Number(n.toFixed(2)));
const pi=Math.PI, sq=x=>x*x, radius=(r,x)=>Math.sqrt(Math.max(0,r*r-x*x));
const material='#9da5a1', water='#5abed2', roof='#98724e';
const cut=(points,color=glass)=>panel(points,color,.7,{highlight:true});
const section=(fn,formula,label='Diện tích lát cắt')=>s=>({area:fn(s),unit:'m²',label,formula});
const sectionLab=(fn,formula,name)=>({section:section(fn,formula,name),features:[['A(s)',name??'Lát cắt','slice']]});
const shapes=(points,color=material,depth=.24)=>{
  const levels=[0,depth].map(y=>points.map(([x,z])=>[x,y,z]));
  return shell(levels,color,1);
};
const bands=(lo,hi,f,g,c,n=50)=>sample(lo,hi,n,x=>[x,f(x),g(x)]).slice(1).map(([r,b,d],i)=>{
  const l=lo+(hi-lo)*i/n;
  return panel([[l,-.025,f(l)],[r,-.025,b],[r,-.025,d],[l,-.025,g(l)]],c,.92,{outline:false});
});
const pipe=(axis,r,from,to)=>{
  const section=(u,k=1)=>ring(r*k,0,0,0,48).map(([a,b])=>axis===0?[u,a,b]:[a,u,b]);
  const options={closed:false,hideCutaway:true};
  return [shell([section(from),section(to)],glass,.22,{...options,finish:'glass'}),
    shell([section(from,1.055),section(from+.13*r,1.055),section(from+.21*r,1)],metal,.90,{...options,finish:'steel'}),
    shell([section(to-.21*r,1),section(to-.13*r,1.055),section(to,1.055)],metal,.90,{...options,finish:'steel'}),
    shell([section(from,1),section(from,1.055)],metal,1,{...options,finish:'steel'}),
    shell([section(to,1),section(to,1.055)],metal,1,{...options,finish:'steel'})];
};
const girt=x=>x*x*(3-x)/2;
const areaGirt=x=>Math.sqrt(3)*girt(x)**2/4;
const tiltedTank=({x,v})=>{
  const m=Math.tan(radians(x));
  const b=m<=v/16?v/8+2*m:Math.sqrt(v*m);
  return {b,m,reach:m===0?4:Math.min(4,b/m)};
};
const bladeAt=u=>[.65-.45*u,.22-.17*u,radians(55*u)];
const bladeArea=u=>{const [a,b]=bladeAt(u);return pi*a*b;};
const canopyR=h=>Math.sqrt(36+4*h);
const canopyS=h=>pi/3*((40+4*h)**1.5-40**1.5);
const mass=({x})=>8*(1+x/2);
const balance=({x})=>4*(.5+x/3)/(.5*x+1);
const gateWidth=y=>2+2*y/3;
const gateForce=x=>{const z=Math.min(x,3);return 9.81*(2*x*z+(x/3-1)*z*z-2*z**3/9);};
const overlap=w=>w*w*(pi/3-Math.sqrt(3)/4);
const strip=w=>16*(w*radius(10,w)/10+10*Math.asin(w/10));
const wedge=({a})=>Math.tan(radians(a));
const drill=({r})=>3*r/2;
const power=t=>12+8/(1+t)**2;
const energy=(a,b)=>12*(b-a)+8*(1/(1+a)-1/(1+b));
const displacement=t=>t**3/3-3.5*t*t+10*t;
const distance=t=>[0,2,5,t].filter((v,i)=>!i||i===3||v<t).reduce((prev,u,i,a)=>i?prev+Math.abs(displacement(u)-displacement(a[i-1])):0,0);
const spinArea=(s,k)=>pi*(sq(Math.max(k,s-k))-sq(Math.max(k-s,0)));
const spinVolume=k=>{
  const marks=[0,k,Math.min(4,2*k),4];
  return marks.slice(1).reduce((a,b,i)=>a+integral(s=>spinArea(s,k),marks[i],b,12),0);
};

export const integralExpansion=[
I('Phần giao của hai ống vuông góc','Thiết diện hình vuông',
'Hai khối trụ đặc cùng bán kính R, có hai trục nằm ngang vuông góc và đi qua gốc. Chọn lát ở cao độ z từ tâm để tính diện tích và toàn bộ phần giao.',
[C('Cao độ lát / R','',-1,1,.05,.25),C('Bán kính R','m',1,3,.1,2,'r')],
({x,r})=>[M('Diện tích lát vuông',4*r*r*(1-x*x),'m²'),M('Thể tích phần giao',16*r**3/3,'m³')],
['A(z) = [2√(R² − z²)]² = 4(R² − z²)','V = ∫₋ᴿᴿ A(z) dz = 16R³/3'],
'Cùng cao độ z, mỗi trụ giới hạn một chiều của lát. Hai chiều bằng nhau nên lát là hình vuông.',
[['Vẽ hai khoảng','Cả x và y chạy từ −√(R²−z²) tới +√(R²−z²).'],['Lấy tích phân','Tích phân đa thức 4(R²−z²) từ −R tới R.']],
({x,r})=>{
  const s=radius(r,x*r),z=x*r;
  return {shells:[...pipe(0,r,-r*1.48,r*1.48),...pipe(1,r,-r*1.48,r*1.48),
    shell(sample(-r,r,36,h=>rect(2*radius(r,h),2*radius(r,h),h)),blue,.59,{hideCutaway:true}),
    shell(sample(-r,z,24,h=>rect(2*radius(r,h),2*radius(r,h),h)),blue,.88,{onlyCutaway:true})],
    panels:s>0?[cut(rect(2*s,2*s,z+.004))]:[],edges:s>0?trace([...rect(2*s,2*s,z+.009),[-s,-s,z+.009]],cream,1.9):[],dimensions:s>0?[measure([-s,s,z],[s,s,z],short(2*s)+' m',cream,[0,.17,0])]:[],
    handle:[s,-s,z],labels:[label('Lát vuông',[s,-s,z+.30])]};
},{...sectionLab(({x,r})=>4*r*r*(1-x*x),'A(z) = 4(R² − z²), z = R·(cao độ tương đối)'),cutaway:true,focusMetric:1}),
I('Gân chịu lực đáy cong lệch','Đáy bất đối xứng, lát tam giác đều',
'Gân có đáy giới hạn bởi y=0 và y=x²(3−x)/2 từ x=0 tới x=3 m. Mỗi lát đứng có đáy là đoạn nằm trong miền và có dạng tam giác đều.',
C('Vị trí lát','m',0,3,.05,1.9),
({x})=>[M('Diện tích tam giác',areaGirt(x),'m²'),M('Thể tích gân',729*Math.sqrt(3)/560,'m³')],
['d(x) = x²(3 − x)/2','A(x) = √3·d(x)²/4','V = ∫₀³ A(x) dx'],
'Mỗi lát dùng độ rộng của miền phẳng làm cạnh tam giác đều.',
[['Đọc bề rộng','Trừ đường dưới y=0 từ đường trên.'],['Tính thể tích','Bình phương d(x), nhân √3/4 rồi lấy tích phân từ 0 tới 3.']],
({x})=>{
  const tri=t=>{const d=girt(t);return [[t,0,0],[t,d,0],[t,d/2,d*Math.sqrt(3)/2]];};
  return {shells:[shell(sample(0,3,36,tri),'#a08a67',.77,{hideCutaway:true,finish:'wood'}),shell(sample(0,x,25,tri),'#b0a17f',.95,{onlyCutaway:true,finish:'wood'})],
    panels:girt(x)>0?[cut(tri(x),gold)]:[],edges:[...trace(sample(0,3,45,t=>[t,girt(t),.01]),gold),...trace(sample(0,3,36,t=>tri(t)[2]),cream,1.1)],
    dimensions:[measure(tri(x)[0],tri(x)[1],short(girt(x))+' m',cream,[0,0,.09])],
    handle:tri(x)[2],labels:[label('Tam giác đều',[x,0,.21])]};
},{...sectionLab(({x})=>areaGirt(x),'A(x) = √3·[x²(3 − x)/2]²/4'),cutaway:true,focusMetric:1}),
I('Gioăng cao su hình xuyến','Phương pháp vỏ trụ',
'Quay một đĩa tròn bán kính r quanh trục đứng cách tâm đĩa 3 m để tạo gioăng. Kéo bán kính s của một lớp vỏ trụ.',
[C('Vị trí vỏ từ mép trong','%',0,100,1,55),C('Bán kính tiết diện r','m',.35,1.2,.05,.8,'r')],
({x,r})=>{
  const s=3+r*(x/50-1),h=2*radius(r,s-3);
  return [M('Chiều cao vỏ',h,'m'),M('Thể tích gioăng',6*pi*pi*r*r,'m³'),M('Diện tích mặt vỏ 2πsh',2*pi*s*h,'m²')];
},
['h(s) = 2√(r² − (s − 3)²)','V = ∫₃₋ᵣ³⁺ᵣ 2πs·h(s) ds = 6π²r²'],
'Vỏ trụ mỏng có thể tích xấp xỉ chu vi nhân chiều cao nhân bề dày.',
[['Chọn cận bán kính','Lớp đầu ở s=3−r và lớp cuối ở s=3+r.'],['Tận dụng đối xứng','Đặt u=s−3. Hạng lẻ triệt tiêu, phần còn lại dùng diện tích nửa đĩa bán kính r.']],
({x,r})=>{
  const z=r+.08,s=3+r*(x/50-1),h=radius(r,s-3);
  const profile=(end,n)=>sample(0,2*pi,24,a=>sample(0,end,n,b=>[(3+r*Math.cos(a))*Math.cos(b),(3+r*Math.cos(a))*Math.sin(b),z+r*Math.sin(a)]));
  return {shells:[shell(profile(2*pi,56),'#283832',.87,{closed:false,hideCutaway:true,finish:'rubber'}),
    shell(profile(1.53*pi,42),'#263e38',.98,{closed:false,onlyCutaway:true,finish:'rubber'}),
    shell([ring(s,z-h),ring(s,z+h)],gold,.39,{closed:false,finish:'brass'})],
    edges:[...[-h,h].flatMap(d=>{const lip=ring(s,z+d);return trace(lip.concat([lip[0]]),gold,1.85);}),
      ...[0,pi/2,pi,1.5*pi].map(a=>edge([s*Math.cos(a),s*Math.sin(a),z-h],[s*Math.cos(a),s*Math.sin(a),z+h],cream,1.05))],dimensions:[measure([s,0,z-h],[s,0,z+h],short(2*h)+' m',cream,[.18,0,0])],
    handle:[s,0,z+h],labels:[label('Vỏ trụ',[s,0,z+h+.24])]};
},{focusMetric:1,cutaway:true}),
I('Bể chữ nhật bị nghiêng','Bảo toàn thể tích và đổi hình mặt cắt',
'Bể chữ nhật kín dài 4 m, rộng 2 m, cao 2 m chứa V m³ nước. Nâng một đầu đáy dọc theo chiều dài. Tính độ sâu dọc thành tại đầu thấp và phần đáy còn ướt.',
[C('Góc nghiêng','°',0,30,.5,22),C('Thể tích nước','m³',3,6,.1,6,'v')],
s=>{const t=tiltedTank(s);return [M('Độ sâu tại thành đầu thấp',t.b,'m'),M('Chiều dài đáy còn ướt',t.reach,'m'),M('Thể tích giữ lại',s.v,'m³')];},
['d(u) = max(0, b − u tan θ)','V = 2∫₀⁴ d(u) du','b = V/8 + 2 tan θ hoặc b = √(V tan θ)'],
'Mặt nước nằm ngang theo hệ quy chiếu mặt đất. Độ sâu đo dọc thành bể thay đổi tuyến tính theo vị trí trên đáy.',
[['Thử đáy ướt hết','Nếu b ≥ 4 tan θ, tiết diện dọc là hình thang.'],['Đáy bắt đầu khô','Nếu b < 4 tan θ, chỉ tích phân tới u=b/tan θ. Lát dọc là tam giác.']],
s=>{
  const {b,m,reach}=tiltedTank(s),a=radians(s.x);
  const p=(x,y,z)=>[x*Math.cos(a)-z*Math.sin(a)-1.8,y,x*Math.sin(a)+z*Math.cos(a)];
  const q=(z)=>[[0,-1,z],[4,-1,z],[4,1,z],[0,1,z]].map(v=>p(...v));
  const [w,k,l,j]=[p(0,-1,b),p(reach,-1,Math.max(0,b-m*reach)),p(reach,1,Math.max(0,b-m*reach)),p(0,1,b)];
  const floor=[p(0,-1,0),p(reach,-1,0),p(reach,1,0),p(0,1,0)],top=[w,k,l,j],walls=q(0);
  const jack=p(3.42,0,0), base=[1.35,0,-.54], body=jack.map((v,i)=>base[i]+.62*(v-base[i]));
  return {blocks:[{...block(.06,0,-.78,5.25,2.55,.23,stone),finish:'stone'},block(1.35,0,-.55,.53,.45,.16,blue),
    ...[-.92,.92].map(y=>block(-1.8,y,-.54,.36,.25,.54,metal))],
    shells:[shell([q(0),q(2)],glass,.21,{closed:false,hideCutaway:true,finish:'glass'}),shell([floor,top],water,.42,{closed:false,finish:'water'})],
    panels:[panel(q(0),metal,.9),panel(top,water,.8,{water:true}),panel([floor[0],floor[1],k,w],water,.49,{onlyCutaway:true})],
    rods:[rod([-1.8,-1.09,-.04],[-1.8,1.09,-.04],.071,ink),rod(base,body,.107,ink),rod(body,jack,.049,metal),
      ...walls.flatMap((pt,i)=>[rod(pt,walls[(i+1)%4],.04,metal),rod(pt,q(2)[i],.039,metal),rod(q(2)[i],q(2)[(i+1)%4],.039,metal)])],
    edges:[...trace(top.concat([w]),'#b7e1d9',1.1),edge(w,k,cream,1.9),edge(floor[0],w,gold,1.5),edge(floor[0],floor[1],gold,2)],dimensions:[
      measure(floor[0],w,short(b)+' m',cream,[0,-.18,0]),
      measure(floor[3],floor[2],short(reach)+' m',gold,[0,.26,.03])
    ],handle:w,handles:{v:w},labels:[label('Mặt nước',p(.15,-1.02,b+.25))]};
},{cutaway:true}),
I('Cánh quạt gió thuôn và xoắn','Ước lượng thể tích từ lát mẫu',
'Cánh dài 6 m. Tại tỉ lệ chiều dài u, mặt cắt elip có bán trục a=0,65−0,45u và b=0,22−0,17u mét, xoay 55u độ. Dùng N dải và tiết diện giữa dải để ước lượng.',
[C('Vị trí lát theo chiều dài','%',0,100,1,45),C('Số dải trung điểm','dải',2,20,1,6,'n')],
({x,n})=>[M('Diện tích tiết diện',bladeArea(x/100),'m²'),M('Thể tích ước lượng',6/n*sample(.5,n-.5,n-1,i=>bladeArea(i/n)).reduce((a,b)=>a+b,0),'m³'),M('Thể tích theo công thức',.3825*pi,'m³')],
['A(u) = π(0,65 − 0,45u)(0,22 − 0,17u)','V_N ≈ (6/N)Σ A((i + ½)/N), i = 0,…,N−1','V = 6∫₀¹ A(u) du = 0,3825π'],
'Xoay mặt cắt quanh tâm giữ nguyên diện tích. Điểm giữa tránh dùng riêng lát đầu hoặc lát cuối của mỗi dải.',
[['Đọc bán trục','Nhân các bán trục để được A(u).'],['Lấy tổng mẫu','Mỗi dải dày 6/N. Tăng N để đối chiếu với tích phân.']],
({x,n})=>{
  const sectionAt=u=>{
    const [a,b,t]=bladeAt(u);
    return ring(1,0,0,0,24).map(([v,w])=>[6*u,a*v*Math.cos(t)-b*w*Math.sin(t),.86+a*v*Math.sin(t)+b*w*Math.cos(t)]);
  };
  const slices=sample(.5,n-.5,n-1,i=>panel(sectionAt(i/n),glass,.23,{outline:'#80c9c9',onlyCutaway:true}));
  const skin=(end)=>shell(sample(0,end,42,sectionAt),'#c8ccc4',.94,{finish:'enamel'});
  const root=ring(.29,0,0,0,24).map(([a,b])=>[0,a,.86+b]);
  const [a,b,angle]=bladeAt(x/100),u=x/100,center=[6*u,0,.86];
  const major=[6*u,a*Math.cos(angle),.86+a*Math.sin(angle)],minor=[6*u,-b*Math.sin(angle),.86+b*Math.cos(angle)];
  const sampleEdges=sample(.5,n-.5,n-1,i=>{
    const rim=sectionAt(i/n);
    return trace(rim.concat([rim[0]]),'#7ebeb99c',.8);
  });
  return {shells:[{...skin(1),hideCutaway:true},{...skin(x/100),onlyCutaway:true},
    shell([root.map(([,a,b])=>[-.40,a,b]),root],'#7f8c89',1,{finish:'steel'})],
    panels:[...slices,cut(sectionAt(x/100),gold)],
    rods:[rod([-.5,0,.86],[-.1,0,.86],.17,ink)],
    edges:[...trace(sample(0,1,42,u=>sectionAt(u)[0]),gold,1.65),...sampleEdges.flat()],
    dimensions:[measure(center,major,'a '+short(a),gold),measure(center,minor,'b '+short(b),glass)],
    handles:{n:[6*(n-.5)/n,0,.86]},labels:[label('Xoắn '+short(angle*180/pi)+'°',major)],
    handle:sectionAt(x/100)[0]};
},{...sectionLab(({x})=>bladeArea(x/100),'A(u) = πa(u)b(u)'),cutaway:true,discrete:['n'],focusMetric:1}),
I('Chụp đèn cong thành mỏng','Diện tích mặt tròn xoay',
'Đường sinh của chụp đèn có r(z)=√(36+4z) cm. Từ mép nhỏ z=0 quét lên đến h để tính diện tích mặt bên, bỏ qua bề dày.',
C('Chiều cao đã quét h','cm',0,20,.5,12),
({x})=>[M('Diện tích mặt cong',canopyS(x),'cm²'),M('Bán kính mép lát',canopyR(x),'cm')],
['S(h) = 2π∫₀ʰ r(z)√(1 + r′(z)²) dz','r′(z)=2/r(z), nên S(h) = π[(40 + 4h)³ᐟ² − 40³ᐟ²]/3'],
'Bề rộng vật liệu theo đường sinh dài hơn bước thẳng đứng khi mặt nghiêng.',
[['Tính dải vi phân','Chiều dài vòng là 2πr. Dải theo đường sinh dài √(1+r′²) dz.'],['Lấy nguyên hàm','Rút gọn tích hai căn về √(40+4z).']],
({x})=>{
  const r=z=>ring(canopyR(z),z,0,0,54);
  const rolledRim=at=>shell([r(at-.12),r(at+.12)],'#a48453',.98,{closed:false,finish:'brass'});
  return {shells:[shell(sample(x,20,28,r),'#d6c390',.34,{closed:false,finish:'paper'}),
    shell(sample(0,x,30,r),'#cba56d',.91,{closed:false,finish:'paper'}),rolledRim(0),rolledRim(20)],
    rods:[...sample(0,1,5,(_,i)=>{const a=i*pi/3;return rod([6*Math.cos(a),6*Math.sin(a),0],[0,0,3],.10,metal);}),
      rod([0,0,2],[0,0,5.3],.29,ink)],
    edges:[...trace(r(x).concat([r(x)[0]]),'#ffe4a4',2.3),
      ...[0,9,18,27,36,45].flatMap(i=>trace(sample(0,20,28,z=>r(z)[i]),'#caa47584',.8))],
    dimensions:[measure([0,canopyR(x),0],[0,canopyR(x),x],short(x)+' cm',cream,[0,.6,0])],
    lamps:[{at:[0,0,5.5],color:'#ffe4af',r:.28}],handle:r(x)[5],labels:[label('Mép dải đã quét',[0,canopyR(x)+.35,x])]};
}),
I('Tấm chắn có khối lượng dồn về một đầu','Mômen và trọng tâm',
'Tấm dài 4 m có mật độ theo chiều dài λ(s)=2(1+ks/4) kg/m. Kéo hệ số k và điểm kê p. Tính vị trí trọng tâm và mômen trọng lực quanh điểm kê.',
[C('Mật độ dồn về bên phải','',0,3,.1,1.5),C('Vị trí kê p','m',.4,3.6,.05,2,'p')],
s=>[M('Vị trí trọng tâm',balance(s),'m'),M('Mômen trọng lực có dấu',9.81*mass(s)*(balance(s)-s.p),'N·m'),M('Khối lượng',mass(s),'kg')],
['m = ∫₀⁴ λ(s) ds','s_G = ∫₀⁴ sλ(s) ds / m','τ = mg(s_G − p)'],
'Điểm kê trùng trọng tâm thì mômen tổng bằng 0. Vị trí trọng tâm phụ thuộc mật độ, dù hình tấm giữ nguyên.',
[['Lấy hai tích phân','Cộng mật độ để ra khối lượng và cộng sλ(s) để ra mômen khối lượng.'],['Tính mômen trọng lực','Nhân trọng lượng với cánh tay đòn có dấu.']],
s=>{
  const g=balance(s),at=(x,y,z)=>[x,y,.83+z];
  const strips=sample(0,4,21,(x,i)=>[x,i]).slice(1);
  const rims=[-.65,.65].map(y=>rod(at(0,y,0),at(4,y,0),.027,metal));
  const displacement=g-s.p;
  const lever=measure(at(s.p,.69,.05),at(g,.69,.05),short(Math.abs(displacement))+' m',displacement<0?glass:gold,[0,.16,.13]);
  return {blocks:[block(s.p,0,-.12,.95,1,.12,stone)],
    rods:rims,shells:[shell([rect(.81,.85,0,s.p),rect(.12,.85,.83,s.p)],metal,1,{finish:'steel'})],
    panels:strips.map(([x,i])=>{
      const col=Math.round(161-47*s.x/3*i/21).toString(16);
      return panel([[x-4/21,-.65,0],[x,-.65,0],[x,.65,0],[x-4/21,.65,0]].map(v=>at(...v)),'#'+col+'9c69',.97,{outline:false});
    }),edges:[edge(at(g,0,0),[g,0,.05],gold,2.4),edge([g,0,.05],[g-.055,0,.16],gold,2),edge([g,0,.05],[g+.055,0,.16],gold,2)],dots:[at(g,0,.06)],handle:at(g,.0,.09),
    dimensions:[lever],handles:{p:[s.p,.19,.68]},surfaceMarks:[label('G',at(g,.14,.15),gold)],
    labels:[label('G',at(g,0,.27)),label('Gối kê',[s.p,-.56,.52])]};
}),
I('Cửa van hình thang dưới nước','Tổng lực thủy tĩnh theo độ sâu',
'Cửa thẳng đứng cao 3 m, rộng w(y)=2+2y/3 mét ở cao độ y tính từ đáy. Mực nước cách đáy h mét. Lấy trọng lượng riêng của nước là 9,81 kN/m³.',
C('Mực nước h','m',0,5,.1,2.6),
({x})=>[M('Lực tổng cộng',gateForce(x),'kN'),M('Áp suất ở đáy',9.81*x,'kPa')],
['dF = 9,81(h − y)w(y) dy','F = 9,81∫₀ᵐⁱⁿ⁽ʰ˒³⁾ (h − y)(2 + 2y/3) dy'],
'Mỗi dải nhận áp suất theo khoảng cách thẳng đứng xuống dưới mặt nước. Mép trên cửa là giới hạn của diện tích ướt.',
[['Giới hạn phần ướt','Lấy từ đáy tới min(h,3).'],['Cộng lực của các dải','Áp suất tại dải ngang nhân bề rộng của dải rồi tích phân.']],
({x})=>{
  const rim=z=>[-gateWidth(z)/2,gateWidth(z)/2].map(a=>[a,0,z]);
  const [a,b]=rim(0),[l,r]=rim(3),h=Math.min(x,3),[w,k]=rim(h);
  const pressures=h===0?[]:sample(0,h,7,z=>z).filter(z=>x-z>1e-9);
  const thrust=pressures.flatMap(z=>{
    const length=(x-z)*.40,end=[0,-.035-length,z],half=Math.min(.12,length*.33);
    return [edge([0,-.035,z],end,gold,2.35),...[-1,1].map(side=>edge([side*half*.55,end[1]+half,z],end,gold,1.7))];
  });
  const wet=x===0?[]:[panel([a,b,k,w].map(([u,,z])=>[u,-.02,z]),blue,.67),panel(rect(4.4,1.5,x,0,.75),water,.48,{water:true})];
  return {blocks:[block(0,.45,-.19,5.2,1.65,.18,stone),...[-2.2,2.2].map(xx=>block(xx,.25,0,.52,.8,3.39,stone))],
    panels:[panel([a,b,r,l],metal,.95),...wet],
    rods:[rod(l,r,.062,metal),rod(a,b,.053,metal),rod(a,l,.045,metal),rod(b,r,.045,metal),...sample(.15,2.85,4,z=>rod(...rim(z).map(([x,,z])=>[x,.04,z]),.035,ink))],
    edges:thrust,dimensions:[measure([-2.02,-.07,0],[-2.02,-.07,x],short(x)+' m',cream,[-.44,0,0])],labels:[label('Mặt nước',[-1.5,.2,x+.17])],handle:[1.75,.05,x]};
}),
I('Cổng parabol hai cánh','Diện tích phần trang trí quanh cửa',
'Cổng rộng 4 m, cao 4 m tại đỉnh, biên y=4−x². Hai cánh ghép thành hình chữ nhật có nửa bề rộng u, hai góc trên chạm biên. Tính phần ốp trang trí ở trên và hai bên.',
C('Nửa bề rộng cửa u','m',.45,1.92,.01,1.1),
({x})=>[M('Diện tích hoa văn',32/3-2*x*(4-x*x),'m²'),M('Chiều cao cánh cửa',4-x*x,'m')],
['S_cổng = ∫₋₂²(4 − x²) dx = 32/3','S_trang trí = 32/3 − 2u(4 − u²)'],
'Mô hình cửa gồm phần trên thanh ngang và hai dải bên. Tính toàn bộ vòm rồi trừ cửa.',
[['Lập biên parabol','Đỉnh ở (0,4), hai chân ở x=±2.'],['Trừ hình chữ nhật','Chiều cao 4−u², bề rộng 2u.']],
({x})=>{
  const h=4-x*x,f=t=>4-t*t;
  const arch=sample(-2,2,50,u=>[u,f(u)]);
  const decorated=[...bands(-2,-x,f,()=>0,roof),...bands(-x,x,f,()=>h,roof),...bands(x,2,f,()=>0,roof)];
  const darkMetal='#566464',front=.232,back=-.042;
  const skins=[front,back].flatMap(y=>decorated.map(p=>({...p,points:p.points.map(v=>[v[0],y,v[2]])})));
  const doors=[front+.011,back-.011].map(y=>panel([[-x,y,.04],[x,y,.04],[x,y,h],[-x,y,h]],glass,.96,{outline:'#bbdad2'}));
  const mainFrame=[front+.034,back-.034].flatMap(y=>[
    ...[-x,x,0].map(t=>rod([t,y,.045],[t,y,h],.035,darkMetal)),
    rod([-x,y,h],[x,y,h],.049,darkMetal),
    ...[-.115,.115].map(t=>rod([t,y,h*.48],[t,y,h*.60],.025,gold))
  ]);
  const ornaments=sample(-1.9,1.9,20,u=>{
    const z=f(u);
    return z>h+.21?rod([u,front+.012,h+.038],[u,front+.012,z-.024],.014,gold):null;
  }).filter(Boolean);
  const trims=[front+.027,back-.027].flatMap(y=>trace(arch.map(([u,z])=>[u,y,z]),gold,2.1));
  const mullionSeal=[front+.024,back-.024].flatMap(y=>[-.71,.71].map(k=>
    edge([k*x,y,.085],[k*x,y,h-.04],'#e0eeeb80',.9)));
  return {blocks:[block(0,0,-.19,5.1,1.4,.18,stone),block(-2.14,0,0,.30,.62,4.02,stone),block(2.14,0,0,.30,.62,4.02,stone)],
    shells:[{...shapes(arch.concat([[-2,0]]),roof,.19),closed:false}],
    panels:[...skins,...doors],rods:[...mainFrame,...ornaments],edges:[...trims,...mullionSeal],
    dimensions:[measure([-x,front,0],[x,front,0],short(2*x)+' m',gold,[0,.52,.07]),
      measure([x,front,0],[x,front,h],short(h)+' m',cream,[.18,.30,0])],
    dots:[[-x,front+.06,h],[x,front+.06,h]],labels:[label('Hai cánh cửa',[0,front+.1,h*.52])],handle:[x,front+.06,h]};
},{practice:[{changes:{x:1.1},index:0,explanation:'Hai cánh cao 2,79 m và có tổng chiều rộng 2,2 m. Diện tích hoa văn là 32/3 − 2,2×2,79 ≈ 4,53 m².'},
 {changes:{x:1.5},index:0,question:'Nới mỗi cánh tới 1,5 m. Tính diện tích còn lại để làm hoa văn.',explanation:'Parabol cho chiều cao 1,75 m. Lấy 32/3 − 3×1,75 ≈ 5,42 m².'}]}),
I('Biển chữ nhật trang trí bằng hai đường tròn','Phân vùng theo hai cung tròn',
'Tấm biển rộng w mét, cao w+d. Hai đường tròn cùng bán kính w có tâm ở hai góc dưới. Chỉ sơn phần bên trong biển. Ba vùng lần lượt nằm trong hai đường tròn, trong đúng một đường tròn hoặc ở ngoài cả hai.',
[C('Chiều rộng w','m',2,5,.1,4),C('Phần cao thêm d','m',0,1.5,.1,.5,'d')],
({x,d})=>{
  const both=overlap(x),one=pi*x*x/2-2*both,neither=x*(x+d)-one-both;
  return [M('Diện tích phần giao',both,'m²'),M('Diện tích trong đúng một đường tròn',one,'m²'),M('Diện tích ngoài hai đường tròn',neither,'m²')];
},
['S_giao = 2∫₀ʷᐟ² √[w² − (w − u)²] du = w²(π/3 − √3/4)','S_một = πw²/2 − 2S_giao','S_ngoài = w(w+d) − S_một − S_giao'],
'Mỗi đường tròn cho một góc tư trên nền biển. Ở miền giao, lấy cung thấp hơn tại từng hoành độ.',
[['Tìm nơi hai cung đổi thứ tự','Hai độ cao bằng nhau tại u=w/2.'],['Phân màu','Cung thấp giới hạn miền giao. Phần nằm giữa hai cung thuộc đúng một đường tròn.']],
({x:w,d})=>{
  const h=w+d,fn=u=>radius(w,u),gn=u=>radius(w,w-u);
  const low=u=>Math.min(fn(u),gn(u)),high=u=>Math.max(fn(u),gn(u));
  const layers=[...bands(0,w,low,()=>0,'#367d75',60),...bands(0,w,high,low,'#ba694e',60),...bands(0,w,()=>h,high,'#b0a078',60)];
  const flags=[.226,-.051];
  const fasteners=flags.flatMap(y=>[.12,w-.12].flatMap(x=>[.12,h-.12].map(z=>
    rod([x,y,z],[x,y+Math.sign(y)*.08,z],.043,metal))));
  return {shells:[{...shapes([[0,0],[w,0],[w,h],[0,h]],stone,.16),finish:'enamel'}],
    panels:flags.flatMap(y=>layers.map(p=>({...p,points:p.points.map(([x,,z])=>[x,y,z])}))),
    edges:flags.flatMap(y=>{
      const border=[[0,y,0],[w,y,0],[w,y,h],[0,y,h]];
      return [...trace(sample(0,w,52,x=>[x,y,fn(x)]),cream,1.4),...trace(sample(0,w,52,x=>[x,y,gn(x)]),cream,1.4),
        ...trace(border.concat([border[0]]),gold,2.4),edge([w/2,y,0],[w/2,y,low(w/2)],cream,1.55)];
    }),
    rods:[...fasteners,rod([0,.13,0],[0,.13,h],.045,ink),rod([w,.13,0],[w,.13,h],.045,ink)],
    dimensions:[measure([0,.24,0],[w,.24,0],short(w)+' m',cream,[0,.30,-.13]),
      measure([w,.24,0],[w,.24,h],short(h)+' m',gold,[.19,.30,0])],
    surfaceMarks:[label('Giao',[w/2,.28,.36*w],cream),label('Ngoài',[w/2,.28,(h+high(w/2))/2],cream)],
    handles:{d:[w,.23,h]},labels:[label('Phần giao',[w/2,.30,.31*w])],handle:[w/2,.26,low(w/2)]};
},{practice:[{changes:{x:4,d:0},index:0,question:'Biển vuông cạnh 4 m. Tính diện tích phần nằm trong cả hai đường tròn.'},
 {changes:{x:4,d:1},index:2,question:'Giữ hai đường tròn và tăng độ cao biển lên 5 m. Tính phần ngoài cả hai đường tròn.'}]}),
I('Gạch hoa bốn cánh','Hai parabol đổi hướng và đối xứng quay',
'Viên gạch vuông có nửa cạnh a. Trong góc phần tư thứ nhất, một cánh hoa nằm giữa y=x²/a và x=y²/a, với 0≤x≤a. Ba cánh còn lại là các ảnh quay cách nhau 90°.',
C('Nửa cạnh a','m',.15,.6,.01,.3),
({x})=>[M('Diện tích bốn cánh',4*x*x/3,'m²'),M('Diện tích một cánh',x*x/3,'m²')],
['S₁ = ∫₀ᵃ[√(ax) − x²/a] dx = a²/3','S = 4S₁'],
'Ở góc phần tư thứ nhất, phương trình viết theo x của đường trên là y=√(ax).',
[['Tìm giao điểm','Hai biên gặp nhau tại (0,0) và (a,a).'],['Nhân theo đối xứng','Tính một cánh từ hiệu trên−dưới, rồi nhân bốn.']],
({x:a})=>{
  const petal=bands(0,a,x=>Math.sqrt(a*x),x=>x*x/a,'#b86b4d',31);
  const at=(p,a)=>[p[0]*Math.cos(a)-p[2]*Math.sin(a),p[0]*Math.sin(a)+p[2]*Math.cos(a),-.025-p[1]+.021];
  return {blocks:[{...block(0,0,-.054,2*a,2*a,.052,'#d5c59b'),finish:'tile'}],panels:[0,1,2,3].flatMap(i=>petal.map(p=>panel(p.points.map(q=>at(q,i*pi/2)),i===0?'#bd684c':'#5e967f',.97,{outline:false,finish:'tile'}))),
    edges:[...trace(rect(2*a,2*a,.018).concat([rect(2*a,2*a,.018)[0]]),metal,1.2),edge([0,-a,.004],[0,a,.004],ink,.8),edge([-a,0,.004],[a,0,.004],ink,.8)],
    dimensions:[measure([-a,a,.018],[a,a,.018],short(2*a)+' m',cream,[0,.055,0])],
    handle:[a,a,.05]};
}),
I('Dải hoa trong khu vườn elip','Diện tích miền elip bị chặn bởi hai đường đứng',
'Khu vườn có phương trình x²/100+y²/64≤1. Hai mép dải hoa song song với Oy, cách tâm cùng u mét. Tính diện tích và tiền trồng hoa với giá 100.000 đồng/m².',
C('Nửa bề rộng dải u','m',0,10,.1,5),
({x})=>[M('Diện tích dải hoa',strip(x),'m²'),M('Chi phí trồng hoa',strip(x)*.1,'triệu đồng')],
['S = 4∫₀ᵘ 8√(1 − x²/100) dx','S = 16[u√(1 − u²/100) + 10 arcsin(u/10)]'],
'Chỉ lấy phần elip giữa hai đường cắt. Bốn phần theo hai trục đối xứng có diện tích bằng nhau.',
[['Dựng biên','Nửa trên elip có y=8√(1−x²/100).'],['Tích phân theo bề rộng','Dùng một góc phần tư và nhân bốn.']],
({x})=>{
  const y=u=>.8*radius(10,u);
  const p=t=>[10*Math.cos(t),8*Math.sin(t),.01];
  const turf=sample(0,2*pi,66,p);
  const fills=sample(-x,x,48,u=>[u,y(u)]).slice(1).map(([u,w],i)=>{
    const a=-x+2*x*i/48,v=y(a);
    return panel([[a,-v,.04],[u,-w,.04],[u,w,.04],[a,v,.04]],'#ac6676',.96,{outline:false});
  });
  const flowerHeads=x<.2?[]:sample(-x*.80,x*.80,8,a=>sample(-.75*y(a),.75*y(a),6,(b,i)=>
    ({at:[a,b,.29+.035*(i%3)],r:Math.min(.094,x*.06),color:i%3===0?'#ffe4ab':'#f0a9b6'}))).flat();
  return {panels:[panel(turf,green,.94,{ground:true}),...fills],balls:flowerHeads,edges:[...trace(turf,cream,1.7),...[-x,x].map(a=>edge([a,-y(a),.055],[a,y(a),.055],gold,2))],
    rods:x===0?[]:sample(-x*.87,x*.87,10,a=>sample(-.79*y(a),.79*y(a),8,(b,i)=>
      rod([a,b,.061],[a,b,.22+.06*(i%3)],.034,i%3?'#dfb1a9':'#ecd1c0'))).flat(),handle:[x,-y(x),.11],labels:[label('Dải hoa',[0,0,.31])]};
}),
I('Khúc gỗ cắt thành hình nêm','Cắt hình trụ bằng mặt phẳng nghiêng',
'Khúc gỗ trụ bán kính 2 m. Mặt phẳng cắt đi qua một đường kính đáy và nghiêng a độ so với đáy. Tính thể tích phần nêm trên nửa đáy y≥0.',
[C('Vị trí lát x','m',-2,2,.05,.6),C('Góc nghiêng a','°',0,50,1,35,'a')],
s=>[M('Diện tích lát tam giác',(4-s.x*s.x)*wedge(s)/2,'m²'),M('Thể tích hình nêm',16*wedge(s)/3,'m³')],
['q(x) = √(4 − x²)','A(x) = ½ q(x)² tan a','V = ∫₋₂² A(x) dx = (16/3)tan a'],
'Ở mỗi lát đứng, cạnh đáy bằng nửa dây cung và chiều cao là cạnh đáy nhân tan a.',
[['Xác định dây cung','Thế x vào phương trình đáy tròn.'],['Nối với độ nghiêng','Mặt phẳng qua đường kính nên chiều cao z=y tan a.']],
s=>{
  const tri=x=>{const q=radius(2,x);return [[x,0,0],[x,q,0],[x,q,q*wedge(s)]];};
  const wood=shell(sample(-2,2,48,tri),'#a47c51',.97,{finish:'wood'});
  const selected=tri(s.x),q=selected[1][1];
  return {shells:[{...wood,hideCutaway:true},shell(sample(-2,s.x,30,tri),'#a98358',.97,{onlyCutaway:true,finish:'wood'})],
    panels:q>0&&s.a>0?[cut(selected,gold)]:[],edges:[edge([-2,0,0],[2,0,0],cream,1.4),...trace(sample(-2,2,48,x=>tri(x)[2]),gold)],
    dimensions:[measure(selected[0],selected[1],short(q)+' m',cream,[0,0,.04]),
      measure(selected[1],selected[2],short(selected[2][2])+' m',gold,[0,.11,0])],
    handle:tri(s.x)[2],labels:[label('Lát tam giác',tri(s.x)[2].map((v,i)=>i===2?v+.23:v))]};
},{...sectionLab(s=>(4-s.x*s.x)*wedge(s)/2,'A(x) = (4 − x²)tan a/2'),focusMetric:1,cutaway:true}),
I('Khối đáy tam giác, lát bán nguyệt','Đường kính lát là bề rộng đáy',
'Đáy là tam giác vuông có chiều dài 6 m và chiều rộng đầu lớn b mét. Lát đứng vuông góc theo trục dài là nửa hình tròn dựng trên đoạn đáy của lát.',
[C('Vị trí lát x','m',0,6,.05,2),C('Bề rộng đầu lớn b','m',1,4,.1,2.6,'b')],
({x,b})=>[M('Diện tích lát bán nguyệt',pi*sq(b*(1-x/6))/8,'m²'),M('Thể tích khối',pi*b*b/4,'m³')],
['d(x) = b(1 − x/6)','A(x) = πd(x)²/8','V = πb²/4'],
'Bề rộng đáy là đường kính. Diện tích nửa hình tròn bằng πd²/8.',
[['Lập d(x)','Tam giác đồng dạng cho bề rộng giảm tuyến tính.'],['Tính thể tích','Tích phân A(x) dọc theo chiều dài 6 m.']],
({x,b})=>{
  const semicircle=u=>{const r=b*(1-u/6)/2;return sample(0,pi,28,t=>[u,r+r*Math.cos(t),r*Math.sin(t)]);};
  const diameter=b*(1-x/6),rim=semicircle(x);
  return {shells:[shell(sample(0,6,43,semicircle),'#b3ae93',.87,{hideCutaway:true,finish:'stone'}),shell(sample(0,x,27,semicircle),'#b3ae93',.97,{onlyCutaway:true,finish:'stone'})],
    panels:diameter>0?[cut(rim,gold)]:[],edges:[edge([0,b,0],[6,0,0],cream,1.3),edge([0,0,0],[6,0,0],cream,1.3)],
    dimensions:[measure([x,0,0],[x,diameter,0],short(diameter)+' m',cream,[0,0,.045])],
    handle:semicircle(x)[14],labels:[label('Bán nguyệt',semicircle(x)[14].map((v,i)=>i===2?v+.22:v))]};
},{...sectionLab(({x,b})=>pi*sq(b*(1-x/6))/8,'A(x) = π[b(1 − x/6)]²/8'),focusMetric:1,cutaway:true}),
I('Khoan lỗ dọc trục khối nón','Vành khăn và cận phụ thuộc lỗ khoan',
'Khối nón đặt đỉnh dưới, cao 6 m và bán kính miệng 4 m. Khoan đồng trục lỗ trụ bán kính r. Tính phần vật liệu còn lại.',
[C('Cao độ lát khảo sát','m',0,6,.05,4),C('Bán kính mũi khoan','m',.3,4,.05,1.25,'r')],
s=>[M('Diện tích vành khăn',pi*Math.max(0,(2*s.x/3)**2-s.r**2),'m²'),
  M('Thể tích còn lại',pi*(4*(216-drill(s)**3)/27-s.r*s.r*(6-drill(s))),'m³'),M('Cao độ bắt đầu còn vật liệu',drill(s),'m')],
['z₀ = 3r/2','A(z)=π max(0, (2z/3)² − r²)','V = π∫_{3r/2}^6 [(2z/3)² − r²] dz'],
'Vành khăn chỉ xuất hiện từ vị trí mặt nón rộng hơn mũi khoan. Ở gần đỉnh, toàn bộ tiết diện bị lấy đi.',
[['Tìm cận dưới','Giải 2z/3=r.'],['Trừ hai đĩa','Diện tích còn lại là diện tích đĩa ngoài trừ đĩa lỗ, rồi tích phân tới 6.']],
s=>{
  const z0=drill(s),end=Math.max(s.x,z0);
  const start=limit=>limit===2*pi?0:1.92;
  const arc=(r,z,limit=2*pi)=>sample(start(limit),start(limit)+limit,48,t=>[r*Math.cos(t),r*Math.sin(t),z]);
  const mantle=(end,limit)=>shell(sample(z0,end,27,z=>arc(2*z/3,z,limit)),metal,.90,{closed:false,finish:'steel'});
  const liner=(end,limit)=>shell([arc(s.r,z0,limit),arc(s.r,end,limit)],ink,.9,{closed:false});
  const disk=(z,limit,color)=>2*z/3>s.r?sample(start(limit),start(limit)+limit,48,(t,i)=>{
    if(!i)return null;const a=t-limit/48,p=(r,v)=>[r*Math.cos(v),r*Math.sin(v),z+.003];
    return panel([p(s.r,a),p(2*z/3,a),p(2*z/3,t),p(s.r,t)],color,.97,{outline:false});
  }).slice(1):[];
  const angle=1.53*pi,layerR=2*s.x/3;
  const axisRose=trace(sample(0,6,10,z=>[0,0,z]),'#b7d7d17f',.87);
  return {shells:[{...mantle(6,2*pi),hideCutaway:true},{...liner(6,2*pi),hideCutaway:true},
    {...mantle(end,angle),onlyCutaway:true},{...liner(end,angle),onlyCutaway:true}],
    framePoints:[[-4,-4,0],[4,4,6]],
    panels:[...disk(6,2*pi,cream).map(p=>({...p,hideCutaway:true})),...disk(end,angle,gold).map(p=>({...p,onlyCutaway:true})),...disk(s.x,2*pi,glass).map(p=>({...p,hideCutaway:true,alpha:.63}))],
    edges:[...axisRose,...s.x>z0?trace(arc(layerR,s.x),gold,2.05):[]],handle:[layerR,0,s.x],
    handles:{r:[s.r,0,6]},dimensions:s.x>z0?[measure([s.r,0,s.x],[layerR,0,s.x],short(layerR-s.r)+' m',gold)]:[],
    labels:[label(s.x<=z0?'Lát không còn vật liệu':'Vành khăn',[layerR,0,s.x+.28]),
      label('Bắt đầu có vành',[s.r,0,z0+.36])]};
},{...sectionLab(s=>pi*Math.max(0,(2*s.x/3)**2-s.r**2),'A(z) = π max(0, (2z/3)² − r²)'),cutaway:true,focusMetric:1,
  practice:[{changes:{x:5,r:1},index:1},{changes:{x:1,r:2},index:0,question:'Ở cao độ 1 m, lỗ khoan có bán kính 2 m. Còn bao nhiêu diện tích vật liệu?'}]}),
I('Xe chạy rồi đổi chiều','Quãng đường và độ dời',
'Một xe chạy dọc ray, có vận tốc v(t)=(t−2)(t−5) m/s trong [0;7]. Xe ở mốc 0 lúc khởi hành. Tính quãng đường và độ dời từ 0 tới t.',
C('Thời gian t','s',0,7,.05,6),
({x})=>[M('Quãng đường',distance(x),'m'),M('Độ dời',displacement(x),'m'),M('Vận tốc có dấu',(x-2)*(x-5),'m/s')],
['s(t) = ∫₀ᵗ |(u − 2)(u − 5)| du','Δx(t) = t³/3 − 3,5t² + 10t'],
'Quãng đường cộng độ dài từng chặng. Độ dời cộng có dấu theo chiều quy ước.',
[['Tìm các mốc đổi chiều','Vận tốc đổi dấu tại 2 s và 5 s.'],['Chia chặng','Dùng F(t)=t³/3−3,5t²+10t; lấy trị tuyệt đối của hiệu F tại hai đầu mỗi chặng.']],
({x})=>{
  const u=displacement(x)/2.3;
  const body=[
    block(u,0,.30,1.10,.79,.27,'#476b77'),block(u,0,.32,1.18,.60,.08,'#373e38'),
    block(u-.04,0,.57,.54,.62,.29,blue),block(u-.05,0,.86,.63,.70,.065,'#b7c3be'),
    ...[-1,1].map(side=>block(u-.04,.318*side,.66,.36,.020,.15,'#203a3f')),
    ...[-1,1].map(side=>block(u+.472,.25*side,.442,.099,.114,.077,cream))
  ];
  const rotation=-u/.105, wheels=[-.3,.3].flatMap(dx=>[-.35,.35].flatMap(y=>{
    const at=u+dx,out=Math.sign(y),edgeY=y+.076*out;
    return [rod([at,y-.07,.24],[at,y+.07,.24],.105,ink),
      rod([at,y,.24],[at,edgeY,.24],.064,metal),
      ...sample(0,1,3,(_,i)=>{
        const angle=rotation+i*Math.PI/2;
        return rod([at,edgeY,.24],[at+.074*Math.cos(angle),edgeY,.24-.074*Math.sin(angle)],.013,cream);
      })];
  }));
  const sleepers=sample(-.45,6.7,16,q=>block(q,0,.025,.16,1.04,.055,'#98724e'));
  const v=(x-2)*(x-5);
  const milestones=[0,...[2,5].filter(t=>t<=x),x].map(t=>displacement(t)/2.3);
  const tracePath=milestones.slice(1).map((end,i)=>edge(
    [milestones[i],.53+.135*i,.115],[end,.53+.135*i,.115],i%2?glass:gold,2.15));
  const direction=[u+v*.095,-.58,1.07],wing=Math.min(.15,Math.abs(v)*.025);
  return {blocks:[block(3.15,0,0,7.5,1.14,.025,stone),...sleepers,...body],rods:[...[-.42,.42].map(y=>rod([-.58,y,.09],[6.85,y,.09],.043,metal)),...wheels],
    edges:[...tracePath,edge([u,-.58,1.07],direction,gold,2.25),
      ...[-1,1].map(side=>edge([direction[0]-wing*Math.sign(v),direction[1],direction[2]+side*wing*.69],direction,gold,1.6))],
    dimensions:[measure([0,.66,.13],[u,.66,.13],short(displacement(x))+' m',cream,[0,.35,0])],
    labels:[label(v>0?'Tiến':v<0?'Lùi':'Đổi chiều',[u,-.56,1.23])],handle:[u,-.44,.46]};
}),
I('Quay một miền quanh trục lệch','Đĩa và vành khăn trong cùng khối',
'Miền tam giác 0≤y≤s, 0≤s≤4 quay quanh y=k. Với từng s, xác định tiết diện khi trục đi qua miền hoặc nằm ngoài miền theo khoảng cách tới hai biên.',
[C('Vị trí lát s','m',0,4,.05,2.45),C('Cao độ trục k','m',.3,4,.05,1.5,'k')],
({x,k})=>[M('Diện tích lát',spinArea(x,k),'m²'),M('Thể tích khối',spinVolume(k),'m³')],
['R(s) = max(k, s − k)','r(s) = max(k − s, 0)','V = π∫₀⁴ [R(s)² − r(s)²] ds'],
'Đo bán kính bằng khoảng cách tới trục. Khi trục thuộc đoạn [0,s], bán kính trong bằng 0.',
[['Tìm nơi mất lỗ','Ở s=k, tiết diện chuyển từ vành khăn sang đĩa.'],['Tìm mép xa hơn','Hai khoảng cách tới hai đầu bằng nhau ở s=2k. Chia cận tại các mốc nằm trong [0,4].']],
({x,k})=>{
  const R=s=>Math.max(k,s-k),r=s=>Math.max(k-s,0),rAt=(u,s,end)=>sample(0,end,37,t=>[s,u*Math.cos(t),k+u*Math.sin(t)]);
  const outer=(max,end,extra)=>shell(sample(0,max,34,s=>rAt(R(s),s,end)),blue,.74,{closed:false,...extra});
  const lining=(max,end,extra)=>shell(sample(0,Math.min(max,k),24,s=>rAt(r(s),s,end)),ink,.83,{closed:false,...extra});
  const fill=sample(0,2*pi,36,(a,i)=>{
    const b=a-2*pi/36,p=(r,t)=>[x,r*Math.cos(t),k+r*Math.sin(t)];
    return i?panel([p(r(x),b),p(R(x),b),p(R(x),a),p(r(x),a)],gold,.83,{outline:false}):null;
  }).slice(1);
  const sectionRim=rAt(R(x),x,2*pi),innerRim=rAt(r(x),x,2*pi);
  return {shells:[outer(4,2*pi,{hideCutaway:true}),lining(4,2*pi,{hideCutaway:true}),outer(x,1.57*pi,{onlyCutaway:true}),lining(x,1.57*pi,{onlyCutaway:true})],
    rods:[rod([-.25,0,k],[4.4,0,k],.028,gold)],
    panels:fill,edges:[...trace(sectionRim,cream,1.85),...r(x)>0?trace(innerRim,gold,2):[],
      ...[k,2*k].filter(u=>u<4).flatMap(u=>trace(rAt(R(u),u,2*pi),'#b7dfdd6f',.85))],handle:[x,R(x),k],
    dimensions:[measure([x,0,k],[x,R(x),k],'R '+short(R(x)),cream),
      ...r(x)>0?[measure([x,0,k],[x,0,k+r(x)],'r '+short(r(x)),gold)]:[]],
    handles:{k:[0,0,k]},labels:[label(r(x)>0?'Vành khăn':'Đĩa đặc',[x,0,k+R(x)+.25])]};
},{...sectionLab(({x,k})=>spinArea(x,k),'A(s) = π[R(s)² − r(s)²]'),cutaway:true,focusMetric:1}),
I('Điện năng sau khi dây chuyền khởi động','Tích lũy và giá trị trung bình',
'Công suất P(t)=12+8/(1+t)² kW sau t giờ. Hai mốc a và a+d xác định khoảng đo. Tính điện năng và công suất trung bình.',
[C('Mốc đầu a','giờ',0,7,.1,1),C('Độ dài khoảng d','giờ',.25,5,.25,3,'d')],
({x,d})=>[M('Điện năng tiêu thụ',energy(x,x+d),'kWh'),M('Công suất bình quân',energy(x,x+d)/d,'kW'),M('Công suất ở cuối khoảng',power(x+d),'kW')],
['E = ∫ₐᵃ⁺ᵈ P(t) dt','E = 12d + 8[1/(1+a) − 1/(1+a+d)]','P_tb = E/d'],
'Điện năng là diện tích dưới đường công suất. Hình chữ nhật cùng bề rộng và diện tích có chiều cao bằng công suất bình quân.',
[['Lấy nguyên hàm','P có nguyên hàm 12t−8/(1+t).'],['Tính công suất đều tương đương','Chia E cho độ dài khoảng đo.']],
({x,d})=>{
  const end=x+d,bar=energy(x,end)/d;
  return chart([curve(0,12,power,glass)],{
    domain:[0,12],range:[0,21],axis:'Thời gian · giờ',unit:'Công suất · kW',note:'Điện năng '+fmt(Number(energy(x,end).toFixed(2)))+' kWh',props:powerProps(x,end,power(end)),
    fill:{points:[[x,0],...sample(x,end,42,t=>[t,power(t)]),[end,0]],color:'#65bedb63'},
    lines:[[[x,bar],[end,bar],gold,2.15],[[x,0],[x,power(x)],gold,1.35],[[end,0],[end,power(end)],gold,1.35]],
    points:[[x,power(x)],[end,power(end)]],tags:[['Trung bình',[(x+end)/2,bar-1.9],gold]],handle:[x,power(x)],handles:{d:[end,power(end)]}
  });
}),
I('Bơm nước lên miệng ống','Công nâng theo độ cao của từng lớp',
'Máng dài 4 m, mặt cắt dọc chiều rộng là tam giác, sâu 2 m và rộng 3 m ở miệng. Mực nước h và đầu ra ở độ cao B tính từ đáy. Tính công lý tưởng để bơm hết nước, bỏ qua tổn thất.',
[C('Độ sâu nước h','m',0,2,.05,1.55),C('Cao độ đầu ra B','m',2,4,.1,3,'b')],
({x,b})=>[M('Công để bơm hết nước',58.86*(b*x*x/2-x**3/3),'kJ'),M('Thể tích nước',3*x*x,'m³')],
['A(y) = 6y','W = 9,81∫₀ʰ 6y(B − y) dy'],
'Bề rộng của lớp nước tỉ lệ với cao độ y. Công của một lớp bằng trọng lượng của lớp nhân độ cao cần nâng.',
[['Tính tiết diện ngang','Bề rộng 3y/2 nhân chiều dài 4.'],['Cộng công nâng','Mỗi lớp cần nâng B−y mét. Tích phân từ đáy tới mặt nước.']],
({x,b},{mechanism=0})=>{
  const layer=z=>rect(4,1.5*z,z),height=x*Math.sqrt(1-mechanism);
  const ends=[-1.61,1.61];
  const feet=ends.flatMap(q=>[-.78,.78].map(y=>block(q,y,-.34,.26,.45,.34,metal)));
  const braces=ends.flatMap(q=>[-1,1].flatMap(side=>[
    rod([q,.78*side,-.04],[q,.75*side,1],.063,metal),
    rod([q,.78*side,-.04],[q,0,-.04],.062,metal),
    rod([q,0,-.04],[q,.79*side,1.055],.058,metal)
  ]));
  const intake=0,distance=b+.95+.30;
  const flow=mechanism>0&&mechanism<1&&height>intake?sample(0,1,6,(_,i)=>{
    const t=((i/7+mechanism*13)%1)*distance;
    if(t<b-intake)return [1.7,.06,intake+t];
    if(t<b-intake+.95)return [1.7+t-(b-intake),.06,b];
    return [2.65,.06,b-(t-(b-intake+.95))];
  }).map(at=>({at,r:.039,color:'#bcf2f2'})):[];
  return {blocks:feet,balls:flow,shells:[
    shell([layer(0),layer(2)],metal,.43,{closed:false,hideCutaway:true,finish:'glass'}),
    ...height>0?[shell([layer(0),layer(height)],water,.63,{closed:false,finish:'water'})]:[]
  ],panels:height>0?[panel(layer(height),water,.77,{water:true}),
      ...sample(.22,.88,3,y=>panel(layer(height*y),glass,.38,{onlyCutaway:true}))]:[],
    rods:[...braces,rod([1.7,.06,intake],[1.7,.06,b],.069,metal),rod([1.7,.06,b],[2.65,.06,b],.069,metal),
      rod([2.65,.06,b],[2.65,.06,b-.26],.069,metal),
      ...trace(layer(2).concat([layer(2)[0]])).map(e=>rod(e.from,e.to,.045,metal))],
    dimensions:[measure([.9,-.75*height,height],[.9,-.75*height,b],short(b-height)+' m',gold,[0,-.36,0])],labels:[label('Miệng ống',[2.38,.06,b+.22])],
    handle:[.9,-.75*height,height],handles:{b:[2.65,.06,b]}};

},{cutaway:true})
];

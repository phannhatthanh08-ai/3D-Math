import {choose,fmt} from './lessons.mjs';

const pi=Math.PI;
const nn=Number.isFinite;
const val=(label,unit,value,min,max,integer=false)=>({label,unit,value,min,max,integer});
const positive=(label,unit,value,max=value*15)=>val(label,unit,value,Math.max(.001,value/100),max);
const count=(label,unit,value,min,max)=>val(label,unit,value,min,max,true);
const pct=(label,value)=>val(label,'%',value,0,100);
const varied=(conditions,evaluate,formulas,describe,ranges,validate)=>({conditions,evaluate,formulas,describe,ranges,validate});
const power=(unit)=>unit.includes('³')?3:unit.includes('²')?2:unit==='°'?0:1;
const pt=(x,y,z)=>[x,y,z];
const edge=(from,to)=>({from,to});
const block=(x,y,z,w,d,h)=>({x,y,z,w,d,h});

const definitions={
  1:varied({capacity:positive('Hệ số thể tích V/π','m³',72),sideCost:positive('Đơn giá thân','triệu đồng/m²',1),capCost:positive('Đơn giá nắp','triệu đồng/m²',2)},
    ({x:r},{capacity:v,sideCost:c,capCost:k})=>{
      const h=Math.max(0,v/r**2-2*r/3);
      return [h,2*pi*r*h*c+2*pi*r*r*k];
    },['h = (V/π)/r² − 2r/3','C = 2πrh·c + 2πr²·k'],
    'Xét một bình trụ ghép với nửa khối cầu bán kính bằng bán kính thân. Cho phép chiều cao thân bằng 0 tại biên. Chi phí gồm mặt bên thân và mặt cong của nắp.',
    ({capacity})=>({x:[Math.cbrt(capacity/72)*1.5,Math.cbrt(1.5*capacity)]})),
  2:varied({seats:count('Sức chứa','người',40000,100,250000),drop:count('Khách giảm khi tăng 1.000 đồng','người',100,1,10000)},
    ({x:p},{seats:n,drop:k})=>[Math.max(0,n-k*p),p*Math.max(0,n-k*p)/1e6],
    ['N(p) = max(0, N₀ − kp)','R(p) = p·N(p)/10⁶ (tỷ đồng, p tính theo nghìn đồng)'],
    'Tại một trận bóng, tất cả chỗ ngồi đều có người nếu vé miễn phí. Giả sử lượng vé bán giảm tuyến tính khi giá tăng.',
    ({seats,drop})=>({x:[0,seats/drop]}),({seats,drop})=>drop>seats?'Mức giảm mỗi 1.000 đồng phải nhỏ hơn hoặc bằng sức chứa.':''),
  3:varied({volume:positive('Thể tích hộp','dm³',8),baseCost:positive('Đơn giá đáy','nghìn đồng/dm²',10),wallCost:positive('Đơn giá thành','nghìn đồng/dm²',5)},
    ({x:a},{volume:v,baseCost:c,wallCost:k})=>[v/a**2,c*a*a+4*k*v/a],
    ['h = V/a²','C = c·a² + 4k·V/a'],'Một xưởng làm khay đáy vuông, không có nắp. Đáy và bốn thành sử dụng hai loại giấy có đơn giá riêng.',
    ({volume})=>({x:[Math.cbrt(volume)/2,Math.cbrt(volume)*2]})),
  4:varied({halfWidth:positive('Nửa bề rộng miệng hầm','m',6),height:positive('Chiều cao đỉnh hầm','m',4)},
    ({x},{halfWidth:a,height:h})=>[h*(1-(x/a)**2),2*x*h*(1-(x/a)**2)],
    ['y = H[1 − (x/a)²]','A = 2xy'],'Một xe hàng có mặt cắt chữ nhật chạy qua giữa cửa hầm parabol. Hai góc trên của xe chạm đường biên cửa hầm.',
    ({halfWidth})=>({x:[0,halfWidth]})),
  5:varied({height:positive('Chiều cao bể','m',4),radius:positive('Bán kính miệng bể','m',2)},
    ({x:h,q},{height:H,radius:R})=>{
      const r=R*h/H;
      return [r,pi*r*r*h/3,h>=H?0:q/(pi*r*r)];
    },['r = Rh/H','V = πR²h³/(3H²)','dh/dt = Q/(πr²) khi h < H'],
    'Bơm nước vào một bể có hình nón đặt đỉnh xuống dưới. Lưu lượng bơm được coi là không đổi.',
    ({height})=>({x:[height/100,height]})),
  6:varied({width:positive('Bề rộng nhịp vòm','m',20),length:positive('Chiều dài nhà','m',60),oldHeight:positive('Chiều cao vòm ban đầu','m',8)},
    ({x:H,s},{width:W,length:L,oldHeight:h})=>[H*(1-(2*s/W)**2),2*W*L*(H-h)/3],
    ['y(s) = H[1 − (2s/W)²]','ΔV = (2/3)WL(H − h₀)'],
    'Một mái vòm parabol kéo dài đều theo nhà. Tòa nhà giữ nguyên bề rộng và chiều dài khi nâng cao đỉnh mái.',
    ({width,oldHeight})=>({x:[oldHeight,oldHeight*2.5],s:[-width/2,width/2]})),
  7:varied({length:positive('Chiều dài đáy','m',2.1),width:positive('Chiều rộng đáy','m',1.95),height:positive('Chiều cao lều','m',1.2)},
    ({x},{length:L,width:W,height:H})=>[L*W*(1-x/H),L*W*H/2],
    ['A(z) = LW(1 − z/H)','V = LWH/2'],'Một lều đáy chữ nhật thu đều theo khung parabol. Mỗi lát ngang là hình chữ nhật đồng dạng với đáy.',
    ({height})=>({x:[0,height]})),
  8:varied({axis:positive('Nửa chiều dài bóng','cm',14),radius:positive('Bán kính lớn nhất','cm',8.5)},
    ({x},{axis:a,radius:b})=>{
      const q=Math.max(0,1-(x/a)**2);
      return [b*Math.sqrt(q),pi*b*b*q,4*pi*a*b*b/3];
    },['r(x) = b√(1 − x²/a²)','A(x) = πr²','V = 4πab²/3'],'Một quả bóng thuôn dài có biên dạng là nửa elip quay quanh trục dọc.',
    ({axis})=>({x:[-axis,axis]})),
  9:varied({height:positive('Chiều cao tháp','m',120),waist:positive('Cao độ eo tháp','m',80),rMin:positive('Bán kính eo','m',15),rBase:positive('Bán kính đáy','m',20)},
    ({x},{waist:e,rMin:r,rBase:R})=>{
      const square=r*r+(R*R-r*r)*((x-e)/e)**2;
      return [Math.sqrt(square),pi*square];
    },['r(z)² = rₑ² + (r₀² − rₑ²)(z − e)²/e²','A(z) = πr(z)²'],
    'Một tháp giải nhiệt có tiết diện dọc dạng hyperbol. Mặt ngang hẹp nhất đi qua eo tháp.',
    ({height})=>({x:[0,height]}),({height,waist,rMin,rBase})=>waist>height||rBase<rMin?'Eo phải nằm trong tháp và bán kính đáy phải lớn hơn hoặc bằng bán kính eo.':''),
  10:varied({time:positive('Thời gian chảy hết','phút',20),flow:positive('Lưu lượng lúc bắt đầu','cm³/phút',13),accel:val('Tốc độ tăng lưu lượng','cm³/phút²',.2,0,5),profile:positive('Hệ số biên dạng r²/h','cm',4)},
    ({x:t},{time:T,flow:a,accel:b,profile:k})=>{
      const spent=a*t+b*t*t/2,total=a*T+b*T*T/2;
      return [spent,Math.sqrt(Math.max(0,total-spent)*2/(pi*k))];
    },['Q(t) = a + bt','V(t) = at + bt²/2','h = √[2(V(T) − V(t))/(πk)]'],'Hai khoang đồng hồ có biên dạng parabol r² = kh. Lưu lượng cát chảy tăng tuyến tính theo thời gian.',
    ({time})=>({x:[0,time]})),
  11:varied({speedA:positive('Vận tốc A theo Ox','km/h',60),speedB:positive('Tốc độ B theo chiều âm Oy','km/h',30),bx:positive('Tọa độ x của B','km',12),by:positive('Tọa độ y ban đầu của B','km',6),az:positive('Độ cao A','km',3),bz:positive('Độ cao B','km',5),observation:val('Thời gian quan sát tối đa (0 là không giới hạn)','phút',0,0,600)},
    ({x},{speedA:a,speedB:b,bx,by,az,bz})=>[Math.hypot(a*x/60-bx,by-b*x/60,bz-az),Math.abs(bz-az)],
    ['A(t) = (vₐt; 0; zₐ)','B(t) = (xᵦ; yᵦ − vᵦt; zᵦ)','AB = √[(vₐt − xᵦ)² + (yᵦ − vᵦt)² + (zᵦ − zₐ)²]'],
    'Hai máy bay giữ nguyên độ cao. A bay theo chiều dương Ox, B theo chiều âm Oy. Đổi phút sang giờ trước khi tính.',
    ({observation})=>({x:[0,observation||90]})),
  12:varied({center:positive('Cao độ tâm bồn','m',4),radius:positive('Bán kính bồn','m',3),offset:positive('Khoảng ngang đầu ống tới trục bồn','m',8)},
    ({x},{center:c,radius:r,offset:d})=>[Math.abs(x-c)>r?null:d-Math.sqrt(Math.max(0,r*r-(x-c)**2))],
    ['x² + y² + (z − c)² = R²','L = d − √[R² − (h − c)²] khi |h − c| ≤ R'],
    'Một đoạn ống tiến theo phương Ox ở cao độ cố định, từ phía ngoài đến tiếp xúc hoặc giao với bồn hình cầu.',
    ({center,radius})=>({x:[0,(center+radius)*1.3]}),({center,radius,offset})=>center<radius||offset<radius?'Bán kính phải nhỏ hơn hoặc bằng cao độ tâm và khoảng ngang đầu ống.':''),
  13:varied({center1:positive('Tọa độ dọc đường tâm vùng 1','km',4),center2:positive('Tọa độ dọc đường tâm vùng 2','km',9),offset1:positive('Độ lệch ngang tâm vùng 1','km',1),offset2:positive('Độ lệch ngang tâm vùng 2','km',1),radius1:positive('Bán kính vùng 1','km',Math.sqrt(5)),radius2:positive('Bán kính vùng 2','km',Math.sqrt(5))},
    ({x},c)=>{
      const d1=Math.hypot(x-c.center1,c.offset1),d2=Math.hypot(x-c.center2,c.offset2);
      return [d1,d2,d1<=c.radius1&&d2<=c.radius2?'Trong cả hai vùng':d1<=c.radius1?'Trong vùng 1':d2<=c.radius2?'Trong vùng 2':'Ngoài hai vùng'];
    },['dᵢ = √[(t − cᵢ)² + bᵢ²]','Trong vùng i khi dᵢ ≤ Rᵢ'],
    'Một khí cầu bay thẳng ở cao độ 2 km. Hai vùng an toàn là hai khối cầu có tâm nằm về hai phía của đường bay.',
    c=>({x:[0,Math.max(c.center1+c.radius1,c.center2+c.radius2)+2]})),
  14:varied({center:positive('Cao độ tâm bóng đèn','m',4),vx:val('Thành phần vectơ theo Ox','',1,-10,10),vy:val('Thành phần vectơ theo Oy','',2,-10,10),vz:positive('Thành phần vectơ theo Oz','',2,10)},
    ({x},{center:c,vx,vy,vz})=>[c-x/100,(c-x/100)*Math.hypot(vx,vy,vz)/vz],
    ['zmin = c − R','dmin = (c − R)·‖v‖/v_z'],
    'Một điểm chạy trên mặt đèn hình cầu, điểm kia nằm ở sàn. Đoạn nối hai điểm luôn cùng phương với vectơ đã nhập.',
    ({center})=>({x:[.1,center*99.9]})),
  15:varied({height:positive('Độ cao thả bóng','m',55.8),bounce:pct('Tỉ lệ độ cao sau mỗi lần nảy',10)},
    ({x:n},{height:h,bounce:b})=>{
      const q=b/100;
      return [h*q**n,h+2*h*q*(1-q**n)/(1-q)];
    },['hₙ = h₀qⁿ','Sₙ = h₀ + 2h₀q(1 − qⁿ)/(1 − q)'],
    'Một quả bóng rơi thẳng đứng. Sau mỗi lần chạm sàn, độ cao cực đại bằng một tỉ lệ cố định của lần trước.',
    undefined,({bounce})=>bounce>=100?'Tỉ lệ nảy cần nhỏ hơn 100%.':''),
  16:varied({center:positive('Độ cao trục quay','m',20),radius:positive('Bán kính vòng','m',10),period:positive('Chu kỳ','giây',10),phase:val('Mốc pha thời gian','giây',1,-100,100)},
    ({x:t},{center:c,radius:r,period:T,phase:p})=>[c+r*Math.sin(2*pi*(t-p)/T),r],
    ['h(t) = c + R·sin[2π(t − t₀)/T]','Biên độ là R, chu kỳ là T.'],
    'Quan sát một cabin của đu quay chuyển động đều. Tại mốc pha, cabin ở ngang trục và bắt đầu đi lên.',
    ({period})=>({x:[0,period*2]}),({center,radius})=>radius>center?'Bán kính không được vượt quá độ cao trục quay.':''),
  17:varied({roof:positive('Chiều cao tòa nhà','m',20)},
    ({x,h},{roof:r})=>[r+h,Math.hypot(x,r+h)],['HT = H₀ + h','AT = √(AH² + HT²)'],
    'Một cột dựng thẳng đứng trên mép mái. Cáp căng từ đỉnh cột đến neo trên mặt đất, phía ngoài tòa nhà.'),
  18:varied({edge:positive('Độ dài cạnh bên','m',230)},
    ({x:a},{edge:e})=>{
      const h=Math.sqrt(e*e-a*a/2);
      return [h,Math.atan2(a/2,h)*180/pi];
    },['SO = √(e² − a²/2)','tan α = (a/2)/SO'],'Xét hình chóp đều đáy vuông. Đo góc với đáy của đoạn ngắn nhất nối tâm đáy tới mặt bên.',
    ({edge})=>({x:[edge*.25,edge*Math.SQRT2*.999]})),
  19:varied({area:positive('Diện tích xung quanh','cm²',1536)},
    ({x:a},{area:s})=>[s/(6*a),s*Math.sqrt(3)*a/4],
    ['h = Sₓq/(6a)','Sđáy = 3√3·a²/2','V = Sđáy·h'],
    'Một khung đèn là lăng trụ đứng có đáy lục giác đều. Tổng diện tích sáu mặt bên được giữ theo dữ liệu đã nhập.'),
  20:varied({target:count('Số cú vào rổ để dừng','cú',5,1,12)},
    ({x,n},{target:k})=>[100*choose(n-1,k-1)*(x/100)**k*(1-x/100)**(n-k)],
    ['P(T = n) = C(n − 1, k − 1)pᵏ(1 − p)ⁿ⁻ᵏ'],
    'Trong một buổi tập, các cú ném phạt độc lập. Người ném dừng ngay sau cú vào rổ thứ k.',
    ({target})=>({n:[target,Math.max(target+2,16)]})),
  21:varied({second:pct('Xác suất linh kiện thứ hai hoạt động',90)},
    ({x},{second})=>{const p=x*second/1e4;return [100*p,100*(1-(1-p)**3)];},
    ['p_thông = p₁p₂','P(mạch thông) = 1 − (1 − p_thông)³'],
    'Ba nhánh mắc song song. Mỗi nhánh có hai linh kiện nối tiếp hoạt động độc lập với nhau.'),
  23:varied({p9:pct('Xác suất đạt 9 điểm',20)},
    ({x,p},{p9})=>{const a=(x/100)**3,b=3*(x/100)**2*p9/100;return [100*a,100*b,100*(a+b*p/100)];},
    ['P(30) = p₁₀³','P(29) = 3p₁₀²p₉','P(vàng) = P(30) + P(vàng | 29)P(29)'],
    'Xạ thủ bắn ba lượt độc lập. Một phát được 10, 9 hoặc tối đa 8 điểm. Tổng 30 luôn nhận vàng, còn tổng 29 nhận vàng theo xác suất đã cho.',
    ({p9})=>({x:[0,100-p9]})),
  24:varied({total1:count('Tổng bi hộp I','viên',5,2,12),total2:count('Tổng bi hộp II','viên',4,1,10),green2:count('Bi xanh hộp II','viên',1,0,10),total3:count('Tổng bi hộp III','viên',4,1,10),green3:count('Bi xanh hộp III','viên',0,0,10),move:count('Số bi chuyển từ hộp I','viên',2,1,5)},
    ({x,p},c)=>{
      const [a,b]=urnGreenRates(x,c);
      const den=p/100*a+(1-p/100)*b;
      return [p>0?100*a:null,den?100*(p/100)*a/den:null];
    },['E(K) = m·g₁/n₁','P(xanh | hộp j) = [gⱼ + E(K)]/(nⱼ + m)','P(chẵn | xanh) = P(chẵn)P(xanh | chẵn)/P(xanh)'],
    'Gieo xúc xắc. Mặt chẵn chuyển bi từ hộp I sang II, mặt lẻ chuyển sang III. Sau khi chuyển, rút ngẫu nhiên một viên từ hộp nhận.',
    ({total1})=>({x:[0,total1]}),c=>c.move>c.total1||c.green2>c.total2||c.green3>c.total3?'Số bi xanh và số bi chuyển cần nằm trong số bi hiện có ở hộp tương ứng.':''),
  25:varied({volume:positive('Dung tích bể','dm³',32)},
    ({x:a},{volume:v})=>[a*a+4*v/a],['h = V/a²','S = a² + 4V/a'],
    'Một bể kính đáy vuông, không nắp. Cần tính lượng kính phủ đáy và bốn mặt bên.',
    ({volume})=>({x:[Math.cbrt(volume)/2,Math.cbrt(volume)*3]})),
  26:varied({volume:positive('Hệ số thể tích V/π','dm³',54)},
    ({x:r},{volume:v})=>[2*pi*(r*r+v/r)],['h = (V/π)/r²','S = 2πr² + 2πrh'],
    'Thùng hình trụ kín, gồm hai đáy tròn và mặt xung quanh.',
    ({volume})=>({x:[Math.cbrt(volume)/3,Math.cbrt(volume)*2]})),
  27:varied({radius:positive('Bán kính bàn','m',1),strength:positive('Hệ số nguồn sáng','',120)},
    ({x:h},{radius:r,strength:k})=>[k*h/(r*r+h*h)**1.5],['E = k·h/(R² + h²)^(3/2)'],
    'Một đèn điểm chiếu xuống tâm bàn tròn. Xét độ rọi ở vành bàn.',
    ({radius})=>({x:[radius*.05,radius*5]})),
  28:varied({halfWidth:positive('Nửa nhịp cầu','m',12),height:positive('Chiều cao ở tim cầu','m',9)},
    ({x},{halfWidth:a,height:H})=>[2*x*H*(1-(x/a)**2)],
    ['y = H(1 − x²/a²)','A = 2xy'],
    'Đặt một khung chữ nhật cân giữa vòm parabol của cầu. Hai góc trên của khung cùng chạm vòm.',
    ({halfWidth})=>({x:[0,halfWidth]})),
  29:varied({diameter:positive('Đường kính khúc gỗ','cm',20)},
    ({x},{diameter:D})=>[x*Math.sqrt(Math.max(0,D*D-x*x))],
    ['h = √(D² − x²)','A = xh'],
    'Một thanh xà có tiết diện chữ nhật nội tiếp trong mặt cắt tròn của khúc gỗ.',
    ({diameter})=>({x:[0,diameter]})),
  30:varied({distance:positive('Khoảng cách từ tường đến chắn','m',2),height:positive('Chiều cao chắn','m',1)},
    ({x},{distance:d,height:h})=>[Math.hypot(x+d,h*(x+d)/x)],['L = (x + d)√(1 + h²/x²)'],
    'Thang đi qua đúng mép trên hàng chắn và chạm tường phía sau. Ba điểm chân thang, mép chắn và đầu thang thẳng hàng.',
    ({distance})=>({x:[distance*.125,distance*3]})),
  31:varied({length:positive('Chiều dài tấm bìa','cm',120),width:positive('Chiều rộng tấm bìa','cm',50)},
    ({x},{length:l,width:w})=>[x*(l-2*x)*(w-2*x)],['V = x(L − 2x)(W − 2x)'],
    'Cắt một hình vuông ở mỗi góc của tấm bìa chữ nhật rồi gấp bốn thành hộp.',
    ({length,width})=>({x:[0,Math.min(length,width)/2]})),
  32:varied({fence:positive('Tổng chiều dài rào','m',120)},
    ({x},{fence:l})=>[x*(l-3*x)],['y = L − 3x','A = x·y'],
    'Ba đoạn rào vuông góc tường và một đoạn song song với tường chia khoảng sân thành hai ô.',
    ({fence})=>({x:[0,fence/3]})),
  33:varied({shore:positive('Khoảng vuông góc từ thuyền tới bờ','km',3),land:positive('Khoảng dọc bờ đến đích','km',6),rowSpeed:positive('Tốc độ chèo','km/h',3),walkSpeed:positive('Tốc độ đi bộ','km/h',5)},
    ({x},c)=>[Math.hypot(x,c.shore)/c.rowSpeed+(c.land-x)/c.walkSpeed],['T = √(x² + d²)/v_chèo + (L − x)/v_đi bộ'],
    'Chèo thuyền theo đường thẳng đến điểm cập bờ, rồi đi bộ dọc bờ đến đích.',
    ({land})=>({x:[0,land]})),
  34:varied({height:positive('Chiều cao bể','m',4),bottom:positive('Bán kính đáy','m',1),mouth:positive('Bán kính miệng','m',3),flow:positive('Lưu lượng bơm','m³/phút',2)},
    ({x},{height:h,bottom:r,mouth:R,flow:q})=>[q/(pi*(r+(R-r)*x/h)**2)],
    ['r(z) = r₀ + (R − r₀)z/H','dz/dt = Q/(πr(z)²)'],
    'Bể tròn có bán kính tăng hoặc giảm tuyến tính theo cao độ. Bơm nước với lưu lượng không đổi.',
    ({height})=>({x:[0,height*.999]})),
  35:varied({length:positive('Chiều dài đáy','m',10),width:positive('Bề rộng bể','m',4),rise:positive('Chênh cao hai đầu','m',2),flow:positive('Lưu lượng bơm','m³/phút',3)},
    ({x},{length:l,width:w,rise:d,flow:q})=>[q*d/(l*w*x)],
    ['ℓ = Lh/d','A_mặt = W·ℓ','dh/dt = Q/A_mặt'],
    'Đáy bể dốc đều. Độ sâu đo tại đầu thấp, nước chưa vượt quá đầu cao của đáy.',
    ({rise})=>({x:[rise*.02,rise]})),
  72:varied({total:count('Số ngăn tối đa','ngăn',20,2,36),limit:count('Số suất lọc tối đa','suất',30,2,72),salmon:positive('Lãi mỗi ngăn cá hồi','triệu đồng',5),other:positive('Lãi mỗi ngăn cá khác','triệu đồng',3)},
    ({x},{total,limit,salmon,other})=>[salmon*x+other*Math.min(total-x,limit-2*x)],
    ['y = min(N − x, F − 2x)','L = a·x + b·y'],
    'Một ngăn cá hồi dùng hai suất lọc, một ngăn cá khác dùng một suất. Điền nhiều ngăn cá khác nhất sao cho thỏa cả hai giới hạn.',
    ({total,limit})=>({x:[0,Math.min(total,Math.floor(limit/2))]})),
  73:varied({budget:positive('Ngân sách','nghìn đồng',120),book:positive('Giá một quyển vở','nghìn đồng',12),pen:positive('Giá một bút','nghìn đồng',5)},
    ({x},{budget,book,pen})=>[x+Math.floor((budget-book*x+1e-10)/pen)],
    ['y = ⌊(B − cx)/d⌋','N = x + y'],
    'Mua số vở đã chọn trước, rồi dùng phần ngân sách còn lại để mua tối đa số bút.',
    ({budget,book})=>({x:[0,Math.min(1000,Math.floor((budget+1e-10)/book))]})),
  76:varied({total:count('Tổng số bi trong hộp','viên',30,2,40)},
    ({x:g},{total:n})=>[100*choose(g,2)/choose(n,2)],['P(cả hai xanh) = C(g,2)/C(n,2)'],
    'Rút hai viên từ một hộp có bi xanh và bi nâu. Mỗi cặp viên có cùng khả năng được chọn.',
    ({total})=>({x:[0,total]})),
  77:varied({match:count('Số mặt ngửa cần đúng','mặt',2,0,4)},
    ({x},{match:k})=>[100*choose(4,k)*(x/100)**k*(1-x/100)**(4-k)],
    ['P(X = k) = C(4,k)pᵏ(1 − p)⁴⁻ᵏ'],
    'Tung bốn đồng xu độc lập có cùng xác suất ra mặt ngửa. Tính xác suất xuất hiện đúng số mặt ngửa yêu cầu.'),
  83:varied({a:pct('Tỉ lệ loại I của trại A',90),b:pct('Tỉ lệ loại I của trại B',70)},
    ({x},{a,b})=>[x/100*a+(1-x/100)*b],
    ['P(I) = P(A)P(I | A) + P(B)P(I | B)'],
    'Chọn ngẫu nhiên một quả cam trong lượng hàng gộp từ hai trại. Mỗi trại có tỉ lệ cam loại I riêng.'),
  87:varied({a:pct('Xác suất cây A có quả',75)},
    ({x},{a})=>[a*(1-x/100)+(100-a)*x/100],
    ['P(đúng một cây có quả) = pₐ(1 − pᵦ) + (1 − pₐ)pᵦ'],
    'Hai cây ra quả độc lập. Xác suất ra quả có thể khác nhau giữa cây A và cây B.'),
  89:varied({sensitivity:pct('Máy báo lỗi với thanh bị lỗi',95),falsePositive:pct('Máy báo lỗi với thanh tốt',4)},
    ({x},{sensitivity,falsePositive})=>{const a=x*sensitivity,b=(100-x)*falsePositive;return [a+b?100*a/(a+b):null];},
    ['P(L | B) = p·s/[p·s + (1 − p)·f]'],
    'Máy kiểm tra một thanh thép. Với thanh thật sự lỗi, máy báo theo độ nhạy s. Với thanh tốt, máy vẫn có xác suất báo nhầm f.')
};

export function urnSpec(state){
  return state.conditions??{total1:5,total2:4,green2:1,total3:4,green3:0,move:2};
}
export function urnGreenRates(x,spec){
  const {total1,total2,green2,total3,green3,move}=spec;
  const expectation=move*x/total1;
  return [(green2+expectation)/(total2+move),(green3+expectation)/(total3+move)];
}

function scalePoint(point,ratios){return point.map((value,k)=>value*ratios[k]);}
function scaleScene(base,ratios,radiusScale){
  const point=p=>scalePoint(p,ratios);
  const scaleSegment=item=>({...item,from:point(item.from),to:point(item.to),...(item.radius===undefined?{}:{radius:item.radius*radiusScale})});
  const {lathe,horizontal,arch}=base;
  return {...base,
    ...(lathe?{lathe:{...lathe,height:lathe.height*ratios[2],cut:lathe.cut===undefined?undefined:lathe.cut*ratios[2],radius:z=>lathe.radius(z/ratios[2])*radiusScale}}:{}),
    ...(horizontal?{horizontal:{...horizontal,length:horizontal.length*ratios[0],cut:horizontal.cut===undefined?undefined:horizontal.cut*ratios[0],radius:z=>horizontal.radius(z/ratios[0])*radiusScale}}:{}),
    ...(arch?{arch:{...arch,width:arch.width*ratios[0],depth:arch.depth*ratios[1],profile:t=>arch.profile(t)*ratios[2]}}:{}),
    dots:base.dots?.map(point),
    edges:base.edges?.map(scaleSegment),rods:base.rods?.map(scaleSegment),
    blocks:base.blocks?.map(item=>({...item,x:item.x*ratios[0],y:item.y*ratios[1],z:item.z*ratios[2],w:item.w*ratios[0],d:item.d*ratios[1],h:item.h*ratios[2]})),
    panels:base.panels?.map(item=>({...item,points:item.points.map(point)})),
    lofts:base.lofts?.map(item=>({...item,bottom:item.bottom.map(point),top:item.top.map(point)})),
    balls:base.balls?.map(item=>({...item,at:point(item.at),r:item.r*radiusScale})),
    labels:base.labels?.map(item=>({...item,at:point(item.at)})),
    origin:base.origin?point(base.origin):undefined
  };
}
function integrationDefinition(base){
  const kind=Object.keys(base.scene(base.controls[0].value)).find(k=>['lathe','horizontal','arch'].includes(k));
  const conditions={
    axial:val('Tỉ lệ dọc theo trục lát cắt','lần',1,.15,8),
    transverse:val('Tỉ lệ chiều vuông góc lát cắt','lần',1,.15,8)
  };
  const definition=varied(conditions,({x},{axial:a,transverse:b})=>{
    const [s,v,total]=base.result({x:x/a}).map(m=>m.value);
    return [s*b*b,v*a*b*b,total*a*b*b];
  },['A_mới(x) = b²·A_gốc(x/a)','V_mới(x) = a·b²·V_gốc(x/a)','V = ∫ A(x) dx'],
  'Các kích thước theo trục lát cắt được nhân với a, hai chiều trên mặt cắt cùng nhân với b.',
  ({axial})=>({x:[base.controls[0].min*axial,base.controls[0].max*axial]}));
  definition.scene=(x,{axial:a,transverse:b})=>{
    const scale=kind==='lathe'?[b,b,a]:[a,b,b];
    return scaleScene(base.scene(x/a),scale,b);
  };
  return definition;
}
function similarityDefinition(base){
  const c=base.controls[0];
  const ratioInput=['m','cm','dm','km','đơn vị'].includes(c.unit);
  const conditions={scale:val('Tỉ lệ các kích thước','lần',1,.15,8)};
  const definition=varied(conditions,({x},{scale:k})=>
    base.result({x:ratioInput?x/k:x}).map(({value,unit})=>nn(value)?value*k**power(unit):value),
    [...base.formula,'Đồng dạng tỉ số k: độ dài × k, diện tích × k², thể tích × k³.'],
    'Giữ dạng hình học của mô hình và thay đổi đồng thời các độ dài theo cùng một tỉ lệ.',
    ({scale})=>({x:ratioInput?[c.min*scale,c.max*scale]:[c.min,c.max]}));
  definition.scene=(x,{scale:k})=>scaleScene(base.scene(ratioInput?x/k:x),[k,k,k],k);
  return definition;
}
const sceneBuilders={
  25:(base,x,c)=>({blocks:[{...block(0,0,0,x,x,c.volume/x**2),open:true}]}),
  26:(base,x,c)=>({lathe:{height:c.volume/x**2,radius:()=>x,closed:true}}),
  27:(base,h,c)=>({lathe:{height:.1*c.radius,radius:()=>c.radius,closed:true},dots:[pt(0,0,h)],
    edges:[edge(pt(0,0,h),pt(c.radius,0,.1*c.radius)),edge(pt(0,0,h),pt(0,0,.1*c.radius))]}),
  28:(base,x,{halfWidth:a,height:H})=>({arch:{width:2*a,depth:a*5/12,profile:t=>H*(1-t*t)},
    blocks:[block(0,-a/12,0,2*x,a/12,H*(1-(x/a)**2))]}),
  29:(base,x,{diameter:D})=>({lathe:{height:D,radius:()=>D/2,closed:false},
    blocks:[block(0,0,0,x,Math.sqrt(Math.max(0,D*D-x*x)),D)]}),
  30:(base,x,c)=>{
    const d=c.distance/2,h=c.height;
    const model=scaleScene(base.scene(x/d),[d,d,h],Math.min(d,h));
    model.labels=model.labels.map(item=>item.text.startsWith('Mép chắn')?{...item,text:'Mép chắn · '+fmt(h)+' m'}:item);
    return model;
  },
  31:(base,x,c)=>({blocks:[{...block(0,0,0,c.length-2*x,c.width-2*x,x),open:true}]}),
  32:(base,x,c)=>{const k=c.fence/120;return scaleScene(base.scene(x/k),[k,k,k],k);},
  33:(base,x,c)=>scaleScene(base.scene(x*6/c.land),[c.land/6,c.shore/3,1],1),
  34:(base,x,c)=>({lathe:{height:c.height,radius:z=>c.bottom+(c.mouth-c.bottom)*z/c.height,cut:x,fill:true}}),
  35:(base,x,c)=>scaleScene(base.scene(x*2/c.rise),[c.length/10,c.width/4,c.rise/2],c.width/4),
  72:(base,x,c)=>({tokens:{count:x+Math.min(c.total-x,c.limit-2*x),marked:x,label:'Cá hồi / ngăn khác'}}),
  73:(base,x,c)=>({tokens:{count:x+Math.floor((c.budget-c.book*x+1e-10)/c.pen),marked:x,label:'Vở / bút'}})
};
const similarIds=new Set([51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,74,75]);
export function conditionsFor(base){
  if(definitions[base.id]){
    const builder=sceneBuilders[base.id];
    return builder?{...definitions[base.id],scene:(x,c)=>builder(base,x,c)}:definitions[base.id];
  }
  if(base.id>=36&&base.id<=50)return integrationDefinition(base);
  if(similarIds.has(base.id))return similarityDefinition(base);
  return null;
}

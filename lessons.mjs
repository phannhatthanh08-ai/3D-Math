export const groups = ['Khảo sát hàm số','Tích phân','Vectơ và Oxyz','Toán thực tế lớp 10–11','Xác suất'];
export const fmt = n => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 6 }).format(Math.abs(n) < 1e-11 ? 0 : n);
const pi = Math.PI;
const sq = x => x*x;
const radians = x => x * pi / 180;
export const distance = (a,b) => Math.hypot(...a.map((x,i) => x-b[i]));
export function choose(n,k) {
  let count=1;
  if(k>n || k<0) return 0;
  for(let i=1;i<=k;i++) count*= (n-i+1)/i;
  return Math.round(count);
}
export function kingCounts(n, start=27) {
  let board=Array(64).fill(0);
  board[start]=1;
  for(let t=0;t<n;t++){
    const next=Array(64).fill(0);
    for(let i=0;i<64;i++){
      for(let dx=-1;dx<=1;dx++) for(let dy=-1;dy<=1;dy++){
        if(dx===0 && dy===0) continue;
        const x=i%8+dx, y=Math.floor(i/8)+dy;
        if(x>=0&&x<8&&y>=0&&y<8) next[8*y+x]+=board[i];
      }
    }
    board=next;
  }
  return board;
}
const L=(id, group, title, tag, mode, prompt, controls, result, formula, knowledge, steps, practice, plot=null) =>
  ({id,group,title,tag,mode,prompt,controls,result,formula,knowledge,steps,practice,plot});
const R=(key,label,unit,min,max,step,value)=>({key,label,unit,min,max,step,value});
const P=(question,answer,unit,explanation,tolerance=.005)=>({question,answer,unit,explanation,tolerance});
const M=(label,value,unit)=>({label,value,unit});
const S=(title,text)=>({title,text});
const circle = (diam) => pi*sq(diam/2);
const ticket = p => p*(40000-100*p)/1e6;
const lossUntil = (n,p) => choose(n-1,4)*p**5*(1-p)**(n-5);
const chemCost = r => pi*(144/r+8*sq(r)/3);
const houseVol = h => 60*20*h*2/3;
const ballRadius = x => 8.5*Math.sqrt(Math.max(0,1-sq(x/14)));
const towerRadius = z => Math.sqrt(225+175*sq(z-80)/6400);
const diagram=(label,min,max,yLabel,fn)=>({label,min,max,yLabel,fn});
export const lessons = [
L(1,0,'Bồn hóa chất trụ đứng','Tối ưu chi phí','tank',
'Một bình chứa có phần dưới hình trụ và mái là nửa hình cầu. Dung tích cần đạt 72π m³. Mỗi mét vuông vỏ trụ có giá 1 triệu đồng, vỏ mái có giá 2 triệu đồng. Hãy chọn bán kính sao cho tổng tiền hai phần này ít nhất.',
[R('x','Bán kính r','m',1.5,4.7,.01,3)],({x})=>[M('Chiều cao thân',72/x**2-2*x/3,'m'),M('Chi phí',chemCost(x),'triệu đồng')],
['h = 72/r² − 2r/3','C(r) = π(144/r + 8r²/3)'],
'Thể tích trụ bằng πr²h, thể tích bán cầu bằng 2πr³/3. Diện tích cong của nắp bằng 2πr².',
[S('Rút chiều cao','Chia phương trình thể tích cho πr². Điều kiện h > 0 cho 0 < r < ∛108.'),S('Lập hàm chi phí','Thân tốn 2πrh và nắp tốn 4πr² triệu đồng. Thế h để được C(r).'),S('Tìm cực tiểu','C′(r) = π(−144/r² + 16r/3). Đạo hàm đổi từ âm sang dương tại r = 3.'),S('Kết luận','Chọn r = 3 m. Thân cao 6 m và chi phí là 72π ≈ 226,19 triệu đồng.')],
P('Với r = 4 m, thân bồn cao bao nhiêu? Làm tròn 2 chữ số thập phân.',11/6,'m','h = 72/16 − 8/3 ≈ 1,83 m.'),diagram('r (m)',1.5,4.7,'Chi phí (triệu đồng)',chemCost)),
L(2,0,'Bán vé sân vận động','Tối ưu doanh thu','stadium',
'Một sân vận động có 40.000 ghế. Khi giá vé bằng 0, mô hình dự báo tất cả ghế đều có người. Với mỗi 1.000 đồng tăng thêm, dự kiến bán ít đi 100 vé. Giá nào làm tổng tiền vé cao nhất?',
[R('x','Giá vé','nghìn đồng',0,400,1,150)],({x})=>[M('Khán giả dự kiến',40000-100*x,'người'),M('Doanh thu',ticket(x),'tỷ đồng')],
['N(p) = 40.000 − 100p','R(p) = p(40.000 − 100p)'],
'Doanh thu bằng giá vé nhân số vé bán. Khi dùng nghìn đồng, chia kết quả cho 10⁶ để đổi sang tỷ đồng.',
[S('Chọn ẩn và miền giá','Gọi p là giá vé tính bằng nghìn đồng. Điều kiện giá và số khách không âm cho 0 ≤ p ≤ 400.'),S('Lập hàm doanh thu','R(p) = −100p² + 40.000p nghìn đồng. Hệ số bậc hai âm nên đồ thị quay xuống.'),S('Tìm đỉnh','Hoành độ đỉnh bằng −40.000/[2(−100)] = 200, thuộc miền xét.'),S('Trả lời','Giá 200.000 đồng bán được 20.000 vé, doanh thu bằng 4 tỷ đồng.')],
P('Nếu mỗi lần tăng 1.000 đồng chỉ giảm 80 khách, giá vé tối ưu là bao nhiêu?',250,'nghìn đồng','Hàm mới là R(p) = p(40.000 − 80p), đỉnh tại p = 250.'),diagram('Giá vé (nghìn đồng)',0,400,'Doanh thu (tỷ đồng)',ticket)),
L(3,0,'Hộp giấy đáy vuông','Tối ưu diện tích','box',
'Một xưởng giấy cần làm khay đáy vuông chứa đúng 8 dm³. Tấm đáy có giá 10 nghìn đồng/dm² và bốn thành có giá 5 nghìn đồng/dm². Khay không có nắp. Tìm cạnh đáy cho phương án rẻ nhất.',
[R('x','Cạnh đáy x','dm',1,4,.01,2)],({x})=>[M('Chiều cao',8/x**2,'dm'),M('Chi phí',10*x*x+160/x,'nghìn đồng')],
['h = 8/x²','C(x) = 10x² + 160/x'],
'Đáy có diện tích x². Bốn mặt bên có tổng diện tích 4xh.',
[S('Ràng buộc thể tích','Từ x²h = 8, rút h = 8/x² với x > 0.'),S('Tối ưu','C′(x) = 20x − 160/x². Dấu của C′ cùng dấu x³ − 8.'),S('Trả lời','Hàm giảm rồi tăng tại x = 2 dm. Chi phí nhỏ nhất là 120 nghìn đồng.')],
P('Nếu vật liệu đáy cũng giá 5 nghìn đồng/dm² thì cạnh đáy tối ưu dài bao nhiêu? Làm tròn 2 chữ số.',Math.cbrt(16),'dm','C′(x) = 10x − 160/x², nên x = ∛16 ≈ 2,52 dm.'),diagram('Cạnh đáy (dm)',1,4,'Chi phí (nghìn đồng)',x=>10*x*x+160/x)),
L(4,0,'Container qua hầm parabol','Diện tích lớn nhất','arch',
'Cửa một hầm giao thông có đường biên là parabol, cao 4 m ở giữa và rộng 12 m trên mặt đường. Đặt tiết diện xe hình chữ nhật đối xứng qua tim hầm. Tìm diện tích hình chữ nhật lớn nhất vừa lọt cửa.',
[R('x','Nửa bề rộng xe x','m',0,6,.01,3)],({x})=>[M('Chiều cao xe',4-x*x/9,'m'),M('Diện tích tiết diện',2*x*(4-x*x/9),'m²')],
['y = 4 − x²/9','A(x) = 2x(4 − x²/9)'],
'Chọn gốc tại tâm mặt đường. Parabol đi qua (0; 4) và (±6; 0).',
[S('Đọc kích thước','Xe rộng 2x và cao y(x), với 0 ≤ x ≤ 6.'),S('Xét đạo hàm','A′(x)=8 − 2x²/3, đổi dấu từ dương sang âm tại x = 2√3.'),S('Tính diện tích','Thay x = 2√3 được A lớn nhất bằng 32√3/3 ≈ 18,48 m².')],
P('Nếu xe rộng đúng 6 m, chiều cao lớn nhất của xe là bao nhiêu?',3,'m','Nửa bề rộng bằng 3 m. Thế x = 3 vào y = 4 − x²/9.'),diagram('Nửa bề rộng (m)',0,6,'Diện tích (m²)',x=>2*x*(4-x*x/9))),
L(5,0,'Nước dâng trong tháp nón','Tốc độ biến thiên','cone',
'Một bể hình nón đặt đỉnh xuống dưới, sâu 4 m, bán kính miệng 2 m. Máy bơm đưa vào 2 m³ nước mỗi phút. Khi nước sâu 3 m, mặt nước đang nâng lên nhanh bao nhiêu?',
[R('x','Mực nước h','m',.25,4,.01,3),R('q','Lưu lượng bơm Q','m³/phút',.5,5,.1,2)],({x,q})=>[M('Bán kính mặt nước',x/2,'m'),M('Thể tích nước',pi*x**3/12,'m³'),M(x>=4?'Đầy bể':'Tốc độ dâng',x>=4?0:4*q/(pi*x*x),x>=4?'· bơm dừng':'m/phút')],
['r = h/2','V = πh³/12','dh/dt = 4Q/(πh²), 0 < h < 4'],
'Đồng dạng cho bán kính tỉ lệ với độ sâu. Quy tắc dây chuyền cho dV/dt = (dV/dh)(dh/dt).',
[S('Mô hình hóa','Từ r/h = 2/4 suy ra V = π(r²)h/3 = πh³/12.'),S('Lấy đạo hàm theo thời gian','Q = (πh²/4)·dh/dt. Tốc độ giảm khi h tăng vì mặt nước rộng hơn.'),S('Thế số','Tại h = 3 và Q = 2, tốc độ bằng 8/(9π) ≈ 0,283 m/phút.')],
P('Với lưu lượng 2 m³/phút, tại độ sâu 2 m, tốc độ dâng bằng bao nhiêu? Làm tròn 3 chữ số.',2/pi,'m/phút','4×2/(π×2²) = 2/π ≈ 0,637.',.0006)),
L(6,1,'Nâng đỉnh mái vòm','Hiệu hai tích phân','vault',
'Một mái parabol có nhịp 20 m và kéo đều theo chiều dài 60 m. Đội xây dựng nâng đỉnh từ 8 m lên 10 m, giữ nguyên hai mép mái. Khoảng không bên dưới tăng thêm bao nhiêu?',
[R('x','Chiều cao đỉnh mới','m',8,14,.1,10),R('s','Vị trí lát cắt ngang','m',-10,10,.1,3)],({x,s})=>[M('Chiều cao tại lát cắt',x*(1-s*s/100),'m'),M('Thể tích tăng',houseVol(x-8),'m³')],
['y = H(1 − x²/100)','A = ∫₋₁₀¹⁰ y dx = 40H/3','V = 60A'],
'Tích phân diện tích dưới parabol. Diện tích cung parabol bằng 2/3 diện tích chữ nhật cùng đáy và chiều cao.',
[S('Lập hai parabol','Hai vòm cùng chân x = ±10. Hiệu chiều cao tại x là 2(1 − x²/100).'),S('Tích phân','Hiệu tiết diện ngang là 80/3 m².'),S('Đổi sang thể tích','Kéo dài tiết diện không đổi 60 m: ΔV = 1.600 m³.')],
P('Nếu đỉnh mới cao 11 m thì thể tích tăng bao nhiêu?',2400,'m³','ΔV = 60·40/3·(11 − 8).')),
L(7,1,'Lều cắm trại parabol','Tích phân mặt cắt','tent',
'Mô hình lều rộng 1,95 m, dài 2,10 m và cao 1,20 m. Theo chiều cao tương đối u, hai cạnh của lát ngang cùng giảm theo hệ số √(1 − u). Tính dung tích bên trong lều.',
[R('x','Độ cao lát cắt','m',0,1.2,.01,.45)],({x})=>[M('Diện tích lát ngang',2.1*1.95*(1-x/1.2),'m²'),M('Thể tích lều',2.1*1.95*1.2/2,'m³')],
['k(h) = √(1 − h/H)','S(h) = 2,10·1,95·(1 − h/1,20)'],
'Lát ngang đồng dạng. Nếu độ dài tỉ lệ k thì diện tích tỉ lệ k².',
[S('Lấy tỉ lệ từ parabol','Viết h = H(1 − k²) dọc theo đường chéo, với k bằng khoảng cách ngang đến tâm chia nửa đường chéo đáy.'),S('Lập diện tích','Hai cạnh của hình chữ nhật cùng nhân k. Diện tích lát bằng 4,095(1 − h/1,2).'),S('Tính tích phân','V = ∫₀¹·² S(h) dh = 4,095·1,2/2 = 2,457 m³.')],
P('Nếu giữ đáy nhưng nâng chiều cao lên 1,60 m, thể tích mới bằng bao nhiêu?',3.276,'m³','V = 2,10·1,95·1,60/2.')),
L(8,1,'Quả bóng bầu dục','Khối tròn xoay','football',
'Một mô hình bóng thuôn được tạo bằng cách quay nửa elip quanh trục dài. Bóng dài 28 cm và rộng nhất 17 cm. Dùng các lát vuông góc với trục để tính thể tích.',
[R('x','Vị trí lát cắt','cm',-14,14,.1,4)],({x})=>[M('Bán kính đĩa',ballRadius(x),'cm'),M('Diện tích đĩa',pi*sq(ballRadius(x)),'cm²'),M('Thể tích',4*pi*14*sq(8.5)/3,'cm³')],
['r(x) = 8,5√(1 − x²/196)','V = π∫₋₁₄¹⁴ r(x)² dx'],
'Khối tròn xoay quanh trục dài dùng các đĩa vuông góc trục, mỗi đĩa có diện tích πr².',
[S('Lập đường sinh','Từ x²/14² + r²/8,5² = 1, rút r².'),S('Tính tích phân','Tích phân 1 − x²/196 trên [−14; 14] bằng 56/3.'),S('Thể tích','V = 4π·14·8,5²/3 ≈ 4.236,96 cm³.')],
P('Nếu đường kính lớn nhất là 18 cm và chiều dài giữ nguyên, thể tích làm tròn tới cm³ bằng bao nhiêu?',Math.round(4*pi*14*81/3),'cm³','Thay bán trục ngang 8,5 bằng 9 trong biểu thức thể tích.',.01)),
L(9,1,'Tháp giải nhiệt Phả Lại','Mặt cắt hyperbol','tower',
'Xét một tháp cao 120 m có biên dạng dọc hyperbol. Mặt ngang nhỏ nhất nằm ở cao độ 80 m và có bán kính 15 m. Bán kính đáy là 20 m. Tính thể tích giới hạn bởi thành tháp và hai mặt đáy.',
[R('x','Độ cao lát cắt','m',0,120,1,80)],({x})=>[M('Bán kính lát cắt',towerRadius(x),'m'),M('Diện tích lát cắt',pi*sq(towerRadius(x)),'m²')],
['r(z)² = 225 + 175(z − 80)²/6.400','V = π∫₀¹²⁰ r(z)² dz'],
'Quan hệ bình phương bán kính theo bình phương khoảng cách tới eo cho mặt cắt hyperbol.',
[S('Đặt hệ trục','Lấy z từ đáy. Tại z = 80, r² = 225. Tại z = 0, r² = 400, nên hệ số phần bình phương là 175/6.400.'),S('Lập nguyên hàm','Nguyên hàm của r² là 225z + 175(z−80)³/19.200.'),S('Tính thể tích','Thay cận 0 và 120. V = 32.250π ≈ 101.316,36 m³.')],
P('Dùng r(z)² của bài, diện tích tiết diện tại eo bằng bao nhiêu? Làm tròn đến m².',707,'m²','π·15² = 225π ≈ 706,858 m².',.01)),
L(10,1,'Đồng hồ cát','Thể tích theo mực cát','hourglass',
'Hai khoang đồng hồ có biên dạng r² = 4h với kích thước tính bằng cm. Cát chảy từ khoang trên với lưu lượng 13 + 0,2t cm³/phút, hết sau 20 phút. Lúc đầu cát chiếm 2/3 chiều cao khoang trên. Hai khoang giống nhau. Tính chiều cao toàn bộ.',
[R('x','Thời gian t','phút',0,20,.1,10)],({x})=>[M('Cát đã chảy',13*x+.1*x*x,'cm³'),M('Mực cát còn lại',Math.sqrt(Math.max(0,300-13*x-.1*x*x)/(2*pi)),'cm')],
['r² = 4h','V(h) = 2πh²','Q(t) = 13 + 0,2t'],
'Thể tích lượng cát chảy bằng tích phân lưu lượng. Chu vi 8π cho bán kính 4 ở h = 4.',
[S('Tìm diện tích ngang','Parabol có r² = kh. Thế r = 4, h = 4 được k = 4.'),S('Tính cát ban đầu','∫₀²⁰ (13 + 0,2t)dt = 300 cm³ = 2πh₀².'),S('Tìm chiều cao vỏ','Mỗi nửa cao 3h₀/2, nên toàn bộ cao 3√(150/π) ≈ 20,73 cm.')],
P('Trong 10 phút đầu, bao nhiêu cm³ cát đã chảy?',140,'cm³','Dùng nguyên hàm 13t + 0,1t² tại t = 10.')),
L(11,2,'Hai máy bay gần nhau nhất','Khoảng cách theo thời gian','aircraft',
'Mỗi giờ, máy bay A dịch 60 km theo chiều dương Ox, máy bay B dịch 30 km theo chiều âm Oy. Lúc đầu chúng ở A(0; 0; 3) và B(12; 6; 5), đơn vị km. Trong 24 phút đầu, lúc nào khoảng cách giữa chúng nhỏ nhất?',
[R('x','Thời gian','phút',0,24,.1,6)],({x})=>[M('Khoảng cách',Math.hypot(x-12,6-x/2,2),'km'),M('Chênh lệch độ cao',2,'km')],
['D²(t) = (60t − 12)² + (30t − 6)² + 4','D²(t) = 4.500(t − 0,2)² + 4'],
'So sánh tọa độ tại cùng một thời điểm. Tối thiểu hóa D² cho cùng vị trí cực tiểu với D.',
[S('Lấy vectơ nối','Trừ tọa độ và bình phương ba thành phần.'),S('Tìm cực tiểu','D² = 4.500(t − 0,2)² + 4 đạt cực tiểu tại t = 0,2 giờ thuộc [0; 0,4].'),S('Kết luận','Tại phút thứ 12, hai máy bay cách nhau 2 km theo phương đứng.')],
P('Chỉ quan sát 9 phút đầu. Khoảng cách nhỏ nhất đạt tại phút thứ mấy?',9,'phút','Đồ thị giảm đến phút 12 nên cực tiểu trên [0; 9] nằm tại đầu mút 9.'),diagram('Thời gian (phút)',0,24,'Khoảng cách (km)',x=>Math.hypot(x-12,6-x/2,2))),
L(12,2,'Ống dẫn chạm bồn khí','Giao đường thẳng và mặt cầu','pipe',
'Một bồn cầu bán kính 3 m có tâm ở (0; 0; 4). Đầu một ống thẳng đi từ (−8; 0; 5) theo chiều dương Ox. Đầu ống đi thêm bao nhiêu mét thì gặp bồn lần đầu?',
[R('x','Độ cao ống','m',0,8,.1,5)],({x})=>Math.abs(x-4)<=3?[M('Đến mặt bồn',8-Math.sqrt(9-sq(x-4)),'m')]:[M('Giao điểm',null,'Ống nằm ngoài mặt cầu')],
['x² + y² + (z − 4)² = 9','x = −8 + t, y = 0, z = 5'],
'Một điểm nằm trên mặt cầu khi khoảng cách từ nó đến tâm bằng bán kính.',
[S('Thế tọa độ ống','Ở cao độ 5: x² + 1 = 9.'),S('Chọn điểm chạm đầu tiên','Ống đi từ trái sang phải nên gặp x = −√8 trước.'),S('Tính chiều dài','Chiều dài từ đầu ống đến bồn là 8 − √8 ≈ 5,17 m.')],
P('Nâng ống lên cao độ 7 m. Ống đi bao xa từ đầu ống thì tiếp xúc mặt bồn?',8,'m','Lúc này (z−4)² = 9 nên x = 0 là tiếp điểm.')),
L(13,2,'Khinh khí cầu qua hai vùng an toàn','Đường thẳng và mặt cầu','balloons',
'Khí cầu đi dọc đường (t; 0; 2), các tọa độ tính bằng km. Hai vùng an toàn có bán kính √5 km, tâm lần lượt ở (4; 1; 2) và (9; −1; 2). Tính tổng chiều dài các đoạn bay thuộc ít nhất một vùng.',
[R('x','Vị trí dọc đường t','km',0,14,.1,5)],({x})=>[M('Cách tâm vùng 1',Math.hypot(x-4,1),'km'),M('Cách tâm vùng 2',Math.hypot(x-9,1),'km'),M('Trạng thái',null,x>=2&&x<=6?'Trong vùng 1':x>=7&&x<=11?'Trong vùng 2':'Ngoài hai vùng')],
['(t − 4)² + 1 ≤ 5','(t − 9)² + 1 ≤ 5'],
'Điểm ở trong khối cầu khi bình phương khoảng cách tới tâm không lớn hơn bình phương bán kính.',
[S('Tìm đoạn trong vùng 1','Bất phương trình cho 2 ≤ t ≤ 6, dài 4 km.'),S('Tìm đoạn trong vùng 2','Bất phương trình cho 7 ≤ t ≤ 11, dài 4 km.'),S('Cộng đoạn rời nhau','Hai khoảng không chồng nhau, tổng chiều dài bằng 8 km.')],
P('Từ lúc rời vùng 1 đến lúc chạm vùng 2, khí cầu đi bao xa?',1,'km','Khoảng trống giữa hai đoạn là 7 − 6 = 1 km.')),
L(14,2,'Hai con kiến và bóng đèn','Vectơ chỉ phương','ants',
'Một đèn cầu có tâm cao 4 m. Nối một điểm trên đèn với một điểm trên sàn bằng đoạn thẳng cùng phương vectơ (1; 2; 2). Nếu độ dài nhỏ nhất của đoạn nối là 5,7 m, bán kính đèn bằng bao nhiêu?',
[R('x','Bán kính đèn','cm',5,100,1,20)],({x})=>[M('Độ cao nhỏ nhất trên đèn',4-x/100,'m'),M('Khoảng cách ngắn nhất',(4-x/100)*1.5,'m')],
['‖(1; 2; 2)‖ = 3','d = 3z/2','dmin = 3(4 − R)/2'],
'Thành phần theo trục z của vectơ nối bằng độ cao z. Từ tỉ lệ thành phần, độ dài vectơ bằng 3z/2.',
[S('Viết vectơ nối','Dùng λ(1; 2; 2), với 2λ = z và λ > 0.'),S('Tìm z thấp nhất','Con kiến trên cầu xuống thấp nhất ở độ cao 4 − R.'),S('Giải bán kính','3(4 − R)/2 = 5,7 cho R = 0,2 m = 20 cm.')],
P('Nếu khoảng cách nhỏ nhất là 5,4 m, bán kính đèn bằng bao nhiêu?',40,'cm','R = 4 − 2×5,4/3 = 0,4 m.')),
L(15,3,'Bóng nảy ở tháp Pisa','Cấp số nhân','bounce',
'Thả một quả bóng từ độ cao 55,8 m. Sau mỗi lần chạm đất, bóng nảy lên tới 10% độ cao trước đó. Theo mô hình này, cộng tất cả quãng đường lên và xuống, kể cả lần rơi đầu.',
[R('x','Số lần nảy đã tính','lần',0,8,1,1)],({x})=>[M('Độ cao lần nảy chọn',x===0?55.8:55.8*.1**x,'m'),M('Quãng đường đã cộng',55.8+2*55.8*.1*(1-.1**x)/.9,'m')],
['hₙ = 55,8·(1/10)ⁿ','S = 55,8 + 2·55,8·(1/10)/(1 − 1/10)'],
'Tổng cấp số nhân vô hạn với |q| < 1 là u₁/(1−q). Mỗi nhịp nảy có một lượt lên và một lượt xuống.',
[S('Tách lần rơi đầu','Bóng rơi 55,8 m lần đầu, chỉ tính một lượt.'),S('Tính phần nảy','Tổng độ cao các lần nảy là 5,58/0,9 = 6,2 m.'),S('Cộng cả hai chiều','Tổng quãng đường = 55,8 + 2×6,2 = 68,2 m.')],
P('Nếu tỉ lệ nảy lên là 1/5, tổng quãng đường bằng bao nhiêu?',83.7,'m','55,8 + 2·55,8·0,2/0,8 = 83,7.')),
L(16,3,'Vòng đu quay','Hàm lượng giác','wheel',
'Vòng đu quay có trục cao 20 m, bán kính 10 m và chu kỳ 10 giây. Lúc t = 1 giây cabin ngang với trục và đang đi lên. Trong 10 giây đầu, cabin đạt độ cao 30 m khi nào?',
[R('x','Thời gian','giây',0,10,.1,3)],({x})=>[M('Độ cao cabin',20+10*Math.sin(pi*(x-1)/5),'m'),M('Bán kính',10,'m')],
['h(t) = 20 + 10sin[π(t − 1)/5]','sin θ = 1 ⇔ θ = π/2 + 2kπ'],
'Biên độ là 10 m, độ cao tâm là 20 m. Chu kỳ bằng 10 giây.',
[S('Đổi sang phương trình sin','h(t) = 30 khi sin[π(t−1)/5] = 1.'),S('Giải','π(t−1)/5 = π/2 + 2kπ nên t = 3,5 + 10k.'),S('Chọn thời điểm','Trong [0; 10] chỉ có t = 3,5 giây.')],
P('Tính từ lần đầu đạt 30 m, sau bao lâu cabin lại đạt 30 m?',10,'giây','Sau một chu kỳ, vị trí cabin lặp lại.'),diagram('Thời gian (giây)',0,10,'Độ cao (m)',x=>20+10*Math.sin(pi*(x-1)/5))),
L(17,3,'Cáp giữ cột ăng-ten','Định lý Pythagore','antenna',
'Trên mép mái nhà cao 20 m dựng một ăng-ten thẳng đứng, cao thêm 20 m. Neo dây nằm trên đất, cách chân tường ngay dưới cột 30 m. Tính chiều dài dây căng thẳng từ đỉnh ăng-ten tới neo.',
[R('x','Khoảng cách neo AH','m',10,60,1,30),R('h','Chiều cao ăng-ten','m',5,35,1,20)],({x,h})=>[M('Độ cao đỉnh cột',20+h,'m'),M('Chiều dài cáp',Math.hypot(x,20+h),'m')],
['HT = 20 + 20 = 40 m','AT = √(AH² + HT²)'],
'Cạnh đứng vuông góc với mặt đất. Tam giác AHT vuông tại H.',
[S('Cộng độ cao','Đỉnh T cao hơn mặt đất 40 m.'),S('Lập tam giác','Hai cạnh góc vuông là 30 m và 40 m.'),S('Độ dài cáp','AT = √(900 + 1.600) = 50 m.')],
P('Giữ nguyên tòa nhà và cột, dời điểm neo tới cách H 42 m. Cáp dài bao nhiêu?',58,'m','√(42² + 40²) = 58.')),
L(18,3,'Đường hầm trong kim tự tháp','Góc đường thẳng và mặt phẳng','pyramid',
'Một chóp đều đáy vuông có cạnh đáy 262 m và cạnh bên 230 m. Từ tâm đáy dựng đoạn ngắn nhất đến một mặt bên. Đo góc mà đoạn đó tạo với mặt đáy, làm tròn đến độ.',
[R('x','Cạnh đáy a','m',180,300,1,262)],({x})=>{const h=Math.sqrt(230**2-x*x/2);return [M('Chiều cao chóp',h,'m'),M('Góc với đáy',Math.atan2(x/2,h)*180/pi,'°')];},
['SO = √(230² − a²/2)','tan ∠HOM = OM/SO'],
'Xét tam giác SOM qua đỉnh S, tâm O và trung điểm M của một cạnh đáy. Đường hầm OH vuông góc SM.',
[S('Tính chiều cao','OA = a/√2. Từ tam giác vuông SOA có SO = √(230²−262²/2) ≈ 136,30 m.'),S('Xác định góc','Trong SOM, tan ∠SMO = SO/OM. Vì OH vuông góc SM, ∠HOM phụ với ∠SMO.'),S('Thay số','OM = 131 m. ∠HOM ≈ 43,86°, làm tròn bằng 44°.')],
P('Nếu giữ cạnh bên 230 m và giảm cạnh đáy xuống 200 m, góc làm tròn đến độ bằng bao nhiêu?',Math.round(Math.atan2(100,Math.sqrt(230**2-200**2/2))*180/pi),'°','Tính SO = √(230²−200²/2), rồi lấy arctan(100/SO).',.01)),
L(19,3,'Lồng đèn lục giác','Thể tích lăng trụ','lantern',
'Khung đèn có hai đáy lục giác đều cạnh 8 cm, các cạnh bên vuông góc với đáy. Diện tích sáu mặt bên cộng lại bằng 1.536 cm². Tính thể tích trong khung.',
[R('x','Cạnh lục giác','cm',4,14,.1,8)],({x})=>[M('Chiều cao',1536/(6*x),'cm'),M('Thể tích',384*Math.sqrt(3)*x,'cm³')],
['Sxq = 6ah','Sđáy = 6·(√3/4)a²','V = Sđáy·h'],
'Lục giác đều chia được thành sáu tam giác đều cạnh a. Thể tích lăng trụ đứng bằng diện tích đáy nhân chiều cao.',
[S('Tính h','Với a = 8, h = 1.536/(6×8) = 32 cm.'),S('Tính diện tích đáy','Sđáy = 96√3 cm².'),S('Tính thể tích','V = 3.072√3 ≈ 5.321 cm³.')],
P('Nếu cạnh đáy 10 cm với cùng diện tích xung quanh, thể tích làm tròn đến cm³ bằng bao nhiêu?',Math.round(3840*Math.sqrt(3)),'cm³','V = 384√3·10 ≈ 6.651 cm³.',.01)),
L(20,4,'Ném phạt bóng rổ','Thử Bernoulli','basketball',
'Một vận động viên ném phạt với xác suất vào rổ 80% ở mỗi lượt độc lập. Buổi tập kết thúc ngay khi có cú vào rổ thứ năm. Tìm xác suất cú ném kết thúc buổi tập là cú thứ tám.',
[R('x','Xác suất vào rổ','%',0,100,1,80),R('n','Lượt kết thúc cần xét','lượt',5,12,1,8)],({x,n})=>[M('Xác suất lý thuyết',100*lossUntil(n,x/100),'%')],
['P(T = n) = C(n−1, 4)·p⁵·(1−p)ⁿ⁻⁵'],
'Muốn đạt lần thành công thứ 5 đúng ở lượt n, trước lượt đó phải có đúng 4 lần thành công.',
[S('Xét 7 lượt đầu','Chọn 4 lượt vào rổ trong 7 lượt đầu, có C(7,4) cách.'),S('Cố định lượt thứ 8','Lượt 8 phải vào rổ, nên có tổng cộng 5 lần vào và 3 lần trượt trong chuỗi.'),S('Tính','35 × 0,8⁵ × 0,2³ = 0,0917504, tức khoảng 9,18%.')],
P('Vẫn xác suất 0,8. Buổi tập dừng ngay ở lượt 5 với xác suất bao nhiêu phần trăm? Làm tròn 2 chữ số.',32.768,'%','Cả 5 lượt đều vào: 100×0,8⁵ = 32,768%.',.006)),
L(21,4,'Mạch điện ba nhánh','Biến cố đối','circuit',
'Ba nhánh điện mắc song song, mỗi nhánh có hai linh kiện mắc nối tiếp. Mỗi linh kiện tốt với xác suất 90% và các trạng thái độc lập. Tìm xác suất có ít nhất một nhánh dẫn điện.',
[R('x','Xác suất linh kiện tốt','%',0,100,1,90)],({x})=>[M('Một nhánh tốt',sq(x/100)*100,'%'),M('Mạch hoạt động',100*(1-(1-sq(x/100))**3),'%')],
['P(nhánh tốt) = p²','P(mạch hoạt động) = 1 − (1 − p²)³'],
'Hai linh kiện nối tiếp đều phải tốt. Với các nhánh song song, biến cố đối là cả ba nhánh cùng hỏng.',
[S('Tính cho một nhánh','Một nhánh tốt có xác suất 0,9² = 0,81.'),S('Lấy biến cố đối','Các nhánh độc lập, nên xác suất cả ba hỏng là 0,19³.'),S('Tính kết quả','1 − 0,19³ = 0,993141, tức 99,3141%.')],
P('Nếu từng linh kiện chỉ tốt với xác suất 0,8 thì xác suất mạch tốt là bao nhiêu phần trăm? Làm tròn 2 chữ số.',95.3344,'%','1 − (1 − 0,8²)³ = 0,953344.',.006)),
L(22,4,'Quân vua đi bảy nước','Đếm đường đi','chess',
'Đặt quân vua tại d4 trên bàn 8 × 8. Mỗi nước đi sang một ô kề cạnh hoặc kề góc mà vẫn trong bàn. Đếm các chuỗi bảy nước đưa quân vua về d4.',
[R('x','Số nước đi','nước',0,10,1,7)],({x})=>[M('Số đường về d4',kingCounts(x)[27],'đường')],
['F₀(d4) = 1; các ô khác bằng 0','Fₖ₊₁(c) = tổng Fₖ(b) trên các ô b kề c'],
'Mỗi đường tới c ở lượt k+1 phải đến từ duy nhất một ô kề b. Cộng số cách từ những ô đó.',
[S('Khởi tạo','Lúc chưa đi, chỉ có một cách đứng ở d4.'),S('Lặp từng lượt','Duyệt 64 ô ở mỗi lượt. Cộng các ô kề nằm trong bàn cờ, kể cả chéo.'),S('Đọc kết quả','Sau 7 lượt, ô d4 có '+fmt(kingCounts(7)[27])+' đường về.')],
P('Nếu chỉ đi đúng 2 nước thì có bao nhiêu đường trở lại d4?',8,'đường','Từ d4 đi được 8 hướng. Mỗi hướng có đúng một nước đi ngược lại.',.01)),
L(23,4,'Xạ thủ Olympic','Xác suất toàn phần','target',
'Mỗi phát bắn của một lượt thi có 30% khả năng đạt 10 điểm, 20% đạt 9 điểm và các trường hợp còn lại đạt không quá 8 điểm. Ba phát độc lập. Tổng 30 chắc chắn có vàng, tổng 29 có vàng với xác suất 70%. Tính cơ hội nhận vàng.',
[R('x','Xác suất đạt 10 điểm','%',0,80,1,30),R('p','Cơ hội có vàng tại 29 điểm','%',0,100,1,70)],({x,p})=>[M('Đạt 30 điểm',100*(x/100)**3,'%'),M('Đạt 29 điểm',100*3*(x/100)**2*.2,'%'),M('Có huy chương vàng',100*((x/100)**3+3*(x/100)**2*.2*p/100),'%')],
['P(30) = p₁₀³','P(29) = 3p₁₀²p₉','P(vàng) = P(30) + 0,7P(29)'],
'Tổng 29 chỉ có thể là một lượt 9, hai lượt 10. Hai trường hợp tổng điểm loại trừ lẫn nhau.',
[S('Tổng 30','Cả ba lượt đạt 10, xác suất 0,027.'),S('Tổng 29','Chọn lượt đạt 9 trong 3 lượt, xác suất bằng 3×0,3²×0,2 = 0,054.'),S('Dùng toàn phần','P(vàng) = 0,027 + 0,7×0,054 = 0,0648, tức 6,48%.')],
P('Nếu 29 điểm không được huy chương vàng, xác suất có vàng bằng bao nhiêu phần trăm?',2.7,'%','Chỉ còn trường hợp được 30 điểm: 100×0,3³.')),
L(24,4,'Chuyển bi giữa ba hộp','Công thức Bayes','urn',
'Đặt 3 bi xanh và 2 bi nâu trong hộp I, 1 bi xanh và 3 bi nâu trong hộp II, 4 bi nâu trong hộp III. Gieo một xúc xắc đều. Chuyển ngẫu nhiên hai bi từ I đến II nếu chẵn, đến III nếu lẻ. Rút một viên từ hộp nhận. Biết viên rút là xanh, tính xác suất mặt xúc xắc đã gieo là chẵn.',
[R('x','Số bi xanh ban đầu ở hộp I','viên',0,5,1,3),R('p','Xác suất xúc xắc ra chẵn','%',0,100,1,50)],({x,p})=>{const a=(1+2*x/5)/6,b=(2*x/5)/6,den=p/100*a+(1-p/100)*b;return [M('Rút xanh nếu chẵn',100*a,'%'),M('Chẵn khi đã thấy bi xanh',den?100*(p/100)*a/den:null,den?'%':'Biến cố xanh không thể xảy ra')];},
['P(X|C) = (1 + 2·3/5)/6','P(X|L) = (2·3/5)/6','P(C|X) = P(C)P(X|C)/P(X)'],
'Số bi xanh chuyển có kỳ vọng 2×3/5 vì mỗi vị trí rút có xác suất 3/5 là xanh. Mẫu số của xác suất Bayes cần dương.',
[S('Tách chẵn và lẻ','Mỗi nhánh có xác suất 1/2. Hộp nhận luôn có 6 bi.'),S('Tính xác suất bi xanh','Nếu chẵn, P(X|C) = (1+1,2)/6 = 11/30. Nếu lẻ, P(X|L) = 1,2/6 = 6/30.'),S('Dùng Bayes','P(C|X) = (11/30)/(11/30+6/30) = 11/17 ≈ 64,71%.')],
P('Nếu hộp I có đúng 1 bi xanh và xúc xắc vẫn công bằng, P(chẵn | xanh) là bao nhiêu phần trăm? Làm tròn 2 chữ số.',100*7/9,'%','Hai tử số tỷ lệ lần lượt với 1,4 và 0,4. Xác suất là 1,4/1,8 = 7/9.',.006))
];

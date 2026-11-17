import {kingCounts} from './lessons.mjs';

const pi=Math.PI;
const q=(kind,question,answer,unit,first,expression,explanation,parameters,conditions,digits=2,metric)=>
  ({kind,question,answer,unit,first,expression,explanation,model:{parameters,conditions,metric},digits});

export const exercises={
  1:[
    q('Thay số','Bồn trụ có nắp bán cầu, dung tích 72π m³. Nếu bán kính là 2 m, thân trụ cao bao nhiêu?',50/3,'m','Tách thể tích thân trụ và nắp bán cầu.','h = 72/r² − 2r/3.','h = 72/4 − 4/3 = 50/3 m.',{x:2},null,2,0),
    q('Tìm ngược','Bồn trụ có nắp bán cầu. Bán kính 3 m, chiều cao thân 6 m. Tìm V/π của cả bồn.',72,'m³','Hai phần dùng chung bán kính.','V/π = r²h + 2r³/3.','V/π = 9·6 + 2·27/3 = 72 m³.',{x:3},{capacity:72},0)
  ],
  2:[
    q('Thay số','Sân có 36.000 ghế, miễn phí thì đầy sân. Tăng giá 1.000 đồng làm giảm 120 khách. Với vé 100.000 đồng, doanh thu là bao nhiêu tỷ đồng?',2.4,'tỷ đồng','Tính số khách trước khi tính doanh thu.','N = 36.000 − 120p, R = pN/10⁶ khi p tính theo nghìn đồng.','N = 24.000 và R = 100·24.000/10⁶ = 2,4 tỷ đồng.',{x:100},{seats:36000,drop:120},2,1),
    q('Tối ưu','Sân có 45.000 ghế, miễn phí thì đầy sân. Tăng 1.000 đồng làm giảm 150 khách. Giá nào tối đa hóa doanh thu? Trả lời theo nghìn đồng.',150,'nghìn đồng','Doanh thu theo giá là một parabol quay xuống.','R(p) = p(45.000 − 150p). Lấy hoành độ đỉnh.','p = 45.000/(2·150) = 150 nghìn đồng.',{x:150},{seats:45000,drop:150},0,2)
  ],
  3:[
    q('Thay số','Khay đáy vuông không nắp có thể tích 27 dm³ và cạnh đáy 3 dm. Giá đáy là 8 nghìn đồng/dm², giá thành là 6 nghìn đồng/dm². Tính chi phí.',288,'nghìn đồng','Dùng thể tích để tìm chiều cao.','h = V/a² và C = 8a² + 6·4ah.','h = 3 dm. C = 8·9 + 6·36 = 288 nghìn đồng.',{x:3},{volume:27,baseCost:8,wallCost:6},0,1),
    q('Tối ưu','Khay không nắp có đáy vuông và thể tích 8 dm³. Cả đáy lẫn thành có cùng đơn giá. Chọn cạnh đáy để dùng ít vật liệu nhất.',Math.cbrt(16),'dm','Chi phí nhỏ nhất tương đương diện tích nhỏ nhất.','S(a) = a² + 32/a. Giải S′(a) = 0.','2a − 32/a² = 0 ⇒ a³ = 16. Đạo hàm đổi từ âm sang dương.',{x:Math.cbrt(16)},{baseCost:5,wallCost:5},2,2)
  ],
  4:[
    q('Tìm ngược','Cửa hầm parabol rộng 12 m, đỉnh cao 4 m. Một xe cao 3 m có tiết diện hình chữ nhật đặt cân giữa. Bề rộng tối đa của xe là bao nhiêu?',6,'m','Hai góc trên có hoành độ đối nhau.','Giải 4 − x²/9 = 3 với x ≥ 0, rồi tính 2x.','x = 3 nên xe rộng tối đa 6 m.',{x:3},null,0,0),
    q('Tối ưu','Hầm parabol rộng 18 m và cao 6 m. Tìm diện tích lớn nhất của tiết diện xe chữ nhật đặt đối xứng qua tim hầm.',24*Math.sqrt(3),'m²','Viết nửa chiều rộng xe là x.','A(x) = 12x(1 − x²/81) trên [0; 9].','A′ = 12(1 − x²/27) đổi từ dương sang âm tại x = 3√3. Khi đó A = 24√3 m².',{x:3*Math.sqrt(3)},{halfWidth:9,height:6},2,3)
  ],
  5:[
    q('Tìm ngược','Bể nón sâu 6 m, bán kính miệng 3 m. Khi nước sâu 2 m và đang dâng 0,5 m/phút, lưu lượng máy bơm là bao nhiêu?',pi/2,'m³/phút','Tìm bán kính mặt nước nhờ đồng dạng.','Q = πr²·dh/dt.','r = 1 m nên Q = π/2 m³/phút.',{x:2,q:pi/2},{height:6,radius:3}),
    q('Vận dụng','Bể nón sâu 4 m và bán kính miệng 2 m. Nước được bơm với lưu lượng không đổi. Tốc độ dâng ở h = 1 m gấp mấy lần ở h = 2 m?',4,'lần','Cùng một lượng nước, tiết diện nhỏ làm mực dâng nhanh hơn.','Với Q không đổi, h′ tỉ lệ nghịch với h².','Tỉ số bằng 2²/1² = 4.',{x:1},null,0)
  ],
  6:[
    q('Tìm ngược','Mái vòm parabol rộng 18 m, dài 50 m, đỉnh cũ cao 7 m. Thể tích tăng 1.800 m³ khi nâng đỉnh. Đỉnh mới cao bao nhiêu?',10,'m','Hai vòm có cùng chân và cùng chiều dài.','ΔV = (2/3)WL(H − h₀).','1.800 = 600(H − 7) ⇒ H = 10 m.',{x:10},{width:18,length:50,oldHeight:7},0,1),
    q('Thay số','Mái parabol có nhịp 20 m, đỉnh mới cao 12 m. Tại vị trí cách tâm nhịp 5 m, vòm cao bao nhiêu?',9,'m','Lấy nửa nhịp làm a trong phương trình vòm.','y(s) = H[1 − (s/a)²].','y(5) = 12[1 − (5/10)²] = 9 m.',{x:12,s:5},null,0,0)
  ],
  7:[
    q('Thay số','Đáy lều dài 3 m, rộng 2 m, lều cao 1,5 m. Lát ngang có diện tích A(z) = 6(1 − z/1,5). Lát ở z = 0,5 m rộng bao nhiêu m²?',4,'m²','z là độ cao tính từ đáy.','Thế z = 0,5 vào biểu thức diện tích.','A(0,5) = 6(1 − 1/3) = 4 m².',{x:.5},{length:3,width:2,height:1.5},0,0),
    q('Tìm ngược','Lều parabol có đáy 3 m × 2 m. Diện tích lát ngang giảm tuyến tính từ diện tích đáy đến 0 ở đỉnh. Dung tích 4,5 m³. Tìm chiều cao.',1.5,'m','Diện tích trung bình theo chiều cao bằng nửa diện tích đáy.','V = LW·H/2.','H = 2·4,5/(3·2) = 1,5 m.',{x:.75},{length:3,width:2,height:1.5})
  ],
  8:[
    q('Tìm ngược','Quả bóng xoay từ elip có chiều dài 24 cm. Một lát cách tâm 6 cm có bán kính 3√3 cm. Tìm bán kính lớn nhất của quả bóng.',6,'cm','Bán kính lớn nhất ở lát qua tâm.','r(s)² = b²[1 − s²/a²] với a = 12.','27 = b²·3/4 ⇒ b = 6 cm.',{x:6},{axis:12,radius:6},0,0),
    q('Vận dụng','Quả bóng elip có chiều dài giữ nguyên và bán kính lớn nhất tăng từ 8 cm lên 10 cm. Thể tích mới gấp mấy lần thể tích cũ?',25/16,'lần','Diện tích lát tròn tỉ lệ với bình phương bán kính.','V = 4πab²/3.','Tỉ số bằng (10/8)² = 25/16.',{x:0},{radius:10},4,2)
  ],
  9:[
    q('Thay số','Eo tháp ở độ cao 60 m, bán kính eo 12 m, bán kính đáy 18 m. Biên dạng hyperbol đối xứng qua cao độ eo. Nếu đỉnh ở 120 m, bán kính trên đỉnh bằng bao nhiêu?',18,'m','Đáy và đỉnh cách đều eo.','r(z)² = rₑ² + k(z − e)².','Vì |120 − 60| = |0 − 60|, bán kính đỉnh bằng bán kính đáy.',{x:120},{height:120,waist:60,rMin:12,rBase:18},0,0),
    q('Tìm ngược','Tại eo, diện tích mặt ngang của tháp là 196π m². Bán kính eo bằng bao nhiêu?',14,'m','Mặt ngang là một đĩa tròn.','A = πr².','r² = 196, lấy nghiệm dương r = 14 m.',{x:80},{rMin:14},0,0)
  ],
  10:[
    q('Tìm ngược','Lưu lượng cát là Q(t) = 10 + 2t cm³/phút. Từ lúc bắt đầu, mất bao nhiêu phút để 75 cm³ cát chảy xuống?',5,'phút','Lượng cát chảy là tích phân của lưu lượng.','∫₀ᵗ(10 + 2u)du = 10t + t².','t² + 10t − 75 = 0, nghiệm không âm là 5.',{x:5},{flow:10,accel:2},0,0),
    q('Vận dụng','Khoang trên có mặt ngang thỏa r² = 4h. Nếu độ cao cát giảm còn một nửa, thể tích cát còn bao nhiêu phần trăm so với lúc đầu?',25,'%','Diện tích lát ngang tỉ lệ với độ cao h.','V(h) = ∫₀ʰ4πu du = 2πh².','V(h/2)/V(h) = 1/4, tức 25%.',{x:(Math.sqrt(259)-13)/.2},null,0)
  ],
  11:[
    q('Thay số','A(0; 0; 3) bay theo chiều dương Ox với 60 km/h. B(12; 6; 5) bay theo chiều âm Oy với 30 km/h. Khoảng cách sau 6 phút là bao nhiêu?',7,'km','Đổi 6 phút sang 0,1 giờ.','D = √[(60t − 12)² + (30t − 6)² + 2²].','D = √(36 + 9 + 4) = 7 km.',{x:6},null,0,0),
    q('Tối ưu','A(0; 0; 3) bay theo chiều dương Ox với 60 km/h. B(18; 9; 5) bay theo chiều âm Oy với 30 km/h. Sau bao nhiêu phút hai máy bay gần nhau nhất?',18,'phút','Tại một thời điểm hai tọa độ ngang có thể trùng nhau.','D² = (60t − 18)² + (30t − 9)² + 4, với t tính theo giờ.','Hai bình phương cùng bằng 0 khi t = 0,3 giờ, tức 18 phút.',{x:18},{bx:18,by:9},0,2)
  ],
  12:[
    q('Thay số','Bồn tâm (0; 0; 5), bán kính 4 m. Đầu ống ở (−9; 0; 5) đi theo chiều dương Ox. Đi thêm bao nhiêu mét thì chạm bồn?',5,'m','Ống ở đúng độ cao tâm.','Giải x² = 16 và chọn nghiệm phía âm.','Điểm chạm đầu tiên là (−4; 0; 5), cách đầu ống 5 m.',{x:5},{center:5,radius:4,offset:9},0,0),
    q('Tìm ngược','Bồn có tâm (0; 0; 5). Đường ống dọc theo Ox đi qua (−9; 0; 8) và tiếp xúc với bồn. Tìm bán kính bồn.',3,'m','Đường tiếp tuyến cách tâm đúng một bán kính.','Khoảng cách từ tâm tới đường ống là |8 − 5|.','R = 3 m.',{x:8},{center:5,radius:3,offset:9},0)
  ],
  13:[
    q('Thay số','Khí cầu bay dọc đường (t; 0; 2), t ≥ 0. Vùng cầu tâm (5; 3; 2) có bán kính 5 km. Đoạn đường trong vùng dài bao nhiêu?',8,'km','Dựng đường vuông góc từ tâm đến đường bay.','(t − 5)² + 3² ≤ 5².','|t − 5| ≤ 4 ⇒ t ∈ [1; 9], đoạn dài 8 km.',{x:5},{center1:5,offset1:3,radius1:5},0,0),
    q('Vận dụng','Đường bay là (t; 0; 2), t ≥ 0. Hai vùng có tâm (4; 1; 2), (7; −1; 2), cùng bán kính √5 km. Hỏi đoạn bay thuộc ít nhất một vùng dài bao nhiêu?',7,'km','Hai đoạn trong vùng có phần giao nhau.','Lấy hợp của [4 − 2; 4 + 2] và [7 − 2; 7 + 2].','Hợp là [2; 9] nên tổng độ dài bằng 7 km.',{x:5.5},{center2:7},0)
  ],
  14:[
    q('Thay số','Đèn cầu có tâm cao 5 m, bán kính 40 cm. Điểm thấp nhất trên mặt đèn cao bao nhiêu mét?',4.6,'m','Đổi bán kính sang mét trước.','zmin = c − R.','zmin = 5 − 0,4 = 4,6 m.',{x:40},{center:5},2,0),
    q('Tìm ngược','Đèn cầu có tâm cao 4 m. Đoạn nối từ đèn tới sàn luôn cùng phương vectơ (1; 2; 2). Đoạn ngắn nhất dài 5,25 m. Tìm bán kính đèn theo cm.',50,'cm','Với vectơ có độ dài 3 và thành phần đứng 2, độ dài đoạn nối bằng 3/2 lần độ cao.','5,25 = (3/2)(4 − R).','4 − R = 3,5 ⇒ R = 0,5 m = 50 cm.',{x:50},null,0,1)
  ],
  15:[
    q('Thay số','Bóng thả từ độ cao 20 m. Mỗi lần nảy cao bằng 25% lần trước. Sau lần nảy thứ hai, bóng đạt độ cao tối đa bao nhiêu?',1.25,'m','Lần thả đầu tương ứng n = 0.','hₙ = h₀qⁿ.','h₂ = 20·0,25² = 1,25 m.',{x:2},{height:20,bounce:25},2,0),
    q('Tìm ngược','Bóng thả từ 18 m. Sau lần nảy thứ hai bóng lên tới 2 m. Mỗi lần nảy giữ cùng tỉ lệ. Tỉ lệ đó là bao nhiêu phần trăm?',100/3,'%','Tỉ lệ độ cao xuất hiện hai lần.','18q² = 2 với q ≥ 0.','q = 1/3, tức khoảng 33,33%.',{x:2},{height:18,bounce:100/3})
  ],
  16:[
    q('Thay số','Trục đu quay cao 24 m, bán kính 12 m, chu kỳ 16 giây. Tại t = 0 cabin ngang trục và đang đi lên. Độ cao tại t = 4 giây là bao nhiêu?',36,'m','Sau một phần tư chu kỳ, cabin ở vị trí cao nhất.','h = 24 + 12sin(2πt/16).','h(4) = 24 + 12 = 36 m.',{x:4},{center:24,radius:12,period:16,phase:0},0,0),
    q('Tìm ngược','Tại t = 2 giây cabin ngang trục và đang đi lên. Lần đầu sau đó cabin tới vị trí cao nhất vào t = 5 giây. Chu kỳ của đu quay là bao nhiêu?',12,'giây','Từ ngang trục đi lên đến đỉnh mất một phần tư vòng.','T/4 = 5 − 2.','T = 12 giây.',{x:5},{period:12,phase:2},0)
  ],
  17:[
    q('Thay số','Mái cao 15 m, ăng-ten cao thêm 5 m. Neo đất cách chân tường 21 m. Dây thẳng từ đỉnh ăng-ten đến neo dài bao nhiêu?',29,'m','Chiều cao đỉnh bằng chiều cao mái cộng chiều cao cột.','AT = √(AH² + HT²).','AT = √(21² + 20²) = 29 m.',{x:21,h:5},{roof:15},0,1),
    q('Tìm ngược','Mái cao 15 m, ăng-ten cao thêm 5 m. Dây từ đỉnh tới neo dài 25 m. Neo cách chân tường bao nhiêu mét?',15,'m','Dây là cạnh huyền, chiều cao là cạnh góc vuông.','AH = √(AT² − HT²).','AH = √(625 − 400) = 15 m.',{x:15,h:5},{roof:15},0,1)
  ],
  18:[
    q('Thay số','Hình chóp đều đáy vuông có cạnh đáy 100 m và cạnh bên 100 m. Tìm chiều cao chóp.',50*Math.SQRT2,'m','Đoạn từ tâm đáy đến một đỉnh đáy dài bằng nửa đường chéo.','SO = √(e² − a²/2).','SO = √(10.000 − 5.000) = 50√2 m.',{x:100},{edge:100},2,0),
    q('Tìm ngược','Chóp đều đáy vuông cạnh đáy 100 m. Đoạn ngắn nhất từ tâm đáy đến mặt bên tạo góc 45° với đáy. Tìm chiều cao chóp.',50,'m','Trong mặt phẳng qua đỉnh và trung điểm cạnh đáy, góc đang xét phụ với góc giữa mặt bên và đáy.','tan α = (a/2)/SO.','tan 45° = 1 nên SO = 50 m.',{x:100},{edge:50*Math.sqrt(3)},0,0)
  ],
  19:[
    q('Thay số','Đèn dạng lăng trụ đứng lục giác đều có cạnh đáy 10 cm, diện tích xung quanh 1.200 cm². Tìm chiều cao.',20,'cm','Mỗi cạnh đáy ứng với một mặt bên.','Sₓq = 6ah.','h = 1.200/(6·10) = 20 cm.',{x:10},{area:1200},0,0),
    q('Vận dụng','Đèn hai đáy lục giác đều, diện tích xung quanh giữ nguyên. Khi cạnh đáy tăng từ 6 lên 9 cm, thể tích tăng bao nhiêu phần trăm?',50,'%','Cạnh càng lớn thì chiều cao càng giảm để giữ diện tích xung quanh.','Thế h = Sₓq/(6a) vào V = (3√3/2)a²h.','V tỉ lệ với a. Tăng từ 6 lên 9 là tăng 50%.',{x:9},null,0,1)
  ],
  20:[
    q('Thay số','Mỗi cú ném có xác suất vào rổ 60%, các cú độc lập. Buổi tập dừng ngay khi vào rổ lần thứ ba. Xác suất dừng đúng cú thứ tư là bao nhiêu phần trăm?',25.92,'%','Cú thứ tư phải vào, ba cú đầu phải đúng hai cú vào.','P = C(3,2)·0,6³·0,4.','P = 0,2592, tức 25,92%.',{x:60,n:4},{target:3}),
    q('Tìm ngược','Các cú ném độc lập và có cùng xác suất vào rổ. Buổi tập dừng ngay khi có cú vào rổ thứ ba. Xác suất dừng đúng cú thứ ba là 21,6%. Tìm xác suất vào rổ mỗi cú theo phần trăm.',60,'%','Dừng đúng cú thứ ba nghĩa là cả ba cú đầu đều vào.','p³ = 0,216.','Lấy căn bậc ba: p = 0,6, tức 60%.',{x:60,n:3},{target:3})
  ],
  21:[
    q('Thay số','Ba nhánh song song, mỗi nhánh có hai linh kiện nối tiếp. Tỉ lệ tốt của hai loại là 80% và 50%, tất cả độc lập. Xác suất mạch thông là bao nhiêu phần trăm?',78.4,'%','Tìm xác suất của một nhánh, rồi xét cả ba nhánh cùng hỏng.','P(mạch thông) = 1 − (1 − 0,8·0,5)³.','1 − 0,6³ = 0,784, tức 78,4%.',{x:80},{second:50},2,1),
    q('Tìm ngược','Mỗi nhánh có hai linh kiện độc lập mắc nối tiếp. Linh kiện loại một tốt với xác suất 80%. Xác suất một nhánh thông là 60%. Tìm xác suất linh kiện loại hai tốt theo phần trăm.',75,'%','Một nhánh chỉ thông khi cả hai linh kiện tốt.','0,8p₂ = 0,6.','p₂ = 0,75, tức 75%.',{x:80},{second:75},0,0)
  ],
  22:[
    q('Thay số','Vua ở d4 trên bàn 8 × 8. Mỗi bước đi được một ô kề cạnh hoặc kề góc. Có bao nhiêu đường trở về d4 sau đúng 3 bước?',24,'đường','Xét thứ tự của hai ô trung gian quanh d4.','Mỗi cặp ô kề nhau quanh d4 cho hai hướng đi.','Trong tám ô quanh d4 có 12 cặp kề, nên có 24 đường.',{x:3},null,0,0),
    q('Vận dụng','Vua xuất phát ở d4. Có bao nhiêu đường về lại d4 sau đúng 4 bước nếu ở mỗi bước vua đi sang ô kề cạnh hoặc kề góc?',kingCounts(4)[27],'đường','Tính số đường đến từng ô sau hai bước.','Cộng bình phương các số đường hai bước vì có thể đảo chiều nửa sau.','Tổng bình phương các lượt đến hợp lệ ở bước 2 bằng '+kingCounts(4)[27]+'.',{x:4},null,0,0)
  ],
  23:[
    q('Thay số','Mỗi phát độc lập, xác suất đạt 10 điểm là 40%, đạt 9 điểm là 25%. Tính xác suất tổng ba phát đúng 29 theo phần trăm.',12,'%','Tổng 29 cần hai điểm 10 và một điểm 9.','P(29) = 3·p₁₀²p₉.','3·0,4²·0,25 = 0,12, tức 12%.',{x:40},{p9:25},2,1),
    q('Tìm ngược','Mỗi phát đạt 10 với xác suất 50%, đạt 9 với xác suất 20%. Ba phát độc lập. Tổng 30 chắc chắn có vàng, tổng dưới 29 không có vàng. Nếu xác suất có vàng là 20%, cơ hội có vàng khi đạt đúng 29 là bao nhiêu phần trăm?',50,'%','Tách xác suất có vàng thành hai trường hợp điểm số.','0,20 = 0,5³ + q·3·0,5²·0,2.','0,20 = 0,125 + 0,15q ⇒ q = 0,5.',{x:50,p:50},{p9:20},0,2)
  ],
  24:[
    q('Thay số','Hộp I có 2 bi xanh trong 5 viên, hộp II có 1 bi xanh trong 4 viên. Xúc xắc chẵn thì chuyển ngẫu nhiên 2 bi từ I sang II, rồi rút một viên từ II. Tính P(rút xanh | chẵn) theo phần trăm.',30,'%','Tính kỳ vọng số bi xanh được chuyển sang.','P(xanh | chẵn) = [g₂ + m·g₁/n₁]/(n₂ + m).','(1 + 2·2/5)/6 = 0,3, tức 30%.',{x:2},null,0,0),
    q('Vận dụng','Gieo xúc xắc công bằng. Chẵn chuyển ngẫu nhiên 2 bi từ I sang II, lẻ chuyển 2 bi từ I sang III. Hộp I có 2 xanh trên 5, hộp II có 1 xanh trên 4, hộp III có 0 xanh trên 4. Rút từ hộp nhận và thấy bi xanh. Xác suất đã gieo chẵn là bao nhiêu phần trăm?',900/13,'%','Trong mẫu số chỉ tính các khả năng cuối cùng rút được bi xanh.','P(chẵn | xanh) = P(xanh | chẵn)/[P(xanh | chẵn)+P(xanh | lẻ)] vì hai nhánh cùng xác suất.','Hai xác suất rút xanh là 1,8/6 và 0,8/6. Tỉ lệ là 1,8/2,6 = 9/13.',{x:2},null,2,1)
  ]
};

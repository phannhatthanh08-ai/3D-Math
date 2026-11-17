const extrema={
  1:[1,'min','Bán kính cho chi phí nhỏ nhất','Viết C/(2π) = cV₀/r + (k − 2c/3)r² với V₀ = V/π. Giải C′(r) = 0 nếu k > 2c/3, rồi so sánh với hai biên.',c=>c.capCost>2*c.sideCost/3?Math.cbrt(c.sideCost*c.capacity/(2*(c.capCost-2*c.sideCost/3))):Infinity],
  2:[1,'max','Giá vé cho doanh thu lớn nhất','Trên miền còn khách, R(p) có hệ số bậc hai bằng −k. Đỉnh nằm tại p = N₀/(2k).',c=>c.seats/(2*c.drop)],
  3:[1,'min','Cạnh đáy cho chi phí nhỏ nhất','C′(a) = 2ca − 4kV/a². Giải C′(a) = 0 được a = ∛(2kV/c).',c=>Math.cbrt(2*c.wallCost*c.volume/c.baseCost)],
  4:[1,'max','Nửa chiều rộng xe cho diện tích lớn nhất','A′(x) = 2H(1 − 3x²/a²). Đạo hàm đổi dấu từ dương sang âm tại x = a/√3.',c=>c.halfWidth/Math.sqrt(3)],
  11:[0,'min','Thời điểm hai máy bay gần nhau nhất','Bình phương AB là tam thức bậc hai theo giờ. Hoành độ đỉnh là (vₐxᵦ + vᵦyᵦ)/(vₐ² + vᵦ²). Sau đó đổi sang phút.',c=>60*(c.speedA*c.bx+c.speedB*c.by)/(c.speedA**2+c.speedB**2)],
  25:[0,'min','Cạnh đáy tốn ít kính nhất','S′(a) = 2a − 4V/a². Giải S′(a) = 0 được a = ∛(2V).',c=>Math.cbrt(2*c.volume)],
  26:[0,'min','Bán kính cho diện tích nhỏ nhất','S′(r)/(2π) = 2r − V₀/r², trong đó V₀ = V/π. Giải S′(r) = 0 được r = ∛(V₀/2).',c=>Math.cbrt(c.volume/2)],
  27:[0,'max','Độ cao cho độ rọi lớn nhất','Dấu của E′(h) cùng dấu R² − 2h², nên cực đại tại h = R/√2.',c=>c.radius/Math.sqrt(2)],
  28:[0,'max','Nửa chiều rộng của cửa có diện tích lớn nhất','A′(x) = 2H(1 − 3x²/a²), nên diện tích đạt cực đại tại x = a/√3.',c=>c.halfWidth/Math.sqrt(3)],
  29:[0,'max','Chiều rộng xà cho tiết diện lớn nhất','Hai cạnh x và h thỏa x² + h² = D². Từ 2xh ≤ D², diện tích lớn nhất đạt khi x = h = D/√2.',c=>c.diameter/Math.SQRT2],
  30:[0,'min','Vị trí chân thang để thang ngắn nhất','Dấu của L′(x) cùng dấu x³ − dh². Điểm tới hạn là x = ∛(dh²).',c=>Math.cbrt(c.distance*c.height**2)],
  31:[0,'max','Cạnh hình vuông cắt để thể tích lớn nhất','V′(x) = 12x² − 4(L + W)x + LW. Lấy nghiệm nhỏ nằm trong miền và so sánh với hai đầu.',c=>{
    const sum=c.length+c.width;
    return c.length*c.width/(2*(sum+Math.sqrt(sum*sum-3*c.length*c.width)));
  }],
  32:[0,'max','Cạnh vuông góc tường cho diện tích lớn nhất','A(x) = −3x² + Lx có hoành độ đỉnh L/6.',c=>c.fence/6],
  33:[0,'min','Điểm cập bờ cho thời gian ngắn nhất','T′(x) = x/[v_chèo√(x² + d²)] − 1/v_đi bộ. So sánh nghiệm trong miền với hai biên. Khi v_đi bộ ≤ v_chèo, T giảm trên đoạn.',c=>c.walkSpeed>c.rowSpeed?c.shore*c.rowSpeed/Math.sqrt(c.walkSpeed**2-c.rowSpeed**2):Infinity]
};

function domainFor(id,c){
  switch(id){
    case 1:return {min:0,max:Math.cbrt(1.5*c.capacity),openMin:true};
    case 2:return {min:0,max:c.seats/c.drop};
    case 11:return {min:0,max:c.observation||Infinity};
    case 4:
    case 28:return {min:0,max:c.halfWidth};
    case 29:return {min:0,max:c.diameter};
    case 31:return {min:0,max:Math.min(c.length,c.width)/2};
    case 32:return {min:0,max:c.fence/3};
    case 33:return {min:0,max:c.land};
    default:return {min:0,max:Infinity,openMin:id!==27};
  }
}

export function objectiveWindow(base,conditions,domain){
  const point=extrema[base.id]?.[4](conditions);
  if(!Number.isFinite(point)||!domain)return domain;
  const {min,max}=domainFor(base.id,conditions);
  return [point<domain[0]&&point>min?Math.max(min,point*.8):domain[0],
    point>domain[1]&&point<=max?Math.min(max,point*1.2):domain[1]];
}

export function objectiveOptions(base,metrics){
  const labels=metrics.map(m=>m.label);
  const objective=extrema[base.id];
  if(objective){
    const [index,order,label]=objective;
    labels.push(label,metrics[index].label+(order==='min'?' nhỏ nhất':' lớn nhất'));
  }
  return labels;
}
export function objectiveResult(base,controls,calculate,parameters,conditions,goal,metrics){
  const item=extrema[base.id];
  if(!item||goal<metrics.length)return null;
  const [index,order,label,reason,candidate]=item;
  const x=controls[0],domain=domainFor(base.id,conditions),critical=candidate(conditions);
  const {min,max,openMin}=domain;
  const candidates=[];
  if(!openMin)candidates.push(min);
  if(Number.isFinite(max))candidates.push(max);
  if(Number.isFinite(critical)&&critical>min&&critical<max)candidates.push(critical);
  const comparisons=candidates.map(value=>({value,reading:calculate({...parameters,x:value})[index]}));
  const best=comparisons.reduce((best,other)=>
    (order==='min'?other.reading.value<best.reading.value:other.reading.value>best.reading.value)?other:best);
  return {input:x,comparisons,best,reason,index,domain,
    answer:goal===metrics.length?{label,value:best.value,unit:x.unit}:
      {...best.reading,label:objectiveOptions(base,metrics)[goal]}};
}

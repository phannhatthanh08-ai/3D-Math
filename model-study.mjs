import {drawParameterGraph} from './lesson-studio.mjs';

const symbols={
  1:[['r','Bán kính đáy và nắp','radius'],['h','Chiều cao thân trụ','height']],
  2:[['N(p)','Ghế có khán giả','audience'],['R(p)','Doanh thu theo giá vé','graph',1]],
  3:[['a','Cạnh đáy vuông','width'],['h','Chiều cao hộp','height']],
  4:[['2x','Bề rộng xe','width'],['y','Chiều cao xe','height']],
  5:[['h','Mực nước từ đáy','height'],['r','Bán kính mặt nước','radius']],
  6:[['s','Vị trí mặt cắt','slice'],['y(s)','Chiều cao vòm tại mặt cắt','height']],
  7:[['z','Độ cao lát cắt','height'],['A(z)','Diện tích lát ngang','slice']],
  8:[['r(x)','Bán kính đĩa','radius'],['A(x)','Diện tích đĩa vuông góc trục','slice']],
  9:[['r(z)','Bán kính lát cắt','radius'],['A(z)','Diện tích tiết diện tròn','slice']],
  10:[['h','Mực cát còn lại','height'],['A(h)','Mặt cát ngang','slice']],
  11:[['A(t), B(t)','Tọa độ máy bay và hình chiếu','projection'],['AB','Đoạn nối hai máy bay','distance']],
  12:[['R','Bán kính của bồn','radius'],['L','Đoạn từ đầu ống đến chỗ chạm','distance']],
  13:[['I₁, I₂','Tâm hai vùng và hình chiếu','projection'],['dᵢ','Đoạn từ khí cầu đến tâm vùng','distance']],
  14:[['v⃗','Đoạn cùng phương vectơ nối','distance'],['z','Độ cao và hình chiếu','projection']],
  15:[['hₙ','Độ cao trong lần nảy','height']],
  16:[['R','Bán kính đến cabin được xét','radius'],['h(t)','Độ cao cabin tính từ mặt đất','height']],
  17:[['HT','Độ cao của đỉnh','height'],['AT','Dây cáp là cạnh huyền','distance']],
  18:[['SO','Đường cao hình chóp','height'],['α','Góc giữa đường hầm và đáy','angle']],
  19:[['a','Cạnh đáy lục giác','width'],['h','Chiều cao của lồng đèn','height']],
  20:[['P(T = n)','Lượt dừng trong phân bố','event']],
  21:[['P(nhánh thông)','Một nhánh có hai linh kiện tốt','event']],
  22:[['Fₖ(c)','Số đường tới từng ô sau k bước','event']],
  23:[['P(29), P(30)','Các nhóm điểm trong kết quả','event']],
  24:[['P(A | B)','Các lượt thuộc mẫu số có điều kiện','event']],
  27:[['R','Bán kính bàn','radius'],['h','Độ cao đèn','height']],
  30:[['L','Chiều dài từ chân tới đầu thang','distance'],['h','Độ cao hàng chắn','height']],
  31:[['x','Chiều cao hộp bằng cạnh phần cắt','height']],
  33:[['T','Hai chặng nối tiếp nhau','distance']],
  34:[['r(h)','Bán kính mặt nước','radius'],['A(h)','Diện tích mặt nước','slice']],
  35:[['A(h)','Mặt nước nằm ngang','slice']]
};
const radialSliceSymbols=[['r(x)','Bán kính lát cắt','radius'],['A(x)','Mặt cắt vuông góc trục','slice']];
const archSliceSymbols=[['h(x)','Chiều cao ở mặt cắt','radius'],['A(x)','Mặt cắt vuông góc trục','slice']];
const xyzSymbols=[['(x; y; z)','Tọa độ điểm và hình chiếu','projection'],['d','Đoạn thẳng của bài toán','distance']];
const probabilitySymbols=[['P(A)','Biến cố trong kết quả thí nghiệm','event']];
export function lessonFeatures(lesson){
  return lesson.features??symbols[lesson.id]??(lesson.group===1?([39,40,42,43].includes(lesson.id)?archSliceSymbols:radialSliceSymbols):lesson.group===2?xyzSymbols:lesson.group===4?probabilitySymbols:[]);
}

export function sectionParameter(lesson){
  return lesson.id===6?'s':'x';
}

export function sectionReading(lesson,state){
  if(lesson.section)return lesson.section(state);
  if(lesson.id===6){
    const height=lesson.result(state)[0].value;
    return {area:height*(lesson.conditions?.length??60),unit:'m²',label:'Mặt cắt dọc mái',formula:'A(s) = chiều dài nhà × chiều cao vòm tại s'};
  }
  if(lesson.id===10){
    const h=lesson.result(state)[1].value,k=lesson.conditions?.profile??4;
    return {area:Math.PI*k*h,unit:'cm²',label:'Mặt cát ngang',formula:'A(t) = πk·h(t), với r² = kh'};
  }
  const reading=lesson.result(state)[[8,9].includes(lesson.id)?1:0];
  return {area:reading.value,unit:reading.unit,label:reading.label,formula:'Mỗi điểm trên đồ thị ứng với diện tích tiết diện tại vị trí đang chọn.'};
}

export function sectionCurve(lesson,state){
  const key=sectionParameter(lesson),control=lesson.controls.find(c=>c.key===key);
  const points=Array.from({length:73},(_,i)=>{
    const x=control.min+(control.max-control.min)*i/72;
    return [x,sectionReading(lesson,{...state,[key]:x}).area];
  });
  const height=Math.max(1e-10,...points.map(([,y])=>y));
  return {control,points,min:0,max:height*1.12,discrete:false};
}

export function drawSectionChart(canvas,curve,x,y){
  return drawParameterGraph(canvas,curve,[x,y],null,'#86e2ba');
}

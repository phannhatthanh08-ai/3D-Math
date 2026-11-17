import {fmt} from './lessons.mjs';
import {exercises} from './practice-questions.mjs';
import {draftFor,instantiateProblem,validateDraft} from './problem-editor.mjs';

const storage='toan-lab-3d-practice-v1';
const exactUnits=new Set(['đường','viên','cách','người','ghế','cú','lượt','quyển']);
const sampleContext={
  2:'Sân có 40.000 ghế và đầy khách khi miễn phí. Giá p được tính theo nghìn đồng.',
  3:'Hộp không có nắp, đáy vuông, thể tích 8 dm³. Giá vật liệu thành hộp là 5 nghìn đồng/dm².',
  4:'Cửa hầm parabol rộng 12 m trên mặt đường và cao 4 m ở tim hầm. Xe đặt cân giữa.',
  5:'Bể nón đặt đỉnh xuống dưới, cao 4 m, bán kính miệng 2 m.',
  6:'Mái vòm parabol ban đầu cao 8 m, nhịp 20 m và dài 60 m.',
  7:'Đáy lều dài 2,10 m và rộng 1,95 m. Tỉ lệ chiều dài của lát ngang ở độ cao z là √(1 − z/H).',
  8:'Mô hình bóng là elip tròn xoay có chiều dài 28 cm.',
  9:'Bán kính eo tháp bằng 15 m.',
  10:'Lưu lượng cát theo thời gian là 13 + 0,2t cm³/phút.',
  11:'A(0; 0; 3) bay theo chiều dương Ox với tốc độ 60 km/h. B(12; 6; 5) bay theo chiều âm Oy với tốc độ 30 km/h.',
  12:'Bồn cầu tâm (0; 0; 4), bán kính 3 m. Đầu ống có tọa độ ngang x = −8, y = 0 và đi theo chiều dương Ox.',
  13:'Khí cầu đi dọc (t; 0; 2), tính bằng km. Hai vùng cầu có bán kính √5 km, tâm (4; 1; 2) và (9; −1; 2).',
  14:'Tâm đèn cao 4 m. Đoạn nối giữa sàn và đèn cùng phương với vectơ (1; 2; 2).',
  15:'Bóng được thả thẳng đứng từ 55,8 m. Mỗi lần nảy có hai chặng đi lên và đi xuống.',
  16:'Trục đu quay cao 20 m. Bán kính 10 m, mỗi vòng mất 10 giây.',
  17:'Mái cao 20 m và cột cao thêm 20 m. Neo A ở mặt đất, H ở chân tường ngay dưới cột.',
  18:'Chóp đều đáy vuông. Cạnh bên dài 230 m. Góc cần tính nằm giữa đoạn ngắn nhất từ tâm đáy đến mặt bên và mặt đáy.',
  19:'Lồng đèn là lăng trụ đứng đáy lục giác đều, tổng diện tích sáu thành là 1.536 cm².',
  20:'Các cú ném độc lập. Dừng ngay khi vào rổ lần thứ năm.',
  21:'Ba nhánh mắc song song, mỗi nhánh gồm hai linh kiện nối tiếp hoạt động độc lập.',
  22:'Vua bắt đầu ở d4 trên bàn 8 × 8. Mỗi lượt được đi một ô kề cạnh hoặc kề góc.',
  23:'Mỗi phát có 30% cơ hội đạt 10 điểm và 20% đạt 9 điểm, còn lại đạt tối đa 8. Ba phát độc lập, tổng 30 chắc chắn có vàng.',
  24:'Chẵn chuyển 2 bi từ I sang II, lẻ chuyển từ I sang III rồi rút một bi ở hộp nhận. Hộp I có 5 bi, II có 1 xanh trên 4, III có 0 xanh trên 4.'
};
const sampleClues=[
  'Tách thể tích thân trụ và nắp bán cầu.', 'Viết số khách theo giá mới rồi lập doanh thu.',
  'Giá ghi theo diện tích, nên dùng thể tích để rút một kích thước.', 'Xe đặt cân giữa. Đổi bề rộng thành nửa bề rộng.',
  'Bán kính lát ngang tỉ lệ với độ sâu.', 'Hai vòm có cùng chân và kéo dài cùng một đoạn.', 'Diện tích lát ngang là tích của hai cạnh cùng thu nhỏ.',
  'Bán trục ngang là nửa đường kính lớn nhất.', 'Lát tại eo vẫn là một hình tròn.', 'Dùng lưu lượng để tìm lượng tích lũy.',
  'Miền thời gian là 9 phút đầu. Điểm cực tiểu tự do có thể nằm ngoài miền này.', 'Đầu ống tiến theo chiều dương Ox.',
  'Tìm thời điểm rời vùng 1 và thời điểm vừa vào vùng 2.', 'Bán kính quyết định cao độ thấp nhất trên mặt cầu.',
  'Lần rơi đầu chỉ tính một lượt. Các độ cao nảy lặp theo cấp số nhân.', 'So sánh hai vị trí cao nhất liên tiếp trên vòng quay.',
  'Cộng độ cao mái và cột trước khi lập tam giác.', 'Xét mặt phẳng qua đỉnh, tâm và trung điểm cạnh đáy.',
  'Dùng diện tích sáu mặt bên để rút chiều cao.', 'Cú cuối cùng phải vào rổ.',
  'Một nhánh chỉ dẫn điện nếu cả hai linh kiện tốt.', 'Mỗi hành trình có một bước đi ra và một bước quay lại.',
  'Liệt kê các tổng điểm còn đủ điều kiện nhận huy chương.', 'Phân biệt điều đã quan sát với điều cần suy ra.'
];
const sampleFormulas=[
  'h = V/(πr²) − 2r/3.', 'p tối ưu là số ghế chia hai lần mức giảm khách mỗi nghìn đồng.',
  'Thế đơn giá mới vào C(a) = c·a² + 4kV/a rồi giải C′(a) = 0.', 'Một nửa bề rộng bằng 3 m. Đọc tung độ parabol.',
  'Với r = h/2, dùng Q = πr²·dh/dt.', 'ΔV = (2/3)WL(H − h₀).', 'V = LW·H/2.',
  'Dùng V = 4πab²/3 với b bằng nửa đường kính mới.', 'Tại eo, A = πrₑ².',
  'Tính tích phân của 13 + 0,2t từ 0 đến 10.', 'So sánh đỉnh của tam thức D² với miền 0 ≤ t ≤ 9 phút.',
  'Thế z = 7 vào phương trình mặt cầu.', 'Lấy đầu mút vào vùng 2 trừ đầu mút ra vùng 1.',
  'Giải (4 − R)·3/2 = 5,4 rồi đổi R sang cm.', 'Dùng S = h₀ + 2h₀q/(1 − q) với q = 1/5.',
  'Khoảng cách giữa hai đỉnh liên tiếp là một chu kỳ.', 'AT = √(42² + 40²).',
  'Tìm SO bằng Pythagore rồi dùng tan α = (a/2)/SO.', 'Dùng h = Sₓq/(6a) và V = (3√3/2)a²h.',
  'Xác suất của năm cú vào rổ liên tiếp là 0,8⁵.', 'Mạch hỏng khi cả ba nhánh cùng hỏng.',
  'Mỗi lựa chọn đi ra từ d4 có đúng một nước quay ngược.', 'Khi tổng 29 không được vàng, chỉ tính P(30).',
  'Lấy P(chẵn và xanh) chia P(xanh), với P(xanh) tính từ cả hai hộp nhận.'
];
const sampleModels={
  1:{parameters:{x:4}},2:{parameters:{x:250},conditions:{drop:80}},3:{parameters:{x:Math.cbrt(16)},conditions:{baseCost:5}},
  4:{parameters:{x:3}},5:{parameters:{x:2}},6:{parameters:{x:11}},7:{conditions:{height:1.6}},
  8:{conditions:{radius:9}},9:{parameters:{x:80}},10:{parameters:{x:10}},11:{parameters:{x:9},conditions:{observation:9}},
  12:{parameters:{x:7}},13:{parameters:{x:6}},14:{parameters:{x:40}},15:{parameters:{x:8},conditions:{bounce:20}},
  16:{parameters:{x:13.5}},17:{parameters:{x:42}},18:{parameters:{x:200}},19:{parameters:{x:10}},
  20:{parameters:{n:5}},21:{parameters:{x:80},conditions:{second:80}},22:{parameters:{x:2}},
  23:{parameters:{p:0}},24:{parameters:{x:1}}
};

export function practiceTasks(lesson){
  const base=lesson.base??lesson;
  const {practice}=base;
  const rounding=practice.question.match(/làm tròn\s+(\d+)\s+chữ số/i);
  const digits=rounding?Number(rounding[1]):
    /làm tròn (tới|đến) (độ|m²|cm³)/i.test(practice.question)||exactUnits.has(practice.unit)?0:2;
  const tasks=[{...practice,key:'sample',kind:'Câu mẫu',digits:practice.digits??digits,
    context:sampleContext[base.id]??(base.extension?base.prompt:null),
    first:sampleClues[base.id-1]??base.knowledge,expression:sampleFormulas[base.id-1]??base.formula.join(' · '),
    model:practice.model??sampleModels[base.id]}];
  for(const [index,task] of (base.extraPractice??[]).entries())tasks.push({...task,key:'expansion-'+(index+1),kind:'Tự giải',context:base.prompt});
  for(const [index,task] of (exercises[base.id]??[]).entries())tasks.push({...task,key:String(index+1)});
  if(lesson.custom){
    const key='custom:'+JSON.stringify(lesson.custom);
    const objective=lesson.steps.find(step=>step.title==='Tìm ứng viên và so sánh');
    const special=lesson.referenceProblem?' '+lesson.referenceProblem:'';
    tasks.unshift({...lesson.practice,key,kind:'Đề tùy chỉnh',
      context:lesson.prompt+special,givens:lesson.problemData,
      question:lesson.problemQuestion,digits:exactUnits.has(lesson.practice.unit)?0:2,
      first:'Xác định đại lượng cần tìm và đối chiếu đơn vị với các dữ kiện của đề.',
      expression:lesson.formula.join(' · '),
      explanation:objective?.text??lesson.steps.find(step=>step.title==='Thay số')?.text??lesson.practice.explanation,
      choices:lesson.practice.answer===null?qualitativeChoices(lesson):null,
      explanationChoice:lesson.practice.answer===null?lesson.practice.explanation.split(' = ').at(-1).replace(/\.$/,''):null,
      configured:true});
  }
  return tasks;
}

function qualitativeChoices(lesson){
  if(lesson.id===13)return ['Ngoài hai vùng','Trong vùng 1','Trong vùng 2','Trong cả hai vùng'];
  if(lesson.id===12)return ['Ống cắt mặt cầu','Ống tiếp xúc mặt cầu','Ống nằm ngoài mặt cầu'];
  return ['0%','100%','Xác suất điều kiện không xác định'];
}

export function readProgress(){
  const blank={last:null,selected:{},records:{}};
  try{
    const data=JSON.parse(localStorage.getItem(storage));
    if(data&&data.selected&&data.records)return data;
  }catch{}
  return blank;
}
export function writeProgress(data){
  try{localStorage.setItem(storage,JSON.stringify(data));return true;}
  catch{return false;}
}
export function recordKey(lessonId,task){
  return lessonId+'|'+task.key;
}

const normalizeUnit=text=>text.toLowerCase().replace(/\^([23])/g,(_,n)=>n==='2'?'²':'³').replace(/\s*\/\s*/g,'/').replace(/\s+/g,' ').trim();
const unitAliases={
  '%':['%','phần trăm'],'°':['°','độ'],'m':['m','mét'],'cm':['cm','xăng-ti-mét'],
  'km':['km','ki-lô-mét'],'giây':['giây','s'],'phút':['phút','min'],'giờ':['giờ','h'],
  'tỷ đồng':['tỷ đồng','tỉ đồng'],'nghìn đồng':['nghìn đồng','ngàn đồng'],
  'triệu đồng':['triệu đồng'],'m³/phút':['m³/phút','m³/min'],'m/phút':['m/phút','m/min']
};
function parseNumber(text){
  let value=text.replace(/−/g,'-').trim();
  if(/^[+-]?\d{1,3}(?:[. ]\d{3})+(?:,\d+)?$/.test(value)){
    const decimal=value.includes(',');
    const grouped=value.replace(/[. ]/g,'').replace(',','.');
    if(decimal||value.includes(' ')||value.split('.').length>2)return [Number(grouped)];
    return [Number(value),Number(grouped)];
  }
  if(!/^[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)$/.test(value))return [];
  return [Number(value.replace(',','.'))];
}
function readAnswer(raw){
  const match=/^\s*([+−-]?(?:\d[\d., ]*\d|\d|[.,]\d+))(.*)$/u.exec(raw);
  if(!match)return {values:[],unit:''};
  const [,number,unit]=match;
  return {values:parseNumber(number),unit:normalizeUnit(unit)};
}

export function gradePractice(task,raw){
  if(task.choices)return !raw?'invalid':raw===task.explanationChoice?'correct':'incorrect';
  const {values,unit}=readAnswer(raw);
  if(!values.length||values.some(n=>!Number.isFinite(n)))return 'invalid';
  const expected=task.answer;
  const allowed=unitAliases[task.unit]??[normalizeUnit(task.unit)];
  if(unit&&!allowed.includes(unit))return 'unit';
  const epsilon=1e-9+Math.abs(expected)*1e-12;
  const digits=task.digits;
  const rounded=Number(expected.toFixed(digits));
  if(values.some(n=>Math.abs(n-expected)<=epsilon||Math.abs(n-rounded)<=epsilon))return 'correct';
  if(task.unit==='%'&&Math.abs(expected)>epsilon&&values.some(n=>Math.abs(n*100-expected)<=Math.max(epsilon,.05)))return 'percent';
  if(digits>0&&values.some(n=>Math.abs(n-expected)<=Math.max(epsilon,.5*10**-digits)&&n.toFixed(digits)===expected.toFixed(digits)))return 'correct';
  if(digits>0&&values.some(n=>Math.abs(n-expected)<=1.05*10**-digits))return 'round';
  return 'incorrect';
}

export function answerLabel(task){
  if(task.choices)return task.explanationChoice;
  return fmt(Number(task.answer.toFixed(task.digits)))+(task.unit?' '+task.unit:'');
}

export function exerciseModel(lesson,task){
  if(task.configured)return lesson;
  if(!task.model)return null;
  const base=lesson.base??lesson;
  const draft=draftFor(base);
  Object.assign(draft.parameters,task.model.parameters);
  Object.assign(draft.conditions,task.model.conditions);
  const index=task.model.metric??Math.max(0,base.result(draft.parameters).length-1);
  draft.metric=index;
  const {data}=validateDraft(base,draft);
  return data?instantiateProblem(base,data):null;
}

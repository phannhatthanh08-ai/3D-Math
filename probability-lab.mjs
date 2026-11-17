import {fmt} from './lessons.mjs';
import {urnSpec} from './problem-models.mjs';

export const walkLessons=new Set([22,78,79]);
export const sampledMain=new Set([20,21,23,24]);
const descriptions={
  20:'Cú thành công thứ 5 đúng ở lượt đang xét.',
  21:'Có ít nhất một nhánh mà cả hai linh kiện đều tốt.',
  23:'Xạ thủ nhận huy chương vàng.',
  24:'Trong các lượt rút được bi xanh, xét những lượt xúc xắc ra chẵn.',
  76:'Hai viên được rút đều xanh.',
  77:'Đúng hai đồng xu ngửa.',
  80:'Hai tay đua đứng ở vị trí kề nhau.',
  81:'Có ít nhất một viên đỏ trong các lượt rút.',
  82:'Ngăn số 1 nhận ít nhất một quyển sách.',
  83:'Quả cam được chọn là cam loại I.',
  84:'Tay bài chứa đủ bốn lá Át.',
  85:'Có ít nhất một bóng hỏng.',
  86:'Có ít nhất một bi mang số chẵn.',
  87:'Đúng một cây có quả.',
  88:'Đúng một phiếu trúng.',
  89:'Trong các lượt máy báo lỗi, xét những thanh thép thực sự lỗi.',
  90:'Mọi cặp đỉnh kề có màu khác nhau.',
  91:'A và B ngồi cạnh nhau.'
};
export function eventDescription(id,state){
  if(id===20)return 'Cú thành công thứ '+(state.conditions?.target??5)+' đúng ở lượt đang xét.';
  if(id===77)return 'Đúng '+(state.conditions?.match??2)+' đồng xu ngửa.';
  return descriptions[id]??'';
}
const actions={
  20:step=>'Ném bóng · cú '+step,
  21:step=>'Kiểm tra nhánh '+Math.ceil(step/2)+' · linh kiện '+(2-(step%2)),
  23:step=>step===4?'Xét huy chương':'Bắn phát '+step,
  76:step=>'Lật kết quả viên bi '+step,
  77:step=>'Tung đồng xu '+step,
  80:step=>step===1?'Cố định tay đua A':'Bốc vị trí của tay đua B',
  81:step=>'Rút rồi trả bi · lượt '+step,
  82:step=>'Xếp quyển sách '+step,
  83:step=>step===1?'Chọn nguồn cam':'Phân loại quả cam',
  84:step=>'Lật lá bài '+step,
  85:step=>'Kiểm tra bóng '+step,
  86:step=>'Rút bi thứ '+step,
  87:step=>step===1?'Quan sát cây A':'Quan sát cây B',
  88:step=>'Rút phiếu '+step,
  89:step=>step===1?'Đưa thanh thép vào máy':'Đọc tín hiệu máy',
  90:step=>'Tô đỉnh '+step,
  91:step=>step===1?'Cố định ghế của A':'Bốc ghế của B'
};

export function trialAction(id,step,length){
  if(id===20&&step===length)return 'Đối chiếu mốc dừng';
  if(id===24){
    if(step===length)return 'Rút bi từ hộp nhận';
    return step===1?'Gieo xúc xắc':step===2?'Xác định hộp nhận':'Chuyển viên thứ '+(step-2);
  }
  return actions[id]?.(step)??'Bước '+step;
}

const yesNo=(value,yes,no)=>value?yes:no;
const chooseIndex=(n,rng)=>Math.floor(rng()*n);

export function samplePrimary(id,state,rng=Math.random){
  const p=state.x/100,c=state.conditions;
  if(id===20){
    const target=c?.target??5;
    const view=[];let hits=0;
    for(let i=0;i<state.n&&hits<target;i++){const hit=rng()<p;view.push(hit);hits+=Number(hit);}
    return {view,target,success:hits===target&&view.length===state.n};
  }
  if(id===21){
    const p2=c?c.second/100:p;
    const view=Array.from({length:3},()=>[rng()<p,rng()<p2]);
    return {view,success:view.some(branch=>branch.every(Boolean))};
  }
  if(id===23){
    const p9=(c?.p9??20)/100;
    const view=Array.from({length:3},()=>{const u=rng();return u<p?10:u<p+p9?9:8;});
    const score=view.reduce((a,b)=>a+b,0);
    return {view,success:score===30||(score===29&&rng()<state.p/100)};
  }
  if(id!==24)throw new RangeError('Unknown probability lesson');
  const spec=urnSpec(state);
  const bag=Array.from({length:spec.total1},(_,i)=>i<state.x);
  const even=rng()<state.p/100;
  const die=1+2*chooseIndex(3,rng)+Number(even);
  const moved=Array.from({length:spec.move},()=>bag.splice(chooseIndex(bag.length,rng),1)[0]);
  const receiver=even?1:2;
  const boxes=urnLayout(state,moved,receiver);
  const green=rng()<boxes[receiver][0]/(boxes[receiver][0]+boxes[receiver][1]);
  return {view:{die,green,boxes,receiver,moved},success:even&&green,condition:green};
}
export function urnLayout(state,moved=[],receiver){
  const {total1,total2,green2,total3,green3}=urnSpec(state);
  const greens=moved.filter(Boolean).length,browns=moved.length-greens;
  const boxes=[[state.x-greens,total1-state.x-browns],[green2,total2-green2],[green3,total3-green3]];
  if(receiver!==undefined){
    boxes[receiver][0]+=greens;
    boxes[receiver][1]+=browns;
  }
  return boxes;
}
export function sampleCustomProbability(id,{x,conditions:c},rng=Math.random){
  if(!c)return;
  const p=x/100;
  if(id===76){
    const first=rng()<x/c.total;
    const second=rng()<(x-Number(first))/(c.total-1);
    return {view:[first,second],success:first&&second};
  }
  if(id===77){
    const view=Array.from({length:4},()=>rng()<p);
    return {view,success:view.filter(Boolean).length===c.match};
  }
  if(id===83){
    const farm=rng()<p,grade=rng()<(farm?c.a:c.b)/100;
    return {view:[grade],success:grade,detail:{farm}};
  }
  if(id===87){
    const a=rng()<c.a/100,b=rng()<p;
    return {view:[a,b],success:a!==b};
  }
  if(id===89){
    const faulty=rng()<p,signal=rng()<(faulty?c.sensitivity:c.falsePositive)/100;
    return {view:[faulty,signal],success:faulty&&signal,condition:signal};
  }
}

const flags=(values,on,off)=>values.map((value,i)=>[String(i+1),yesNo(value,on,off),value?'match':'neutral']);
const suits=['♠','♥','♦','♣'];
const colorNames=['Vàng','Xanh ngọc','Xanh dương','Tím','Cam','Xanh lá'];
export const cardName=card=>{
  const rank=card%13;
  return (['A','2','3','4','5','6','7','8','9','10','J','Q','K'][rank])+suits[Math.floor(card/13)];
};
export function trialSteps(id,result){
  if(result.steps)return result.steps;
  const {view,detail}=result;
  switch(id){
    case 20:{
      const target=result.target??5;
      const end=view.filter(Boolean).length===target?'Đủ '+target+' ở cú '+view.length:'Chưa đủ '+target+' sau '+view.length+' cú';
      return flags(view,'Vào rổ','Trượt').concat([['Kết thúc lượt thử',end,result.success?'match':'neutral']]);
    }
    case 21:return view.flatMap((branch,i)=>branch.map((bit,j)=>[
      'Nhánh '+(i+1)+' · Linh kiện '+(j+1),yesNo(bit,'Tốt','Hỏng'),bit?'match':'miss'
    ]));
    case 23:return view.map((score,i)=>['Phát '+(i+1),score===8?'Tối đa 8 điểm':score+' điểm','neutral']).concat([['Xét huy chương',(view.includes(8)?'Tối đa '+view.reduce((a,b)=>a+b,0):fmt(view.reduce((a,b)=>a+b,0))+' điểm')+' · '+(result.success?'Có vàng':'Không có vàng'),result.success?'match':'neutral']]);
    case 24:return [['Xúc xắc',String(view.die),'neutral'],['Hộp nhận',view.receiver===1?'II':'III','neutral'],
      ...view.moved.map((bit,i)=>['Bi chuyển '+(i+1),yesNo(bit,'Xanh','Nâu'),'neutral']),['Bi rút ra',yesNo(view.green,'Xanh','Nâu'),view.green?'match':'neutral']];
    case 76:return flags(view,'Bi xanh','Bi nâu');
    case 77:return flags(view,'Ngửa','Sấp');
    case 80:return [['Tay đua A','Vị trí 1','neutral'],['Tay đua B','Vị trí '+(detail.position+1),result.success?'match':'neutral']];
    case 81:return flags(view,'Đỏ rồi trả lại','Xanh rồi trả lại');
    case 82:return detail.shelves.map((n,i)=>['Sách '+(i+1),'Ngăn '+(n+1),n===0?'match':'neutral']);
    case 83:return [['Nguồn',detail.farm?'Trại A':'Trại B','neutral'],['Phân loại',view[0]?'Loại I':'Loại khác',view[0]?'match':'neutral']];
    case 84:return detail.cards.map((card,i)=>['Lá '+(i+1),cardName(card),card%13===0?'match':'neutral']);
    case 85:return flags(view,'Hỏng','Sáng');
    case 86:return detail.numbers.map((n,i)=>['Bi '+(i+1),String(n),n%2===0?'match':'neutral']);
    case 87:return view.map((bit,i)=>['Cây '+(i?'B':'A'),bit?'Có quả':'Chưa có quả',bit?'match':'neutral']);
    case 88:return flags(view,'Phiếu trúng','Phiếu thường');
    case 89:return [['Thực tế',view[0]?'Thanh lỗi':'Thanh đạt',view[0]?'miss':'neutral'],['Máy kiểm định',view[1]?'Báo lỗi':'Không báo lỗi',view[1]?'match':'neutral']];
    case 90:return view.map((n,i)=>['Đỉnh '+(i+1),colorNames[n],n===view[(i+1)%6]?'miss':'neutral']);
    case 91:return [['Người A','Ghế 1','neutral'],['Người B','Ghế '+(detail.position+1),result.success?'match':'neutral']];
    default:return [];
  }
}

const lilyNeighbors=[[1,2],[0,2,3],[0,1,4],[1,4],[2,3]];
const knightMoves=[[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]];
const kingMoves=[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];
const walks={
  22:{width:8,start:27,target:27,moves:kingMoves},
  78:{width:5,start:12,target:12,moves:knightMoves},
  79:{start:0,target:4,neighbors:lilyNeighbors}
};
function neighbors(config,at){
  if(config.neighbors)return config.neighbors[at];
  const {width,moves}=config;
  const x=at%width,y=Math.floor(at/width);
  return moves.map(([dx,dy])=>[x+dx,y+dy]).filter(([a,b])=>a>=0&&a<width&&b>=0&&b<width).map(([a,b])=>a+b*width);
}
export function walkOptions(id,at){return neighbors(walks[id],at);}
export function walkStart(id){return walks[id].start;}
export function walkTarget(id){return walks[id].target;}
export function walkPlace(id,at){
  const width=walks[id].width;
  return width?String.fromCharCode(97+at%width)+(1+Math.floor(at/width)):'Lá '+'ABCDE'[at];
}
export function walkStages(id,steps,start=walkStart(id)){
  const {width}=walks[id];
  let counts=Array.from({length:width?width**2:lilyNeighbors.length},(_,i)=>Number(i===start));
  const stages=[counts];
  for(let move=0;move<steps;move++){
    const next=counts.map(()=>0);
    counts.forEach((n,at)=>{for(const to of walkOptions(id,at))next[to]+=n;});
    stages.push(next);
    counts=next;
  }
  return stages;
}
export function walkExample(id,steps,rng=Math.random){
  const config=walks[id];
  const memo=new Map();
  function ways(at,left){
    if(left===0)return Number(at===config.target);
    const key=at+':'+left;
    if(!memo.has(key))memo.set(key,neighbors(config,at).reduce((sum,next)=>sum+ways(next,left-1),0));
    return memo.get(key);
  }
  const total=ways(config.start,steps);
  if(total===0)return [];
  const route=[config.start];
  for(let left=steps;left>0;left--){
    const options=neighbors(config,route.at(-1));
    let ticket=rng()*ways(route.at(-1),left);
    for(const next of options){
      ticket-=ways(next,left-1);
      if(ticket<0){route.push(next);break;}
    }
  }
  return route;
}
export function walkSteps(id,path){
  return path.map((at,i)=>[i?'Bước '+i:'Xuất phát',walkPlace(id,at),'neutral']);
}

// Reveal a recorded outcome without drawing new random values during playback.
export function trialFrame(id,state,result,step,progress=1){
  if(!result||step===0)return {id,step,progress};
  if(result.steps)return {id,step,progress,detail:result.detail,view:result.view};
  const {view,detail}=result;
  const shown=(values,count=step)=>values.slice(0,count);
  switch(id){
    case 20:return {id,step,progress,view:shown(view)};
    case 21:return {id,step,progress,view:view.map((branch,i)=>branch.slice(0,Math.max(0,step-i*2))).filter(branch=>branch.length)};
    case 23:return {id,step,progress,view:shown(view),medal:step>view.length?result.success:undefined};
    case 24:{
      const moved=shown(view.moved,Math.max(0,step-2));
      const receiver=view.receiver;
      const drawStep=view.moved.length+3;
      return {id,step,progress,view:{die:view.die,boxes:urnLayout(state,moved,receiver),transferred:moved,
        receiver:step>=2?receiver:undefined,
        green:step>=drawStep?view.green:undefined,
        moving:step>2&&step<drawStep?moved.at(-1):undefined}};
    }
    case 80:
    case 91:return {id,step,progress,view:step>=2?view:undefined,detail:step>=2?detail:undefined};
    case 81:return {id,step,progress,view:shown(view),detail:{slots:shown(detail.slots)}};
    case 82:return {id,step,progress,view:shown(view),detail:{shelves:shown(detail.shelves)}};
    case 83:return {id,step,progress,view:step>=2?view:undefined,detail};
    case 84:return {id,step,progress,view:shown(view),detail:{cards:shown(detail.cards)}};
    case 86:return {id,step,progress,view:shown(view),detail:{numbers:shown(detail.numbers)}};
    default:return {id,step,progress,view:shown(view),detail};
  }
}

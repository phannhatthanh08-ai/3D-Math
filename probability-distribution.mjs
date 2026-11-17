import {choose} from './lessons.mjs';
import {urnSpec,urnGreenRates} from './problem-models.mjs';

const range=n=>Array.from({length:n},(_,i)=>i);
const binomial=(n,p)=>range(n+1).map(k=>choose(n,k)*p**k*(1-p)**(n-k));
const hypergeometric=(total,marked,draws)=>range(draws+1)
  .map(k=>choose(marked,k)*choose(total-marked,draws-k)/choose(total,draws));
const count=values=>values.filter(Boolean).length;
const exclusive=(a,b)=>[a*b,a*(1-b),(1-a)*b,(1-a)*(1-b)];

function countBands(noun,weights,observed,cap=weights.length-1){
  const rows=weights.slice(0,cap).map((p,k)=>[k+' '+noun,p]);
  const suffix=cap===weights.length-1?'':' trở lên';
  rows.push([cap+' '+noun+suffix,weights.slice(cap).reduce((a,b)=>a+b,0)]);
  return {rows,category:result=>Math.min(cap,observed(result))};
}

function coloring(k){
  // Fix the first color, then track the last color and number of equal edges.
  let paths=Array.from({length:k},(_,color)=>[Number(color===0),0,0]);
  for(let edge=0;edge<5;edge++){
    const next=Array.from({length:k},()=>[0,0,0]);
    paths.forEach((counts,from)=>next.forEach((target,to)=>counts.forEach((n,i)=>{
      target[Math.min(2,i+Number(from===to))]+=n;
    })));
    paths=next;
  }
  const sums=[0,0,0];
  paths.forEach((counts,last)=>counts.forEach((n,i)=>sums[Math.min(2,i+Number(last===0))]+=n));
  return sums.map(n=>n/k**5);
}

export function outcomeDistribution(id,state,metric){
  const {x,n,p,conditions:c}=state;
  const rate=x/100, bias=p/100;
  const make=(labels,weights,category)=>({rows:labels.map((label,i)=>[label,weights[i]]),category});
  const hits=({view})=>count(view);
  switch(id){
    case 20:{
      const before=binomial(n-1,rate);
      const k=c?.target??5;
      const early=before.slice(k).reduce((a,b)=>a+b,0), exact=before[k-1]*rate;
      return make(['Đủ '+k+' trước lượt '+n,'Đủ '+k+' đúng lượt '+n,'Chưa đủ '+k+' sau '+n+' lượt'],
        [early,exact,Math.max(0,1-early-exact)],result=>result.success?1:result.view.length<n?0:2);
    }
    case 21:{
      const p=rate*(c?c.second/100:rate);
      return metric===0?make(['Nhánh 1 thông','Nhánh 1 hỏng'],[p,1-p],({view})=>Number(!view[0].every(Boolean))):
        countBands('nhánh thông',binomial(3,p),({view})=>count(view.map(branch=>branch.every(Boolean))));
    }
    case 23:{
      const max=rate**3, near=3*rate**2*((c?.p9??20)/100);
      return make(['30 điểm · Có vàng','29 điểm · Có vàng','29 điểm · Thiếu vàng','28 điểm trở xuống'],
        [max,near*bias,near*(1-bias),1-max-near],({view,success})=>{
          const score=view.reduce((a,b)=>a+b,0);
          return score===30?0:score===29?(success?1:2):3;
        });
    }
    case 24:{
      const [evenGreen,oddGreen]=urnGreenRates(x,urnSpec(state));
      return make(['Chẵn · Bi xanh','Lẻ · Bi xanh','Chẵn · Bi nâu','Lẻ · Bi nâu'],
        [bias*evenGreen,(1-bias)*oddGreen,bias*(1-evenGreen),(1-bias)*(1-oddGreen)],
        ({view})=>2*Number(!view.green)+Number(view.die%2===1));
    }
    case 76:return countBands('bi xanh',hypergeometric(c?.total??30,x,2),hits);
    case 77:return countBands('mặt ngửa',binomial(4,rate),hits);
    case 80:
    case 91:return make(['Hai vị trí kề nhau','Hai vị trí cách nhau'],[2/(x-1),1-2/(x-1)],({success})=>Number(!success));
    case 81:return countBands('lượt ra bi đỏ',binomial(x,.25),hits,Math.min(3,x));
    case 82:return countBands('sách ở ngăn 1',binomial(x,.25),hits,Math.min(3,x));
    case 83:{
      const a=(c?.a??90)/100,b=(c?.b??70)/100;
      return make(['A · Loại I','A · Loại khác','B · Loại I','B · Loại khác'],
        [a*rate,(1-a)*rate,b*(1-rate),(1-b)*(1-rate)],({view,detail})=>2*Number(!detail.farm)+Number(!view[0]));
    }
    case 84:return countBands('lá Át',hypergeometric(52,4,x).slice(0,5),hits);
    case 85:return countBands('bóng hỏng',binomial(17,rate),hits,3);
    case 86:return countBands('bi chẵn',hypergeometric(9,4,x).slice(0,5),hits,Math.min(3,x));
    case 87:return make(['Cả hai cây có quả','Chỉ A có quả','Chỉ B có quả','Cả hai cây chưa có quả'],
      exclusive((c?.a??75)/100,rate),({view})=>2*Number(!view[0])+Number(!view[1]));
    case 88:return countBands('phiếu trúng',hypergeometric(20,x,3),hits);
    case 89:{
      const sensitivity=(c?.sensitivity??95)/100,falsePositive=(c?.falsePositive??4)/100;
      return make(['Lỗi thật · Máy báo','Thanh đạt · Máy báo nhầm','Lỗi thật · Máy bỏ sót','Thanh đạt · Máy không báo'],
        [sensitivity*rate,falsePositive*(1-rate),(1-sensitivity)*rate,(1-falsePositive)*(1-rate)],({view})=>2*Number(!view[1])+Number(!view[0]));
    }
    case 90:return make(['0 cạnh trùng màu','1 cạnh trùng màu','2 cạnh trùng màu trở lên'],
      coloring(x),({view})=>Math.min(2,count(view.map((v,i)=>v===view[(i+1)%6]))));
  }
}

// The numerator and denominator use the same categories as the replay and histogram.
export function experimentEvent(id,metric,description){
  const name=(label,numerator,denominator=null,condition='')=>({label,numerator,denominator,condition});
  if(id===24)return metric===0?
    name('Rút bi xanh khi biết xúc xắc ra chẵn.',[0],[0,2],'xúc xắc ra chẵn'):
    name('Xúc xắc ra chẵn khi biết đã rút bi xanh.',[0],[0,1],'rút được bi xanh');
  if(id===89)return name('Thanh bị lỗi khi biết máy đã báo lỗi.',[0],[0,1],'máy báo lỗi');
  if(id===23&&metric<2)return metric===0?name('Ba lần bắn đạt đúng 30 điểm.',[0]):name('Ba lần bắn đạt đúng 29 điểm.',[1,2]);
  if(id===21&&metric===0)return name('Cả hai linh kiện của nhánh 1 hoạt động.',[0]);
  return {label:description};
}

export function classifyTrial(event,result,category){
  const qualified=!event.denominator||event.denominator.includes(category);
  const success=qualified&&(event.numerator?event.numerator.includes(category):result.success);
  return {qualified,success};
}

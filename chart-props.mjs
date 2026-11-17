import {block, rod, edge, label, shell, ring, cream, glass, gold, ink, metal} from './expansion-kit.mjs';

const slate='#405a56', dark='#293c39', gray='#75827a';

function parcel(x,y,z,w=.47){
  return [
    {...block(x,y,z,w,.49,.31,'#a67c54'),finish:'paper'},
    {...block(x,y,z+.313,w*.85,.088,.012,'#e3c282'),finish:'paper'}
  ];
}

export function dispatchProps(orders,threshold){
  const status=orders>=threshold?'#9ad1a4':'#dbac70',x=-2.55,y=1.46,z=-.37;
  const van=[
    block(x,y,z+.14,1.82,.64,.22,slate),
    {...block(x-.21,y,z+.35,1.20,.68,.49,'#c9cbc0'),finish:'enamel'},
    {...block(x+.58,y,z+.33,.50,.65,.42,'#53877d'),finish:'enamel'},
    block(x+.58,y+.33,z+.52,.28,.018,.15,'#344e54')
  ];
  const batch=Math.min(9,Math.ceil(orders/5));
  return {blocks:[...van,block(0,1.5,z-.12,8.45,1.35,.12,gray),block(2.84,1.55,z+.06,2.36,.84,.12,dark),
    ...Array.from({length:batch},(_,i)=>parcel(2.05+(i%4)*.50,1.55,z+.18+Math.floor(i/4)*.323,.43))],
    rods:[-.61,.63].flatMap(d=>[-1,1].map(side=>rod([x+d,y+.24*side,z+.17],[x+d,y+.37*side,z+.17],.165,ink))),
    lamps:[{at:[.77,1.92,z+.24],r:.28,color:status}],surfaceMarks:[label(orders+' đơn',[2.84,2.10,z+.066],cream)]};
}

export function conveyorProps(amount,active){
  const bed=1.44,z=-.41;
  const parcels=Math.min(10,Math.ceil(amount));
  const blocks=[
    {...block(0,bed,z-.09,7.9,1.16,.14,slate),finish:'steel'},
    block(-2.38,bed,z+.07,.96,.88,.46,'#6e918a'),block(2.38,bed,z+.07,.96,.88,.46,'#768881'),
    ...Array.from({length:parcels},(_,i)=>parcel(-1.73+(i%7)*.56,bed,z+.13+Math.floor(i/7)*.318))
  ];
  const rods=Array.from({length:24},(_,i)=>{
    const x=-3.77+i*.327;return rod([x,bed-.41,z+.109],[x,bed+.42,z+.109],.045,metal);
  });
  const lamps=[-2.38,2.38].map((x,i)=>({at:[x,bed+.45,z+.42],r:.23,color:active===i?'#b9eac2':'#687b72'}));
  return {blocks,rods,lamps};
}

export function dataProps(gigabytes,cheaper){
  const blocks=[],edges=[],surfaceMarks=[];
  for(const [i,x] of [-2.13,2.13].entries()){
    const y=1.62,z=-.37,color=cheaper===i||cheaper===null?'#82bb92':gray;
    blocks.push({...block(x,y,z-.07,2.75,1.02,.12,slate),finish:'steel'},block(x,y,z+.045,2.36,.78,.33,dark),
      block(x,y+.405,z+.14,2.04,.026,.105,ink));
    if(gigabytes>0)blocks.push(block(x-1.02+gigabytes*.051,y+.429,z+.142,gigabytes*.102,.03,.10,i?gold:glass));
    edges.push(edge([x-.24,y-.29,z+.398],[x+.24,y-.29,z+.398],color,2));
    surfaceMarks.push(label(i?'B':'A',[x,y-.09,z+.41],cream));
  }
  return {blocks,edges,surfaceMarks};
}

export function powerProps(start,end,kw){
  const z=-.39,y=1.48,x=(end-6)*.52;
  return {blocks:[block(0,y,z-.08,7.40,1.07,.12,slate),block(0,y,z+.04,6.74,.59,.092,ink),
    {...block(x,y,z+.15,.69,.62,.44,'#7c958c'),finish:'steel'}],
    rods:[...Array.from({length:20},(_,i)=>{
      const dx=-3.25+i*.342;
      return rod([dx,y-.3,z+.16],[dx,y+.3,z+.16],.034,metal);
    })],
    edges:[edge([(start-6)*.52,y+.50,z+.096],[(end-6)*.52,y+.50,z+.096],gold,2)],
    shells:[shell([ring(.17,z+.60,x,y,20),ring(.135,z+.65,x,y,20)],kw>14?gold:glass,1,{finish:'enamel'})]};
}

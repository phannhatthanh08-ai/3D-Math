const clamp=(t,lo,hi)=>Math.max(lo,Math.min(hi,t));

export function bounceClock(index,q){
  const r=Math.sqrt(q);
  if(!index)return 0;
  return (1+r)*(-Math.expm1(index*Math.log(r)))/(1-r);
}

export function bounceFrame(clock,q,last){
  const r=Math.sqrt(q);
  let index=0;
  while(index<last&&clock>=bounceClock(index+1,q))index++;
  if(index===last)return index;
  const duration=(1+r)*r**index;
  return index+(duration>0?clamp((clock-bounceClock(index,q))/duration,0,1):0);
}

export function bounceHeight(frame,q){
  const index=Math.floor(frame), t=frame-index, contact=1/(1+Math.sqrt(q));
  const peak=q**index;
  if(t<=contact)return peak*Math.max(0,1-(t/contact)**2);
  const rising=(1-t)/(1-contact);
  return peak*q*Math.max(0,1-rising*rising);
}

export function tossHeight(t,amplitude){
  return 4*amplitude*t*(1-t);
}

// Yaw and pitch are confined to the die. The clearance is its rotated support height.
export function dieRoll(t,face,half){
  const sides={1:[0,0],2:[0,-Math.PI/2],3:[Math.PI/2,0],
    4:[-Math.PI/2,0],5:[0,Math.PI/2],6:[0,Math.PI]};
  const [finalX,finalY]=sides[face]??sides[1];
  const advance=1-(1-t)**2;
  const x=(finalX+4*Math.PI)*advance,y=(finalY+2*Math.PI)*advance;
  const sx=Math.sin(x),cx=Math.cos(x),sy=Math.sin(y),cy=Math.cos(y);
  const rotate=([u,v,w])=>[u*cy+(v*sx+w*cx)*sy,v*cx-w*sx,-u*sy+(v*sx+w*cx)*cy];
  const clearance=half*(Math.abs(sy)+Math.abs(sx*cy)+Math.abs(cx*cy));
  return {rotate,clearance};
}

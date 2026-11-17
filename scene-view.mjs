const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
export const zoomLimits=[.42,5];

export function fitView(bounds,width,height){
  if(!bounds||width<30||height<30)return null;
  const {left,right,top,bottom}=bounds;
  const spanX=right-left,spanY=bottom-top;
  if(!(spanX>0||spanY>0))return null;
  const zoom=clamp(Math.min(width*.82/Math.max(1,spanX),height*.77/Math.max(1,spanY)),...zoomLimits);
  return {zoom,pan:[-zoom*(left+right)/2,-zoom*(top+bottom)/2]};
}

export function zoomAt(view,amount,at){
  const zoom=clamp(view.zoom*amount,...zoomLimits);
  const ratio=zoom/view.zoom;
  const pan=view.pan.map((value,i)=>at[i]+(value-at[i])*ratio);
  return {zoom,pan};
}

export function advancePlayback(value,travel,control,direction,loop){
  const {min,max}=control;
  const span=max-min;
  if(span<=0)return {raw:min,direction,done:true};
  const next=value+direction*travel;
  if(!loop)return {raw:clamp(next,min,max),direction,done:next<=min||next>=max};
  // Unfold the back-and-forth motion onto a period of length 2*(max-min).
  const phase=(direction>0?value-min:2*span-(value-min))+travel;
  const position=phase%(2*span);
  return position<span?{raw:min+position,direction:1,done:false}:
    {raw:max-(position-span),direction:-1,done:false};
}

export function bindStageGestures(canvas,handle,callbacks){
  const pointers=new Map();
  let start,dragged=false;
  const centroid=(p,q)=>[(p.x+q.x)/2,(p.y+q.y)/2];
  const separation=(p,q)=>Math.hypot(p.x-q.x,p.y-q.y);
  const sample=event=>({x:event.clientX,y:event.clientY,type:event.pointerType});
  function begin(event){
    if(!callbacks.enabled()||event.button!==0||pointers.size>=2)return;
    if(event.currentTarget===handle){event.preventDefault();handle.focus({preventScroll:true});}
    const point=sample(event);
    callbacks.start();
    if(!pointers.size){
      dragged=false;
      start={point,control:callbacks.control(),mode:callbacks.mode()};
    }else dragged=true;
    pointers.set(event.pointerId,point);
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function move(event){
    const last=pointers.get(event.pointerId);
    if(!last)return;
    const point=sample(event);
    const dx=point.x-last.x,dy=point.y-last.y;
    if(pointers.size===2){
      const other=[...pointers.entries()].find(([id])=>id!==event.pointerId)[1];
      pointers.set(event.pointerId,point);
      const previous=separation(last,other);
      if(previous>6)callbacks.pinch(separation(point,other)/previous,centroid(last,other),centroid(point,other));
      return;
    }
    const first=!dragged;
    if(first&&Math.hypot(point.x-start.point.x,point.y-start.point.y)<4)return;
    dragged=true;
    pointers.set(event.pointerId,point);
    if(start.mode==='parameter')callbacks.slide(start.control,point.x-start.point.x);
    else if(start.mode==='pan')callbacks.pan(dx,dy);
    else callbacks.orbit(dx,dy,point.type==='touch');
  }
  function release(event){
    if(!pointers.delete(event.pointerId))return;
    if(pointers.size===1){
      const point=pointers.values().next().value;
      start={point,control:callbacks.control(),mode:callbacks.mode()};
    }
  }
  for(const element of [canvas,handle]){
    element.addEventListener('pointerdown',begin);
    element.addEventListener('pointermove',move);
    element.addEventListener('pointerup',release);
    element.addEventListener('pointercancel',release);
    element.addEventListener('lostpointercapture',release);
  }
  return {dragged:()=>dragged,reset:()=>{pointers.clear();dragged=false;}};
}

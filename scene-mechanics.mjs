const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>t*t*(3-2*t);

// Panels rotate rigidly about the four edges of the fixed base.
export function boxFold(width,depth,height,progress){
  const x=width/2,y=depth/2;
  const base=[[-x,-y,0],[x,-y,0],[x,y,0],[-x,y,0]];
  const rise=height*Math.sin(progress*Math.PI/2);
  const reach=height*Math.cos(progress*Math.PI/2);
  const faces=base.map((p,i)=>{
    const q=base[(i+1)%4];
    const [dx,dy]=[[0,-1],[1,0],[0,1],[-1,0]][i];
    const tip=([u,v])=>[u+dx*reach,v+dy*reach,rise];
    return [p,q,tip(q),tip(p)];
  });
  return {base,faces};
}

export function drawFoldingBox(api,width,depth,height,progress,transform=p=>p){
  const {add,line,loft}=api;
  const {base,faces}=boxFold(width,depth,height,progress);
  const floor=base.map(transform);
  const down=floor.map(([x,y,z])=>[x,y,z-.021]);
  loft(down,floor,'#9d764b');
  add(floor,'#b28b56','#e7c694',1);
  for(const [i,face] of faces.entries()){
    const panel=face.map(transform);
    const along=panel[1].map((x,k)=>x-panel[0][k]);
    const up=panel[3].map((x,k)=>x-panel[0][k]);
    const n=[along[1]*up[2]-along[2]*up[1],along[2]*up[0]-along[0]*up[2],along[0]*up[1]-along[1]*up[0]];
    const length=Math.hypot(...n);
    if(length>1e-9){
      const layer=panel.map(point=>point.map((x,k)=>x+n[k]/length*.022));
      loft(panel,layer,'#a37a4b');
      add(layer,i%2?'#c59e64':'#ddb67a','#71543e',.82);
    }else add(panel,'#c59e64');
    line(panel[0],panel[1],'#7c583c',1.25);
    line(panel[2],panel[3],'#f4dca5',1.2);
  }
  return transform(faces[0][2]);
}

export function drawClearanceTruck(api,width,height,center,halfLength,travel){
  const {add,box,tube,line}=api;
  if(width<.025||height<.025)return center;
  const tire=Math.min(width*.19,height*.23,halfLength*.22);
  const floor=tire*1.83, cargoEnd=center+halfLength,cabEnd=center-halfLength;
  const cabLength=halfLength*.61;
  const cargoStart=cabEnd+cabLength;
  const edge=width/2;
  box(0,center,floor*.79,width*.91,halfLength*1.96,tire*.36,'#505653');
  box(0,(cargoEnd+cargoStart)/2,floor,width,cargoEnd-cargoStart,height-floor,'#e3dfc8');
  box(0,cabEnd+cabLength/2,floor,width*.89,cabLength,(height-floor)*.72,'#d69c65');
  const nose=cabEnd-.007, cabTop=floor+(height-floor)*.72;
  box(0,nose+.006,floor*.768,width*.81,.061,tire*.29,'#b2b8ae');
  box(0,cargoEnd+.014,floor+.08*tire,width*.71,.047,tire*.31,'#838d86');
  const tail=height-floor;
  for(const side of [-1,1]){
    const x=side*edge*.46;
    line([x,cargoEnd+.007,floor+tail*.12],[x,cargoEnd+.007,floor+tail*.92],'#9da39a',1.1);
  }
  add([[-edge*.78,nose,cabTop*.95],[edge*.78,nose,cabTop*.95],
    [edge*.74,nose,cabTop*.72],[-edge*.74,nose,cabTop*.72]],'#53757d','#adaf9e',.7);
  for(const side of [-1,1]){
    const x=side*width*.414;
    for(const y of [cabEnd+cabLength*.54,center+halfLength*.56]){
      tube([x-side*.09*width,y,tire],[x+side*.061*width,y,tire],tire,'#343937');
      const mount=x+side*.061*width;
      tube([mount,y,tire],[mount+side*.008,y,tire],tire*.53,'#b7b4a5');
      const angle=-travel/tire;
      line([mount+side*.011,y,tire],[mount+side*.011,y+tire*.46*Math.cos(angle),tire+tire*.46*Math.sin(angle)],'#424f50',1.35);
    }
    const xBody=side*edge*1.001;
    for(let i=1;i<5;i++){
      const z=lerp(floor,height,i/5);
      line([xBody,cargoStart,z],[xBody,cargoEnd,z],'#a99d7e',.58);
    }
    const xLamp=side*edge*.67;
    line([xLamp-edge*.12,nose,floor*1.22],[xLamp+edge*.12,nose,floor*1.22],'#fff0bc',1.9);
  }
  return cargoStart;
}

export function liftThroughOpening(from,to,rim,progress){
  const rise=Math.min(1,progress/.24);
  const cross=Math.max(0,Math.min(1,(progress-.24)/.52));
  const fall=Math.max(0,(progress-.76)/.24);
  const position=from.map((x,i)=>lerp(x,to[i],smooth(cross)));
  position[2]=rise<1?lerp(from[2],rim,smooth(rise)):lerp(rim,to[2],smooth(Math.min(1,fall)));
  return position;
}

export function tankVolume(id,h,dimensions){
  if(id===5){const {height=4,radius=2}=dimensions;return Math.PI*(radius/height)**2*h**3/3;}
  if(id===34){
    const {bottom=1,mouth=3,height=4}=dimensions,k=(mouth-bottom)/height;
    return Math.PI*h*(bottom*bottom+bottom*k*h+k*k*h*h/3);
  }
  const {length=10,width=4,rise=2}=dimensions;
  return width*length*h*h/(2*rise);
}

export function tankLevel(id,volume,max,dimensions){
  if(volume<=0)return 0;
  if(volume>=tankVolume(id,max,dimensions))return max;
  let low=0,high=max;
  for(let k=0;k<38;k++){
    const mid=(low+high)/2;
    if(tankVolume(id,mid,dimensions)<volume)low=mid;
    else high=mid;
  }
  return (low+high)/2;
}

export function urnBallStates(layouts,receiver,transferred,drawing,progress){
  const bins=layouts.map(([green,brown])=>Array.from({length:green+brown},(_,slot)=>({slot,green:slot<green})));
  let moving;
  for(let i=0;i<transferred.length;i++){
    const green=transferred[i];
    const ball=bins[0].splice(bins[0].findLastIndex(b=>b.green===green),1)[0];
    const destination={green,slot:bins[receiver].length};
    if(i===transferred.length-1&&progress<1&&drawing===undefined){
      moving={ball,from:0,destination,to:receiver};
    }else bins[receiver].push(destination);
  }
  if(drawing!==undefined){
    const ball=bins[receiver].splice(bins[receiver].findLastIndex(b=>b.green===drawing),1)[0];
    moving={ball,from:receiver,to:null};
  }
  return {bins,moving};
}

export function clipSolidFace(points,distance){
  if(!distance)return points;
  const clipped=[];
  for(let i=0;i<points.length;i++){
    const from=points[i],to=points[(i+1)%points.length];
    const a=distance(from),b=distance(to);
    if(a<=0)clipped.push(from);
    if((a<0&&b>0)||(a>0&&b<0)){
      const t=a/(a-b);
      clipped.push(from.map((n,k)=>lerp(n,to[k],t)));
    }
  }
  return clipped;
}

export function swingAngle(amplitude,phase){
  const a=amplitude*Math.PI/180;
  const t=phase*2*Math.PI;
  // First nonlinear correction keeps the endpoints and preserves left-right symmetry.
  return amplitude*(Math.cos(t)+(a*a/192)*(Math.cos(t)-Math.cos(3*t)));
}

const indoor = new Set([3,10,19,24,26,27,29,31,41,44,45,46,47,49,50,52,57,58,59,62,64,70,72,73,76,77,78,81,82,83,84,85,86,88,89,90,91]);
const industry = new Set([1,5,9,12,34,36,37,38,53,60,67]);
const range = n => Array.from({length:n},(_,i)=>i);

function gradient(ctx, x, y, stops) {
  const paint=ctx.createLinearGradient(0,0,x,y);
  for(const [offset,color] of stops)paint.addColorStop(offset,color);
  return paint;
}

function ridge(ctx,w,y,amplitude,color,seed) {
  ctx.beginPath();
  ctx.moveTo(0,y);
  for(const i of range(65)){
    const t=i/64;
    const height=.55+.26*Math.sin(t*19+seed)+.16*Math.sin(t*43+seed)+.06*Math.sin(t*113);
    ctx.lineTo(t*w,y-height*amplitude);
  }
  ctx.lineTo(w,y);ctx.closePath();
  ctx.fillStyle=color;ctx.fill();
}

function trees(ctx,w,y,h,seed) {
  ctx.beginPath();ctx.moveTo(0,y);
  for(const i of range(132)){
    const t=i/131;
    const variation=.65+.3*Math.sin(t*25+seed);
    const height=(.27+.28*Math.abs(Math.sin(i*8.929+seed))+.37*Math.abs(Math.sin(i*3.99)))*h*variation;
    ctx.lineTo(t*w,y-height);
  }
  ctx.lineTo(w,y);ctx.closePath();ctx.fillStyle='#2d493d';ctx.fill();
}

export function paintEnvironment(ctx,w,h,vertical,id,panY,yaw=0) {
  const tabletop=indoor.has(id);
  const industrial=industry.has(id);
  const horizon=Math.max(0,Math.min(h*.59,h*(.52-vertical*.56)+panY*.12));
  const palette=tabletop?['#182822','#3e4b39','#584132','#211d1a']:
    industrial?['#34566e','#adc1bb','#60635a','#333f38']:
    ['#426784','#c0cfc1','#59735a','#283c30'];
  ctx.fillStyle=gradient(ctx,0,h,[[0,palette[0]],[Math.max(.10,horizon/h),palette[1]],[1,palette[3]]]);
  ctx.fillRect(0,0,w,h);
  const sunlight=ctx.createRadialGradient(w*.25,h*.12,0,w*.25,h*.12,w*.74);
  sunlight.addColorStop(0,tabletop?'#ffe0a855':'#f7e5b849');
  sunlight.addColorStop(1,'#fff0d000');
  ctx.fillStyle=sunlight;ctx.fillRect(0,0,w,h);
  if(!tabletop&&horizon>0){
    const parallax=Math.sin(yaw)*.7;
    for(const [x,y,r] of [[.23,.24,.22],[.73,.16,.24],[.95,.41,.17]]){
      const px=w*(x+parallax*.03),py=horizon*y;
      ctx.save();ctx.translate(px,py);ctx.scale(1,.24);
      const cloud=ctx.createRadialGradient(0,0,0,0,0,Math.max(1,w*r));
      cloud.addColorStop(0,'#f4ede464');cloud.addColorStop(1,'#f4ede400');
      ctx.fillStyle=cloud;ctx.beginPath();ctx.arc(0,0,w*r,0,2*Math.PI);ctx.fill();ctx.restore();
    }
    ridge(ctx,w,horizon,h*.112,'#849e9a',1.4+parallax);
    ridge(ctx,w,horizon+h*.015,h*.079,'#587d72',3.3+parallax);
    if(!industrial)trees(ctx,w,horizon+h*.028,h*.065,5.1+parallax);
  }
  const floorY=tabletop?horizon*.94:Math.max(0,horizon+h*.026*(1-vertical**8));
  ctx.fillStyle=gradient(ctx,w*.22,h,[[0,palette[2]],[floorY/h,palette[2]],[1,palette[3]]]);
  ctx.fillRect(0,floorY,w,h-floorY);
  if(tabletop){
    ctx.strokeStyle='#f7c89514';ctx.lineWidth=1;
    for(const i of range(12)){
      const y=floorY+(h-floorY)*(i/12)**1.56;
      ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y+h*.033);ctx.stroke();
    }
  }
  return floorY;
}

export function groundGridColor(id,major) {
  if(indoor.has(id))return major?'#d3aa7825':'#d3aa7811';
  return major?'#bad4bb40':'#acbea924';
}

export function paintCastShadows(ctx, shapes, width, height, floorY) {
  if(!shapes.length)return;
  ctx.save();
  ctx.beginPath();ctx.rect(0,floorY,width,height-floorY);ctx.clip();
  ctx.beginPath();
  for(const {polygon,ellipse} of shapes){
    if(ellipse){
      const [x,y,rx,ry]=ellipse;
      ctx.moveTo(x+rx,y);ctx.ellipse(x,y,rx,ry,0,0,2*Math.PI);ctx.closePath();
      continue;
    }
    // Keep all silhouettes in the same winding so overlap never cuts holes in the shadow.
    let signedArea=0;
    for(let i=0;i<polygon.length;i++){
      const [x,y]=polygon[i], [nextX,nextY]=polygon[(i+1)%polygon.length];
      signedArea+=x*nextY-y*nextX;
    }
    if(Math.abs(signedArea)<1)continue;
    const ordered=signedArea>0?polygon:[...polygon].reverse();
    ctx.moveTo(...ordered[0]);
    for(let i=1;i<ordered.length;i++)ctx.lineTo(...ordered[i]);
    ctx.closePath();
  }
  ctx.fillStyle='#09141342';
  ctx.shadowColor='#0a11134d';
  ctx.shadowBlur=4;
  ctx.fill();
  ctx.restore();
}

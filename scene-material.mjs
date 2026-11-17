const hex = /^#[0-9a-f]{6}$/i;

export function shade(color, multiplier, highlight=0) {
  if (!hex.test(color)) return color;
  return '#'+[1,3,5].map(start=>{
    const base=parseInt(color.slice(start,start+2),16);
    const value=base*multiplier+(255-base)*highlight;
    return Math.max(0,Math.min(255,Math.round(value))).toString(16).padStart(2,'0');
  }).join('');
}

export function surfaceColor(points, color, glass=false, view=null) {
  if (!hex.test(color)||points.length<3) return color;
  const [p,q,r]=points;
  const ab=q.map((v,i)=>v-p[i]), ac=r.map((v,i)=>v-p[i]);
  const normal=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]];
  const size=Math.hypot(...normal);
  if(size<1e-9)return color;
  const [x,y,z]=normal.map(v=>v/size);
  const light=-.42*x-.49*y+.76*z;
  const diffuse=Math.max(0,glass?Math.abs(light):light);
  const bounce=Math.max(0,.59*x+.79*y+.14*z);
  const rim=Math.max(0,.58*x-.19*y+.79*z);
  const specular=view?Math.max(0,x*view[0]+y*view[1]+z*view[2])**(glass?10:20):0;
  const facing=view&&glass?Math.max(0,1-Math.abs(x*view[3]+y*view[4]+z*view[5]))**3:0;
  return shade(color,.59+.42*diffuse+.12*bounce,.10*diffuse**3+.12*rim**8+specular*.22+facing*.17);
}

export function beadPaint(ctx,x,y,r,color) {
  if (r<3) return color;
  const sheen=ctx.createRadialGradient(x-r*.31,y-r*.34,0,x,y,r*1.16);
  sheen.addColorStop(0,shade(color,1,.73));
  sheen.addColorStop(.21,shade(color,1,.36));
  sheen.addColorStop(.62,shade(color,1,.05));
  sheen.addColorStop(.84,shade(color,.76));
  sheen.addColorStop(1,shade(color,.53));
  return sheen;
}

// Rings orthogonal to a 3D segment, with a stable basis even for vertical rods.
export function tubeRings(from,to,radius,sides=12) {
  const step=to.map((value,i)=>value-from[i]);
  const length=Math.hypot(...step);
  if(length<1e-9||radius<=0)return null;
  const unit=step.map(v=>v/length);
  const transverse=Math.abs(unit[2])<.85?[-unit[1],unit[0],0]:[0,-unit[2],unit[1]];
  const norm=Math.hypot(...transverse);
  const u=transverse.map(v=>v/norm);
  const v=[unit[1]*u[2]-unit[2]*u[1],unit[2]*u[0]-unit[0]*u[2],unit[0]*u[1]-unit[1]*u[0]];
  return [from,to].map(end=>Array.from({length:sides},(_,i)=>{
    const angle=2*Math.PI*i/sides;
    return end.map((x,k)=>x+radius*(u[k]*Math.cos(angle)+v[k]*Math.sin(angle)));
  }));
}

export function panelPaint(ctx, points, color) {
  if(!hex.test(color)||points.length<3)return color;
  let first=points[0],last=first,left=first[0],right=left;
  for(const point of points){
    if(point[0]+point[1]<first[0]+first[1])first=point;
    if(point[0]+point[1]>last[0]+last[1])last=point;
    left=Math.min(left,point[0]);right=Math.max(right,point[0]);
  }
  if(right-left<21||Math.hypot(last[0]-first[0],last[1]-first[1])<24)return color;
  const finish=ctx.createLinearGradient(first[0],first[1],last[0],last[1]);
  finish.addColorStop(0,shade(color,1,.08));
  finish.addColorStop(.44,color);
  finish.addColorStop(1,shade(color,.81));
  return finish;
}

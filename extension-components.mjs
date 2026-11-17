const TAU=2*Math.PI;
const lerp=(a,b,t)=>a.map((x,i)=>x+(b[i]-x)*t);
const circle=(center,r,n=24)=>Array.from({length:n},(_,i)=>[
  center[0]+r*Math.cos(TAU*i/n),center[1]+r*Math.sin(TAU*i/n),center[2]
]);
const frame=(x,y,z,w,d)=>[[x-w/2,y-d/2,z],[x+w/2,y-d/2,z],[x+w/2,y+d/2,z],[x-w/2,y+d/2,z]];

export function drawProfileHardware(id,solid,horizontal,g){
  const {face,join,segment,rod,makeBox,size}=g;
  const length=horizontal?solid.length:solid.height;
  const shape=t=>Math.max(0,solid.radius(t*length));
  const rim=(r,t,n=24)=>circle([0,0,t*length],r,n).map(([x,y,z])=>horizontal?[z,x,y+shape(0)]:[x,y,z]);
  const small=.045/size, clamp=Math.min(small,length*.08);
  const ringBand=(t,w,paint)=>{
    const u=Math.min(1,t+w);
    join(rim(shape(t)+clamp,t),rim(shape(u)+clamp,u),paint,.88);
  };
  if([26,36,37,38,47,48,50,67].includes(id)){
    const shell=id===50?'#b69a72':id===47||id===48?'#a5c6bd':'#8e9c9b';
    for(const t of id===50?[.03,.20,.78,.965]:[.03,.965])ringBand(t,.027,shell);
    if([26,38,67].includes(id)){
      for(const t of [0,1]){
        const cross=rim(shape(t),t,36);
        face(cross,t?'#b6c3bc':'#879999',null,id===26?.88:.46);
        if(horizontal){
          const z=shape(0);
          rod([length*t,0,z],[length*t+(t?1:-1)*Math.min(length*.13,small*5),0,z],.055,'#949e97');
        }
      }
    }
    if(id===36||id===37){
      const r=shape(.05);
      if(id===36){
        const x=shape(1)+small*1.8;
        for(const y of [-small*2,small*2])rod([x,y,0],[x,y,length],.027,'#b8c1b7');
        for(let i=0;i<11;i++){
          const z=length*(i+.5)/11;
          rod([x,-small*2,z],[x,small*2,z],.018,'#b8c1b7');
        }
      }
      for(const a of [0,TAU/3,TAU*2/3]){
        const x=(r+clamp)*Math.cos(a),y=(r+clamp)*Math.sin(a);
        makeBox([x,y,-clamp],clamp*3,clamp*3,clamp,'#a9a18b');
      }
    }
    if(id===50){
      for(let j=0;j<20;j++){
        const a=j*TAU/20;
        const at=t=>[(shape(t)+clamp*.2)*Math.cos(a),(shape(t)+clamp*.2)*Math.sin(a),length*t];
        for(let i=0;i<9;i++)segment(at(i/9),at((i+1)/9),'#573d36ad',.72);
      }
    }
  }
  if(id===34){
    const r=shape(.95);
    for(let i=0;i<3;i++){
      const a=i*TAU/3, x=Math.cos(a),y=Math.sin(a);
      rod([x*(r+clamp),y*(r+clamp),-clamp],[x*r,y*r,length*.95],.038,'#95a9a3');
      makeBox([x*(r+clamp),y*(r+clamp),-clamp],clamp*3,clamp*3,clamp,'#a7a089');
    }
  }
  if(id===41){
    ringBand(.975,.025,'#bfd2c9');
  }
  if(id===29){
    const end=(center,r)=>rim(r,center,32);
    for(const t of [0,1])for(const fraction of [.58,.72,.85,.96]){
      const ring=end(t,shape(t)*fraction);
      ring.forEach((p,i)=>segment(p,ring[(i+1)%ring.length],'#d0a477a8',.63));
    }
  }
  if(id===44){
    ringBand(.475,.017,'#7f592c');ringBand(.50,.018,'#ecc783');
    for(const t of [.14,.27,.72,.85]){
      const lip=rim(shape(t)+clamp*.20,t,32);
      lip.forEach((p,i)=>segment(p,lip[(i+1)%lip.length],'#e3c68a99',.65));
    }
    makeBox([shape(.5)*.985,0,length*.49],clamp*3,clamp*3,clamp*5,'#ac7450');
  }
  if(id===45||id===46){
    ringBand(.025,.036,id===45?'#7f5c42':'#b6d6d0');
    ringBand(.91,.027,id===45?'#b4845b':'#d1e3d8');
    if(id===46){
      const r=Math.min(shape(1)*.78,length*.38);
      for(let i=0;i<12;i++){
        const sphere=t=>rim(r*Math.sin(Math.PI*t),1+(r/length)*(1-Math.cos(Math.PI*t)));
        join(sphere(i/12),sphere((i+1)/12),'#b5d6d3',.35);
      }
    }
  }
  if(id===47||id===48){
    for(const t of [.066,.93])ringBand(t,.022,id===47?'#b2d1c4':'#65927f');
    if(id===47){
      const t=.86,r=shape(t)+clamp*.28;
      for(let i=0;i<4;i++){
        const a=Math.PI*.30+i*.32,p=[r*Math.cos(a),r*Math.sin(a),length*t];
        rod(p,[p[0],p[1],length*(t+.032)],.019,'#d6e4c8');
      }
    }else for(let i=0;i<6;i++){
      const t=.26+i*.065,r=shape(t)+clamp*.40;
      segment([.13,r,length*t],[-.13,r,length*t],'#bdd5ad',.78);
    }
  }
  if(id===49){
    const seam=Array.from({length:21},(_,i)=>{
      const t=i/20,r=shape(t)+clamp*.36;
      return [r*.43,r*Math.sqrt(1-.43**2),t*length];
    });
    seam.slice(1).forEach((p,i)=>segment(seam[i],p,'#e8ac9690',.68));
    for(let i=0;i<16;i++){
      const a=i*TAU/16,r=shape(0)*1.018;
      const p=[r*Math.cos(a),r*Math.sin(a),0];
      rod(p,[p[0]*.97,p[1]*.97,clamp*1.6],.043,'#e2e1cb');
    }
  }
  if(id===59){
    const r=shape(.08);
    join(rim(r*.94,.001),rim(r*.85,.045),'#768d83',.75);
  }
}

export function drawArchStructure(id,arch,g){
  const {face,rod,segment,makeBox,size}=g;
  const d=arch.depth/2,half=arch.width/2;
  const skin=.061/size;
  const top=(u,y)=>[u*half,y,arch.profile(u)];
  const lower=(u,y)=>[u*half,y,Math.max(0,arch.profile(u)-skin)];
  if([28,39,75].includes(id)){
    for(let i=0;i<20;i++){
      const a=i/10-1,b=(i+1)/10-1;
      for(const y of [-d,d]){
        face([top(a,y),top(b,y),lower(b,y),lower(a,y)],i%2?'#9d9782':'#a9a18c','#d4c7a2',.96);
      }
    }
    if(id===75){
      const thickness=.23/size;
      for(const x of [-half,half])makeBox([x,0,-skin*2],thickness*2,2*d+.32/size,skin*2,'#a0947c');
      for(const y of [-d,d]){
        const bottom=p=>[p[0],p[1],Math.max(0,p[2]-thickness)];
        for(let i=0;i<33;i++){
          const a=i/16.5-1,b=(i+1)/16.5-1;
          face([lower(a,y),lower(b,y),bottom(top(b,y)),bottom(top(a,y))],
            i%2?'#a09783':'#b1a48b','#6d746f',.95);
          segment(top(a,y),top(b,y),'#f0dcb1',1.25);
        }
      }
      for(const side of [-1,1])for(const u of [-.84,-.62,-.4,-.18,.04,.26,.48,.70,.90]){
        rod(top(u,side*(d-.07/size)),top(u+.028,side*(d+.037/size)),.025,'#c6b395');
      }
      const x=arch.cut*half,y=d+.1/size;
      segment([x,y,0],[x,y,arch.profile(arch.cut)],'#f4cb81',2.25);
      return;
    }
    if(id===39){
      const edge=top(1,0);
      for(const y of [-d,d])rod([edge[0],y,0],[edge[0],y,edge[2]],.044,'#627774');
    }else for(const x of [-half,half])makeBox([x,0,-skin],skin*4,2*d,skin,'#b3a38a');
    return;
  }
  for(const y of [-d,-d/2,0,d/2,d]){
    for(let i=0;i<22;i++){
      const a=i/11-1,b=(i+1)/11-1;
      segment(lower(a,y),lower(b,y),id===42?'#8f7253':'#d9d5bc',1.75);
    }
    for(const side of [-1,1])makeBox([side*half,y,-skin*.6],skin*2.5,skin*2.1,skin*.6,'#766451');
  }
  if(id===43){
    for(let i=0;i<=36;i++){
      const a=i/18-1;
      const p=top(a,d),q=top(a,-d);
      if(i%9===0)rod(p,q,.027,'#b5a783');
    }
    for(const y of [-d,d])for(let i=0;i<24;i++){
      const a=i/12-1,b=(i+1)/12-1;
      segment(top(a,y),top(b,y),'#ebc67d',1.4);
    }
  }
  if(id===40||id===43){
    for(const side of [-1,1])for(const y of [-d,d]){
      rod(top(side*.73,y),[side*half*1.17,y*1.12,0],.018,'#e4d2ac');
    }
  }
}

export function drawObjectAttachments(id,model,g){
  const {face,join,rod,segment,makeBox,marker,size}=g;
  const {blocks=[],edges=[],dots=[],lofts=[]}=model;
  const unit=1/size;
  if(id===25||id===54||id===53){
    const b=blocks[0];
    const bottom=frame(b.x,b.y,b.z,b.w,b.d);
    const top=frame(b.x,b.y,b.z+b.h,b.w,b.d);
    for(let i=0;i<4;i++)rod(bottom[i],top[i],.031,id===25?'#82a9a7':'#657b81');
    if(id===25&&b.h>0){
      const w=b.w*.19,d=b.d*.13;
      makeBox([b.x-b.w*.29,b.y+b.d*.21,b.z],w,d,Math.min(b.h*.7,.4*unit),'#526e65');
      for(let i=0;i<3;i++){
        const p=[b.x+b.w*(.16+i*.12),b.y-b.d*.16,b.z+b.h*(.26+i*.13)],r=Math.min(.16*unit,b.w*.08,b.h*.17);
        if(r<=0)continue;
        face([[p[0]-r,p[1],p[2]],[p[0]+r*.83,p[1],p[2]+.51*r],[p[0]+r*1.16,p[1],p[2]],
          [p[0]+r*.83,p[1],p[2]-.51*r]],'#e3ab64');
        face([[p[0]-r*.62,p[1],p[2]],[p[0]-1.6*r,p[1],p[2]+.53*r],[p[0]-1.6*r,p[1],p[2]-.53*r]],'#bc7952');
      }
    }else if(id===54){
      for(let i=1;i<7;i++){
        const z=b.z+b.h*i/7;
        const floor=frame(b.x,b.y,z,b.w,b.d);
        for(let j=0;j<4;j++)segment(floor[j],floor[(j+1)%4],'#e0d6c5',1.18);
        for(const side of [-1,1]){
          const y=b.y+side*b.d/2;
          for(let j=1;j<6;j++){
            const x=b.x+b.w*(j/6-.5);
            segment([x,y,z],[x,y,z+b.h/7],'#9cb2b291',.72);
          }
        }
      }
    }else if(id===53){
      const r=Math.min(b.w,b.d)*.21;
      join(circle([b.x,b.y,b.z+b.h],r),circle([b.x,b.y,b.z+b.h+.09*unit],r),'#9eab9f');
      rod([b.x+b.w*.51,b.y,b.z+b.h*.21],[b.x+b.w*.69,b.y,b.z+b.h*.21],.045,'#a1ac9e');
    }
  }
  if(id===27){
    const p=dots[0],r=.17*unit;
    join(circle(p,r),circle([p[0],p[1],p[2]+.12*unit],r*.62),'#c2ad78');
    face(circle([p[0],p[1],p[2]-.006*unit],r*.87),'#edd9a5');
  }
  if(id===30){
    for(const rail of model.rods.slice(0,2)){
      const p=rail.from;
      makeBox([p[0],p[1],p[2]-.035*unit],.15*unit,.14*unit,.07*unit,'#4e5149');
    }
  }
  if(id===32){
    const ends=edges.slice(0,3).map(e=>e.from);
    const first=ends[0],last=ends.at(-1);
    if(first[0]!==last[0])face([first,last,[last[0],last[1],.49*unit],[first[0],first[1],.49*unit]],'#ada289','#dec5a1',.92);
  }
  if(id===52)for(const p of dots.slice(1)){
    makeBox([p[0],p[1],p[2]],.18*unit,.16*unit,.055*unit,'#b2a38a');
  }
  if([57,60,71].includes(id)){
    const joints=edges.flatMap(e=>[e.from,e.to]);
    for(const p of joints){
      if(p[2]===0)makeBox([p[0],p[1],0],.23*unit,.22*unit,.052*unit,'#6e7773');
      else marker(p,.064,'#b8b098');
    }
    if(id===57){
      const p=edges[0].to;
      rod([p[0],p[1]-.16*unit,p[2]],[p[0],p[1]+.16*unit,p[2]],.042,'#59645f');
    }
  }
  if(id===58){
    const p=model.panels[0].points;
    const top=p.map(([x,y,z])=>[x,y,z+.078*unit]);
    join(p,top,'#7caead',.41,true);
    for(let i=0;i<p.length;i++)rod(top[i],top[(i+1)%p.length],.024,'#678284');
  }
  if(id===61){
    const {at,r}=model.balls[0];
    for(const angle of [0,TAU/4]){
      const poles=Array.from({length:36},(_,i)=>{
        const a=i*TAU/36;
        return [at[0]+r*Math.cos(a)*Math.cos(angle),at[1]+r*Math.cos(a)*Math.sin(angle),at[2]+r*Math.sin(a)];
      });
      poles.forEach((p,i)=>segment(p,poles[(i+1)%poles.length],'#a6cdca',1));
    }
    rod(at,edges[0].to,.042,'#d1bc86');
  }
  if(id===62){
    const p=model.panels[0].points;
    const rear=p.map(([x,y,z])=>[x,y-.12*unit,z]);
    join(p,rear,'#96978b',.88);
    const end=edges[0].to;
    for(let i=1;i<=12;i++){
      const p=lerp(edges[0].from,end,i/13);
      marker(p,.043,'#c5b092');
    }
  }
  if(id===63){
    const p=model.panels[0].points;
    const rear=p.map(([x,y,z])=>[x,y+Math.max(.35*unit,Math.abs(p[0][0])*.5),z]);
    join(p,rear,'#b4a275',.61,true);
    for(let i=0;i<3;i++)rod(rear[i],rear[(i+1)%3],.029,'#cab892');
  }
  if(id===66){
    const [pivot,seat]=[edges[0].from,edges[0].to];
    for(const y of [-.40,.40]){
      rod([pivot[0],y,pivot[2]],[seat[0],y,seat[2]],.027,'#a99a84');
      for(const x of [-.34,.34]){
        const p=[seat[0]+x,y,seat[2]];
        rod(p,[p[0],y,seat[2]+.26*unit],.022,'#80634b');
      }
    }
    rod([0,-.56,pivot[2]],[0,.56,pivot[2]],.065,'#a98d65');
  }
  if([64,65,68,69,70,74].includes(id))for(const f of lofts){
    if(id===64){
      for(let j=0;j<f.bottom.length;j++){
        const next=(j+1)%f.bottom.length;
        for(let k=0;k<7;k++){
          const t=k/7;
          rod(lerp(f.bottom[j],f.bottom[next],t),lerp(f.top[j],f.top[next],t),.014,'#c1a078');
        }
      }
    }else if(id===68){
      for(let i=0;i<4;i++){
        const t=(i+.1)/4;
        const layer=f.bottom.map((p,j)=>lerp(p,f.top[j],t));
        layer.forEach((p,j)=>segment(p,layer[(j+1)%4],'#c9b390',1.35));
      }
    }else{
      for(let j=0;j<f.bottom.length;j++){
        rod(f.bottom[j],f.top[j],.029,id===70?'#b48556':'#cdb697');
      }
      if(id===65||id===69){
        for(const j of [0,1])for(let i=1;i<7;i++){
          const front=lerp(f.bottom[j],f.bottom[2],i/7),back=lerp(f.top[j],f.top[2],i/7);
          segment(front,back,id===69?'#d28c6f':'#dcc89e',.92);
        }
      }
    }
  }
}

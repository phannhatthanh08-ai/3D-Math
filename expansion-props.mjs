import {ring,rod,panel,shell,rect,sample,add,sub,mul,metal,cream,ink,red} from './expansion-kit.mjs';
import {dieRoll,tossHeight} from './scene-motion.mjs';
import {bevelBox} from './studio-finish.mjs';

const tau=Math.PI*2;
const dark='#182628';
const steel='#afbec0';
const bolt=(at,r=.035,h=.035)=>shell([ring(r,at[2],at[0],at[1],6),ring(r,at[2]+h,at[0],at[1],6)],steel,1,{finish:'steel'});
const eased=t=>t*t*(3-2*t);

export function spurGear(n,c,phase,color){
  const pitch=tau/n,r=n*.105,base=r*Math.cos(Math.PI/9),tip=r+.126,root=r-.16;
  const involute=rr=>{
    const u=Math.acos(Math.min(1,base/rr));
    return Math.tan(u)-u;
  };
  const half=Math.PI/(2*n);
  const a=rr=>half+involute(r)-involute(rr);
  const low=Math.max(root,base);
  const flank=[low,Math.max(low,(low+r)/2),r,(r+tip)/2,tip]
    .filter((v,i,arr)=>i===0||v>arr[i-1]+1e-8);
  const profile=[
    [-pitch/2,root],[-a(low),root],...flank.map(rr=>[-a(rr),rr]),
    ...[0,a(tip)].map(angle=>[angle,tip]),
    ...flank.slice(0,-1).reverse().map(rr=>[a(rr),rr]),[a(low),root],[pitch*.38,root]
  ];
  const polar=[];
  for(let i=0;i<n;i++)for(const [angle,radius] of profile)polar.push([phase+i*pitch+angle,radius]);
  const level=(z,k=0)=>polar.map(([a,r])=>[c+(r-k)*Math.cos(a),(r-k)*Math.sin(a),z]);
  const shells=[
    shell([level(.38,.015),level(.40),level(.63),level(.654,.015)],metal,1,{finish:'steel',closed:false}),
    shell([ring(r*.65,.651,c),ring(r*.65,.676,c)],color,1,{finish:'enamel'}),
    shell([ring(r*.285,.682,c),ring(r*.285,.795,c)],steel,1,{finish:'steel'}),
    shell([ring(.17,.794,c),ring(.15,.915,c)],dark,1,{finish:'iron'})
  ];
  const outer=level(.654,.015);
  const inner=polar.map(([a])=>[c+r*.65*Math.cos(a),r*.65*Math.sin(a),.654]);
  const panels=outer.map((p,i)=>{
    const j=(i+1)%outer.length;
    return panel([inner[i],p,outer[j],inner[j]],metal,1,{finish:'steel',outline:false});
  });
  const rods=[];
  for(let i=0;i<6;i++){
    const a=phase+i*tau/6;
    const pos=s=>[c+s*Math.cos(a),s*Math.sin(a)];
    const [x,y]=pos(r*.39);
    shells.push(bolt([x,y,.68],Math.min(.067,r*.045)));
    rods.push(rod([...pos(r*.48),.682],[...pos(r*.62),.682],.018,'#ccd3c8'));
  }
  return {shells,panels,rods};
}

const pips={1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[-1,1],[1,-1],[1,1]],5:[[-1,-1],[-1,1],[0,0],[1,-1],[1,1]],6:[[-1,-1],[-1,0],[-1,1],[1,-1],[1,0],[1,1]]};
export function physicalDie(phase,face=1){
  const half=.455;
  const {rotate,clearance}=dieRoll(phase,face,half);
  const at=[-.52+1.04*eased(phase),-1.05,.024+clearance+tossHeight(phase,.64)];
  const transform=p=>add(rotate(p),at);
  const die=bevelBox(0,0,-half,half*2,half*2,half*2).map(ring=>ring.map(transform));
  const sides=[
    [1,(u,v)=>[u,v,half+.003]], [6,(u,v)=>[u,-v,-half-.003]],
    [2,(u,v)=>[half+.003,u,v]], [5,(u,v)=>[-half-.003,-u,v]],
    [3,(u,v)=>[v,half+.003,u]], [4,(u,v)=>[v,-half-.003,-u]]
  ];
  const panels=sides.flatMap(([value,map])=>pips[value].map(([u,v])=>{
    const points=ring(value===1?.083:.050,0,u*.213,v*.213,12).map(([a,b])=>transform(map(a,b)));
    return panel(points,'#172629',1,{outline:false});
  }));
  return {shells:[shell(die,'#ece2c6',1,{finish:'enamel'})],panels,at};
}

export function hingedDoor(cx,progress,color){
  const side=cx-.69,angle=eased(progress)*1.53,ca=Math.cos(angle),sa=Math.sin(angle);
  const at=(u,v,z)=>[side+u*ca+v*sa,-.37-u*sa+v*ca,z];
  const slab=(u0,u1,v0,v1,z0,z1)=>[v1,v0].map(v=>[
    at(u0,v,z0),at(u1,v,z0),at(u1,v,z1),at(u0,v,z1)
  ]);
  const shells=[shell(slab(0,1.38,0,.10,.25,2.28),color,1,{finish:'wood'})];
  for(const [lo,hi] of [[.42,1.16],[1.30,2.10]]){
    shells.push(shell(slab(.16,1.22,-.021,.003,lo,hi),color,1,{finish:'wood'}));
    shells.push(shell(slab(.16,1.22,.10,.13,lo,hi),color,1,{finish:'wood'}));
  }
  const rods=[rod(at(1.18,-.073,1.13),at(1.18,-.073,1.29),.029,steel),
    rod(at(1.18,.15,1.13),at(1.18,.15,1.29),.028,steel)];
  for(const z of [.46,1.38,2.05])rods.push(rod(at(0,.06,z),at(0,.06,z+.135),.037,steel));
  return {shells,rods};
}

export function quadDrone(at,t){
  const shape=(x,y,z)=>add(at,[x,y,z]);
  const shells=[
    shell([rect(.64,.40,-.10),rect(.77,.45,-.055),rect(.77,.45,.067),rect(.57,.34,.16)].map(r=>r.map(p=>add(at,p))),'#58696b',1,{finish:'enamel'}),
    shell([ring(.073,-.17,at[0]+.30,at[1],14),ring(.073,-.106,at[0]+.30,at[1],14)].map(r=>r.map(([x,y,z])=>[x,y,z+at[2]])),dark,1)
  ];
  const panels=[],rods=[];
  for(const a of [-1,1])for(const b of [-1,1]){
    const x=.58*a,y=.54*b,p=shape(x,y,.0);
    rods.push(rod(shape(.20*a,.16*b,-.015),p,.037,dark));
    rods.push(rod(p,shape(x,y,.098),.093,metal));
    rods.push(rod(shape(x,y,.10),shape(x,y,.132),.032,dark));
    const theta=t*41*a*b+(a+b)*.71,rx=.24*Math.cos(theta),ry=.24*Math.sin(theta);
    const blade=([u,v,z])=>shape(x+u*Math.cos(theta)-v*Math.sin(theta),y+u*Math.sin(theta)+v*Math.cos(theta),z);
    panels.push(panel([[-.25,.018,.134],[-.14,-.037,.134],[.25,-.019,.134],[.16,.032,.134]].map(blade),dark,.90));
    if(t)panels.push(panel(ring(.25,.134,x+at[0],y+at[1],24).map(([x,y,z])=>[x,y,z+at[2]]),'#bdcdce',.12,{outline:false}));
    rods.push(rod(shape(.15*a,.16*b,-.09),shape(.26*a,.19*b,-.21),.021,ink));
    rods.push(rod(shape(x-rx*.15,y-ry*.15,.144),shape(x+rx*.15,y+ry*.15,.144),.019,a>0?cream:red));
  }
  return {shells,panels,rods};
}

export function solarCells(surface){
  const [a,b,,d]=surface,ab=sub(b,a),ad=sub(d,a);
  const slope=Math.hypot(ad[1],ad[2]);
  const at=(s,t)=>add(add(a,mul(ab,s)),mul(ad,t));
  const p=(s,t)=>add(at(s,t),[0,-.014*ad[2]/slope,.014*ad[1]/slope]);
  const panels=[],edges=[];
  for(let i=0;i<8;i++)for(let j=0;j<6;j++){
    const u=(i+.09)/8,v=(j+.09)/6, r=(i+.93)/8,w=(j+.93)/6;
    const color=(i*11+j*7)%4===0?'#223f70':'#29476f';
    panels.push(panel([at(i/8,j/6),at((i+1)/8,j/6),at((i+1)/8,(j+1)/6),at(i/8,(j+1)/6)],
      '#4e6777',1,{finish:'steel',outline:false}));
    panels.push(panel([p(u,v),p(r,v),p(r,w),p(u,w)],color,1,{finish:'enamel',outline:'#b1c7d263'}));
  }
  for(const t of [.23,.51,.72])edges.push({from:p(.016,t),to:p(.984,t),color:'#c4d4d36c',width:.65});
  return {panels,edges};
}

export function cabinRoofRibs(panelPoints,color){
  const [a,b,c,d]=panelPoints;
  const u=sub(b,a),v=sub(d,a),at=(s,t,dz=0)=>add(add(add(a,mul(u,s)),mul(v,t)),[0,0,dz]);
  const rods=sample(.02,.98,13,t=>rod(at(0,t,.02),at(1,t,.02),.025,color));
  const gutters=[rod(b,c,.072,metal),rod(at(.01,0,-.028),at(.99,0,-.028),.042,metal),rod(at(.01,1,-.028),at(.99,1,-.028),.042,metal)];
  return [...rods,...gutters];
}

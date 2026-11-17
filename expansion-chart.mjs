import {block, edge, label, sample, trace, cream, gold, glass, ink, metal, mix} from './expansion-kit.mjs';

export const curve=(lo,hi,fn,color=glass)=>({lo,hi,fn,color});

export function chart(curves,{
  guides=[], points=[], lines=[], tags=[], handle, handles={}, domain, range, fill, axis='x', unit='', note='', props={}
}={}){
  const series=curves.map(({lo,hi,fn,color})=>({color,points:sample(lo,hi,96,x=>[x,fn(x)])}));
  const coordinates=[...series.flatMap(s=>s.points),...points,...lines.flatMap(([a,b])=>[a,b])];
  const [minX,maxX]=domain??[Math.min(...coordinates.map(p=>p[0])),Math.max(...coordinates.map(p=>p[0]))];
  const [minZ,maxZ]=range??[Math.min(0,...coordinates.map(p=>p[1])),Math.max(0,...coordinates.map(p=>p[1]))];
  const plot=([x,z])=>[-3.78+(x-minX)*7.56/(maxX-minX),0,.68+(z-minZ)*3.68/(maxZ-minZ)];
  function clipped(a,b){
    const dz=b[1]-a[1];
    if(!dz)return a[1]>=minZ&&a[1]<=maxZ?[plot(a),plot(b)]:null;
    const enter=(minZ-a[1])/dz,exit=(maxZ-a[1])/dz;
    const start=Math.max(0,Math.min(enter,exit)),end=Math.min(1,Math.max(enter,exit));
    return end>start?[plot(mix(a,b,start)),plot(mix(a,b,end))]:null;
  }
  const ticks=(lo,hi)=>{
    const raw=(hi-lo)/5;
    const magnitude=10**Math.floor(Math.log10(raw));
    const step=magnitude*([1,2,2.5,5,10].find(n=>n>=raw/magnitude)??10);
    return Array.from({length:Math.floor((hi+1e-9)/step)-Math.ceil((lo-1e-9)/step)+1},(_,i)=>
      Number(((Math.ceil((lo-1e-9)/step)+i)*step).toPrecision(8)));
  };
  const xTicks=ticks(minX,maxX),zTicks=ticks(minZ,maxZ);
  const border=[[minX,minZ],[maxX,minZ],[maxX,maxZ],[minX,maxZ],[minX,minZ]].map(plot);
  const grid=[
    ...xTicks.map(x=>edge(plot([x,minZ]),plot([x,maxZ]),x===0?'#a5c2bd':'#446969',x===0?1.15:.7)),
    ...zTicks.map(z=>edge(plot([minX,z]),plot([maxX,z]),z===0?'#a5c2bd':'#446969',z===0?1.15:.7)),
    ...trace(border,'#729995',.8)
  ];
  const strokes=[
    ...guides.map(([x,z])=>edge(plot([x,minZ]),plot([x,z]),'#f9dd8887',1.05)),
    ...series.flatMap(({points,color})=>points.slice(1).flatMap((b,i)=>{
      const segment=clipped(points[i],b);
      return segment?[edge(...segment,color,2.6)]:[];
    })),
    ...lines.map(([a,b,color,width])=>edge(plot(a),plot(b),color??gold,width??2))
  ];
  const readings=[
    ...xTicks.map(x=>label(String(x).replace('.',','),[plot([x,minZ])[0],0,.44],'#b7d2cd')),
    ...zTicks.map(z=>label(String(z).replace('.',','),[-4.18,0,plot([minX,z])[2]],'#b7d2cd')),
    label(axis,[3.2,0,4.6],cream),
    ...(unit?[label(unit,[-2.72,0,4.6],cream)]:[]),
    ...tags.map(([name,at,color])=>label(name,plot(at),color??cream)),
    ...(note?[label(note,[0,0,.215],cream)]:[])
  ];
  const at=point=>{const [x,,z]=plot(point);return [x,.148,z];};
  return {
    ...props,
    blocks:[
      {...block(0,0,.22,9.15,.24,4.6,'#425956'),finish:'steel'},
      {...block(0,0,.32,8.9,.27,4.4,ink),finish:'enamel'},
      {...block(0,0,0,9.2,1.1,.18,metal),finish:'steel'},
      block(-2.6,0,.16,.55,.36,.2,'#4f6660'),block(2.6,0,.16,.55,.36,.2,'#4f6660'),...props.blocks??[]
    ],
    screen:{
      depth:.148,grid,strokes,readings,points:points.map(plot),
      regions:fill?[{points:fill.points.map(plot),color:fill.color}]:[]
    },
    handle:at(handle??points[0]??[minX,minZ]),
    handles:Object.fromEntries(Object.entries(handles).map(([key,point])=>[key,at(point)]))
  };
}

import {hingedDoor,physicalDie,spurGear} from '../dist/expansion-props.mjs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {lessons} from '../dist/lessons.mjs';
import {extraLessons} from '../dist/expansion.mjs';
import {draftFor,goalOptions,readCustomProblems,instantiateProblem,validateDraft} from '../dist/problem-editor.mjs';
import {outcomeDistribution,experimentEvent,classifyTrial} from '../dist/probability-distribution.mjs';
import {trialFrame,trialSteps,samplePrimary,sampleCustomProbability,sampledMain} from '../dist/probability-lab.mjs';
import {initialState,sceneOptions} from '../dist/lesson-studio.mjs';
import {lessonFeatures,sectionCurve,sectionReading} from '../dist/model-study.mjs';
import {practiceTasks,gradePractice,answerLabel,exerciseModel} from '../dist/practice.mjs';
import {drawScene} from '../dist/scene.mjs';

const all=[...lessons,...extraLessons];
const byId=id=>all[id-1];
const near=(a,b,tolerance=1e-8)=>assert.ok(Math.abs(a-b)<=tolerance*Math.max(1,Math.abs(a),Math.abs(b)),a+' ≈ '+b);
function configure(base,parameters,conditions,metric){
  const draft=draftFor(base);
  Object.assign(draft.parameters,parameters);
  Object.assign(draft.conditions,conditions);
  if(metric!==undefined)draft.metric=metric;
  const checked=validateDraft(base,draft);
  assert.ok(checked.data,base.id+' '+JSON.stringify(checked.errors)+' '+checked.relationship);
  return instantiateProblem(base,checked.data);
}

test('extrema follow the mathematical domain, including explicit limits when applicable',()=>{
  const ladder=configure(byId(30),{x:.2},{distance:.1,height:15});
  near(ladder.focusParameter,Math.cbrt(22.5));
  assert.ok(ladder.controls[0].max>ladder.focusParameter);
  assert.match(ladder.problemQuestion,/dương/);
  const aircraft=configure(byId(11),{x:6},{observation:9},2);
  assert.equal(aircraft.focusParameter,9);
  assert.match(aircraft.problemQuestion,/đến 9 phút/);
  const ground=configure(byId(1),{x:3},{capCost:.1});
  near(ground.focusParameter,Math.cbrt(108));
});

test('an old saved configuration is filled with newly added optional fields',()=>{
  const base=byId(11),previous=draftFor(base);
  previous.parameters.x=35;
  delete previous.conditions.observation;
  globalThis.localStorage={getItem:()=>JSON.stringify({11:previous})};
  try{
    const saved=readCustomProblems(all).get(11);
    assert.equal(saved.parameters.x,35);
    assert.equal(saved.conditions.observation,0);
  }finally{delete globalThis.localStorage;}
});

test('conditional counts, rates, and authored display use the same inputs',()=>{
  const prob=configure(byId(24),{x:2,p:50},{},0);
  const state=initialState(prob),chart=outcomeDistribution(prob.id,state,0);
  const forward=experimentEvent(24,0),reverse=experimentEvent(24,1);
  assert.deepEqual(forward.denominator,[0,2]);
  assert.deepEqual(classifyTrial(forward,{},2),{qualified:true,success:false});
  assert.deepEqual(classifyTrial(forward,{},1),{qualified:false,success:false});
  assert.deepEqual(classifyTrial(reverse,{},1),{qualified:true,success:false});
  near(100*chart.rows[0][1]/(chart.rows[0][1]+chart.rows[2][1]),prob.result(state)[0].value);
  assert.equal(prob.result({...state,p:0})[0].value,null);
  const twenty=configure(byId(76),{x:12},{total:20});
  assert.match(twenty.title,/20 viên/);
  near(twenty.result(initialState(twenty))[0].value,100*66/190);
});

test('all 147 templates accept existing author defaults and keep finite visual data at their boundaries',()=>{
  const nothing=()=>{};
  const gradient={addColorStop:nothing};
  const context=new Proxy({createLinearGradient:()=>gradient,createRadialGradient:()=>gradient,measureText:t=>({width:t.length*7})},
    {get:(obj,key)=>obj[key]??nothing});
  const canvas={clientWidth:820,clientHeight:430,getContext:()=>context};
  const frame=(l,s,options,probability)=>{
    const labels=drawScene(canvas,l.mode,s,-.28,probability?.view??null,l.scene,1,null,-1,probability,options);
    for(const [,p] of labels)assert.ok(p.every(Number.isFinite),l.id+' '+p);
  };
  assert.equal(all.length,147);
  for(const base of all){
    const l=configure(base,{},{}),s=initialState(l);
    const features=lessonFeatures(l).map(f=>f[2]);
    const graphics={...sceneOptions(l),resolution:[820,430],fill:true,projection:l.group===2,feature:features[0]};
    const blank=l.group===4?{id:l.id,step:0,progress:1}:null;
    frame(l,s,{...graphics,registerCoordinates:points=>{
      if(l.group===2)assert.ok(points.length>0&&points.every(p=>p.actual.every(Number.isFinite)),l.id+' coordinates');
    }},blank);
    for(const c of l.controls)for(const x of [c.min,c.max])frame(l,{...s,[c.key]:x},graphics,blank);
    for(let i=0;i<goalOptions(base).length;i++)assert.ok(configure(base,{},{},i).practice.question);
    if(l.group===1&&(!l.approvedExpansion||l.section)){
      assert.ok(Number.isFinite(sectionReading(l,s).area));
      assert.ok(sectionCurve(l,s).points.every(([,area])=>Number.isFinite(area)&&area>=0));
    }
    const distribution=l.distribution?.(s)??outcomeDistribution(l.id,s,l.custom.metric);
    if(l.group===4&&distribution){
      near(distribution.rows.reduce((sum,[,p])=>sum+p,0),1);
      let seed=l.id;
      const rng=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
      const run=sampledMain.has(l.id)?samplePrimary(l.id,s,rng):sampleCustomProbability(l.id,s,rng)??l.sample(s,rng);
      assert.ok(distribution.category(run)>=0);
      for(let step=1;step<=trialSteps(l.id,run).length;step++)frame(l,s,graphics,trialFrame(l.id,s,run,step,.6));
    }
  }
});

test('the exercise bank grades locale, units, precision and authored variants',()=>{
  assert.equal(all.flatMap(practiceTasks).length,251);
  for(const lesson of all){
    const tasks=practiceTasks(lesson);
    for(const task of tasks){
      assert.equal(gradePractice(task,answerLabel(task)),'correct',lesson.title+' '+task.key);
      if(task.model)assert.ok(exerciseModel(lesson,task));
    }
  }
  const exercise=practiceTasks(byId(2))[1];
  assert.equal(gradePractice(exercise,'2,4 tỷ đồng'),'correct');
  assert.equal(gradePractice(exercise,'2,4 triệu đồng'),'unit');
  const probability=practiceTasks(byId(24))[1];
  assert.equal(gradePractice(probability,'0,30'),'percent');
  const nearRound={answer:12.344,unit:'%',digits:2};
  assert.equal(gradePractice(nearRound,'12,34'),'correct');
  assert.equal(gradePractice(nearRound,'12,35'),'round');
});

test('wheel and Pisa scene handles follow the height models at peaks and contacts',()=>{
  const nothing=()=>{};
  const gradient={addColorStop:nothing};
  const ctx=new Proxy({createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??nothing});
  const canvas={clientWidth:390,clientHeight:260,getContext:()=>ctx};
  const elevation=.49, scale=Math.min(390/12.1,(260-24)/(6.5+3.4*Math.sin(elevation)));
  const pixels=scale*Math.cos(elevation);
  const handle=(id,s,motion)=>{
    let point;
    drawScene(canvas,byId(id).mode,s,0,null,null,1,elevation,-1,null,{
      id,resolution:[390,260],motion,registerHandle:value=>{point=value;}
    });
    return point;
  };
  const high=handle(16,{x:3.5}),low=handle(16,{x:8.5}),level=handle(16,{x:1});
  near((low[1]-high[1])/pixels,5.2*20/30);
  near(level[0]-high[0],scale*5.2*10/30);
  const state={x:0,conditions:{height:27.9,bounce:25}};
  const release=handle(15,state,{key:'x',raw:0});
  const contact=handle(15,state,{key:'x',raw:2/3});
  const rebound=handle(15,{...state,x:1},{key:'x',raw:1});
  near(release[0],contact[0]);near(rebound[0],contact[0]);
  near((contact[1]-release[1])/pixels,4.85/2);
  near(contact[1]-rebound[1],(contact[1]-release[1])/4);
});

test('bounce clock shortens each successive flight and the rolled die lands on the selected face',async()=>{
  const {bounceClock,bounceFrame,bounceHeight,dieRoll}=await import('../dist/scene-motion.mjs');
  for(const q of [0,.01,.25,.99]){
    for(const n of [1,2,3])near(bounceHeight(n,q),q**n);
    near(bounceHeight(1/(1+Math.sqrt(q)),q),0);
    near(bounceClock(2,q)-bounceClock(1,q),bounceClock(1,q)*Math.sqrt(q));
    assert.equal(bounceFrame(bounceClock(3,q),q,3),3);
  }
  const normals=[[0,0,1],[1,0,0],[0,1,0],[0,-1,0],[-1,0,0],[0,0,-1]];
  for(const [i,normal] of normals.entries()){
    near(dieRoll(1,i+1,.4).rotate(normal)[2],1);
    for(const t of [0,.15,.49,.83,1]){
      const {rotate,clearance}=dieRoll(t,i+1,.4);
      const base=Math.min(...[-.4,.4].flatMap(x=>[-.4,.4].flatMap(y=>[-.4,.4].map(z=>rotate([x,y,z])[2]))));
      near(base+clearance,0);
    }
  }
});

test('box panels remain rigid and join at the corners when fully folded',async()=>{
  const {boxFold}=await import('../dist/scene-mechanics.mjs');
  const distance=(a,b)=>Math.hypot(...a.map((n,i)=>n-b[i]));
  for(const angle of [0,.17,.5,.89,1]){
    const {base,faces}=boxFold(104,34,8,angle);
    for(const [i,[a,b,c,d]] of faces.entries()){
      assert.deepEqual(a,base[i]);assert.deepEqual(b,base[(i+1)%4]);
      near(distance(a,d),8);near(distance(b,c),8);near(distance(a,b),distance(c,d));
      near(c[2],8*Math.sin(angle*Math.PI/2));
    }
    if(angle===1)faces.forEach((face,i)=>near(distance(face[2],faces[(i+1)%4][3]),0));
  }
});

test('pumping accumulates volume and the displayed depth gives the specified flow relation',async()=>{
  const {tankVolume,tankLevel}=await import('../dist/scene-mechanics.mjs');
  for(const [id,h,max,dimensions] of [[5,2,4,{height:4,radius:2}],
    [34,2,5,{bottom:3,mouth:1,height:5}],[35,1.1,2,{length:10,width:4,rise:2}]]){
    const volume=tankVolume(id,h,dimensions);
    near(tankLevel(id,volume,max,dimensions),h);
    const delta=1e-4;
    const derivative=(tankVolume(id,h+delta,dimensions)-tankVolume(id,h-delta,dimensions))/(2*delta);
    const area=id===5?Math.PI:id===34?Math.PI*2.2**2:22;
    near(derivative,area);
    assert.equal(tankLevel(id,tankVolume(id,max,dimensions)*1.04,max,dimensions),max);
  }
});

test('Bayes keeps other slots fixed and conserves the physical balls during replay',async()=>{
  const {urnBallStates,liftThroughOpening}=await import('../dist/scene-mechanics.mjs');
  const layout=[[3,2],[1,3],[0,4]];
  const state=urnBallStates(layout,1,[true,false],undefined,.5);
  assert.deepEqual(state.bins[0].map(b=>b.slot),[0,1,3]);
  assert.deepEqual(state.moving,{ball:{green:false,slot:4},from:0,destination:{green:false,slot:5},to:1});
  assert.equal(state.bins.flat().length+1,13);
  const settled=urnBallStates(layout,1,[true,false],undefined,1);
  assert.equal(settled.bins.flat().length,13);
  assert.equal(settled.bins[1].at(-1).slot,5);
  const drawn=urnBallStates(layout,1,[true,false],true,1);
  assert.equal(drawn.moving.ball.slot,4);
  assert.equal(drawn.bins.flat().length+1,13);
  const from=[-3,0,.6],to=[3,1,.9];
  assert.deepEqual(liftThroughOpening(from,to,2,0),from);
  near(liftThroughOpening(from,to,2,.5)[2],2);
  liftThroughOpening(from,to,2,1).forEach((x,i)=>near(x,to[i]));
});

test('race follows the lane to the sampled slot and steel signals after clearing the detector',async()=>{
  const {racePose,steelInspection,steelBarLength}=await import('../dist/probability-objects.mjs');
  for(const n of [3,10,24])for(let slot=1;slot<n;slot++){
    const start=racePose(slot,n,0),end=racePose(slot,n,1);
    near(start.angle,0);near(end.angle,2*Math.PI*slot/n);
    near(start.radius,4.23);near(end.radius,3.52);
    assert.ok(racePose(slot,n,.5).radius>3.52);
  }
  near(steelInspection(1,1).x,steelInspection(2,0).x);
  assert.equal(steelInspection(1,1).complete,false);
  const middle=steelInspection(2,.32);
  assert.ok(Math.abs(middle.x)<steelBarLength/2&&middle.scanning&&!middle.complete);
  const end=steelInspection(2,1);
  assert.ok(end.x-steelBarLength/2>0&&end.complete&&!end.scanning);
});

test('cutaway preserves the exact section intersections and swing stays within its chosen angle',async()=>{
  const {clipSolidFace,swingAngle}=await import('../dist/scene-mechanics.mjs');
  const four=[[-3,-2,4],[3,-2,4],[3,2,4],[-3,2,4]];
  assert.deepEqual(clipSolidFace(four,p=>p[0]-1),[[-3,-2,4],[1,-2,4],[1,2,4],[-3,2,4]]);
  assert.equal(clipSolidFace(four,p=>p[0]+4).length,0);
  assert.equal(clipSolidFace(four,null),four);
  for(const angle of [0,15,60,80]){
    near(swingAngle(angle,0),angle);near(swingAngle(angle,.25),0);
    near(swingAngle(angle,.5),-angle);near(swingAngle(angle,1),angle);
    for(let i=0;i<=80;i++)assert.ok(Math.abs(swingAngle(angle,i/80))<=angle+1e-10);
  }
});

test('the approved expansion covers 56 distinct templates and preserves key geometric cases',()=>{
  const added=all.filter(lesson=>lesson.approvedExpansion);
  assert.deepEqual(Array.from({length:5},(_,group)=>added.filter(l=>l.group===group).length),[11,19,10,7,9]);
  assert.equal(new Set(added.map(l=>l.title)).size,56);
  const read=(id,values,index=0)=>byId(id).result({...initialState(byId(id)),...values})[index].value;

  assert.equal(read(99,{x:2}),2);
  assert.equal(read(99,{x:2.05}),1);
  near(read(103,{x:.5,r:2}),12);
  near(read(103,{x:1,r:2},1),128/3);
  const tank=byId(106);
  for(const x of [0,12,20.556045,30])for(const v of [3,6]){
    const state={x,v};
    const water=tank.scene(x,state).panels.find(p=>p.water);
    assert.ok(water.points.every(p=>Math.abs(p[2]-water.points[0][2])<1e-10));
    const [depth,length]=tank.result(state).map(m=>m.value);
    near(2*(depth*length-.5*Math.tan(x*Math.PI/180)*length**2),v);
  }
  near(read(111,{x:1.1}),32/3-2.2*2.79);
  const sign=byId(112);
  near(sign.result({x:4,d:1}).reduce((sum,r)=>sum+r.value,0),20);
  near(read(118,{x:7}),131/6);
  near(read(118,{x:7},1),77/6);
  near(read(128,{x:30}),28/9+28*Math.sqrt(3)/3);
  const shadow=byId(128).scene(30,initialState(byId(128)));
  assert.ok(shadow.coordinates.every(p=>Math.abs(p.projection[2])<1e-10));
  near(read(131,{x:3,h:1.5}),3*Math.sqrt(5));
  near(read(131,{x:5,h:1.5}),0);
  near(read(132,{x:1,n:24},1),-180);
});

test('simulated event categories agree with exact theory for all 9 added experiments',()=>{
  for(const lesson of all.filter(l=>l.approvedExpansion&&l.group===4)){
    const defaults=initialState(lesson);
    const states=[defaults,...lesson.controls.flatMap(c=>[c.min,c.max].map(value=>({...defaults,[c.key]:value})))];
    let seed=lesson.id;
    const rng=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
    for(const state of states){
      const chart=lesson.distribution(state),event=lesson.event(state);
      const modelRate=lesson.result(state)[lesson.experimentMetric].value/100;
      const expected=event.numerator.reduce((sum,i)=>sum+chart.rows[i][1],0);
      const qualifying=event.denominator?.reduce((sum,i)=>sum+chart.rows[i][1],0)??1;
      near(modelRate,expected/qualifying);
      const observed=chart.rows.map(()=>0);
      for(let i=0;i<3000;i++)observed[chart.category(lesson.sample(state,rng))]++;
      observed.forEach((count,i)=>assert.ok(Math.abs(count/3000-chart.rows[i][1])<.055,lesson.title+' · '+chart.rows[i][0]));
    }
  }
});


test('physical details follow the exact outcome and moving geometry',()=>{
  for(let face=1;face<=6;face++){
    const {at,panels}=physicalDie(1,face);
    assert.equal(panels.filter(p=>p.points.every(v=>v[2]>at[2]+.455)).length,face);
    for(const phase of [0,.2,.5,.82,1]){
      const points=physicalDie(phase,face).shells[0].rings.flat();
      assert.ok(points.every(v=>v[2]>=0),'dice clearance for '+face);
    }
  }

  for(const phase of [0,.17,.7,1]){
    const [front]=hingedDoor(0,phase,'#98724e').shells[0].rings;
    near(Math.hypot(front[1][0]-front[0][0],front[1][1]-front[0][1]),1.38);
    near(front[2][2]-front[1][2],2.03);
  }
  for(const teeth of [12,20,28]){
    const {shells}=spurGear(teeth,1,Math.PI/7,'#8c9a9c');
    const rim=shells[0].rings[2];
    const radius=Math.max(...rim.map(p=>Math.hypot(p[0]-1,p[1])));
    near(radius,.105*teeth+.126);
  }
  const radar=byId(131),config=initialState(radar);
  for(const t of [-6,-2.5,0,3,6]){
    const state={...config,t};
    const point=radar.scene(config.x,state).handles.t;
    assert.deepEqual(point,[t,config.x,3+t/2]);
    assert.deepEqual(radar.result(state),radar.result(config));
  }
});

test('display overlays keep the entire chart visible in either orbit direction',()=>{
  const lesson=byId(93),s={...initialState(lesson),x:40,p:32},model=lesson.scene(s.x,s);
  near(lesson.result(s)[0].value,23);
  assert.equal(lesson.result(s)[1].value,11);
  const curve=model.screen.strokes.filter(e=>e.color==='#83c7cf');
  assert.equal(curve.length,96);
  near(curve.at(-1).to[0],model.screen.points[0][0]);
  near(curve.at(-1).to[2],model.screen.points[0][2]);
  const noOperation=()=>{},gradient={addColorStop:noOperation};
  for(const yaw of [0,Math.PI]){
    const events=[];
    const ctx=new Proxy({
      createLinearGradient:()=>gradient,createRadialGradient:()=>gradient,
      fill:()=>events.push('fill'),stroke:()=>events.push(ctx.strokeStyle)
    },{get:(o,k)=>o[k]??noOperation});
    const canvas={getContext:()=>ctx};
    drawScene(canvas,lesson.mode,s,yaw,null,lesson.scene,1,.19,-1,null,{
      ...sceneOptions(lesson),thumbnail:true,resolution:[390,240]
    });
    const first=events.indexOf('#83c7cf'),last=events.lastIndexOf('#83c7cf');
    assert.ok(first>0);
    assert.equal(events.slice(first,last+1).filter(e=>e==='#83c7cf').length,96);
    assert.ok(!events.slice(first,last).includes('fill'));
  }
});

test('updated hydraulic, survey and seating models follow their boundary conditions',()=>{
  const tank=byId(95);
  for(const [t,h] of [[0,6],[4,7.6],[8,6]]){
    const model=tank.scene(t,{x:t});
    near(model.panels.find(p=>p.water).points[0][2],h);
    near(tank.result({x:t})[0].value,h);
  }
  const survey=byId(129),state=initialState(survey);
  assert.deepEqual(survey.scene(29,{...state,x:29,n:3}).coordinates.map(p=>p.text),['O','A','B','M₊','M₋']);
  assert.deepEqual(survey.scene(25,{...state,x:25,n:3}).coordinates.map(p=>p.text),['O','A','B','M₊']);
  assert.deepEqual(survey.scene(29,{...state,x:29,n:4}).coordinates.map(p=>p.text),['O','A','B','D','M₊']);
  const stands=byId(137);
  for(const n of [1,6,11]){
    const count=stands.result({x:n})[0].value;
    assert.equal(stands.scene(n,{x:n}).panels.length,count);
  }
});

test('ô ăn quan replacement lifts one specific pebble and returns it before the next draw',async()=>{
  const {drawWithReplacement,replacementFrame}=await import('../dist/o-an-quan.mjs');
  const {trialFrame}=await import('../dist/probability-lab.mjs');
  const draws=[.02,.08,.93];
  const trial=drawWithReplacement(3,()=>draws.shift());
  assert.deepEqual(trial.detail.slots,[0,0,7]);
  assert.deepEqual(trial.view,[true,true,false]);
  assert.equal(trial.success,true);
  for(const [step,slot] of [[1,0],[2,0],[3,7]])for(const t of [0,.2,.48,.52,.63,.85,1]){
    const replay=trialFrame(81,{x:3},trial,step,t);
    const frame=replacementFrame(replay.detail.slots,t);
    const pieces=frame.slot===null?frame.resting:frame.resting.concat([frame.slot]);
    assert.deepEqual(pieces.sort((a,b)=>a-b),[0,1,2,3,4,5,6,7]);
    assert.equal(frame.slot,t===0||t===1?null:slot);
    assert.equal(frame.observations.length,step-Number(t<.48));
  }
  near(byId(81).result({x:3})[0].value,57.8125);
});

test('ô ăn quan sows into each adjacent pit, captures after a gap and conserves all pieces',async()=>{
  const {newQuanGame,playerPits,quanMove,quanScore}=await import('../dist/o-an-quan.mjs');
  const game=newQuanGame();
  assert.deepEqual(game.pits.map(p=>p.length),[5,5,5,5,5,1,5,5,5,5,5,1]);
  const inventory=s=>[...s.pits.flat(),...s.banks.flat(),...s.hand].sort((a,b)=>a-b);
  assert.deepEqual(quanMove(game,6,1),[]);
  assert.deepEqual(quanMove(game,5,1),[]);
  const first=quanMove(game,0,1);
  assert.deepEqual(first.filter(f=>f.kind==='drop').map(f=>f.pit),[1,2,3,4,5,7,8,9,10,11]);
  assert.deepEqual(first.filter(f=>f.kind==='capture').map(f=>f.pit),[1]);
  assert.equal(quanScore(first.at(-1).after,0),6);
  assert.equal(first.at(-1).after.player,1);
  assert.deepEqual(quanMove(game,0,-1).filter(f=>f.kind==='drop').slice(0,5).map(f=>f.pit),[11,10,9,8,7]);
  let refills=0,finishes=0,seed=90445;
  const random=n=>(seed=(Math.imul(seed,1664525)+1013904223)>>>0)%n;
  for(let run=0;run<18;run++){
    let s=game;
    for(let turn=0;turn<80&&!s.finished;turn++){
      const valid=playerPits[s.player].filter(i=>s.pits[i].length);
      const events=quanMove(s,valid[random(valid.length)],random(11)%2?1:-1);
      assert.ok(events.length>0);
      for(const {after,kind,moving} of events){
        assert.deepEqual(inventory(after),inventory(game));
        assert.equal(after.debt[0]+after.debt[1],0);
        if(kind==='drop')assert.equal(moving.length,1);
        if(kind==='refill')refills++;
        if(kind==='finish')finishes++;
      }
      s=events.at(-1).after;
    }
  }
  assert.ok(refills>0);
  assert.ok(finishes>0);
});

test('the trough drains by volume and scanner lights follow the parcel at each gate',()=>{
  const trough=byId(121);
  for(const fraction of [0,.25,.75,1]){
    const model=trough.scene(2,{x:2,b:3},{mechanism:fraction});
    const surface=model.panels.find(p=>p.water);
    if(fraction===1)assert.equal(surface,undefined);
    else near(3*surface.points[0][2]**2,12*(1-fraction));
  }
  const scanner=byId(139);
  const detail={a:true,b:false,defect:true};
  const view=(step,progress)=>scanner.scene(5,{x:5},{probability:{step,progress,detail}});
  assert.equal(view(1,1).lamps.length,0);
  assert.equal(view(2,.4).lamps.length,0);
  assert.deepEqual(view(2,1).lamps.map(l=>l.at[0]),[-1.65]);
  assert.deepEqual(view(3,1).lamps.map(l=>l.at[0]),[-1.65,1.4]);
});

test('the held pebbles follow adjacent pits and release directly above the destination',async()=>{
  const {newQuanGame,quanMove}=await import('../dist/o-an-quan.mjs');
  const {pitPosition,quanGamePose}=await import('../dist/o-an-quan-scene.mjs');
  for(const direction of [-1,1]){
    const frames=quanMove(newQuanGame(),0,direction);
    for(const [i,event] of frames.entries()){
      if(event.kind!=='drop')continue;
      assert.equal(event.pit,(event.fromPit+direction+12)%12);
      const previous=frames[i-1],before=quanGamePose(previous.after,previous,1);
      const poses=t=>quanGamePose(event.after,event,t);
      const start=poses(0),middle=poses(.31),arrival=poses(.62),rest=poses(1);
      const released=event.moving[0];
      for(const [id,position] of start){
        position.forEach((p,k)=>near(p,before.get(id)[k]));
      }
      const a=pitPosition(event.fromPit),b=pitPosition(event.pit);
      const midpoint=middle.get(released);
      assert.ok(Math.hypot(midpoint[0]-(a[0]+b[0])/2,midpoint[1]-(a[1]+b[1])/2)<.52);
      for(const index of [0,1]){
        const component=rest.get(released)[index];
        near(arrival.get(released)[index],component);
        near(poses(.83).get(released)[index],component);
      }
      assert.ok(arrival.get(released)[2]>poses(.83).get(released)[2]);
      assert.ok(poses(.83).get(released)[2]>rest.get(released)[2]);
      for(const id of event.after.hand){
        const [x,y,z]=poses(.83).get(id);
        assert.ok(Math.hypot(x-b[0],y-b[1])<=.31);
        assert.ok(z>=1);
      }
      assert.equal(poses(.53).size,52);
    }
  }
});

test('the clipped plot keeps all extrema and the force projection reports Newton components',()=>{
  for(const m of [-1.5,-1,0,1,2.5]){
    const {screen}=byId(102).scene(m,{x:m});
    assert.equal(screen.points.length,1+2*Number(m>-1)+2*Number(m>1));
    assert.ok(screen.strokes.every(e=>[e.from,e.to].every(p=>p[2]>=.679999&&p[2]<=4.360001)));
  }
  for(const k of [-12,-9,4]){
    const {coordinates}=byId(130).scene(k,{x:k});
    for(const j of [0,1,2])near(coordinates.reduce((sum,p)=>sum+p.actual[j],0),0);
    assert.deepEqual(coordinates.at(-1).actual.map(v=>v===0?0:v),[-5,-1,-9-k]);
  }
});

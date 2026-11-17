import {mountQuanGame} from './o-an-quan-ui.mjs';
import {tankVolume,tankLevel,swingAngle} from './scene-mechanics.mjs';
import {samplePrimary,sampleCustomProbability,sampledMain,trialSteps,eventDescription,walkLessons,walkExample,walkSteps,walkOptions,walkStart,walkTarget,walkPlace,walkStages,trialFrame,trialAction} from './probability-lab.mjs';
import {outcomeDistribution,experimentEvent,classifyTrial} from './probability-distribution.mjs';
import {renderResults as renderProbabilityResults,renderWalkMap,renderComparison} from './probability-workspace.mjs';
import {groups,lessons as primaryLessons,fmt} from './lessons.mjs';
import {bounceClock,bounceFrame} from './scene-motion.mjs';
import {drawScene,plotScene} from './scene.mjs';
import {preferredCamera,refinedLessons} from './studio-finish.mjs';
import {extraLessons} from './expansion.mjs';
import {accents,chapterRoutes,initialState,sceneOptions,snapControl,mountCovers,makeCurve,drawParameterGraph} from './lesson-studio.mjs';
import {advancePlayback,bindStageGestures,fitView,zoomAt,zoomLimits} from './scene-view.mjs';
import {draftFor,goalOptions,studyProblem,validateDraft,instantiateProblem,readCustomProblems,persistCustomProblems} from './problem-editor.mjs';
import {mountFormulaLibrary,showFormulaLibrary} from './formula-library.mjs';
import {mountPractice,openPractice,renderProgress,resetPracticeSelection} from './practice-workspace.mjs';
import {lessonFeatures,sectionParameter,sectionReading,sectionCurve,drawSectionChart} from './model-study.mjs';
const lessons=[...primaryLessons,...extraLessons];
const lessonsByChapter=groups.map((_,group)=>lessons.filter(l=>l.group===group));
const get=id=>document.getElementById(id);
const built=id=>document.querySelectorAll(id);
const customProblems=readCustomProblems(lessons);
mountFormulaLibrary(lessons,groups,normalizeFormulaSearch);
mountPractice(lessons);
const problemDialog=get('problem-dialog');
let editingBase=null;
const html=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function normalizeFormulaSearch(value){return value.toLowerCase().normalize('NFD').replace(/\p{M}/gu,'').replaceAll('đ','d').trim();}
const titles={problem:'Tình huống',formula:'Công thức trọng tâm',solution:'Lời giải từng bước',practice:'Tự luyện'};
const canvas=get('scene');
const renderQuanGame=mountQuanGame(get('quan-game'));
const labelList=get('scene-label-list');
const liveBounds=new Set([117,119,133,134,137]);
const stageHandle=get('stage-handle'),stageFocus=get('stage-focus'),stageSurface=get('stage-surface');
let labelsVisible=true,selectedLabel=-1,labelSignature='';
let trialResult=null,path=null,pathCursor=0,trialTrace=[];
let replayFrame=0,replayPlaying=false,replayProgress=1,replayStarted=null;
let walkMode='',walkHeat=true,walkCounts=[],walkHitPoints=[];
let distribution=null,frequencies=[],lastCategory=-1;
let guided=false,recorded=false,revealed=0,replaySingle=false;
let probView='model',distributionScope='all',mapStep=0,mapPlace=0,walkHints=false,walkBackwards=[];
const baselines=new Map(),studioBaselines=new Map();
const waterLessons=new Set([5,34,35]);
const mechanisms={
  3:{label:'Góc gấp',play:'Gấp hộp',initial:1,angle:true,duration:1350},
  4:{label:'Vị trí xe',play:'Chạy qua hầm',initial:.5,duration:3800},
  31:{label:'Góc gấp',play:'Gấp hộp',initial:1,angle:true,duration:1350},
  33:{label:'Hành trình',play:'Chèo và đi bộ',initial:0,duration:4200},
  51:{label:'Lượt trượt',play:'Thả phao',initial:0,duration:2000},
  55:{label:'Lượt lao xuống',play:'Cho chim lao xuống',initial:0,duration:1800},
  66:{label:'Chu kỳ đu',play:'Thả ghế đu',initial:0,duration:4500},
  121:{label:'Tiến độ bơm',play:'Bơm ra khỏi máng',initial:0,duration:4900}
};
let mechanismPosition,mechanismFrame=0;
const filledLessons=new Set([6,7,8,9,...Array.from({length:15},(_,i)=>36+i)]);
const defaultMetrics={5:1,7:0,8:1,10:0,11:0,13:0,16:0};
const cameraAngles={perspective:[-.28,null],front:[0,.30],side:[Math.PI/2,.30],top:[0,Math.PI/2-.035]};
const cutawayLessons=new Set([1,5,6,7,8,9,10,12,25,26,29,34,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,59,61,64,65,67,68,69,70,74,75]);
let cutaway=false;
let activeVariable='x',activeMetric=0,studioFill=false,studioCamera='perspective';
let selectedFeature=-1,projection=false,coordinateSignature='',sectionKey='',areaCurve=null;
let cameraFrame=0,sweepFrame=0,sweepActive=false,sweepVisual=null,curveCache=null,curveKey='',graphBounds=null;
let graphics={},stageTool='orbit',pan=[0,0],sweepDirection=1,sweepLoop=false;
const reducedMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let lesson=lessons[1],state={},mode='scene',yaw=-.28,zoom=1,elevation=null,tab='problem',filter=-1,collection='all',highlight=-1,observed=0,trials=0,qualified=0,animating=false,animationId=0;
const two=n=>String(n).padStart(2,'0');
const valueText=(key,value)=>lesson.id===2&&key==='x'?fmt(value*1000)+' ₫':fmt(value)+' '+lesson.controls.find(c=>c.key===key).unit;

function title(id,text){get(id).textContent=text;}
function show(id,visible){get(id).hidden=!visible;}
function pressed(element,on){element.setAttribute('aria-pressed',String(on));}
function link(id,n,arrow) {
  show(id,n>=1&&n<=lessons.length);
  if(n<1||n>lessons.length) return;
  const el=get(id);
  el.href='#bai-'+n;
  el.textContent=arrow==='left'?'← '+lessons[n-1].title:lessons[n-1].title+' →';
}

const normalizeSearch=normalizeFormulaSearch;
function storedLesson(base){
  return instantiateProblem(base,customProblems.get(base.id));
}

function renderLibrary(){
  get('filters').innerHTML=['Tất cả',...groups].map((name,i)=>'<button type="button" class="outline" data-filter="'+(i-1)+'" aria-pressed="'+(filter===i-1)+'">'+name+'</button>').join('');
  renderResults();
}

function renderResults(){
  const query=normalizeSearch(get('lesson-search').value).split(/\s+/).filter(Boolean);
  let total=0;
  get('library-list').innerHTML=groups.map((group,i)=>{
    if(filter!==-1&&filter!==i) return '';
    const matches=lessons.filter(l=>{
      const typeMatches=collection==='all'||(collection==='new'?l.approvedExpansion:Boolean(l.extension)===(collection==='extra'));
      if(l.group!==i||!typeMatches)return false;
      const haystack=normalizeSearch('Bài '+l.id+' '+two(l.id)+' '+l.title+' '+storedLesson(l).title+' '+l.tag+' '+group);
      return query.every(word=>haystack.includes(word));
    });
    if(!matches.length)return '';
    total+=matches.length;
    const cards=matches.map(l=>'<a href="#bai-'+l.id+'" class="library-card" data-chapter="'+i+'">'
      +'<div class="library-cover" data-cover="'+l.id+'" aria-hidden="true"></div>'
      +'<div class="library-card-copy"><span>Bài '+two(l.id)+(l.approvedExpansion?' · Mới':l.extension?' · Mở rộng':' · Bài chính')
      +'</span><h3>'+storedLesson(l).title+'</h3><p>'+l.tag+'</p><span class="card-arrow" aria-hidden="true">↗</span></div></a>').join('');
    return '<section class="library-group" data-chapter="'+i+'"><h2>'+group+' <small>'+matches.length+' bài</small></h2><div class="library-cards">'+cards+'</div></section>';
  }).join('')||'<p class="empty">Không tìm thấy bài phù hợp với từ khóa và bộ lọc hiện tại.</p>';
  title('search-count', total+' / '+lessons.length+' bài');
  mountCovers(get('library-list'),lessons);
}

function renderControls(){
  get('sliders').innerHTML=lesson.controls.map(({key,label,min,max,step,value})=>'<div class="range"><label for="range-'+key+'">'+label+'<output id="value-'+key+'" for="range-'+key+'"></output></label><input id="range-'+key+'" data-key="'+key+'" type="range" min="'+min+'" max="'+max+'" step="'+step+'" value="'+value+'"><div class="ends"><span>'+valueText(key,min)+'</span><span>'+valueText(key,max)+'</span></div></div>').join('');
  const quantities=lesson.result(initialState(lesson));
  for(const id of ['studio-variable','stage-variable']){
    get(id).replaceChildren(...lesson.controls.map(({label,key})=>new Option(label,key)));
    get(id).value=activeVariable;
  }
  get('studio-metric').replaceChildren(...quantities.flatMap(({label,value,unit},i)=>
    Number.isFinite(value)||i===activeMetric?[new Option(label+(Number.isFinite(value)?' ('+unit+')':''),i)]:[]));
  get('studio-variable').value=activeVariable;
  get('studio-metric').value=String(activeMetric);
  show('studio-variable-label',lesson.controls.length>1);
  show('studio-motion',lesson.group!==4);
  show('studio-playback',lesson.group!==4);
  show('studio-fill',filledLessons.has(lesson.id));
  pressed(get('studio-fill'),studioFill);
  show('studio-cutaway',lesson.cutaway||cutawayLessons.has(lesson.id));
  pressed(get('studio-cutaway'),cutaway);
  title('studio-fill',lesson.id===6?'Tô phần tăng thêm':'Tô thể tích đến lát cắt');
  const water=waterLessons.has(lesson.id),walk=walkLessons.has(lesson.id),sample=Boolean(lesson.sample)||sampledMain.has(lesson.id);
  (sample||walk?get('prob-actions-slot'):get('sample-default-slot')).after(get('sample-action'));
  get('sample-action').classList.toggle('prob-actions',sample||walk);
  show('sample-action',sample||walk||water);
  title('sample-btn',water?'Bắt đầu bơm':walk?'Xem đường mẫu':'Thử 1 lần');
  get('sample-btn').className=sample?'primary':'outline';
  show('guided-btn',sample);
  show('batch-btn',sample);
  show('large-batch-btn',sample);
  show('walk-manual',walk);
  renderExperiment();
}
function renderPanel(){
  const group={problem:'formula',formula:'solution',solution:'practice'};
  const nextName={problem:'Lập công thức',formula:'Xem lời giải',solution:'Vào Tự giải'};
  for(const button of built('[data-tab]')) pressed(button,button.dataset.tab===tab);
  if(tab==='practice'){openPractice(lesson);return;}
  let body='';
  if(tab==='problem'){
    body='<p>'+lesson.prompt+'</p>';
    if(lesson.custom){
      body+='<ul class="problem-givens">'+lesson.problemData.map(line=>'<li>'+html(line)+'</li>').join('')+'</ul><p class="problem-question">'+html(lesson.problemQuestion)+'</p>';
      if(lesson.referenceProblem)body+='<details><summary>Mô hình chuẩn dùng làm mốc</summary><p>'+html(lesson.referenceProblem)+'</p></details>';
    }
    if(lesson.id===2&&!lesson.custom){
      body='<dl class="stadium-givens"><div><dt>Sức chứa</dt><dd>40.000 chỗ</dd></div><div><dt>Tăng 1.000 ₫</dt><dd>Giảm 100 khách</dd></div></dl><p>Khi vé miễn phí, sân đầy.</p>';
      body+='<div class="callout"><h3>Thử dự đoán</h3><p>Mức giá nào cho doanh thu cao hơn?</p><div class="callout-actions"><button type="button" class="outline" data-price="150">150.000 ₫</button><button type="button" class="outline" data-price="250">250.000 ₫</button></div></div>';
      body+='<div class="formula-preview"><h3>Công thức trọng tâm</h3><p><i>R</i>(<i>p</i>) = <i>p</i> × (40.000 − 100<i>p</i>)</p><small>Giá vé p và doanh thu R(p) tính theo nghìn đồng.</small></div>';
    }
  }else if(tab==='formula'){
    body=lesson.formula.map((line,i)=>'<button type="button" class="equation" data-equation="'+i+'" aria-pressed="false">'+line+'</button>').join('');
    const features=lessonFeatures(lesson);
    if(features.length)body+='<section class="formula-features"><h3>Xem đại lượng trong mô phỏng</h3><div class="feature-pills">'+features.map(([symbol,label],i)=>
      '<button type="button" class="outline" data-feature="'+i+'" aria-pressed="false" aria-label="'+html(symbol+' · '+label)+'" title="'+html(label)+'">'+html(symbol)+'</button>').join('')+'</div><p id="feature-description">Chọn một ký hiệu để xem phần tương ứng.</p></section>';
    body+='<details open><summary>Kiến thức cần ôn</summary><p>'+lesson.knowledge+'</p></details><p><a class="formula-jump" href="#cong-thuc-'+lesson.group+'">Xem kho công thức chuyên đề →</a></p>';
  }else if(tab==='solution'){
    body=lesson.steps.map((step,i)=>'<details '+(i===0?'open':'')+'><summary>'+(i+1)+'. '+step.title+'</summary><p>'+step.text+'</p></details>').join('');
    if(lesson.focusParameter!=null||!lesson.custom&&(lesson.id===2||lesson.id===11))body+='<button type="button" class="outline optimum" data-extreme>Xem vị trí tối ưu trên đồ thị</button>';
  }
  const next=!lesson.custom&&lesson.id===2&&tab==='problem'?'solution':group[tab];
  const caption=!lesson.custom&&lesson.id===2&&tab==='problem'?'Xem lời giải':nextName[tab];
  const advance=next?'<button type="button" class="primary" data-jump="'+next+'">'+caption+' <span aria-hidden="true">→</span></button>':'';
  get('content').innerHTML='<h2>'+titles[tab]+'</h2>'+body+advance;
}
function renderLabels(labels){
  const signature=JSON.stringify(labels.map(([text,,color])=>[text,color]));
  if(signature!==labelSignature){
    labelSignature=signature;
    const items=labels.map(([text,,color],index)=>{
      const item=document.createElement('li');
      const button=document.createElement('button');
      button.type='button';
      button.className='scene-label';
      button.dataset.labelIndex=index;
      button.textContent=text;
      if(color)button.style.setProperty('--label-tone',color);
      item.append(button);
      return item;
    });
    labelList.replaceChildren(...items);
  }
  for(const button of labelList.querySelectorAll('button'))pressed(button,Number(button.dataset.labelIndex)===selectedLabel);
  const hasLabels=labels.length>0||Boolean(get('scene-caption').textContent);
  show('toggle-labels',hasLabels);
  show('scene-labels',labelsVisible&&hasLabels);
}
function probabilityFrame(){
  if(walkLessons.has(lesson.id)){
    const choices=manualChoices();
    return {id:lesson.id,path:path?.slice(0,pathCursor+1),counts:walkHeat?walkCounts[path?.length?pathCursor:state.x]:null,
      targets:choices,hints:walkHints?choices.filter(remainingPaths):[],progress:replayProgress,registerTargets:points=>{walkHitPoints=points;}};
  }
  return lesson.group===4?trialFrame(lesson.id,state,trialResult,pathCursor,replayProgress):null;
}
function paintScene(viewZoom,options){
  const probability=probabilityFrame();
  return drawScene(canvas,lesson.mode,state,yaw,probability?.view,lesson.scene,viewZoom,elevation,labelsVisible?selectedLabel:-1,probability,{
    ...graphics,bounds:liveBounds.has(lesson.id)?undefined:graphics.bounds,orthographic:studioCamera==='front'||studioCamera==='side'||studioCamera==='top',mechanism:mechanismPosition,fill:studioFill,cutaway,feature:lessonFeatures(lesson)[selectedFeature]?.[2],projection,
    registerCoordinates:projection?renderCoordinates:undefined,
    motion:animating?{pump:true,time:performance.now()/1000}:sweepVisual,...options
  });
}
function redraw(){
  if(tab==='practice'||get('lesson-page').hidden||(lesson.group===4&&probView!=='model'))return;
  walkHitPoints=[];
  if(mode==='graph'){
    if(lesson.group!==4)drawStudioGraph();
    else if(lesson.plot)plotScene(canvas,lesson,state);
    return;
  }
  const labels=paintScene(zoom,{pan,variable:activeVariable,registerHandle:stageTool==='parameter'?positionHandle:undefined});
  if(labels&&(lesson.group!==4||replayProgress===1))renderLabels(labels);
}
function update(){
  for(const {key} of lesson.controls){
    const value=valueText(key,state[key]);
    get('value-'+key).value=value;
    const input=get('range-'+key);input.value=state[key];
    input.setAttribute('aria-valuetext',value);
  }
  for(const button of built('[data-price]'))pressed(button,Number(button.dataset.price)===state.x);
  const metrics=lesson.result(state);
  if(lesson.id===31)metrics[0]={...metrics[0],label:'Thể tích khi gấp xong'};
  if(lesson.id===3)metrics[0]={...metrics[0],label:'Chiều cao khi gấp xong'};
  if(lesson.id===66)metrics[0]={...metrics[0],label:'Độ cao tại góc thả'};
  get('metrics').style.setProperty('--columns',metrics.length);
  get('metrics').innerHTML=metrics.map(({label,value,unit},i)=>'<div class="'+(i===highlight?'selected':'')+'"><dt>'+label+'</dt><dd>'+(value===null?'—':fmt(value))+' <small>'+unit+'</small></dd></div>').join('');
  canvas.setAttribute('aria-label',(mode==='graph'?'Đồ thị ':'Mô hình ')+lesson.title+'. '+metrics.map(({label,value,unit})=>label+': '+(value===null?'':fmt(value)+' ')+unit).join('. '));
  get('prob-defaults').disabled=lesson.controls.every(c=>state[c.key]===c.value);
  if(lesson.group!==4)renderStudioControls(metrics);
  const reading=metrics[activeMetric];
  show('stage-reading',lesson.group!==4&&Boolean(reading));
  if(reading){
    title('stage-reading-label',reading.label);
    get('stage-reading-value').value=reading.value===null?reading.unit:fmt(Number(reading.value.toPrecision(6)))+' '+reading.unit;
  }
  title('studio-stage-label',mode==='graph'?'Đồ thị theo thông số':lesson.group===2?'Hệ trục Oxyz':'Mô phỏng 3D');
  title('studio-camera-label',mode==='graph'?'':get('studio-camera').selectedOptions[0]?.textContent??'');
  renderStageControls();
  renderMechanism();
  renderSectionLab();
  renderProjectionControl();
  redraw();
}
function renderSectionLab(){
  const visible=lesson.group===1&&tab!=='practice'&&(!lesson.approvedExpansion||Boolean(lesson.section));
  show('section-lab',visible);
  if(!visible)return;
  const key=sectionParameter(lesson),control=lesson.controls.find(c=>c.key===key);
  const reading=sectionReading(lesson,state),range=get('section-position');
  Object.assign(range,{min:control.min,max:control.max,step:control.step,value:state[key]});
  range.setAttribute('aria-valuetext',valueText(key,state[key]));
  title('section-title',reading.label);
  title('section-formula',reading.formula);
  get('section-area').value=fmt(reading.area)+' '+reading.unit;
  title('section-axis',control.label+' · '+valueText(key,state[key]));
  const chart=get('section-chart');
  chart.setAttribute('aria-label','Đồ thị diện tích mặt cắt theo '+control.label.toLowerCase()+'. Tại '+valueText(key,state[key])+', diện tích là '+fmt(reading.area)+' '+reading.unit+'.');
  const cache=[lesson.id,...lesson.controls.filter(c=>c.key!==key).map(c=>state[c.key])].join('|');
  if(cache!==sectionKey){sectionKey=cache;areaCurve=sectionCurve(lesson,state);}
  drawSectionChart(chart,areaCurve,state[key],reading.area);
}
function renderProjectionControl(){
  const shown=lesson.group===2&&tab!=='practice';
  show('studio-projection',shown);
  pressed(get('studio-projection'),projection);
  title('studio-projection',lesson.projectionLabel??'Hình chiếu Oxy');
  show('coordinate-readings',shown&&projection&&mode==='scene');
}
function renderCoordinates(points){
  const signature=JSON.stringify(points);
  if(signature===coordinateSignature)return;
  coordinateSignature=signature;
  get('coordinate-points').replaceChildren(...points.map(({label,actual,projected})=>{
    const item=document.createElement('li');
    const tuple=values=>'('+values.map(n=>fmt(Number(n.toPrecision(5)))).join('; ')+')';
    item.textContent=label+tuple(actual)+' → '+label+'′'+tuple(projected);
    return item;
  }));
}
function setMode(value){
  mode=value;
  if(value==='graph'){pauseReplay();stopCamera();}
  graphBounds=null;
  pressed(get('scene-btn'),mode==='scene');
  pressed(get('graph-btn'),mode==='graph');
  show('orbit',mode==='scene');
  show('studio-view-tools',mode==='scene');
  show('studio-graph-tools',mode==='graph'&&lesson.group!==4);
  canvas.tabIndex=mode==='scene'||lesson.group!==4?0:-1;
  gestures.reset();
  canvas.toggleAttribute('data-graph',mode==='graph'&&lesson.group!==4);
  show('scene-notes',mode==='scene');
  renderExperiment();
  const model=mode==='scene'?lesson.scene?.(state.x,state):null;
  const holdsWater=lesson.mode==='cone'||model?.lathe?.fill||model?.panels?.some(panel=>panel.highlight);
  const slice=(lesson.group===1&&lesson.mode!=='hourglass'&&(!lesson.approvedExpansion||Boolean(lesson.section)))||model?.arch?.cut!==undefined;
  const parts=[lesson.group===2?'Hệ trục Oxyz':'',holdsWater?'Mặt nước':slice?'Lát cắt':''];
  const caption=parts.filter(Boolean).join(' · ');
  title('scene-caption',mode==='graph'?'':lesson.id===2?'Khán giả / '+fmt(lesson.conditions?.seats??40000)+' chỗ':caption);
  canvas.toggleAttribute('data-drag',mode==='scene');
  update();
}
function setTab(value,focus=false,syncRoute=true){
  tab=value;highlight=-1;selectedLabel=-1;selectedFeature=-1;
  const practice=tab==='practice';
  if(practice){closeStageFocus(false);stopWater();stopSweep();stopCamera();stopMechanism();pauseReplay();}
  show('lab',!practice);
  show('edit-problem',!practice);
  get('lesson-page').classList.toggle('practice-page',practice);
  if(syncRoute){
    const route='#bai-'+lesson.id+(practice?'-tu-giai':'');
    if(practice||location.hash.endsWith('-tu-giai'))history.replaceState(null,'',route);
  }
  renderPanel();update();
  if(focus) get('tabs').querySelector('[data-tab="'+tab+'"]').focus();
}
function route(){
  closeStageFocus(false);
  if(problemDialog.open)problemDialog.close();
  gestures.reset();
  const hash=location.hash;
  const chapter=chapterRoutes.indexOf(hash);
  const newLibrary=hash==='#bai-moi';
  const isLibrary=hash==='#thu-vien'||newLibrary||chapter>=0;
  const isStudy=hash==='#on-tap';
  const formulaRoute=/^#cong-thuc(?:-([0-4]))?$/.exec(hash);
  show('formula-page',Boolean(formulaRoute));
  show('study-page',isStudy);
  get('study-link').toggleAttribute('aria-current',isStudy);
  get('formula-link').toggleAttribute('aria-current',Boolean(formulaRoute));
  show('library-page',isLibrary);
  show('lesson-page',!isLibrary&&!formulaRoute&&!isStudy);
  get('browse-link').toggleAttribute('aria-current',isLibrary);
  get('lesson-link').toggleAttribute('aria-current',!isLibrary&&!formulaRoute&&!isStudy);
  stopWater();stopSweep();stopCamera();stopMechanism();
  selectedLabel=-1;
  pauseReplay();
  if(isStudy){document.title='Tiến độ · Toán Lab 3D';renderProgress(storedLesson);return;}
  if(formulaRoute){
    document.title='Kho công thức · Toán Lab 3D';
    showFormulaLibrary(formulaRoute[1]);
    return;
  }
  if(isLibrary){
    document.title='Thư viện · Toán Lab 3D';
    if(chapter>=0||newLibrary){
      filter=chapter;collection=newLibrary?'new':'all';get('collection').value=collection;get('lesson-search').value='';
    }else filter=-1;
    renderLibrary();return;
  }
  const match=/^#bai-(\d+)(?:-(tu-giai|cong-thuc))?$/.exec(hash);
  const base=lessons[Number(match?.[1])-1]??lessons[1];
  lesson=storedLesson(base);
  mechanismPosition=mechanisms[lesson.id]?.initial;
  title('problem-status',lesson.custom?'Đề tùy chỉnh':'Đề mẫu');
  get('problem-status').classList.toggle('is-custom',Boolean(lesson.custom));
  get('lesson-link').href='#bai-'+lesson.id;
  state=initialState(lesson);
  graphics=sceneOptions(lesson);
  curveKey='';
  const quantities=lesson.result(state);
  activeVariable=lesson.id===131?'t':lesson.controls[0].key;
  activeMetric=(lesson.focusMetric??(lesson.custom&&Number.isFinite(quantities[lesson.custom.metric]?.value)?lesson.custom.metric:defaultMetrics[lesson.id]))??(lesson.group===1?0:Math.max(0,quantities.findLastIndex(m=>Number.isFinite(m.value))));
  studioFill=false;cutaway=false;projection=false;coordinateSignature='';sectionKey='';
  [yaw,elevation]=lesson.approvedExpansion||refinedLessons.has(lesson.id)?preferredCamera(lesson.id):cameraAngles.perspective;
  zoom=1;pan=[0,0];stageTool='orbit';sweepDirection=1;sweepLoop=false;
  setCameraSelection('perspective');
  get('lesson-page').dataset.chapter=String(lesson.group);
  show('studio-scene-heading',true);
  show('prob-setup-header',true);
  walkHeat=true;walkHints=false;
  probView='model';distributionScope='all';
  get('lab').classList.toggle('probability-lab',lesson.group===4);
  get('lesson-page').classList.toggle('probability-page',lesson.group===4);
  get('prob-distribution').open=true;
  resetTrials();
  title('group',groups[lesson.group]);title('title',lesson.title);title('tag',lesson.id===2&&!lesson.custom?'Đặt giá vé bao nhiêu để doanh thu lớn nhất?':lesson.tag);title('number','Bài '+two(lesson.id)+' / '+lessons.length);
  document.title=lesson.title+' · Toán Lab 3D';
  get('group').href=chapterRoutes[lesson.group];
  const chapterLessons=lessonsByChapter[lesson.group];
  const index=chapterLessons.indexOf(base);
  link('prev',chapterLessons[index-1]?.id??0,'left');
  link('next',chapterLessons[index+1]?.id??0,'right');
  show('graph-btn',lesson.group!==4||Boolean(lesson.plot));
  renderControls();setTab(match?.[2]==='tu-giai'?'practice':match?.[2]==='cong-thuc'?'formula':'problem',false,false);setMode('scene');
}
function resetTrials(){
  selectedLabel=-1;
  pauseReplay();
  trialResult=null;trialTrace=[];path=null;pathCursor=0;replayProgress=1;
  guided=false;recorded=false;revealed=0;
  observed=0;trials=0;qualified=0;
  walkMode='';
  if(walkLessons.has(lesson.id)){
    walkCounts=walkStages(lesson.id,state.x);
    walkBackwards=walkStages(lesson.id,state.x,walkTarget(lesson.id));
    mapStep=state.x;mapPlace=walkTarget(lesson.id);
  }
  distribution=lesson.group===4?(lesson.distribution?.(state)??outcomeDistribution(lesson.id,state,metricForExperiment())):null;
  frequencies=distribution?.rows.map(()=>0)??[];
  lastCategory=-1;
  title('sample-note','');
}
function metricForExperiment(){
  return lesson.experimentMetric??lesson.custom?.metric??lesson.result(state).length-1;
}
function currentEvent(){
  return lesson.event?.(state)??experimentEvent(lesson.id,metricForExperiment(),eventDescription(lesson.id,state));
}
function labStats(){
  const event=currentEvent(), readings=lesson.result(state);
  const theory=readings[metricForExperiment()];
  // An experiment outside the selected condition has no empirical denominator.
  const available=event.denominator?.some(i=>distribution.rows[i][1]>0)??true;
  return {settings:{...state},theory:available?theory:{...theory,value:null},trials,qualified,observed,event,
    conditional:Boolean(event.denominator)};
}
function setLabView(view,focus=false){
  if(view!=='model')pauseReplay();
  probView=view;
  renderExperiment();redraw();
  if(focus)get('prob-lab-bar').querySelector('[data-lab-view="'+view+'"]').focus();
}
function renderExperiment(){
  const isProbability=lesson.group===4;
  show('prob-lab-bar',isProbability);

  show('quan-game-tab',lesson.id===81);
  show('quan-game',lesson.id===81&&probView==='quan');
  show('prob-setup',probView!=='quan');
  if(lesson.id===81&&probView==='quan')renderQuanGame();
  show('model-panel',!isProbability||probView==='model');
  show('prob-results',isProbability&&probView==='results');
  show('prob-ab',isProbability&&probView==='compare');
  show('prob-summary-link',isProbability&&probView==='model'&&trials>0);
  renderReplay();renderWalk();
  if(lesson.group===4)renderStageControls();
  if(!isProbability)return;
  const walk=walkLessons.has(lesson.id),hasPath=Boolean(path?.length);
  const complete=Boolean(trialResult)&&pathCursor===trialTrace.length&&replayProgress===1;
  const judged=trialResult?classifyTrial(currentEvent(),trialResult,distribution.category(trialResult)):null;
  const verdict=judged&&!judged.qualified?'Ngoài điều kiện':judged?.success?'Đạt biến cố':'Chưa đạt biến cố';
  title('prob-lab-status',probView==='quan'?'Hai người chơi':walk?
    'Đích '+walkPlace(lesson.id,walkTarget(lesson.id))+' · '+state.x+' bước':
    probView==='model'&&complete?verdict:fmt(trials)+' lượt đã ghi');
  get('prob-lab-status').dataset.tone=complete&&judged?.success?'match':'neutral';
  for(const button of get('prob-lab-bar').querySelectorAll('button'))pressed(button,button.dataset.labView===probView);
  title('prob-results-tab',walk?'Bản đồ đường đi':'Kết quả');
  show('sample-reset',Boolean(trials)||path!==null||Boolean(trialResult));
  title('sample-reset',walk?'Xóa đường đi':'Xóa lượt thử');

  title('prob-title',walk?'Số đường đến từng vị trí':'Kết quả thí nghiệm');
  title('prob-event',walk?'Chọn số bước và một vị trí để xem cách cộng số đường.':'Biến cố · '+currentEvent().label);
  show('prob-verdict',!walk&&complete);
  title('prob-verdict',verdict);
  get('prob-verdict').dataset.tone=judged?.success?'match':'neutral';
  show('prob-replay-link',Boolean(trialResult));
  title('prob-replay-link',recorded?'Xem lượt cuối':'Tiếp tục lượt thử');
  show('prob-compare',!walk);
  show('prob-distribution',!walk);
  show('walk-map',walk);
  show('prob-empty',!walk&&trials===0);
  if(probView==='results'){
    if(walk)renderWalkMap(lesson.id,walkCounts,mapStep,mapPlace);
    else renderProbabilityResults(lesson,labStats(),distribution,frequencies,recorded?lastCategory:-1,distributionScope);
  }
  if(probView==='compare')renderComparison(lesson,baselines.get(lesson.id),labStats());

  const steps=trialResult?trialTrace.slice(0,revealed):hasPath?walkSteps(lesson.id,path):[];
  const trace=get('prob-trace');
  const oldScroll=trace.scrollLeft;
  show('prob-trace-area',probView==='model'&&mode==='scene'&&steps.length>0);
  title('prob-trace-title',walk?(walkMode==='manual'?'Đường bạn chọn':'Đường đi mẫu'):'Các bước đã quan sát');
  trace.replaceChildren(...steps.map(([label,value,tone],i)=>{
    const step=walk?i:i+1;
    const item=document.createElement('li'),name=document.createElement('span'),text=document.createElement('strong');
    const button=document.createElement('button');
    button.type='button';button.dataset.step=String(step);
    if(step===pathCursor)button.setAttribute('aria-current','step');
    item.dataset.tone=tone;name.textContent=label;text.textContent=value;
    button.append(name,text);item.append(button);
    return item;
  }));
  trace.scrollLeft=oldScroll;
  const current=trace.querySelector('[aria-current=step]');
  if(current&&trace.scrollWidth>trace.clientWidth&&
    (current.offsetLeft<oldScroll||current.offsetLeft+current.offsetWidth>oldScroll+trace.clientWidth)){
    trace.scrollLeft=Math.max(0,current.offsetLeft-12);
  }
}
function sampleOutcome(){
  return lesson.sample?(sampleCustomProbability(lesson.id,state)??lesson.sample(state)):samplePrimary(lesson.id,state);
}
function recordOutcome(result){
  lastCategory=distribution.category(result);
  frequencies[lastCategory]++;
  const judged=classifyTrial(currentEvent(),result,lastCategory);
  observed+=Number(judged.success);
  qualified+=Number(judged.qualified);
  trials++;
}
function runTrials(count,byStep=false){
  if(byStep)changeStageTool('orbit');
  pauseReplay();
  selectedLabel=-1;
  guided=byStep;recorded=count>1;revealed=0;
  for(let i=0;i<count;i++){
    trialResult=sampleOutcome();
    if(recorded)recordOutcome(trialResult);
  }
  trialTrace=trialSteps(lesson.id,trialResult);
  if(recorded)revealed=trialTrace.length;
  title('sample-note',byStep?'Bấm nút tên thao tác để thực hiện từng bước.':'');
  probView='model';
  if(mode==='graph')setMode('scene');
  moveReplay(recorded?trialTrace.length:0);
  if(recorded){setLabView('results',true);return;}
  if(byStep)get('replay-next').focus({preventScroll:true});
  else startReplay();
}
function exploreWalk(){
  pauseReplay();
  if(mode==='graph')setMode('scene');
  selectedLabel=-1;
  walkMode='example';
  path=walkExample(lesson.id,state.x);
  pathCursor=0;replayProgress=1;
  title('sample-note',path.length?'Đã tìm một đường hợp lệ. Bấm Phát hoặc Tiến để xem từng nước.':'Không có đường thỏa số bước này. Hãy đổi số bước rồi thử lại.');
  renderExperiment();redraw();
}
function replayLength(){
  return trialResult?trialTrace.length:Math.max(0,(path?.length??1)-1);
}
function renderReplay(){
  const open=lesson.group===4&&probView==='model'&&mode==='scene'&&(Boolean(trialResult)||(path?.length??0)>1);
  show('replay-controls',open);
  if(!open)return;
  const last=replayLength(), range=get('replay-range'), staged=guided&&!recorded;
  const moving=replayProgress<1;
  range.max=staged?revealed:last;
  range.value=Math.min(pathCursor,Number(range.max));
  range.disabled=Number(range.max)===0;
  const progressText=staged?'Bước '+pathCursor:'Bước '+pathCursor+' / '+(walkMode==='manual'?state.x:last);
  title('replay-step',progressText);
  const entry=trialResult?trialTrace[pathCursor-1]:walkSteps(lesson.id,path.slice(0,pathCursor+1)).at(-1);
  title('replay-description',moving&&trialResult?(trialResult.steps?.[pathCursor-1]?.[0]??trialAction(lesson.id,pathCursor,last)):
    entry?entry[0]+' · '+entry[1]:staged?'Sẵn sàng thực hiện bước đầu tiên.':'Trạng thái ban đầu');
  get('replay-controls').dataset.phase=moving?(replayPlaying?'playing':'paused'):'settled';
  const play=get('replay-play');
  show('replay-play',!staged||replayPlaying);
  play.disabled=last===0;
  title('replay-play',replayPlaying?'Tạm dừng':pathCursor===last?'Phát lại':'Phát');
  get('replay-back').disabled=pathCursor===0;
  const next=get('replay-next');
  next.disabled=(pathCursor===last&&!moving)||(staged&&replayPlaying);
  const index=moving?pathCursor:pathCursor+1;
  title('replay-next',staged&&index>revealed?(trialResult?.steps?.[index-1]?.[0]??trialAction(lesson.id,index,last)):'Tiến');
  next.className=staged?'primary':'outline';
}
function pauseReplay(){
  if(replayFrame)cancelAnimationFrame(replayFrame);
  replayFrame=0;replayStarted=null;replayPlaying=false;
}
function markRevealed(){
  if(!trialResult)return;
  revealed=Math.max(revealed,pathCursor);
  if(!recorded&&pathCursor===trialTrace.length){
    recordOutcome(trialResult);recorded=true;
    title('sample-note','');
  }
}
function moveReplay(step){
  pauseReplay();
  const limit=guided&&!recorded?revealed:replayLength();
  selectedLabel=-1;pathCursor=Math.min(limit,Math.max(0,step));
  replayProgress=1;
  markRevealed();
  renderExperiment();redraw();
}
function startReplay(single=guided&&!recorded){
  const last=replayLength();
  if(last===0)return;
  if(pathCursor===last&&replayProgress===1)pathCursor=0;
  if(replayProgress===1){pathCursor++;replayProgress=0;}
  if(reducedMotion()){
    if(!single)pathCursor=last;
    replayProgress=1;markRevealed();renderExperiment();redraw();
    return;
  }
  replayPlaying=true;replaySingle=single;
  const stepTime=lesson.id===81?1150:760;
  const duration=single?stepTime:Math.min(stepTime,(lesson.id===81?12500:10500)/last);
  renderExperiment();redraw();
  function tick(now){
    const stepDuration=duration/Number(get('replay-speed').value);
    if(replayStarted===null)replayStarted=now-replayProgress*stepDuration;
    replayProgress=Math.min(1,(now-replayStarted)/stepDuration);
    if(replayProgress===1){
      markRevealed();
      if(pathCursor===last||single){pauseReplay();renderExperiment();redraw();return;}
      pathCursor++;replayProgress=0;replayStarted=now;
      renderExperiment();
    }
    redraw();
    replayFrame=requestAnimationFrame(tick);
  }
  replayFrame=requestAnimationFrame(tick);
}
function nextReplay(){
  if(replayPlaying){moveReplay(pathCursor);return;}
  if(guided&&!recorded&&pathCursor<revealed&&replayProgress===1){moveReplay(pathCursor+1);return;}
  startReplay(true);
}
function remainingPaths(destination){
  return walkBackwards[state.x-pathCursor-1]?.[destination]??0;
}
function manualChoices(){
  if(walkMode!=='manual'||replayProgress<1||replayPlaying||pathCursor>=state.x)return [];
  return walkOptions(lesson.id,path[pathCursor]);
}
function renderWalk(){
  const visible=walkLessons.has(lesson.id)&&mode==='scene'&&probView==='model';
  show('walk-panel',visible);
  if(!visible)return;
  const id=lesson.id,target=walkTarget(id),stage=path?.length?pathCursor:state.x;
  pressed(get('walk-heat'),walkHeat);
  show('walk-hint',walkMode==='manual');
  pressed(get('walk-hint'),walkHints);
  title('walk-stage',fmt(walkCounts[stage][target])+' đường tới '+walkPlace(id,target)+' sau '+stage+' bước');
  const object=id===79?'lá':'ô';
  const location=path?.[pathCursor];
  const atTarget=location===target;
  const status=!path?.length?(walkHeat?'Dấu tròn càng lớn thì số đường tới vị trí đó càng nhiều.':'Đã ẩn số đường trên mô hình.'):
    walkMode==='manual'&&pathCursor<state.x?
      (replayProgress<1?'Đang di chuyển…':'Đang ở '+walkPlace(id,location)+' · chọn '+object+' sáng để đi tiếp.'):
      pathCursor===state.x?(atTarget?'Đã tới đích sau đúng '+stage+' bước.':'Đã đi đủ '+stage+' bước. Đích cần tới là '+walkPlace(id,target)+'.'):
      'Đang ở '+walkPlace(id,location)+' · bước '+stage+' / '+state.x+'.';
  title('walk-status',status);
  get('walk-choices').replaceChildren(...manualChoices().map(destination=>{
    const button=document.createElement('button');
    button.type='button';button.className='outline';button.dataset.destination=destination;
    const place=walkPlace(id,destination);
    const count=remainingPaths(destination);
    button.textContent=place;
    button.setAttribute('aria-label','Đi đến '+place);
    if(walkHints){
      const explanation=document.createElement('small');
      explanation.textContent=fmt(count)+' cách về đích';
      button.append(explanation);
      button.dataset.viable=String(count>0);
      button.setAttribute('aria-label','Đi đến '+place+' · '+fmt(count)+' cách về đích');
    }
    return button;
  }));
}
function startManualWalk(){
  changeStageTool('orbit');
  pauseReplay();
  if(mode==='graph')setMode('scene');
  walkMode='manual';path=[walkStart(lesson.id)];
  title('sample-note','');
  moveReplay(0);
}
function walkTo(destination){
  if(!manualChoices().includes(destination))return;
  path=path.slice(0,pathCursor+1).concat(destination);
  startReplay(true);
}
function renderMechanism(){
  const spec=mechanisms[lesson.id];
  show('mechanism-controls',Boolean(spec)&&mode==='scene'&&tab!=='practice');
  if(!spec)return;
  title('mechanism-label',spec.label);
  title('mechanism-play',mechanismFrame?'Tạm dừng':spec.play);
  get('mechanism-position').value=Math.round(mechanismPosition*100);
  const percent=Math.round(mechanismPosition*100)+'%';
  const value=spec.angle?Math.round(mechanismPosition*90)+'°':lesson.id===66?(()=>{
    const angle=swingAngle(state.x,mechanismPosition);
    const height=lesson.result({...state,x:Math.abs(angle)})[0].value;
    return percent+' · '+fmt(Number(height.toFixed(2)))+' m';
  })():lesson.id===121?percent+' · còn '+fmt(Number((3*state.x**2*(1-mechanismPosition)).toFixed(3)))+' m³':percent;
  get('mechanism-position').setAttribute('aria-valuetext',value);
  get('mechanism-value').value=value;
}
function stopMechanism(){
  if(mechanismFrame)cancelAnimationFrame(mechanismFrame);
  mechanismFrame=0;
}
function playMechanism(){
  if(mechanismFrame){stopMechanism();renderMechanism();return;}
  stopSweep();
  const spec=mechanisms[lesson.id];
  if(mechanismPosition===1||mechanismPosition===spec.initial)mechanismPosition=0;
  if(reducedMotion()){mechanismPosition=1;update();return;}
  let last=performance.now();
  function frame(now){
    mechanismPosition=Math.min(1,mechanismPosition+Math.max(0,now-last)/spec.duration);
    last=now;
    mechanismFrame=mechanismPosition<1?requestAnimationFrame(frame):0;
    renderMechanism();redraw();
  }
  mechanismFrame=requestAnimationFrame(frame);
  renderMechanism();redraw();
}
function stopWater(){
  if(animationId)cancelAnimationFrame(animationId);
  animationId=0;animating=false;
  if(waterLessons.has(lesson.id))title('sample-btn','Bắt đầu bơm');
}
function toggleWater(){
  stopSweep();
  if(animating){stopWater();title('sample-note','Đã tạm dừng.');redraw();return;}
  const {id,controls}=lesson,dimensions=lesson.conditions??{};
  const rate=id===5?state.q:dimensions.flow??(id===34?2:3);
  const {min,max}=controls[0];
  if(rate<=0){title('sample-note','Lưu lượng bằng 0. Mực nước giữ nguyên.');return;}
  if(state.x>=max)state.x=min;
  const done=id===35?'Nước vừa tới đầu cao của đáy bể.':id===34?'Đã tới mực nước tối đa của mô hình.':'Bể đã đầy. Bơm dừng.';
  if(reducedMotion()){state.x=max;update();title('sample-note',done);return;}
  let last=performance.now(),ui=last,minutes=0,volume=tankVolume(id,state.x,dimensions);
  animating=true;title('sample-btn','Tạm dừng');
  function frame(now){
    const delta=Math.min(.15,Math.max(0,(now-last)/1000));last=now;
    volume+=rate*delta;minutes+=delta;
    state.x=tankLevel(id,volume,max,dimensions);
    if(now-ui>85||state.x>=max){
      ui=now;update();
      title('sample-note','Đã bơm '+fmt(minutes)+' phút mô phỏng · thời gian tua nhanh 60×.');
    }else redraw();
    if(state.x<max)animationId=requestAnimationFrame(frame);
    else{stopWater();redraw();title('sample-note',done);}
  }
  animationId=requestAnimationFrame(frame);
}

function controlForStudio(){
  return lesson.controls.find(control=>control.key===activeVariable);
}
function renderStudioControls(metrics){
  const control=controlForStudio();
  const saved=studioBaselines.get(lesson.id);
  const metric=metrics[activeMetric];
  title('studio-graph-key','Ngang · '+control.label+' ('+control.unit+')  •  ● Hiện tại'+(saved&&sameOtherSettings(saved)?'  •  ● Mốc A':''));
  title('studio-motion-info',sweepActive?'Đang thay đổi '+control.label.toLowerCase()+' · '+valueText(control.key,state[control.key]):
    'Chọn mốc để thay đổi '+control.label.toLowerCase()+'.');
  const scrub=get('studio-scrub');
  scrub.min=control.min;scrub.max=control.max;scrub.step=control.step;scrub.value=state[control.key];
  scrub.setAttribute('aria-valuetext',valueText(control.key,state[control.key]));
  title('studio-timeline-label',control.label);
  get('studio-timeline-value').value=valueText(control.key,state[control.key]);
  title('studio-direction',sweepDirection>0?'Tăng dần':'Giảm dần');
  get('studio-direction').setAttribute('aria-label',sweepDirection>0?'Đổi hướng phát sang giảm':'Đổi hướng phát sang tăng');
  pressed(get('studio-loop'),sweepLoop);
  for(const button of get('studio-jumps').querySelectorAll('button')){
    pressed(button,state[control.key]===control[button.dataset.jumpValue]);
  }
  show('studio-clear-baseline',Boolean(saved));
  show('studio-baseline-info',Boolean(saved));
  title('studio-baseline',saved?'Cập nhật mốc A':'Đánh dấu mốc A');
  if(!saved)return;
  const original=lesson.result(saved)[activeMetric];
  const comparable=Number.isFinite(metric.value)&&Number.isFinite(original.value)&&metric.unit===original.unit;
  const delta=comparable?metric.value-original.value:0;
  title('studio-baseline-info','A · '+lesson.controls.map(c=>valueText(c.key,saved[c.key])).join(' · ')
    +(comparable?'  |  '+metric.label+' thay đổi '+(delta>1e-10?'+':'')+fmt(delta)+' '+metric.unit:''));
}
function sameOtherSettings(saved){
  return lesson.controls.every(c=>c.key===activeVariable||state[c.key]===saved[c.key]);
}
function drawStudioGraph(){
  const signature=[lesson.id,activeVariable,activeMetric,...lesson.controls.filter(c=>c.key!==activeVariable).map(c=>state[c.key])].join('|');
  if(signature!==curveKey){
    curveCache=makeCurve(lesson,state,activeVariable,activeMetric);
    curveKey=signature;
  }
  const saved=studioBaselines.get(lesson.id);
  const point=values=>[values[activeVariable],lesson.result(values)[activeMetric].value];
  graphBounds=drawParameterGraph(canvas,curveCache,point(state),saved&&sameOtherSettings(saved)?point(saved):null,graphics.accent);
}
function stopSweep(){
  if(sweepFrame)cancelAnimationFrame(sweepFrame);
  sweepFrame=0;sweepActive=false;sweepVisual=null;
  title('studio-play','Phát biến thiên');
  pressed(get('studio-play'),false);
}
function startSweep(){
  if(sweepActive){stopSweep();update();return;}
  if(waterLessons.has(lesson.id)){stopWater();title('sample-note','');}
  stopMechanism();
  const control=controlForStudio(),key=control.key;
  const start=sweepDirection>0?control.min:control.max;
  const end=sweepDirection>0?control.max:control.min;
  const span=control.max-control.min;
  if(!span||reducedMotion()){state[key]=end;update();return;}
  if(state[key]===end){
    if(sweepLoop)sweepDirection*=-1;
    else state[key]=start;
  }
  const bounce=lesson.id===15&&key==='x';
  const ratio=(lesson.conditions?.bounce??10)/100;
  const clock=bounce?{min:0,max:bounceClock(control.max,ratio)}:control;
  const duration=bounce?Math.sqrt(2*(lesson.conditions?.height??55.8)/9.81)*clock.max:
    lesson.id===16&&key==='x'?span:8.75;
  let raw=bounce?bounceClock(state[key],ratio):state[key],last=performance.now();
  sweepActive=true;
  title('studio-play','Tạm dừng');pressed(get('studio-play'),true);
  function tick(now){
    const speed=Number(get('studio-speed').value);
    const direction=sweepDirection;
    const travel=(clock.max-clock.min)*Math.min(Math.max(0,now-last),80)*speed/(1000*duration);
    const step=advancePlayback(raw,travel,clock,direction,sweepLoop);
    raw=step.raw;sweepDirection=step.direction;last=now;
    const parameter=bounce?bounceFrame(raw,ratio,control.max):raw;
    sweepVisual={key,raw:parameter,time:now/1000,direction:sweepDirection};
    const value=bounce?Math.floor(parameter):snapControl(control,parameter);
    if(step.done){state[key]=bounce?parameter:snapControl(control,parameter);stopSweep();update();return;}
    if(state[key]!==value||direction!==sweepDirection){state[key]=value;update();}
    else if(([5,10,11,15,16,58,62].includes(lesson.id)||lesson.approvedExpansion&&!lesson.discrete?.includes(key))&&mode==='scene')redraw();
    sweepFrame=requestAnimationFrame(tick);
  }
  update();sweepFrame=requestAnimationFrame(tick);
}
function selectVariable(key){
  activeVariable=key;
  get('studio-variable').value=key;
  get('stage-variable').value=key;
}
function setParameter(control,raw){
  const next=snapControl(control,raw);
  if(next===state[control.key]&&!sweepActive&&!animating)return;
  stopSweep();stopWater();
  if(waterLessons.has(lesson.id))title('sample-note','');
  state[control.key]=next;
  if(lesson.group===4){resetTrials();renderExperiment();}
  update();
}
function stageCanAct(){
  return lesson.group===4&&guided&&!recorded&&Boolean(trialResult)&&!replayPlaying&&!get('replay-next').disabled;
}
function renderStageControls(){
  const inScene=mode==='scene';
  const editing=inScene&&stageTool==='parameter';
  stageSurface.dataset.tool=stageTool;
  title('drag-hint',editing?'Điều chỉnh trên mô hình':stageTool==='pan'?'Dịch khung mô hình':'Kéo hình để xoay');
  stageSurface.toggleAttribute('data-action',inScene&&stageTool==='orbit'&&stageCanAct());
  show('stage-handle',editing);
  show('stage-zoom',inScene);
  for(const button of get('stage-tools').querySelectorAll('button'))pressed(button,button.dataset.stageTool===stageTool);
  show('stage-hint',editing||stageTool==='pan'||(inScene&&stageCanAct()));
  show('stage-variable-label',editing&&lesson.controls.length>1);
  show('stage-param-value',editing);
  if(editing){
    const control=controlForStudio();
    const value=valueText(control.key,state[control.key]);
    title('stage-hint-text','Kéo ngang điểm sáng để đổi '+control.label.toLowerCase()+'.');
    get('stage-param-value').value=value;
    stageHandle.setAttribute('aria-label',control.label);
    stageHandle.setAttribute('aria-valuemin',control.min);
    stageHandle.setAttribute('aria-valuemax',control.max);
    stageHandle.setAttribute('aria-valuenow',state[control.key]);
    stageHandle.setAttribute('aria-valuetext',value);
  }else{
    title('stage-hint-text',stageTool==='pan'?'Kéo trên khung để dịch chuyển góc nhìn.':
      stageCanAct()?'Bấm vào mô hình để thực hiện bước đang chờ.':'');
  }
}
function positionHandle([x,y]){
  const inset=23;
  const left=Number.isFinite(x)?Math.max(inset,Math.min(canvas.clientWidth-inset,x)):canvas.clientWidth*.5;
  const top=Number.isFinite(y)?Math.max(inset,Math.min(canvas.clientHeight-inset,y)):canvas.clientHeight*.5;
  stageHandle.style.left=left+'px';
  stageHandle.style.top=top+'px';
}
function changeStageTool(tool){
  gestures.reset();stageTool=tool;
  renderStageControls();redraw();
}
function setCameraSelection(camera){
  studioCamera=camera;
  get('studio-camera').value=camera;
  title('studio-camera-label',get('studio-camera').selectedOptions[0]?.textContent??'');
  updateCameraButtons();
}
function stopCamera(){
  if(cameraFrame)cancelAnimationFrame(cameraFrame);
  cameraFrame=0;
}
function animateCamera(targetYaw,targetElevation,targetZoom,targetPan){
  stopCamera();
  const standard=lesson.mode==='stadium'?.61:.49;
  function finish(){
    yaw=targetYaw;elevation=targetElevation;zoom=targetZoom;pan=targetPan;cameraFrame=0;
    updateCameraButtons();redraw();
  }
  if(reducedMotion()){finish();return;}
  const start=performance.now(),fromYaw=yaw,fromElevation=elevation??standard,fromZoom=zoom,fromPan=pan;
  const turn=Math.atan2(Math.sin(targetYaw-yaw),Math.cos(targetYaw-yaw));
  function tick(now){
    const t=Math.min(1,Math.max(0,(now-start)/300)),eased=t*t*(3-2*t);
    if(t>=1){finish();return;}
    yaw=fromYaw+turn*eased;
    elevation=fromElevation+((targetElevation??standard)-fromElevation)*eased;
    zoom=fromZoom+(targetZoom-fromZoom)*eased;
    pan=fromPan.map((value,i)=>value+(targetPan[i]-value)*eased);
    cameraFrame=requestAnimationFrame(tick);
    updateCameraButtons();redraw();
  }
  cameraFrame=requestAnimationFrame(tick);
}
function selectCamera(camera){
  const [targetYaw,targetElevation]=camera==='perspective'&&(lesson.approvedExpansion||refinedLessons.has(lesson.id))?preferredCamera(lesson.id):cameraAngles[camera];
  setCameraSelection(camera);
  animateCamera(targetYaw,targetElevation,1,[0,0]);
}
function frameModel(){
  if(mode!=='scene')return;
  let bounds;
  paintScene(1,{measure:value=>{bounds=value;}});
  const framed=fitView(bounds,canvas.clientWidth,canvas.clientHeight);
  if(framed)animateCamera(yaw,elevation,framed.zoom,framed.pan);
}
function openStageFocus(){
  if(stageFocus.open)return;
  stageFocus.append(get('model-panel'));
  show('stage-close',true);show('stage-full',false);
  stageFocus.showModal();
  get('stage-close').focus();
  if(mode==='scene')frameModel();
  else redraw();
}
function closeStageFocus(focus=true){
  if(!stageFocus.open)return;
  stageFocus.close();
  get('prob-setup').before(get('model-panel'));
  show('stage-close',false);show('stage-full',true);
  gestures.reset();
  if(focus){
    get('stage-full').focus({preventScroll:true});
    if(mode==='scene')frameModel();
    else redraw();
  }
}
function relativeToFrame(x,y){
  const {left,top,width,height}=canvas.getBoundingClientRect();
  return [x-left-width/2,y-top-height/2];
}
function zoomFrame(amount,at=[0,0],shift=[0,0]){
  const next=zoomAt({zoom,pan},amount,at);
  zoom=next.zoom;pan=next.pan.map((value,i)=>value+shift[i]);
  updateCameraButtons();redraw();
}
const gestures=bindStageGestures(canvas,stageHandle,{
  enabled:()=>mode==='scene',
  start:stopCamera,
  mode:()=>stageTool,
  control:()=>({control:controlForStudio(),origin:state[activeVariable]}),
  slide:({control,origin},delta)=>setParameter(control,origin+delta*(control.max-control.min)/Math.max(130,canvas.clientWidth*.65)),
  pan:(dx,dy)=>{pan=[pan[0]+dx,pan[1]+dy];redraw();},
  orbit:(dx,dy,touch)=>{
    yaw+=dx*.011;
    if(!touch||stageFocus.open){
      const standard=lesson.mode==='stadium'?.61:.49;
      elevation=Math.min(1.535,Math.max(.17,(elevation??standard)-dy*.006));
    }
    setCameraSelection('custom');redraw();
  },
  pinch:(factor,previous,next)=>zoomFrame(factor,relativeToFrame(...previous),next.map((value,i)=>value-previous[i]))
});
function saveSceneImage(){
  if(canvas.width<2||canvas.height<2)return;
  const copy=document.createElement('canvas');
  const scale=canvas.width/canvas.clientWidth;
  const footer=Math.round(50*scale);
  copy.width=canvas.width;copy.height=canvas.height+footer;
  const c=copy.getContext('2d');
  const grad=c.createLinearGradient(0,0,copy.width,canvas.height);
  const theme=getComputedStyle(get('lesson-page'));
  grad.addColorStop(0,theme.getPropertyValue('--stage-light').trim());
  grad.addColorStop(1,theme.getPropertyValue('--stage-dark').trim());
  c.fillStyle=grad;c.fillRect(0,0,copy.width,copy.height);
  c.drawImage(canvas,0,0);
  c.fillStyle='#d8eee3';c.font='600 '+13*scale+'px system-ui';
  c.fillText('Toán Lab 3D  ·  '+lesson.title,16*scale,canvas.height+29*scale,copy.width-32*scale);
  const id=lesson.id;
  copy.toBlob(blob=>{
    if(!blob)return;
    const anchor=document.createElement('a'),url=URL.createObjectURL(blob);
    anchor.href=url;anchor.download='toan-lab-3d-bai-'+id+'.png';
    anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
  },'image/png');
}

get('section-position').addEventListener('input',event=>{
  const key=sectionParameter(lesson);
  selectVariable(key);
  setParameter(controlForStudio(),Number(event.target.value));
});
get('studio-projection').addEventListener('click',()=>{
  projection=!projection;
  update();
});
get('studio-play').addEventListener('click',startSweep);
get('mechanism-play').addEventListener('click',playMechanism);
get('mechanism-position').addEventListener('input',event=>{
  stopMechanism();
  stopSweep();
  mechanismPosition=Number(event.target.value)/100;
  renderMechanism();redraw();
});
get('studio-scrub').addEventListener('input',event=>setParameter(controlForStudio(),Number(event.target.value)));
get('studio-direction').addEventListener('click',()=>{sweepDirection*=-1;update();});
get('studio-loop').addEventListener('click',()=>{sweepLoop=!sweepLoop;update();});
get('stage-tools').addEventListener('click',event=>{
  const tool=event.target.closest('button')?.dataset.stageTool;
  if(tool)changeStageTool(tool);
});
get('stage-variable').addEventListener('change',event=>{stopSweep();selectVariable(event.target.value);update();});
get('stage-fit').addEventListener('click',frameModel);
get('stage-full').addEventListener('click',openStageFocus);
get('stage-close').addEventListener('click',()=>closeStageFocus());
stageFocus.addEventListener('cancel',event=>{event.preventDefault();closeStageFocus();});
canvas.addEventListener('wheel',event=>{
  if(mode!=='scene'||!event.shiftKey)return;
  event.preventDefault();stopCamera();
  zoomFrame(Math.exp(Math.max(-240,Math.min(240,-event.deltaY))*.0027),relativeToFrame(event.clientX,event.clientY));
},{passive:false});
get('studio-variable').addEventListener('change',event=>{
  stopSweep();selectVariable(event.target.value);update();
});
get('studio-metric').addEventListener('change',event=>{activeMetric=Number(event.target.value);update();});
get('studio-jumps').addEventListener('click',event=>{
  const jump=event.target.closest('button')?.dataset.jumpValue;
  if(jump){const control=controlForStudio();setParameter(control,control[jump]);}
});
get('studio-baseline').addEventListener('click',()=>{
  studioBaselines.set(lesson.id,{...state});update();
});
get('studio-clear-baseline').addEventListener('click',()=>{
  studioBaselines.delete(lesson.id);update();get('studio-baseline').focus();
});
get('studio-camera').addEventListener('change',event=>selectCamera(event.target.value));
get('studio-cutaway').addEventListener('click',()=>{
  cutaway=!cutaway;pressed(get('studio-cutaway'),cutaway);redraw();
});
get('studio-fill').addEventListener('click',()=>{
  studioFill=!studioFill;pressed(get('studio-fill'),studioFill);redraw();
});
get('studio-image').addEventListener('click',saveSceneImage);

get('toggle-labels').addEventListener('click',()=>{
  labelsVisible=!labelsVisible;
  selectedLabel=-1;
  get('toggle-labels').setAttribute('aria-expanded',String(labelsVisible));
  title('toggle-labels',labelsVisible?'Ẩn chú thích':'Hiện chú thích');
  redraw();
});
labelList.addEventListener('click',event=>{
  const button=event.target.closest('button[data-label-index]');
  if(!button)return;
  const index=Number(button.dataset.labelIndex);
  selectedLabel=selectedLabel===index?-1:index;
  redraw();
});

get('scene-btn').addEventListener('click',()=>setMode('scene'));
get('graph-btn').addEventListener('click',()=>setMode('graph'));
function updateCameraButtons(){
  pressed(get('top-view'),studioCamera==='top'||(studioCamera==='custom'&&elevation!==null&&elevation>1.4));
  get('orbit').querySelector('[data-zoom="-1"]').disabled=zoom<=zoomLimits[0];
  get('orbit').querySelector('[data-zoom="1"]').disabled=zoom>=zoomLimits[1];
  get('stage-zoom').value=fmt(Math.round(zoom*100))+'%';
}
get('orbit').addEventListener('click',event=>{
  const button=event.target.closest('button');
  if(!button)return;
  if(button.id==='reset-view'){selectCamera('perspective');return;}
  if(button.id==='top-view'){selectCamera(studioCamera==='top'?'perspective':'top');return;}
  stopCamera();
  if(button.dataset.turn){yaw+=Number(button.dataset.turn)*.24;setCameraSelection('custom');}
  if(button.dataset.zoom){zoomFrame(Number(button.dataset.zoom)>0?1.2:1/1.2);return;}
  updateCameraButtons();redraw();
});
canvas.addEventListener('click',e=>{
  const rect=canvas.getBoundingClientRect();
  if(mode==='graph'&&graphBounds&&lesson.group!==4){
    const {left,right,top,bottom}=graphBounds;
    const x=e.clientX-rect.left,y=e.clientY-rect.top;
    if(x>=left&&x<=right&&y>=top&&y<=bottom){
      const control=controlForStudio();
      setParameter(control,control.min+(control.max-control.min)*(x-left)/(right-left));
    }
    return;
  }
  if(gestures.dragged()||stageTool!=='orbit')return;
  if(stageCanAct()){nextReplay();return;}
  if(!walkHitPoints.length)return;
  const x=e.clientX-rect.left,y=e.clientY-rect.top;
  const nearest=walkHitPoints.map(([at,a,b,r])=>({at,r,distance:Math.hypot(x-a,y-b)}))
    .filter(point=>point.distance<=point.r).sort((a,b)=>a.distance-b.distance)[0];
  if(nearest)walkTo(nearest.at);
});
function parameterKey(event){
  const control=controlForStudio(),value=state[control.key];
  const steps={ArrowLeft:value-control.step,ArrowDown:value-control.step,ArrowRight:value+control.step,ArrowUp:value+control.step,Home:control.min,End:control.max};
  if(!Object.hasOwn(steps,event.key))return false;
  event.preventDefault();setParameter(control,steps[event.key]);
  return true;
}
stageHandle.addEventListener('keydown',parameterKey);
canvas.addEventListener('keydown',event=>{
  if(mode==='graph'){
    if(lesson.group!==4)parameterKey(event);
    return;
  }
  if(stageTool==='parameter'&&parameterKey(event))return;
  if(event.key==='+'||event.key==='='||event.key==='-'){
    event.preventDefault();stopCamera();zoomFrame(event.key==='-'?1/1.2:1.2);
    return;
  }
  if(event.key==='Home'){event.preventDefault();frameModel();return;}
  if((event.key==='Enter'||event.key===' ')&&stageCanAct()){
    event.preventDefault();nextReplay();return;
  }
  const delta={ArrowLeft:[-20,0],ArrowRight:[20,0],ArrowUp:[0,-20],ArrowDown:[0,20]}[event.key];
  if(!Array.isArray(delta))return;
  event.preventDefault();stopCamera();
  if(event.shiftKey||stageTool==='pan')pan=pan.map((value,i)=>value+delta[i]);
  else{
    yaw+=delta[0]*.011;
    elevation=Math.min(1.535,Math.max(.17,(elevation??.49)-delta[1]*.006));
    setCameraSelection('custom');
  }
  redraw();
});
get('sliders').addEventListener('input',e=>{
  if(!e.target.dataset.key)return;
  const key=e.target.dataset.key,value=Number(e.target.value);
  selectVariable(key);setParameter(controlForStudio(),value);
});
get('tabs').addEventListener('click',e=>{if(e.target.dataset.tab)setTab(e.target.dataset.tab);});
get('lesson-search').addEventListener('input',renderResults);
get('collection').addEventListener('change',e=>{collection=e.target.value;renderResults();});
get('filters').addEventListener('click',e=>{
  if(e.target.dataset.filter===undefined)return;
  filter=Number(e.target.dataset.filter);renderLibrary();
  get('filters').querySelector('[data-filter="'+filter+'"]').focus();
});
function editorField(section,key,field,value){
  const id='edit-'+section+'-'+key;
  const domain=section==='conditions'?'Khoảng '+fmt(field.min)+' đến '+fmt(field.max):'';
  return '<label class="editor-field" for="'+id+'"><span>'+html(field.label)+(field.unit?' <small>'+html(field.unit)+'</small>':'')+'</span>'
    +'<input id="'+id+'" data-field="'+section+'.'+key+'" inputmode="decimal" type="text" value="'+html(value)+'" aria-describedby="'+id+'-hint">'
    +'<small id="'+id+'-hint" class="editor-hint">'+domain+'</small></label>';
}
function openEditor(){
  editingBase=lesson.base??lesson;
  const draft=draftFor(editingBase,lesson.custom);
  title('problem-lesson','Bài '+two(lesson.id)+' · '+lesson.title);
  const extra=Object.entries(studyProblem(editingBase)?.conditions??{});
  const fields=(name,items)=>'<fieldset><legend>'+name+'</legend><div class="editor-grid">'+items.join('')+'</div></fieldset>';
  get('problem-fields').innerHTML=fields('Thông số khởi đầu',editingBase.controls.map(field=>editorField('parameters',field.key,field,draft.parameters[field.key])))
    +(extra.length?fields('Điều kiện của mô hình',extra.map(([key,field])=>editorField('conditions',key,field,draft.conditions[key]))):'');
  get('problem-metric').replaceChildren(...goalOptions(editingBase).map((label,i)=>new Option(label,i)));
  get('problem-metric').value=String(draft.metric);
  get('editor-reset').hidden=!lesson.custom;
  refreshEditor(false);
  problemDialog.showModal();
}
function refreshEditor(reportErrors){
  const draft={parameters:{},conditions:{},metric:get('problem-metric').value};
  const fields=[...get('problem-fields').querySelectorAll('input[data-field]')];
  for(const field of fields){
    const [section,key]=field.dataset.field.split('.');
    draft[section][key]=field.value;
  }
  const checked=validateDraft(editingBase,draft);
  for(const field of fields){
    const error=checked.errors[field.dataset.field];
    const [section,key]=field.dataset.field.split('.');
    const schema=section==='conditions'?studyProblem(editingBase).conditions[key]:editingBase.controls.find(c=>c.key===key);
    const [min,max]=checked.domains[key]??[schema.min,schema.max];
    field.setAttribute('aria-invalid',String(Boolean(error)));
    title(field.id+'-hint',error??((section==='parameters'?'Khoảng mô phỏng ':'Khoảng nhập ')+fmt(min)+' đến '+fmt(max)));
  }
  const invalid=checked.relationship||Object.keys(checked.errors).length;
  show('problem-errors',Boolean(checked.relationship)||reportErrors&&Boolean(invalid));
  title('problem-errors',checked.relationship||'Kiểm tra các ô có thông báo bên dưới.');
  const preview=checked.data?instantiateProblem(editingBase,checked.data):null;
  title('problem-draft-preview',preview?preview.problemQuestion:'Điền hợp lệ các thông số để xem câu hỏi.');
  if(reportErrors&&invalid)fields.find(field=>checked.errors[field.dataset.field])?.focus();
  return checked.data;
}
function useProblem(data){
  const id=editingBase.id;
  resetPracticeSelection(id);
  if(data)customProblems.set(id,data);
  else customProblems.delete(id);
  const stored=persistCustomProblems(customProblems);
  baselines.delete(id);
  studioBaselines.delete(id);
  problemDialog.close();
  route();
  get('edit-problem').focus();
  if(!stored)title('problem-status',data?'Đề tùy chỉnh · chỉ lưu trong phiên này':'Đề mẫu · trình duyệt không lưu thay đổi');
}
get('edit-problem').addEventListener('click',openEditor);
get('editor-close').addEventListener('click',()=>problemDialog.close());
get('editor-reset').addEventListener('click',()=>useProblem(null));
get('problem-form').addEventListener('input',()=>refreshEditor(false));
get('problem-form').addEventListener('submit',event=>{
  event.preventDefault();
  const data=refreshEditor(true);
  if(data)useProblem(data);
});
get('content').addEventListener('click',e=>{
  const button=e.target.closest('button');
  if(!button)return;
  const data=button.dataset;
  if(data.jump){setTab(data.jump,true);return;}
  if(data.price)setParameter(lesson.controls[0],Number(data.price));
  if(data.extreme!==undefined){
    selectVariable('x');
    activeMetric=lesson.id===11?0:1;get('studio-metric').value=String(activeMetric);
    if(lesson.custom&&lesson.focusParameter!=null){
      stopSweep();
      state.x=lesson.focusParameter;
      activeMetric=lesson.focusMetric;
      get('studio-metric').value=String(activeMetric);
    }else setParameter(lesson.controls[0],lesson.id===11?12:200);
    setMode('graph');
  }
  if(data.feature!==undefined){
    const index=Number(data.feature);
    const [,description,feature,metric]=lessonFeatures(lesson)[index];
    const toggled=selectedFeature!==index;
    selectedFeature=toggled?index:-1;
    for(const pill of built('[data-feature]'))pressed(pill,toggled&&pill===button);
    title('feature-description',toggled?description:'Chọn một ký hiệu để xem phần tương ứng.');
    if(feature==='graph'&&toggled){
      activeMetric=metric;get('studio-metric').value=String(metric);
      setMode('graph');
    }else if(feature==='event'&&toggled){
      setLabView('results');
      if(distribution&&currentEvent().denominator){distributionScope='qualified';renderExperiment();}
    }else if(feature==='projection'){
      projection=toggled;setMode('scene');
    }else if(feature==='slice'&&toggled){
      if(lesson.group===1)selectVariable(sectionParameter(lesson));
      changeStageTool('parameter');setMode('scene');
    }else if(toggled)setMode('scene');
    else update();
    return;
  }
  if(data.equation!==undefined){
    const index=Number(data.equation);
    highlight=highlight===index?-1:index;
    for(const el of built('[data-equation]'))pressed(el,el===button&&highlight>=0);
    if(lesson.id===2&&!lesson.custom&&highlight>=0){
      activeMetric=index;get('studio-metric').value=String(activeMetric);setMode(index===0?'scene':'graph');
    }else update();
  }
});
get('sample-btn').addEventListener('click',()=>{
  if(waterLessons.has(lesson.id))toggleWater();
  else if(walkLessons.has(lesson.id))exploreWalk();
  else runTrials(1);
});
get('batch-btn').addEventListener('click',()=>runTrials(100));
get('large-batch-btn').addEventListener('click',()=>runTrials(1000));
get('guided-btn').addEventListener('click',()=>runTrials(1,true));
get('prob-lab-bar').addEventListener('click',event=>{
  const view=event.target.closest('button')?.dataset.labView;
  if(view)setLabView(view);
});
get('prob-summary-link').addEventListener('click',()=>setLabView('results',true));
get('prob-replay-link').addEventListener('click',()=>{
  if(mode==='graph')setMode('scene');
  setLabView('model',true);
});
get('prob-scope').addEventListener('click',event=>{
  const scope=event.target.closest('button')?.dataset.scope;
  if(scope){distributionScope=scope;renderExperiment();}
});
get('walk-map-range').addEventListener('input',event=>{
  mapStep=Number(event.target.value);
  renderWalkMap(lesson.id,walkCounts,mapStep,mapPlace);
});
get('walk-map-cells').addEventListener('click',event=>{
  const cell=event.target.closest('[data-place]');
  if(!cell)return;
  mapPlace=Number(cell.dataset.place);
  renderWalkMap(lesson.id,walkCounts,mapStep,mapPlace);
  get('walk-map-cells').children[mapPlace].focus({preventScroll:true});
});
get('prob-ab-save').addEventListener('click',()=>{
  baselines.set(lesson.id,labStats());renderExperiment();
});
get('prob-ab-clear').addEventListener('click',()=>{
  baselines.delete(lesson.id);renderExperiment();get('prob-ab-save').focus();
});
function applyParameters(settings){
  if(lesson.controls.every(c=>state[c.key]===settings[c.key]))return;
  stopWater();stopSweep();state={...settings};resetTrials();renderExperiment();update();
}
get('prob-ab-load').addEventListener('click',()=>applyParameters(baselines.get(lesson.id).settings));
get('prob-defaults').addEventListener('click',()=>applyParameters(initialState(lesson)));
get('walk-hint').addEventListener('click',()=>{
  walkHints=!walkHints;renderWalk();redraw();
});
get('walk-manual').addEventListener('click',startManualWalk);
get('walk-heat').addEventListener('click',()=>{
  walkHeat=!walkHeat;renderWalk();redraw();
});
get('walk-choices').addEventListener('click',event=>{
  const button=event.target.closest('button[data-destination]');
  if(button){walkTo(Number(button.dataset.destination));get('walk-stage').focus({preventScroll:true});}
});
get('prob-trace').addEventListener('click',event=>{
  const button=event.target.closest('button[data-step]');
  if(button){
    const index=Number(button.dataset.step);
    moveReplay(index);
    get('prob-trace').querySelector('[data-step="'+index+'"]')?.focus({preventScroll:true});
  }
});
get('sample-reset').addEventListener('click',()=>{
  resetTrials();renderExperiment();redraw();get('sample-btn').focus();
});
get('replay-back').addEventListener('click',()=>moveReplay(pathCursor-1));
get('replay-next').addEventListener('click',nextReplay);
get('replay-range').addEventListener('input',event=>moveReplay(Number(event.target.value)));
get('replay-speed').addEventListener('change',()=>{replayStarted=null;});
get('replay-play').addEventListener('click',()=>{
  if(replayPlaying){pauseReplay();renderExperiment();}
  else if(replayProgress<1)startReplay(replaySingle);
  else startReplay();
});
get('replay-controls').addEventListener('keydown',event=>{
  if(event.target.tagName==='INPUT'||event.target.tagName==='SELECT')return;
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
    event.preventDefault();
    if(event.key==='ArrowLeft')moveReplay(pathCursor-1);
    else if(!get('replay-next').disabled)nextReplay();
  }
});
window.addEventListener('hashchange',()=>{route();window.scrollTo(0,0);});
new ResizeObserver(redraw).observe(canvas);
new ResizeObserver(renderSectionLab).observe(get('section-chart'));
route();

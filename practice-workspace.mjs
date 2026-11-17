import {fmt} from './lessons.mjs';
import {practiceTasks,readProgress,writeProgress,recordKey,gradePractice,answerLabel,exerciseModel} from './practice.mjs';
import {drawScene} from './scene.mjs';
import {initialState,sceneOptions,snapControl} from './lesson-studio.mjs';
import {draftFor,validateDraft,instantiateProblem} from './problem-editor.mjs';
import {walkLessons,walkStages} from './probability-lab.mjs';

const get=id=>document.getElementById(id);
const html=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const feedback={
  correct:'Đúng rồi. Hãy đối chiếu cách làm của bạn với lời giải.',
  invalid:'Nhập một số hoặc chọn một đáp án. Ví dụ bạn có thể nhập 0,64.',
  unit:'Đơn vị chưa khớp. Kiểm tra đơn vị ghi cạnh ô trả lời rồi đổi lại kết quả.',
  percent:'Bạn có thể đang nhập xác suất dưới dạng thập phân. Hãy nhân với 100 để viết theo phần trăm.',
  round:'Kiểm tra chữ số ngay sau hàng cần làm tròn. Chỉ làm tròn ở bước cuối.',
  incorrect:'Kết quả chưa khớp. Hãy kiểm tra biểu thức, dữ kiện đã thế và đơn vị ở từng bước.'
};

const progress=readProgress();
let current,currentTask,record,allLessons;
let mistakesOnly=true,preview=null,previewObserver;
let saveError=false;
function save(){
  saveError=!writeProgress(progress);
  const status=get('practice-storage');
  if(status)status.textContent=saveError?'Trình duyệt hiện chỉ lưu tiến độ trong phiên này.':'Tiến độ được lưu trên trình duyệt này.';
}
function taskList(lesson){
  return practiceTasks(lesson);
}
function activate(lesson,task){
  current=lesson;
  currentTask=task;
  const id=recordKey(lesson.id,task);
  record=progress.records[id]??{draft:'',plan:'',hints:0,mistakes:0,grade:'',solved:false,revealed:false};
  progress.records[id]=record;
  if(task.configured)record.variant=lesson.custom;
  record.updated=Date.now();
  progress.selected[lesson.id]=task.key;
  progress.last={id:lesson.id,key:task.key};
  save();
  render();
}
export function resetPracticeSelection(id){
  delete progress.selected[id];
  save();
}

export function openPractice(lesson){
  const key=progress.selected[lesson.id];
  const saved=progress.records[lesson.id+'|'+key];
  const old=saved?.variant?archivedLesson(lesson,saved.variant):null;
  const use=old??lesson,tasks=taskList(use);
  activate(use,tasks.find(q=>q.key===key)??tasks[0]);
}

function archivedLesson(lesson,variant){
  const base=lesson.base??lesson;
  const {data}=validateDraft(base,draftFor(base,variant));
  return data?instantiateProblem(base,data):null;
}
function render(){
  const q=currentTask,tasks=taskList(current);
  const done=tasks.filter(task=>progress.records[recordKey(current.id,task)]?.solved).length;
  const selected=tasks.findIndex(task=>task.key===q.key);
  const inputs=q.choices?
    '<label for="answer">Chọn kết quả</label><select id="answer" required><option value="">Chọn một phương án</option>'+q.choices.map(option=>
      '<option value="'+html(option)+'" '+(record.draft===option?'selected':'')+'>'+html(option)+'</option>').join('')+'</select>':
    '<label for="answer">Đáp số'+(q.unit?' ('+html(q.unit)+')':'')+'</label><input id="answer" type="text" inputmode="decimal" autocomplete="off" value="'+html(record.draft)+'" placeholder="Nhập đáp số" required>'
    +(q.digits>0?'<small>Có thể nhập kết quả đầy đủ hoặc làm tròn '+q.digits+' chữ số thập phân.</small>':'');
  const hints=[q.first,q.expression,q.explanation];
  const explanations=record.hints?hints.slice(0,record.hints).map((text,i)=>
    '<li><strong>'+['Chọn ẩn','Lập biểu thức','Thay số'][i]+'</strong><p>'+html(text)+'</p></li>').join(''):'';
  const showSolution=record.solved||record.revealed;
  const model=showSolution?exerciseModel(current,q):null;
  get('content').innerHTML='<div class="practice-header"><div><h2>Tự giải</h2><p>'+done+'/'+tasks.length+' câu đã giải đúng</p></div><a class="formula-jump" href="#on-tap">Tiến độ và câu sai →</a></div>'
    +'<div class="practice-picker" aria-label="Chọn câu tự luyện">'+tasks.map((task,i)=>
      '<button type="button" class="outline" data-practice-task="'+i+'" aria-pressed="'+(selected===i)+'">Câu '+(i+1)+' · '+html(task.kind)+'</button>').join('')+'</div>'
    +'<section class="practice-question"><h3>Câu '+(selected+1)+' · '+html(q.kind)+'</h3>'
    +(q.context?'<p>'+html(q.context)+'</p>':'')+(q.givens?'<ul class="problem-givens">'+q.givens.map(line=>'<li>'+html(line)+'</li>').join('')+'</ul>':'')
    +'<p class="practice-prompt">'+html(q.question)+'</p></section>'
    +'<details class="practice-notes" '+(record.plan?'open':'')+'><summary>Dự đoán hoặc nháp cách làm</summary><label class="sr-only" for="practice-plan">Nháp cách làm</label><textarea id="practice-plan" rows="3" maxlength="1000" placeholder="Đại lượng nào cần tìm? Bạn định dùng công thức nào?">'+html(record.plan)+'</textarea></details>'
    +'<form class="answer practice-answer" id="guided-answer">'+inputs+'<button class="primary" type="submit">Kiểm tra đáp số</button></form>'
    +'<p id="practice-feedback" class="practice-feedback" aria-live="polite" '+(record.grade?'':'hidden')+' data-grade="'+record.grade+'">'+(feedback[record.grade]??'')+'</p>'
    +'<div class="practice-actions">'+(record.hints<3&&!showSolution?
      '<button class="outline" type="button" data-practice-action="hint">Xem gợi ý '+(record.hints+1)+'/3</button>':'')
    +(!showSolution?'<button class="outline" type="button" data-practice-action="solution">Mở lời giải</button>':'')
    +(tasks[selected+1]?'<button class="outline" type="button" data-practice-task="'+(selected+1)+'">Câu tiếp theo →</button>':'')+'</div>'
    +(explanations?'<ol class="practice-hints">'+explanations+'</ol>':'')
    +(showSolution?'<section class="practice-explanation"><h3>Đối chiếu lời giải</h3><p>'+html(q.explanation)+'</p><p><strong>Đáp số</strong> · '+html(answerLabel(q))+'</p></section>':'')
    +(model?'<details id="practice-model-box"><summary>Đối chiếu trên mô phỏng 3D</summary><div class="practice-model"><canvas id="practice-model" role="img"></canvas><div id="practice-model-controls"></div><p id="practice-reading"></p></div></details>':'')
    +'<small id="practice-storage" class="practice-storage">'+(saveError?'Trình duyệt hiện chỉ lưu tiến độ trong phiên này.':'Tiến độ được lưu trên trình duyệt này.')+'</small>';
  previewObserver?.disconnect();
  preview=null;
  if(model)preparePreview(model);
}

function preparePreview(model){
  const canvas=get('practice-model'),box=get('practice-model-box'),state=initialState(model),graphics=sceneOptions(model);
  if(model.focusParameter!=null)state.x=model.focusParameter;
  preview={canvas,box,state,model,graphics};
  get('practice-model-controls').replaceChildren(...model.controls.map(control=>{
    const label=document.createElement('label'),name=document.createElement('span'),range=document.createElement('input');
    name.textContent=control.label+(control.unit?' ('+control.unit+')':'');
    range.type='range';
    Object.assign(range,{min:control.min,max:control.max,step:control.step,value:state[control.key]});
    range.dataset.practiceModel=control.key;
    label.append(name,range);
    return label;
  }));
  box.addEventListener('toggle',paintPreview);
  previewObserver=new ResizeObserver(paintPreview);
  previewObserver.observe(canvas);
}
function paintPreview(){
  if(!preview?.box.open||!preview.canvas.isConnected)return;
  const {model,state,canvas,graphics}=preview;
  const probability=model.group===4?{id:model.id,progress:1,counts:walkLessons.has(model.id)?walkStages(model.id,state.x).at(-1):null}:null;
  const readings=model.result(state).map(m=>m.label+' · '+(m.value===null?m.unit:fmt(m.value)+' '+m.unit)).join(' | ');
  canvas.setAttribute('aria-label','Mô phỏng '+model.title+'. '+readings);
  get('practice-reading').textContent=readings;
  drawScene(canvas,model.mode,state,-.28,null,model.scene,1,null,-1,probability,graphics);
}

export function mountPractice(lessons){
  allLessons=lessons;
  const root=get('content');
  root.addEventListener('click',event=>{
    const button=event.target.closest('button');
    if(!button)return;
    const index=button.dataset.practiceTask,action=button.dataset.practiceAction;
    if(index!==undefined){
      activate(current,taskList(current)[Number(index)]);
      get('content').querySelector('.practice-question h3').setAttribute('tabindex','-1');
      get('content').querySelector('.practice-question h3').focus({preventScroll:true});
    }
    if(action){
      if(action==='hint'){
        record.hints++;
        if(record.hints===3)record.revealed=true;
      }else record.revealed=true;
      record.updated=Date.now();
      save();render();
      const target=get('content').querySelector(record.revealed?'.practice-explanation':'.practice-hints li:last-child');
      target?.setAttribute('tabindex','-1');
      target?.focus({preventScroll:true});
    }
  });
  root.addEventListener('input',event=>{
    const {id,value,dataset}=event.target;
    if(id==='answer'||id==='practice-plan'){
      record[id==='answer'?'draft':'plan']=value;
      record.updated=Date.now();
      save();
    }
    if(dataset.practiceModel&&preview){
      const control=preview.model.controls.find(c=>c.key===dataset.practiceModel);
      preview.state[control.key]=snapControl(control,Number(value));
      paintPreview();
    }
  });
  root.addEventListener('submit',event=>{
    if(event.target.id!=='guided-answer')return;
    event.preventDefault();
    record.draft=get('answer').value.trim();
    record.grade=gradePractice(currentTask,record.draft);
    if(record.grade==='correct')record.solved=true;
    else if(record.grade!=='invalid'){
      record.mistakes++;
      record.lastWrong=record.draft;
    }
    record.updated=Date.now();
    save();render();
    const status=get('practice-feedback');
    status.tabIndex=-1;
    status.focus({preventScroll:true});
  });
  get('study-switch').addEventListener('click',event=>{
    const value=event.target.closest('button')?.dataset.studyView;
    if(!value)return;
    mistakesOnly=value==='mistakes';
    renderProgress();
  });
  get('study-list').addEventListener('click',restoreSelection);
  get('study-resume').addEventListener('click',restoreSelection);
}
function restoreSelection(event){
  const link=event.target.closest('a[data-study-id]');
  if(link)progress.selected[Number(link.dataset.studyId)]=link.dataset.studyKey;
}

export function renderProgress(resolve){
  if(resolve!==undefined)resolveLesson=resolve;
  const available=Object.entries(progress.records).flatMap(([id,entry])=>{
    if(!(entry.draft||entry.plan||entry.hints||entry.solved||entry.revealed||entry.mistakes))return [];
    const split=id.indexOf('|'),base=allLessons[Number(id.slice(0,split))-1];
    if(!base)return [];
    const lesson=entry.variant?archivedLesson(base,entry.variant):resolveLesson(base);
    if(!lesson)return [];
    const task=taskList(lesson).find(q=>q.key===id.slice(split+1))??(entry.variant?taskList(lesson)[0]:null);
    return task?[{lesson,task,entry}]:[];
  }).sort((a,b)=>(b.entry.updated??0)-(a.entry.updated??0));
  const solved=available.filter(row=>row.entry.solved).length;
  const review=available.filter(row=>row.entry.mistakes&&!row.entry.solved).length;
  get('study-counts').textContent=solved+' câu đúng · '+review+' câu cần xem lại';
  for(const button of get('study-switch').querySelectorAll('button'))button.setAttribute('aria-pressed',String((button.dataset.studyView==='mistakes')===mistakesOnly));
  const last=progress.last;
  const resume=get('study-resume');
  resume.hidden=!last;
  if(last){
    resume.href='#bai-'+last.id+'-tu-giai';
    Object.assign(resume.dataset,{studyId:last.id,studyKey:last.key});
  }
  const filtered=available.filter(({entry})=>!mistakesOnly||entry.mistakes);
  get('study-list').innerHTML=filtered.length?filtered.map(({lesson,task,entry})=>
    '<article class="study-item"><div><strong>'+html(lesson.title)+'</strong><p>'+html(task.question)+'</p>'
    +(entry.lastWrong?'<small>Đáp án từng sai · '+html(entry.lastWrong)+'</small>':'')+'</div><div class="study-action"><span>'
    +(entry.solved?'Đã giải đúng':entry.mistakes?'Cần xem lại':'Đang làm')+'</span><a class="formula-jump" href="#bai-'+lesson.id+'-tu-giai" data-study-id="'+lesson.id+'" data-study-key="'+html(task.key)+'">Mở câu →</a></div></article>').join(''):
    '<p class="empty">'+(mistakesOnly?'Chưa ghi nhận câu sai.':'Mở một bài và vào Tự giải để bắt đầu lưu tiến độ.')+'</p>';
}
let resolveLesson=base=>base;

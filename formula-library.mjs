const categories=[
  [
    ['Cực trị và tối ưu','Lập hàm mục tiêu theo một biến, giữ điều kiện thực tế của đề và so sánh các giá trị tại điểm tới hạn với hai biên.',['f′(x) = 0 hoặc f′ không xác định','x_đỉnh = −b/(2a) với f(x) = ax² + bx + c'],[1,2,3,25,26,27,29,31,32]],
    ['Parabol và tiếp xúc','Khai thác trục đối xứng của tiết diện. Khi hai mép hình chữ nhật nằm ở x và −x, nhân chiều cao với 2x.',['y(x) = H(1 − x²/a²)','A(x) = 2x·y(x), với 0 ≤ x ≤ a'],[4,28]],
    ['Thời gian và khoảng cách','Chia hành trình theo phương tiện hoặc địa hình. Đưa vận tốc và khoảng cách về các đơn vị tương ứng.',['T = d₁/v₁ + d₂/v₂','d = √(Δx² + Δy²)'],[30,33]],
    ['Tốc độ thay đổi','Lấy đạo hàm theo thời gian của thể tích khi biết lưu lượng.',['dV/dt = (dV/dh)(dh/dt)','dh/dt = Q/A(h) khi A(h) > 0'],[5,34,35]]
  ],[
    ['Diện tích dưới đồ thị','Nếu hai đường đổi thứ tự trên đoạn lấy tích phân, chia đoạn tại các giao điểm.',['S = ∫ₐᵇ |f(x) − g(x)| dx'],[6,39,42]],
    ['Thể tích theo lát cắt','Chọn một trục, viết diện tích thật của tiết diện vuông góc với trục và tích phân trên miền chiều dài.',['V = ∫ₐᵇ A(x) dx','A_chữ nhật(x) = l(x)·w(x)'],[7,38,40,43]],
    ['Khối tròn xoay','R là bán kính ngoài, r là bán kính lỗ rỗng. Hai bán kính đều đo vuông góc tới trục quay.',['V = π∫ₐᵇ[R(x)² − r(x)²] dx','V_vỏ trụ = 2π∫ₐᵇ x·h(x) dx với x ≥ 0'],[8,9,36,37,41,44,45,46,47,48,49,50]],
    ['Tích lũy theo thời gian','Tích phân lưu lượng để tìm lượng đã đi qua. Trừ lượng đã chảy khỏi lượng ban đầu để tìm phần còn lại.',['V(t) = V(0) + ∫₀ᵗ Q(u) du','Q(t) = V′(t)'],[10]]
  ],[
    ['Tọa độ và khoảng cách','Biểu diễn vị trí bằng bộ ba tọa độ cùng đơn vị trên hệ trục Oxyz.',['AB = ‖AB⃗‖ = √(Δx² + Δy² + Δz²)','M_trung điểm = (A + B)/2'],[11,14,52,53,54,56,57,60]],
    ['Góc và hình chiếu','Dùng tích vô hướng để tính góc hoặc lấy thành phần theo hướng đã biết.',['u⃗·v⃗ = uₓvₓ + uᵧvᵧ + u_zv_z','cos θ = (u⃗·v⃗)/(‖u⃗‖‖v⃗‖)','proj_v(u⃗) = (u⃗·v⃗)/(v⃗·v⃗)·v⃗'],[14,51,62,63]],
    ['Đường thẳng và mặt phẳng','Thế tọa độ tham số vào phương trình mặt phẳng để tìm giao điểm. Dùng vectơ pháp tuyến để tính khoảng cách.',['M(t) = M₀ + t·u⃗','Π: ax + by + cz + d = 0','d(M, Π) = |axₘ + byₘ + czₘ + d|/√(a² + b² + c²)'],[11,55,58,59,61,62]],
    ['Mặt cầu và vùng an toàn','Thế tọa độ điểm vào bình phương khoảng cách đến tâm. So sánh với bình phương bán kính.',['(x − a)² + (y − b)² + (z − c)² = R²','Trong khối cầu khi d(M, I) ≤ R','r_lát = √(R² − h²) khi |h| ≤ R'],[12,13,14,59,61]]
  ],[
    ['Cấp số nhân','Khi mỗi lần lặp đều nhân cùng một tỉ số q, dùng lũy thừa cho một lần và công thức tổng cho quá trình.',['uₙ = u₀qⁿ','Σₖ₌₀ⁿ⁻¹ u₀qᵏ = u₀(1 − qⁿ)/(1 − q) với q ≠ 1'],[15]],
    ['Lượng giác và chu kỳ','Xác định biên độ theo độ lệch lớn nhất, tần số theo chu kỳ và pha theo mốc thời gian.',['h(t) = c + A sin[2π(t − t₀)/T]','sin α = đối/huyền · cos α = kề/huyền · tan α = đối/kề'],[16,17,18,66,71,75]],
    ['Hình khối và tiết diện','Tính diện tích đáy trước. Với hai thiết diện đồng dạng, cạnh theo tỉ số k, diện tích theo k².',['V_lăng trụ = Bh','V_hình chóp = Bh/3','V_chóp cụt = h(B₁ + √(B₁B₂) + B₂)/3','A_lục giác đều = 3√3·a²/2'],[18,19,64,65,67,68,69,70,71,74]],
    ['Ràng buộc và số nguyên','Lập hệ bất phương trình theo dữ kiện. Với số lượng nguyên, kiểm tra điều kiện nguyên quanh các điểm ứng viên.',['ax + by ≤ M','P = cx + dy','Số vật mua thêm = ⌊(M − ax)/b⌋'],[72,73]]
  ],[
    ['Quy tắc đếm và tổ hợp','Dùng tổ hợp khi các nhóm cùng kích cỡ được chọn đều và thứ tự rút không quan trọng.',['C(n,k) = n!/[k!(n−k)!]','P(A) = |A|/|Ω| khi đồng khả năng','P(X = k) = C(K,k)C(N−K,n−k)/C(N,n) khi rút không hoàn lại'],[76,80,84,86,88,91]],
    ['Độc lập và biến cố đối','Dùng phép nhân nếu các biến cố độc lập. Khi đề có “ít nhất một”, xét trường hợp không biến cố nào xảy ra.',['P(Aᶜ) = 1 − P(A)','P(A ∩ B) = P(A)P(B) khi A, B độc lập','P(ít nhất một) = 1 − (1 − p)ⁿ khi các lượt độc lập, cùng p'],[21,81,82,85,87,90]],
    ['Bernoulli và quy tắc dừng','Nếu biết chính xác lượt dừng, lượt cuối phải thành công. Chọn vị trí các thành công còn lại trong các lượt trước đó.',['P(X = k) = C(n,k)pᵏ(1 − p)ⁿ⁻ᵏ','P(Tₖ = n) = C(n−1,k−1)pᵏ(1 − p)ⁿ⁻ᵏ với n ≥ k'],[20,77]],
    ['Toàn phần và Bayes','Chia thành các trường hợp rời nhau phủ hết khả năng. Đảo xác suất có điều kiện bằng cách chuẩn hóa theo xác suất quan sát được.',['P(A | B) = P(A ∩ B)/P(B), khi P(B) > 0','P(B) = ΣᵢP(Hᵢ)P(B | Hᵢ)','P(Hⱼ | B) = P(Hⱼ)P(B | Hⱼ)/P(B)'],[23,24,83,89]],
    ['Đường đi và truy hồi','Mỗi vị trí nhận tổng số đường từ các vị trí có thể đi tới nó ở bước trước. Khởi tạo tại vị trí xuất phát.',['D₀(s) = 1, D₀(v) = 0 nếu v ≠ s','Dₜ₊₁(v) = Σ Dₜ(u), với u → v'],[22,78,79]]
  ]
];

const get=id=>document.getElementById(id);
const html=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
let chapters,entries,normalize;

export function mountFormulaLibrary(lessons,groups,normalizeSearch){
  normalize=normalizeSearch;
  chapters=groups.map((name,group)=>({
    name,group,
    types:categories[group].map(([name,guide,formulas,ids],index)=>({id:group+'-'+index,name,guide,formulas,ids,group}))
  }));
  entries=lessons.map(lesson=>{
    const types=chapters[lesson.group].types;
    return {...lesson,types:types.filter(type=>type.ids.includes(lesson.id)).map(type=>type.id)};
  });
  get('formula-chapter').replaceChildren(new Option('Tất cả chuyên đề','all'),...chapters.map(c=>new Option(c.name,c.group)));
  get('formula-chapter').addEventListener('change',()=>{refreshTypes();render();});
  get('formula-type').addEventListener('change',render);
  get('formula-search').addEventListener('input',render);
}
function refreshTypes(){
  const group=get('formula-chapter').value;
  const selected=get('formula-type').value;
  const types=chapters.filter(c=>group==='all'||String(c.group)===group).flatMap(c=>c.types);
  const exact=entries.filter(e=>group==='all'||String(e.group)===group);
  const tags=[...new Set(exact.map(e=>e.tag))].sort((a,b)=>a.localeCompare(b,'vi'));
  const families=document.createElement('optgroup'),lessonTags=document.createElement('optgroup');
  families.label='Nhóm công thức';
  lessonTags.label='Dạng cụ thể trong bài';
  families.append(...types.map(t=>new Option(t.name,t.id)));
  lessonTags.append(...tags.map(tag=>new Option(tag,'tag:'+tag)));
  get('formula-type').replaceChildren(new Option('Tất cả dạng bài','all'),families,lessonTags);
  if([...get('formula-type').options].some(o=>o.value===selected))get('formula-type').value=selected;
}
export function showFormulaLibrary(chapter){
  const select=get('formula-chapter');
  if(chapter!==undefined){
    select.value=chapter;
    get('formula-type').value='all';
    get('formula-search').value='';
  }else select.value='all';
  refreshTypes();render();
}
const equations=lines=>'<ul class="formula-lines">'+lines.map(line=>'<li>'+html(line)+'</li>').join('')+'</ul>';
function render(){
  const group=get('formula-chapter').value,type=get('formula-type').value;
  const words=normalize(get('formula-search').value).split(/\s+/).filter(Boolean);
  const matches=text=>words.every(word=>normalize(text).includes(word));
  let countTypes=0,countLessons=0;
  const markup=chapters.filter(c=>group==='all'||String(c.group)===group).map(c=>{
    const topics=c.types.filter(t=>(type==='all'||t.id===type||type.startsWith('tag:')&&entries.some(e=>e.group===c.group&&'tag:'+e.tag===type&&e.types.includes(t.id)))
      &&matches([c.name,t.name,t.guide,...t.formulas].join(' ')));
    const examples=entries.filter(e=>e.group===c.group&&(type==='all'||e.types.includes(type)||'tag:'+e.tag===type)
      &&matches([c.name,e.title,e.tag,...e.formula,...c.types.filter(t=>e.types.includes(t.id)).map(t=>t.name)].join(' ')));
    if(!topics.length&&!examples.length)return '';
    countTypes+=topics.length;countLessons+=examples.length;
    const topicCards=topics.map(t=>{
      const links=entries.filter(e=>t.ids.includes(e.id)).slice(0,3).map(e=>'<a href="#bai-'+e.id+'-cong-thuc">'+html(e.title)+' ↗</a>');
      return '<article class="formula-card"><h3>'+html(t.name)+'</h3><p>'+html(t.guide)+'</p>'+equations(t.formulas)+'<div class="formula-examples">'+links.join('')+'</div></article>';
    }).join('');
    const exampleCards=examples.map(e=>'<details class="formula-example"><summary>'+html(e.title)+' <small>'+html(e.tag)+'</small></summary>'+equations(e.formula)+'<a class="formula-jump" href="#bai-'+e.id+'-cong-thuc">Mở công thức bài '+e.id+' →</a></details>').join('');
    return '<section class="formula-chapter" data-chapter="'+c.group+'"><h2>'+html(c.name)+'</h2>'
      +(topicCards?'<div class="formula-grid">'+topicCards+'</div>':'')
      +(exampleCards?'<h3 class="example-heading">Áp dụng trong bài mẫu</h3><div class="formula-example-grid">'+exampleCards+'</div>':'')+'</section>';
  }).join('');
  get('formula-count').textContent=countTypes+' nhóm công thức · '+countLessons+' bài mẫu';
  get('formula-results').innerHTML=markup||'<p class="empty">Không có công thức phù hợp với bộ lọc này.</p>';
}

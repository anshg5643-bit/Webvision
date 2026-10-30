let current=null,busy=false,researchForDraft=true,chatList=[],models=[],model='',signup=false;
const $=id=>document.getElementById(id);
const store={get:k=>{try{return localStorage.getItem(k)}catch{return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch{}}};
async function api(path,method='GET',body){const r=await fetch(path,{method,headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});let data={};try{data=await r.json()}catch{}if(!r.ok)throw Error(data.error||'Request failed ('+r.status+')');return data}
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n}
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

/* ---------- safe markdown ---------- */
function inline(s){return esc(s).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/(^|[^*])\*([^*\n]+)\*/g,'$1<em>$2</em>').replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')}
function markdown(src){const out=[];let list=null;const close=()=>{if(list){out.push('</'+list+'>');list=null}};
 src.split(/```/).forEach((part,i)=>{
  if(i%2){const lang=(part.match(/^([^\n]*)\n/)||[,''])[1].trim();const code=part.replace(/^[^\n]*\n/,'').replace(/\n$/,'');out.push('<pre><div class="bar"><span>'+esc(lang||'code')+'</span><button type="button" data-copy>Copy code</button></div><code>'+esc(code)+'</code></pre>');return}
  let para=[];const flush=()=>{if(para.length){out.push('<p>'+para.join('<br>')+'</p>');para=[]}};
  part.split('\n').forEach(line=>{let m;
   if(m=line.match(/^(#{1,4})\s+(.*)/)){flush();close();out.push('<h3>'+inline(m[2])+'</h3>')}
   else if(m=line.match(/^\s*[-*]\s+(.*)/)){flush();if(list!=='ul'){close();out.push('<ul>');list='ul'}out.push('<li>'+inline(m[1])+'</li>')}
   else if(m=line.match(/^\s*\d+[.)]\s+(.*)/)){flush();if(list!=='ol'){close();out.push('<ol>');list='ol'}out.push('<li>'+inline(m[1])+'</li>')}
   else if(!line.trim()){flush();close()}else{close();para.push(inline(line))}});
  flush();close()});
 return out.join('')}

/* ---------- messages ---------- */
const flash=(b,t)=>{const o=b.textContent;b.textContent=t;setTimeout(()=>b.textContent=o,1300)};
const copy=async t=>{try{await navigator.clipboard.writeText(t);return true}catch{return false}};
function msg(role,text){document.querySelector('.welcome')?.remove();const n=el('div','message '+role);
 if(role==='user'){n.append(el('div','bubble',text))}
 else{const b=el('div','body');b.innerHTML=markdown(text);b.querySelectorAll('[data-copy]').forEach(c=>c.onclick=async()=>{if(await copy(c.closest('pre').querySelector('code').textContent))flash(c,'Copied!')});n.append(b);
  const a=el('div','acts');const cp=el('button','','⧉');cp.title='Copy';cp.onclick=async()=>{if(await copy(text))flash(cp,'✓')};a.append(cp);n.append(a)}
 $('messages').append(n);$('messages').scrollTo({top:$('messages').scrollHeight,behavior:'smooth'})}
function typing(on){$('typing')?.remove();if(on){document.querySelector('.welcome')?.remove();const t=el('div','typing');t.id='typing';t.append(el('i'),el('i'),el('i'));$('messages').append(t);$('messages').scrollTop=$('messages').scrollHeight}}
const DEMO={original:'write a blog about coffee',improved:`Act as an experienced food-and-drink writer.

Task: Write an engaging blog post (about 800 words) about coffee for curious beginners who want to brew better coffee at home.

Include:
- A catchy title and a short hook
- 4–5 sections with subheadings: origins, roast types, brewing methods, common mistakes, quick tips
- A closing call to action

Tone: warm, conversational, simple language.
Format: Markdown with headings, ending with a 3-bullet summary.`,changes:['Added role and audience','Set length and structure','Listed what to cover','Defined tone and format']};
function welcome(){$('messages').replaceChildren();const w=el('div','welcome');w.append(el('h1','','What can I help with?'));
 const d=el('div','demo');const h=el('h2');h.append(el('span','','✦'),document.createTextNode('Prompt improver: see an example'));d.append(h);
 const r1=el('div','row');r1.append(el('small','','You type'),el('div','before',DEMO.original));
 const r2=el('div','row');r2.append(el('small','','Improved prompt'),el('div','after',DEMO.improved));
 const b=el('button','','Try this example');b.onclick=()=>{$('prompt').value=DEMO.original;grow();updateImprove();improve(true)};
 d.append(r1,r2,b);w.append(d);$('messages').append(w)}
function showError(e){typing(false);msg('assistant','Error: '+e.message)}
function setBusy(v){busy=v;$('form').querySelector('.send').disabled=v;$('prompt').disabled=v;updateImprove();if(!v)$('prompt').focus()}
const grow=()=>{const p=$('prompt');p.style.height='auto';p.style.height=Math.min(p.scrollHeight,200)+'px'};$('prompt').oninput=()=>{grow();updateImprove()};

/* ---------- chats ---------- */
function renderChats(){const q=$('search').value.trim().toLowerCase();$('chats').replaceChildren();chatList.filter(c=>c.title.toLowerCase().includes(q)).forEach(c=>{const row=el('div','chat'+(c.id===current?' active':''));const name=el('span','',c.title);name.onclick=()=>{open(c.id);closeSide()};const del=el('button','','×');del.title='Delete chat';del.onclick=async e=>{e.stopPropagation();if(confirm('Delete this chat permanently?')){await api('/api/chats/'+c.id,'DELETE');if(current===c.id){current=null;welcome();$('workflow').replaceChildren()}await list()}};row.append(name,del);$('chats').append(row)})}
async function list(){chatList=await api('/api/chats');renderChats()}
async function open(id){current=id;$('messages').replaceChildren();$('workflow').replaceChildren();const data=await api('/api/chats/'+id);if(!data.messages.length)welcome();for(const m of data.messages)msg(m.role,m.content);researchForDraft=$('research').checked;if(data.draft?.stage==='questions')questionPanel(JSON.parse(data.draft.questions));if(data.draft?.stage==='approval')approvalPanel(data.draft.enhanced);renderChats()}
function newChat(){current=null;closeImprove();welcome();$('workflow').replaceChildren();renderChats();$('prompt').focus();closeSide()}
$('new').onclick=newChat;$('homeBtn').onclick=newChat;$('search').oninput=renderChats;
const app=$('app'),mobile=()=>matchMedia('(max-width:800px)').matches;
function closeSide(){app.classList.remove('sidebar-open')}
$('collapse').onclick=()=>mobile()?closeSide():app.classList.add('collapsed');$('open').onclick=()=>mobile()?app.classList.add('sidebar-open'):app.classList.remove('collapsed');$('scrimm').onclick=closeSide;
$('theme').onclick=()=>{const t=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=t;store.set('theme',t)};

/* ---------- workflow panels ---------- */
function panel(title){$('workflow').replaceChildren();const box=el('div','panel');box.append(el('h3','',title));$('workflow').append(box);return box}
function controls(box,action,label){const bar=el('div','actions');const ok=el('button','',label);ok.onclick=action;const cancel=el('button','secondary','Cancel');cancel.onclick=async()=>{await api('/api/chats/'+current+'/cancel','POST');$('workflow').replaceChildren()};bar.append(ok,cancel);box.append(bar)}
function questionPanel(questions){const box=panel('A few quick questions');box.append(el('p','','Answer these so the result matches what you need.'));const fields=[];questions.forEach((q,i)=>{const label=el('label','',`${i+1}. ${q}`);const input=el('input');input.placeholder='Your answer (optional)';fields.push(input);box.append(label,input)});fields[0]?.focus();controls(box,async()=>{if(busy)return;setBusy(true);try{const d=await api('/api/chats/'+current+'/enhance','POST',{answers:fields.map(x=>x.value),model});approvalPanel(d.enhanced)}catch(e){showError(e)}finally{setBusy(false)}},'Enhance prompt')}
function approvalPanel(enhanced){const box=panel('Review your enhanced prompt');box.append(el('p','','Edit it if you like, then approve to generate.'));const field=el('textarea');field.value=enhanced;box.append(field);controls(box,async()=>{if(busy)return;setBusy(true);$('workflow').replaceChildren();typing(true);try{const d=await api('/api/chats/'+current+'/approve','POST',{enhanced:field.value,research:researchForDraft,model});typing(false);msg('assistant',d.answer)}catch(e){showError(e)}finally{setBusy(false)}},'Approve & generate')}
$('form').onsubmit=async e=>{e.preventDefault();if(busy)return;const prompt=$('prompt').value.trim();if(!prompt)return;setBusy(true);try{if(!current){const c=await api('/api/chats','POST');current=c.id}$('prompt').value='';grow();closeImprove();msg('user',prompt);typing(true);const d=await api('/api/chats/'+current+'/submit','POST',{prompt,research:$('research').checked,model});typing(false);researchForDraft=$('research').checked;if(d.stage==='questions')questionPanel(d.questions);else msg('assistant',d.answer);await list()}catch(e){showError(e)}finally{setBusy(false)}};
$('prompt').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();$('form').requestSubmit()}};

/* ---------- prompt improver ---------- */
let impSeq=0,idleTimer=null;
function updateImprove(){const b=$('improveBtn'),n=$('prompt').value.trim().length;b.disabled=busy||n<3;b.classList.remove('glow');clearTimeout(idleTimer);if(n>=10&&$('improve').hidden)idleTimer=setTimeout(()=>b.classList.add('glow'),1200)}
function closeImprove(){impSeq++;$('improve').hidden=true;$('improve').replaceChildren();updateImprove()}
function head(demo){const h=el('div','imp-head');h.append(el('span','sp','✦'),document.createTextNode('Improved prompt'));if(demo)h.append(el('span','badge','Example'));const x=el('button','x','×');x.title='Dismiss';x.onclick=closeImprove;h.append(x);return h}
async function improve(demo){const text=$('prompt').value.trim();if(text.length<3||busy)return;const my=++impSeq,box=$('improve');$('improveBtn').classList.remove('glow');
 box.hidden=false;box.replaceChildren(head(demo),el('div','shimmer'),el('div','shimmer'),el('div','shimmer'));
 try{const d=demo?await new Promise(r=>setTimeout(()=>r(DEMO),700)):await api('/api/improve','POST',{prompt:text,model});if(my!==impSeq)return;showImprove(text,d,demo)}
 catch(e){if(my!==impSeq)return;box.replaceChildren(head(demo),el('p','imp-err',e.message));const r=el('div','imp-actions');const t=el('button','ghost','Try again');t.onclick=()=>improve(demo);r.append(t);box.append(r)}}
function showImprove(original,d,demo){const box=$('improve');box.replaceChildren(head(demo));
 if(d.changes?.length){const c=el('div','chips');d.changes.forEach(x=>c.append(el('span','',x)));box.append(c)}
 const o=el('details','orig');o.append(el('summary','','Your original prompt'),el('p','',original));box.append(o);
 const ta=el('textarea');ta.value=d.improved;ta.setAttribute('aria-label','Improved prompt (editable)');box.append(ta);
 const use=text=>{$('prompt').value=text;grow();closeImprove();$('prompt').focus()};
 const bar=el('div','imp-actions');
 const send=el('button','','Use & send');send.onclick=()=>{use(ta.value);$('form').requestSubmit()};
 const put=el('button','ghost','Use in composer');put.onclick=()=>use(ta.value);
 const again=el('button','ghost','Regenerate');again.onclick=()=>{$('prompt').value=original;improve(demo)};
 const keep=el('button','ghost','Keep original');keep.onclick=()=>{$('prompt').value=original;grow();closeImprove();$('prompt').focus()};
 bar.append(send,put,again,keep);box.append(bar);ta.focus({preventScroll:true})}
$('improveBtn').onclick=()=>improve(false);

/* ---------- model picker ---------- */
async function loadModels(){try{const d=await api('/api/models');models=d.models;const saved=store.get('model');model=models.some(m=>m.id===saved)?saved:d.default;if(!models.some(m=>m.id===model))model=models[0]?.id||d.default}catch(e){models=[];model='';$('modelName').textContent='⚠ Setup needed';$('modelBtn').title=e.message;const w=document.querySelector('.welcome');if(w&&!w.querySelector('.keyerr')){const p=el('p','keyerr',e.message);p.style.cssText='color:#e5484d;max-width:520px;margin:12px auto 0;font-size:14px';w.append(p)}}renderModel()}
function renderModel(){const m=models.find(x=>x.id===model);if(m)$('modelName').textContent=m.name;const menu=$('modelMenu');menu.replaceChildren();let grp='';models.forEach(x=>{if(x.group!==grp){grp=x.group;menu.append(el('div','lbl',grp||'Model'))}const b=el('button','opt'+(x.id===model?' on':''));b.type='button';b.setAttribute('role','option');const d=el('div');d.append(el('b','',x.name));if(x.desc)d.append(el('small','',x.desc));b.append(d,el('span','tick','✓'));b.onclick=()=>{model=x.id;store.set('model',model);renderModel();toggleMenu(false)};menu.append(b)})}
function toggleMenu(show){const m=$('modelMenu');show=show??m.hidden;m.hidden=!show;$('modelBtn').setAttribute('aria-expanded',show)}
$('modelBtn').onclick=e=>{e.stopPropagation();toggleMenu()};addEventListener('click',e=>{if(!$('modelMenu').contains(e.target))toggleMenu(false)});addEventListener('keydown',e=>{if(e.key==='Escape'){toggleMenu(false);if(!$('improve').hidden)closeImprove()}});

/* ---------- auth ---------- */
async function authRefresh(){const d=await api('/api/auth/me');const on=!!d.username;$('auth').hidden=on;$('app').hidden=!on;
 if(on){$('identity').textContent=d.username;const av=$('avatar');if(d.avatar){av.style.backgroundImage=`url("${d.avatar}")`;av.textContent=''}else{av.style.backgroundImage='';av.textContent=d.username[0].toUpperCase()}if(!current)welcome();await Promise.all([list(),loadModels()])}
 else renderGoogle()}
$('switchMode').onclick=e=>{e.preventDefault();signup=!signup;$('authTitle').textContent=signup?'Create your account':'Welcome back';$('switchText').textContent=signup?'Already have an account?':'Don’t have an account?';$('switchMode').textContent=signup?'Log in':'Sign up';$('password').autocomplete=signup?'new-password':'current-password';$('authError').textContent=''};
$('authForm').onsubmit=async e=>{e.preventDefault();try{await api(signup?'/api/auth/register':'/api/auth/login','POST',{username:$('username').value,password:$('password').value});$('authError').textContent='';$('password').value='';await authRefresh()}catch(err){$('authError').textContent=err.message}};
$('logout').onclick=async()=>{await api('/api/auth/logout','POST');current=null;chatList=[];$('chats').replaceChildren();$('workflow').replaceChildren();await authRefresh()};
authRefresh().catch(e=>{$('auth').hidden=false;$('authError').textContent=e.message});

/* ---------- Google Sign-In ---------- */
let gsiReady=false;
const googleHint=h=>$('googleHint').innerHTML=h;
const loadGsi=()=>new Promise((ok,bad)=>{if(window.google?.accounts?.id)return ok();const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;s.onload=ok;s.onerror=()=>bad(Error('blocked'));document.head.append(s)});
async function onGoogleCredential(resp){$('authError').textContent='';if(!resp?.credential){$('authError').textContent='Google did not return a credential. Try again.';return}try{await api('/api/auth/google','POST',{credential:resp.credential});await authRefresh()}catch(e){$('authError').textContent=e.message}}
const WHY={missing:'Google sign-in is off. Add your OAuth <b>Web client ID</b> to <code>google_client_id.txt</code>, then restart the server.',
 placeholder:'<code>google_client_id.txt</code> still contains the placeholder. Replace it with your real <b>Web client ID</b> and restart the server.',
 invalid:'The value in <code>google_client_id.txt</code> is not a Web client ID. It must look like <code>123456789-abc123.apps.googleusercontent.com</code> (not a client secret or API key).'};
async function renderGoogle(){if(gsiReady)return;const box=$('googleButton');
 try{const cfg=await api('/api/config');
  if(!cfg.google_client_id){box.replaceChildren();googleHint(WHY[cfg.google_status]||WHY.missing);return}
  await loadGsi();google.accounts.id.initialize({client_id:cfg.google_client_id,callback:onGoogleCredential,ux_mode:'popup',auto_select:false,itp_support:true});
  box.replaceChildren();google.accounts.id.renderButton(box,{theme:document.documentElement.dataset.theme==='light'?'outline':'filled_black',size:'large',shape:'pill',width:340,text:'continue_with'});
  googleHint('Button blank or “origin_mismatch”? In Google Cloud add <code>'+location.origin+'</code> under Authorized JavaScript origins, wait a minute, then hard-refresh.');gsiReady=true}
 catch(e){box.replaceChildren();const retry='<br><a href="#" id="gretry">Try again</a>';
  googleHint((e.message==='blocked'?'Google’s sign-in script could not load. Disable ad/tracker blockers for this page and check your connection.':'Google sign-in unavailable: '+esc(e.message))+retry);
  $('gretry').onclick=ev=>{ev.preventDefault();googleHint('');renderGoogle()}}}

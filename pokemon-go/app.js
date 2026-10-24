let raids=[];
const $=id=>document.getElementById(id);
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pretty=s=>new Date(s).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
function onDay(r,date){const day=date.slice(0,10);return r.start.slice(0,10)<=day&&r.end.slice(0,10)>=day;}
function nextDate(r,date){
 let day=r.start.slice(0,10)>date?r.start.slice(0,10):date;
 if(r.end.slice(0,10)<date)return r.start;
 if(r.weekends){const d=new Date(day+'T12:00');while(![0,6].includes(d.getDay()))d.setDate(d.getDate()+1);day=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
 return day;
}
function selectRows(list,{query='',kind='',weak='',date,view='future'}){
 return list.filter(r=>(!query||(r.name+' '+r.types.join(' ')).toLowerCase().includes(query.toLowerCase()))&&(!kind||r.kind===kind)&&(!weak||r.weaknesses.some(w=>w.type===weak))&&(view==='all'||(view==='day'?onDay(r,date):r.end.slice(0,10)>=date))).sort((a,b)=>Number(onDay(b,date))-Number(onDay(a,date)) || (onDay(a,date) && onDay(b,date) ? a.end.localeCompare(b.end) : nextDate(a,date).localeCompare(nextDate(b,date))) || a.name.localeCompare(b.name));
}
function render(){
 const date=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Denver',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const list=selectRows(raids,{date});
 $('cards').innerHTML=list.map(r=>`<article class="raid-row">
 <div class="raid-name">${r.image?`<img class="boss-image" src="${escapeHTML(r.image)}" alt="" width="64" height="64" loading="lazy">`:'<span class="unknown-image" aria-hidden="true">?</span>'}<div><h3>${escapeHTML(r.name)}</h3><div class="types">${escapeHTML(r.kind)} · <span class="status">${onDay(r,date)?'Current':r.end.slice(0,10)<date?'Ended':'Upcoming'}</span></div>${r.pokebattler?`<a class="counter-link" href="${escapeHTML(r.pokebattler)}" target="_blank" rel="noopener" aria-label="Pokébattler counters for ${escapeHTML(r.name)}">Pokébattler ↗</a>`:''}</div></div>
 <div class="dates">${pretty(r.start)} → ${pretty(r.end)}<small>${r.weekends?'Weekends only':''}</small>${r.raidHour?`<div class="hour">Raid Hour · ${escapeHTML(r.raidHour)}</div>`:''}${r.catchCP?`<div class="catch-cp"><span>4* L20:</span> <b>${r.catchCP.level20}</b>, <span>L25:</span> <b>${r.catchCP.level25}</b>${r.catchCP.encounter?`<small>Catch: ${escapeHTML(r.catchCP.encounter)}</small>`:''}</div>`:''}</div>
 <div><div class="chips">${r.weaknesses.map(w=>`<span class="chip ${w.multiplier>2?'double':''}">${escapeHTML(w.type)} <b>${w.multiplier}×</b></span>`).join('')||'<span class="chip">Weaknesses pending</span>'}</div></div>
 <div class="trainers"><strong>${r.team||'TBD'}</strong><small>${r.trainerEstimate?.applicable?'trainers · PB est.':'trainers (unverified)'}</small></div>
 <details class="row-details"><summary>Details & sources</summary>${r.trainerEstimate?.applicable?`<p>Pokébattler best-counter estimator: ${r.trainerEstimate.estimator.toFixed(2)}. Level 40 attackers, no weather or friendship boost; default page settings. Checked October 22, 2026. Actual teams may need more trainers.</p>`:''}${r.note?`<p>${escapeHTML(r.note)}</p>`:''}<a href="${r.source}" target="_blank" rel="noopener">${escapeHTML(r.sourceLabel)} schedule ↗</a>${r.guide?` · <a href="${r.guide}" target="_blank" rel="noopener">Boss guide ↗</a>`:''}</details>
 </article>`).join('')||'<div class="empty">No saved raids match these filters.</div>';
}
async function init(){
 try{const response=await fetch('raids.json', {cache:'no-store'});if(!response.ok)throw Error();const data=await response.json();raids=data.raids;
 render();
 }catch(e){$('cards').innerHTML='<div class="empty">Could not load the saved schedule. Reload this page using the local server.</div>';}
}
if(typeof document!=='undefined'){init();setInterval(()=>{if(raids.length)render();},60000);}
if(typeof module!=='undefined')module.exports={selectRows,onDay};

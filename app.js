const { policies, initial, keys, step } = window.TidalSimulation;
let state = initial(), selected = null, history = [], paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = id => document.getElementById(id);
const definitions = [ ['fish', 'Fish population', 'Life beneath the surface', '#79a886'], ['water', 'Water quality', 'A cleaner, healthier ocean', '#7caeb2'], ['economy', 'Local economy', 'Livelihoods along the coast', '#d2b66f'], ['community', 'Community wellbeing', 'People who call this place home', '#a2aa7a'] ];
policies.forEach((p, i) => {
  const button = document.createElement('button'); button.className = 'policy' + (p.risk ? ' risky' : ''); button.dataset.id = p.id; button.setAttribute('aria-pressed', 'false');
  button.innerHTML = `<span class="number">0${i + 1}</span><span class="policy-icon" aria-hidden="true">${p.icon}</span><p class="eyebrow">${p.subtitle}</p><h3>${p.name}</h3><p>${p.description}</p><div class="tradeoff">${p.gain}<span>${p.cost}</span></div>`;
  button.onclick = () => { selected = p.id; document.querySelectorAll('.policy').forEach(b => b.setAttribute('aria-pressed', String(b === button))); $('advance').disabled = false; const forecast = step(state, p.id); $('selection-hint').textContent = `Next year: ${definitions.map(([key, name]) => name + ' ' + (forecast[key] - state[key] >= 0 ? '+' : '') + (forecast[key] - state[key])).join(' · ')}. ${p.cost.replace('↓ ', '')}.`; };
  $('cards').append(button);
});
function render(previous) {
  $('year-label').textContent = state.year === 8 ? '8 YEARS · YOUR LEGACY' : `YEAR ${String(state.year + 1).padStart(2, '0')} / 08`;
  $('metrics').innerHTML = definitions.map(([key, name, description, color]) => {
    const delta = previous ? state[key] - previous[key] : 0;
    return `<div class="metric" style="--metric-color:${color}"><div class="metric-label">${name}<span aria-hidden="true">${key === 'fish' ? '◈' : key === 'water' ? '≈' : key === 'economy' ? '▥' : '♡'}</span></div><div class="metric-value">${state[key]}<small> / 100</small>${previous ? `<span class="delta ${delta < 0 ? 'negative' : ''}">${delta > 0 ? '+' : ''}${delta} this year</span>` : ''}</div><div class="bar" role="meter" aria-label="${name}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${state[key]}"><div style="width:${state[key]}%"></div></div><p class="metric-desc">${description}</p></div>`;
  }).join('');
  $('scene-status').innerHTML = [['Coral health', state.coral + '%'], ['Tree cover', state.trees + '%'], ['Litter load', state.litter + '/100'], ['Buildings', state.buildings], ['Fishing boats', state.fleet]].map(([label,value]) => `<span>${label}<strong>${value}</strong></span>`).join('');
  $('ocean').setAttribute('aria-label', `Bluehaven: coral health ${state.coral}, tree cover ${state.trees}, litter ${state.litter}, ${state.buildings} buildings and ${state.fleet} fishing boats. Water quality ${state.water}, fish population ${state.fish}.`);
  $('timeline').innerHTML = Array.from({length:8},(_,i)=>`<div class="year ${i < state.year ? 'done' : i === state.year ? 'current' : ''}">${i < state.year ? '✓' : '·'} YEAR ${i + 1}</div>`).join('');
  $('decision-kicker').textContent = `THE CHOICE IS YOURS · YEAR ${state.year + 1}`;
  $('ocean-mood').textContent = state.fish < 30 ? 'The ocean is growing quiet' : state.fish > 72 && state.water > 65 ? 'Life is returning to the reef' : state.economy < 35 ? 'A recovering sea, a struggling shore' : 'A coast at a crossroads';
}
$('advance').onclick = () => {
  if (!selected || state.year >= 8) return;
  const previous = state; const policy = policies.find(p=>p.id===selected); state = step(state, selected); history.push({policy: selected, state});
  const notes = { restore: 'Saplings are taking root and reef restoration has begun. Recovery takes time, but litter is being removed.', trawling: 'New trawlers fill the harbor. Heavy nets scar the reef, and fewer fish remain for next year.', dumping: 'Treatment costs fell, but untreated waste left a dirty plume and more floating rubbish. Coral is losing color.', development: 'New waterfront buildings bring jobs. Trees have been cleared, and runoff will continue after construction.', fishing: 'The boats brought home less, but young fish have more room to grow.', pollution: 'Cleanup crews are at work. Cleaner water is helping both the reef and the village.', reserve: previous.reserves < 3 ? 'A new refuge is marked out. Its recovery benefits begin next year.' : 'All three refuge areas are protected. This year’s investment maintains their habitat.', nothing: 'The fleet kept fishing. Earnings rose immediately, but pressure on the coast continues.' };
  $('message').textContent = `Year ${state.year} · ${notes[selected]}${state.economy < 35 ? ' Local livelihoods need urgent support.' : ''}${state.fish < 30 ? ' Fish stocks are now dangerously low.' : ''}`;
  $('consequences').textContent = `Visible changes: ${[['coral','coral health'],['trees','tree cover'],['litter','litter'],['buildings','buildings'],['fleet','boats']].filter(([key])=>state[key]!==previous[key]).map(([key,label])=>label+' '+(state[key]-previous[key]>0?'+':'')+(state[key]-previous[key])).join(' · ')}.`;
  render(previous); selected = null; $('advance').disabled = true; document.querySelectorAll('.policy').forEach(b=>b.setAttribute('aria-pressed','false')); $('selection-hint').textContent = 'A new year. Another ripple.';
  if (state.year === 8) finish();
};
function finish() {
  document.querySelector('.decisions').hidden = true; $('results').hidden = false;
  let baseline = initial(); for(let i=0;i<8;i++) baseline=step(baseline,'nothing');
  const minimum = Math.min(...keys.map(k=>state[k]));
  $('result-title').textContent = minimum >= 45 ? 'A coast with a future.' : state.fish >= 60 && state.water >= 60 ? 'Nature is recovering. People need support.' : state.fish < 30 || state.water < 30 ? 'The sea needs a different story.' : 'Progress comes with trade-offs.';
  $('result-copy').textContent = `You created ${state.reserves} marine ${state.reserves === 1 ? 'reserve' : 'reserves'} and shaped eight years of life in Bluehaven. ${minimum >= 45 ? 'Your decisions kept every part of the coast above 45. Try a different path and compare the balance.' : 'A healthy ocean and a healthy community need each other. Which decision would you change next time?'} Here is your coast compared with eight years of taking no action.`;
  $('history').innerHTML = `<table><caption>Final scores · illustrative indices out of 100</caption><thead><tr><th>Indicator</th><th>Your coast</th><th>No action</th></tr></thead><tbody>${definitions.map(([key,name])=>`<tr><td>${name}</td><td>${state[key]}</td><td>${baseline[key]}</td></tr>`).join('')}</tbody></table><p class="eyebrow">YOUR JOURNEY</p><p style="font-size:11px;line-height:1.9">${history.map((h,i)=>`${i+1}. ${policies.find(p=>p.id===h.policy).subtitle}`).join(' → ')}</p>`;
  $('results').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});
}
$('replay').onclick=()=>{state=initial();history=[];selected=null;$('consequences').textContent='Watch the reef, shoreline and harbor change with your decisions.';$('results').hidden=true;document.querySelector('.decisions').hidden=false;$('selection-hint').textContent='Every choice leaves a ripple.';$('message').textContent='“The sea has always looked after us. Now it’s our turn.” — The people of Bluehaven';render();};
$('help').onclick=()=>$('instructions').showModal();
$('close-help').onclick=$('start').onclick=()=>$('instructions').close();
function updatePause(){ $('pause').setAttribute('aria-pressed',String(paused));$('pause').setAttribute('aria-label',paused?'Resume ocean animation':'Pause ocean animation');$('pause').textContent=paused?'▷':'Ⅱ'; }
$('pause').onclick=()=>{paused=!paused;updatePause();};updatePause();render();

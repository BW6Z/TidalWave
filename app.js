const { policies, initial, keys, step } = window.TidalSimulation;
let state = initial(), selected = null, history = [], paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = id => document.getElementById(id);
const definitions = [ ['fish', 'Fish population', 'Life beneath the surface', '#79a886'], ['water', 'Water quality', 'A cleaner, healthier ocean', '#7caeb2'], ['economy', 'Local economy', 'Livelihoods along the coast', '#d2b66f'], ['community', 'Community wellbeing', 'People who call this place home', '#a2aa7a'] ];
policies.forEach((p, i) => {
  const button = document.createElement('button'); button.className = 'policy'; button.dataset.id = p.id; button.setAttribute('aria-pressed', 'false');
  button.innerHTML = `<span class="number">0${i + 1}</span><span class="policy-icon" aria-hidden="true">${p.icon}</span><p class="eyebrow">${p.subtitle}</p><h3>${p.name}</h3><p>${p.description}</p><div class="tradeoff">${p.gain}<span>${p.cost}</span></div>`;
  button.onclick = () => { selected = p.id; document.querySelectorAll('.policy').forEach(b => b.setAttribute('aria-pressed', String(b === button))); $('advance').disabled = false; $('selection-hint').textContent = `${p.subtitle} · Your decision for year ${state.year + 1}`; };
  $('cards').append(button);
});
function render(previous) {
  $('year-label').textContent = state.year === 8 ? '8 YEARS · YOUR LEGACY' : `YEAR ${String(state.year + 1).padStart(2, '0')} / 08`;
  $('metrics').innerHTML = definitions.map(([key, name, description, color]) => {
    const delta = previous ? state[key] - previous[key] : 0;
    return `<div class="metric" style="--metric-color:${color}"><div class="metric-label">${name}<span aria-hidden="true">${key === 'fish' ? '◈' : key === 'water' ? '≈' : key === 'economy' ? '▥' : '♡'}</span></div><div class="metric-value">${state[key]}<small> / 100</small>${previous ? `<span class="delta ${delta < 0 ? 'negative' : ''}">${delta > 0 ? '+' : ''}${delta} this year</span>` : ''}</div><div class="bar" role="meter" aria-label="${name}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${state[key]}"><div style="width:${state[key]}%"></div></div><p class="metric-desc">${description}</p></div>`;
  }).join('');
  $('timeline').innerHTML = Array.from({length:8},(_,i)=>`<div class="year ${i < state.year ? 'done' : i === state.year ? 'current' : ''}">${i < state.year ? '✓' : '·'} YEAR ${i + 1}</div>`).join('');
  $('decision-kicker').textContent = `THE CHOICE IS YOURS · YEAR ${state.year + 1}`;
  $('ocean-mood').textContent = state.fish < 30 ? 'The ocean is growing quiet' : state.fish > 72 && state.water > 65 ? 'Life is returning to the reef' : state.economy < 35 ? 'A recovering sea, a struggling shore' : 'A coast at a crossroads';
}
$('advance').onclick = () => {
  if (!selected || state.year >= 8) return;
  const previous = state; const policy = policies.find(p=>p.id===selected); state = step(state, selected); history.push({policy: selected, state});
  const notes = { fishing: 'The boats brought home less, but young fish have more room to grow.', pollution: 'Cleanup crews are at work. Cleaner water is helping both the reef and the village.', reserve: previous.reserves < 3 ? 'A new refuge is marked out. Its recovery benefits begin next year.' : 'All three refuge areas are protected. This year’s investment maintains their habitat.', nothing: 'The fleet kept fishing. Earnings rose immediately, but pressure on the coast continues.' };
  $('message').textContent = `Year ${state.year} · ${notes[selected]}${state.economy < 35 ? ' Local livelihoods need urgent support.' : ''}${state.fish < 30 ? ' Fish stocks are now dangerously low.' : ''}`;
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
$('replay').onclick=()=>{state=initial();history=[];selected=null;$('results').hidden=true;document.querySelector('.decisions').hidden=false;$('selection-hint').textContent='Every choice leaves a ripple.';$('message').textContent='“The sea has always looked after us. Now it’s our turn.” — The people of Bluehaven';render();};
$('help').onclick=()=>$('instructions').showModal();
$('close-help').onclick=$('start').onclick=()=>$('instructions').close();
function updatePause(){ $('pause').setAttribute('aria-pressed',String(paused));$('pause').setAttribute('aria-label',paused?'Resume ocean animation':'Pause ocean animation');$('pause').textContent=paused?'▷':'Ⅱ'; }
$('pause').onclick=()=>{paused=!paused;updatePause();};updatePause();render();

// All artwork is drawn with original, integer-aligned rectangles at 640 × 360.
const ctx=$('ocean').getContext('2d');ctx.imageSmoothingEnabled=false;
function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
function poly(points,color){ctx.fillStyle=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();}
function tree(x,y,s=1){rect(x,y,4*s,23*s,'#6f674e');for(let i=0;i<3;i++)poly([[x-12*s+i*2*s,y+7*s-i*8*s],[x+2*s,y-15*s-i*5*s],[x+17*s-i*2*s,y+7*s-i*8*s]],['#57816a','#659178','#7b9b7b'][i]);}
function house(x,y,w,color){rect(x,y,w,25,color);rect(x-2,y+22,w+4,4,'#b4a47d');poly([[x-5,y],[x+8,y-13],[x+w-7,y-13],[x+w+5,y]],'#a56b57');rect(x+7,y+10,6,15,'#586d61');rect(x+w-12,y+7,7,7,'#f0d795');rect(x+10,y-18,4,9,'#a18e76');}
function boat(x,y,scale=1){poly([[x,y],[x+32*scale,y],[x+26*scale,y+8*scale],[x+7*scale,y+8*scale]],'#735e4c');rect(x+9*scale,y-7*scale,16*scale,7*scale,'#e9d6a5');rect(x+17*scale,y-25*scale,2*scale,21*scale,'#78624d');poly([[x+16*scale,y-24*scale],[x+3*scale,y-9*scale],[x+16*scale,y-9*scale]],'#f5e7bc');}
function fish(x,y,size,color,reverse){ctx.save();ctx.translate(Math.round(x),Math.round(y));if(reverse)ctx.scale(-1,1);rect(0,0,size*3,size,color);rect(size,-size,size*2,size*3,color);poly([[0,0],[-size*2,-size],[-size*2,size*2],[0,size]],color);rect(size*2,0,1,1,'#173d4c');ctx.restore();}
let t=0,last=0;
function draw(now){const dt=Math.min(50,now-last||16);last=now;if(!paused)t+=dt/1000;
  rect(0,0,640,360,'#c3d9c8');rect(0,55,640,53,'#d3dfcb');rect(0,92,640,33,'#e5e5c4');
  rect(468,28,25,25,'#f8ebba');rect(464,34,33,13,'#f8ebba');
  for(let i=0;i<6;i++){let x=(i*139+t*1.1)%740-60;rect(x,25+i%3*16,49,5,'#eaf0d6');rect(x+10,20+i%3*16,24,6,'#eaf0d6');}
  poly([[0,103],[36,76],[63,76],[94,96],[125,72],[157,69],[199,102],[238,87],[282,110],[640,111],[640,138],[0,138]],'#9ebcaf');
  poly([[381,114],[429,98],[467,100],[506,87],[541,88],[574,109],[640,92],[640,145],[379,145]],'#a8c3b0');
  rect(0,122,640,28,'#79b3ac');rect(0,150,640,30,'#519d9e');rect(0,180,640,45,'#337e89');rect(0,225,640,54,'#256574');rect(0,279,640,81,'#204e60');
  if(state.water<50){ctx.globalAlpha=(50-state.water)/140;rect(0,150,640,210,'#7e8453');ctx.globalAlpha=1;}
  for(let i=0;i<65;i++){let x=(i*73+t*(i%2?3:-2)+700)%660;let y=132+(i*17)%48;rect(x,y,8+(i%5)*4,1,i%3?'#9ac7b7':'#d2dfbf');}
  // Island and harbor.
  poly([[0,118],[27,111],[56,111],[74,102],[112,106],[130,118],[177,120],[205,132],[201,143],[162,150],[65,145],[0,148]],'#dfcf9f');
  poly([[0,108],[36,97],[73,94],[116,100],[143,117],[180,119],[170,133],[92,135],[43,129],[0,134]],'#839a6c');
  for(let i=0;i<9;i++)tree(i*17-10,92+(i%3)*6,.7+(i%2)*.2);
  house(41,106,28,'#e5d2a7');house(83,110,30,'#e8dcb8');house(120,117,24,'#cbb996');
  rect(154,137,94,5,'#b59b72');for(let x=161;x<245;x+=24)rect(x,142,4,15,'#7d7a61');rect(154,134,94,2,'#e1c591');
  boat(279+Math.sin(t*.25)*25,145+Math.sin(t)*1.5);boat(537+Math.sin(t*.18)*15,132,.65);
  // Seabirds.
  for(let i=0;i<4;i++){let x=(330+i*35+t*4)%690;let y=65+i%2*9+Math.sin(t*2+i)*2;rect(x,y,4,1,'#60877e');rect(x+4,y+1,3,1,'#60877e');rect(x+7,y,4,1,'#60877e');}
  // Soft underwater light, deliberately pixel stepped.
  ctx.globalAlpha=.045;poly([[270,155],[310,155],[430,345],[350,345]],'#f9f4b8');poly([[360,155],[385,155],[515,345],[470,345]],'#f9f4b8');ctx.globalAlpha=1;
  poly([[0,326],[45,317],[79,325],[119,320],[157,335],[204,332],[239,341],[334,337],[374,326],[419,329],[462,318],[511,324],[562,312],[610,320],[640,316],[640,360],[0,360]],'#607f76');
  poly([[0,343],[55,334],[103,344],[153,344],[198,355],[293,349],[367,343],[432,340],[492,334],[548,335],[601,329],[640,334],[640,360],[0,360]],'#a1aa83');
  for(let i=0;i<28;i++){let x=i*24+7,y=335+(i*7)%20;rect(x,y,3,2,'#b8bb91');}
  // Kelp and corals respond to water quality.
  for(let i=0;i<24;i++){const x=(i*67)%640,base=337+(i%3)*5,h=14+(i*11)%40;const sway=Math.sin(t+i)*2;const color=state.water<35?'#748575':i%2?'#60988a':'#79a28a';rect(x,base-h,3,h,color);for(let j=0;j<4;j++)rect(x+(j%2?-5:2)+sway,base-h+j*9,6,3,color);}
  for(let i=0;i<10;i++){let x=22+i*66,y=334+(i%3)*6,c=state.water<40?'#8c9281':['#c58e7f','#c7ac8a','#9a9eaa'][i%3];rect(x,y-14,4,17,c);rect(x-7,y-14,18,4,c);rect(x-9,y-24,4,12,c);rect(x+9,y-21,4,9,c);rect(x,y-30,4,15,c);}
  const population=Math.max(3,Math.round(state.fish*.52));
  for(let i=0;i<population;i++){let direction=i%3===0;let x=((i*93+t*(direction?-9:8)+10000)%690)-25;let y=197+(i*31)%116+Math.sin(t*.9+i)*4;fish(x,y,i%5===0?3:2,['#dfc288','#8bbeb4','#c6d4b0','#d0a48c'][i%4],direction);}
  for(let i=0;i<state.reserves;i++){let x=360+i*65;rect(x,153,2,20,'#bcd5ac');rect(x-3,150,8,4,'#e3ce79');rect(x+2,153,10,6,'#c9dc93');ctx.setLineDash([3,5]);ctx.strokeStyle='#d9e9ad55';ctx.strokeRect(x-23,175,52,125);ctx.setLineDash([]);}
  for(let i=0;i<Math.floor((100-state.water)/9);i++){let x=(i*97+t*2)%640,y=169+i%3*8;rect(x,y,5,3,'#b2b298');rect(x+1,y-2,2,2,'#c9c4a5');}
  for(let i=0;i<10;i++){let x=(i*71+Math.sin(t+i)*3)%640,y=340-(t*9+i*23)%155;ctx.strokeStyle='#97c8bb66';ctx.strokeRect(Math.round(x),Math.round(y),2,2);}
  requestAnimationFrame(draw);
}requestAnimationFrame(draw);

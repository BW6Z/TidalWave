const test=require('node:test');const assert=require('node:assert/strict');
const {initial,step,keys,policies}=require('../simulation.js');
test('policies preserve input and create distinct trade-offs',()=>{
 const start=initial();const untouched={...start};
 const fishing=step(start,'fishing'),pollution=step(start,'pollution'),nothing=step(start,'nothing');
 assert.deepEqual(start,untouched);assert.ok(fishing.fish>nothing.fish);assert.ok(fishing.economy<nothing.economy);assert.ok(pollution.water>nothing.water);
});
test('reserves benefit future years and are capped',()=>{
 const reserve=step(initial(),'reserve');const without={...reserve,reserves:0};
 assert.ok(step(reserve,'nothing').fish>step(without,'nothing').fish);
 let s=initial();for(let i=0;i<8;i++)s=step(s,'reserve');assert.equal(s.reserves,3);
});
test('sampled eight-year paths keep all ecological indicators and scene counts bounded',()=>{
 for(let seed=0;seed<4096;seed++){let s=initial(),rng=seed+1;for(let year=0;year<8;year++){rng=(Math.imul(rng,1664525)+1013904223)>>>0;s=step(s,policies[(rng>>>16)%policies.length].id);for(const key of [...keys,'coral','trees','litter'])assert.ok(Number.isInteger(s[key])&&s[key]>=0&&s[key]<=100);assert.ok(s.fleet>=1&&s.fleet<=10);assert.ok(s.buildings>=3&&s.buildings<=11);}assert.equal(s.year,8);}
});
test('harmful policies leave distinct, persistent visible consequences',()=>{
 const s=initial(), trawl=step(s,'trawling'), waste=step(s,'dumping'), build=step(s,'development');
 assert.ok(trawl.fleet>s.fleet&&trawl.coral<s.coral&&trawl.fish<s.fish&&trawl.economy>s.economy);
 assert.ok(waste.water<s.water&&waste.litter>s.litter&&waste.community<s.community);
 assert.ok(build.buildings>s.buildings&&build.trees<s.trees);
 assert.equal(step(build,'pollution').buildings,build.buildings);
 assert.ok(step({...s,fleet:8},'nothing').fish<step(s,'nothing').fish);
 assert.ok(step({...s,buildings:9},'nothing').water<step(s,'nothing').water);
});
test('cleanup and restoration reverse visual damage gradually; replay starts fresh',()=>{
 const damaged=step(step(initial(),'dumping'),'development');
 const cleaned=step(damaged,'pollution'),restored=step(damaged,'restore');
 assert.ok(cleaned.water>damaged.water&&cleaned.litter<damaged.litter);
 assert.ok(restored.trees>damaged.trees&&restored.coral>damaged.coral);
 assert.ok(restored.coral<100);assert.equal(initial().fleet,2);assert.equal(initial().buildings,3);
});
test('invalid policies and extra turns are rejected',()=>{assert.throws(()=>step(initial(),'invalid'));assert.throws(()=>step({...initial(),year:8},'nothing'));});

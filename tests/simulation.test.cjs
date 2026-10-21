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
test('all 65,536 eight-year paths stay in range and end at year eight',()=>{
 function explore(s){for(const key of keys)assert.ok(Number.isInteger(s[key])&&s[key]>=0&&s[key]<=100);if(s.year===8)return;for(const p of policies)explore(step(s,p.id));}explore(initial());
});
test('invalid policies and extra turns are rejected',()=>{assert.throws(()=>step(initial(),'invalid'));assert.throws(()=>step({...initial(),year:8},'nothing'));});

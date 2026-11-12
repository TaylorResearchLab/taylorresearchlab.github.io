const {JSDOM}=require('jsdom');const fs=require('node:fs');const assert=require('node:assert/strict');const path=require('node:path');
const root=path.resolve(__dirname,'..');const dom=new JSDOM(fs.readFileSync(path.join(root,'publications/index.html'),'utf8'),{runScripts:'outside-only'});
const w=dom.window;w.eval(fs.readFileSync(path.join(root,'publications/catalog.js'),'utf8'));const d=w.document;
const topic=d.getElementById('publication-topic'),search=d.getElementById('publication-search');
const records=Array.from(d.querySelectorAll('.catalog-record'));const visible=()=>records.filter(r=>!r.hidden);
const click=s=>d.querySelector(s).click();const choose=value=>{topic.value=value;topic.dispatchEvent(new w.Event('change'));};const query=value=>{search.value=value;search.dispatchEvent(new w.Event('input'));};
assert.equal(d.querySelectorAll('.catalog-topics select').length,1);assert.equal(topic.options.length,14);
assert.equal(visible().length,20);click('#show-more');assert.equal(visible().length,40);click('#clear-filters');
for(const option of Array.from(topic.options).slice(1)){
 choose(option.value);const matched=records.filter(r=>JSON.parse(r.dataset.methods).includes(option.value)||JSON.parse(r.dataset.domains).includes(option.value));
 assert(matched.length>0);assert.equal(visible().length,Math.min(20,matched.length));assert(option.textContent.endsWith(`(${matched.length})`));
 const years=visible().map(r=>Number(r.dataset.year));assert(years.every((y,i)=>i===0||years[i-1]>=y));
}
choose('Clinical study design & diagnostic validation');assert.equal(visible().length,18);assert(visible().some(r=>r.id==='scholar-129'));assert(visible().some(r=>r.id==='scholar-223'));
choose('Cancer');assert(visible().some(r=>r.id==='scholar-129'));choose('Mitochondrial biology & metabolism');query('Rawk:');assert.equal(visible().length,1);assert.equal(visible()[0].id,'rawk-accepted');
query('no-such-paper-xyz');assert.equal(visible().length,0);assert(!d.getElementById('catalog-empty').hidden);assert(!topic.selectedOptions[0].disabled);assert(!topic.options[0].disabled);
click('#clear-search');assert.equal(search.value,'');assert.equal(topic.value,'Mitochondrial biology & metabolism');assert.equal(visible().length,20);
query('no-such-paper-xyz');click('#empty-reset');assert.equal(topic.value,'');assert.equal(search.value,'');assert.equal(visible().length,20);
choose('Knowledge representation & semantic integration');assert(visible().some(r=>r.id==='scholar-063'));assert(!d.getElementById('scholar-167'));click('#clear-filters');
console.log('PASS all 13 independent topics and counts, multi-tag discovery, clinical 18, newest-first, search, recovery, pagination, withheld citation');

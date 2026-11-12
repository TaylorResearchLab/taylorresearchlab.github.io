// Run with: NODE_PATH=/path/to/node_modules node tests/catalog_dom.cjs
const {JSDOM}=require('jsdom');const fs=require('node:fs');const assert=require('node:assert/strict');const path=require('node:path');
const root=path.resolve(__dirname,'..');
const dom=new JSDOM(fs.readFileSync(path.join(root,'publications/index.html'),'utf8'),{runScripts:'outside-only'});
const w=dom.window;w.matchMedia=()=>({matches:false});w.eval(fs.readFileSync(path.join(root,'publications/catalog.js'),'utf8'));
const d=w.document;const visible=()=>Array.from(d.querySelectorAll('.catalog-record')).filter(e=>!e.hidden);const click=(s)=>d.querySelector(s).click();
const choose=(group,value)=>{const s=d.getElementById('filter-'+group);s.value=value;s.dispatchEvent(new w.Event('change'));};
assert.equal(visible().length,20);click('#show-more');assert.equal(visible().length,40);click('#clear-filters');assert.equal(visible().length,20);
choose('domains','Mitochondrial biology & metabolism');assert(!d.getElementById('rawk-accepted').hidden);
choose('methods','Machine learning & statistical methods');assert(!d.getElementById('rawk-accepted').hidden);assert(visible().every(r=>JSON.parse(r.dataset.methods).includes('Machine learning & statistical methods')));
const search=d.getElementById('publication-search');search.value='Rawk:';search.dispatchEvent(new w.Event('input'));assert.equal(visible().length,1);
search.value='no-such-paper-xyz';search.dispatchEvent(new w.Event('input'));assert.equal(visible().length,0);assert(!d.getElementById('catalog-empty').hidden);
click('#clear-filters');assert.equal(visible().length,20);assert.equal(search.value,'');
choose('domains','Physics & biophysics');assert(visible().length>0&&visible().length<20);choose('domains','');assert.equal(visible().length,20);
assert(Array.from(d.querySelectorAll('.catalog-topics select')).every(s=>s.value===''));
const years=visible().map(r=>Number(r.dataset.year));assert(years.every((y,i)=>i===0||years[i-1]>=y));
console.log('PASS interaction tests: search, category intersections/toggles, reset, no results, pagination');
const method=d.getElementById('filter-methods'),area=d.getElementById('filter-domains');
const records=Array.from(d.querySelectorAll('.catalog-record'));
let unavailable=0;
for(const m of Array.from(method.options).slice(1).map(o=>o.value)){
  click('#clear-filters');choose('methods',m);
  for(const o of Array.from(area.options).slice(1)){
    const expected=records.filter(r=>JSON.parse(r.dataset.methods).includes(m)&&JSON.parse(r.dataset.domains).includes(o.value)).length;
    assert.equal(o.disabled,expected===0);assert(o.textContent.endsWith(`(${expected})`));
    if(!expected)unavailable++;
  }
}
assert.equal(unavailable,7);
click('#clear-filters');choose('domains','Mitochondrial biology & metabolism');choose('methods','Machine learning & statistical methods');
search.value='no-such-paper-xyz';search.dispatchEvent(new w.Event('input'));
assert(!method.selectedOptions[0].disabled);assert(!area.selectedOptions[0].disabled);assert(!method.options[0].disabled);
click('#clear-search');assert.equal(search.value,'');assert.equal(visible().length,6);assert.equal(area.value,'Mitochondrial biology & metabolism');
search.value='no-such-paper-xyz';search.dispatchEvent(new w.Event('input'));click('#empty-reset');assert.equal(visible().length,20);assert.equal(method.value,'');assert.equal(area.value,'');
// Defensive recovery if a stale UI or script supplies a now-unavailable pair.
choose('methods','Knowledge representation & semantic integration');choose('domains','Physics & biophysics');assert.equal(visible().length,0);assert(d.getElementById('catalog-empty-message').textContent.includes('provisional'));click('#empty-reset');
console.log('PASS all 35 pair counts, 7 unavailable pairs, selected/All recovery, clear-search and empty-state reset');

click('#clear-filters');choose('methods','Knowledge representation & semantic integration');
assert.equal(Array.from(area.options).find(o=>o.value==='Cancer').disabled,false);
choose('domains','Cancer');assert.equal(visible().length,2);
assert.deepEqual(visible().map(r=>r.id).sort(),['scholar-168','scholar-214']);
console.log('PASS knowledge representation × cancer regression: Petagraph and Data Distillery');
click('#clear-filters');choose('methods','Knowledge representation & semantic integration');choose('domains','Development & reproduction');assert(visible().some(r=>r.id==='scholar-063'));
click('#clear-filters');choose('methods','Measurement, signal processing & physical theory');choose('domains','Genetics & congenital disease');assert.equal(visible().length,2);assert.deepEqual(visible().map(r=>r.id).sort(),['scholar-043','scholar-057']);
assert(!d.getElementById('scholar-167'));
console.log('PASS reproduction tags, diagnostic-genetics intersection, malformed citation withheld');

// Run with: NODE_PATH=/path/to/node_modules node tests/catalog_dom.cjs
const {JSDOM}=require('jsdom');const fs=require('node:fs');const assert=require('node:assert/strict');const path=require('node:path');
const root=path.resolve(__dirname,'..');
const dom=new JSDOM(fs.readFileSync(path.join(root,'publications/index.html'),'utf8'),{runScripts:'outside-only'});
const w=dom.window;w.matchMedia=()=>({matches:false});w.eval(fs.readFileSync(path.join(root,'publications/catalog.js'),'utf8'));
const d=w.document;const visible=()=>Array.from(d.querySelectorAll('.catalog-record')).filter(e=>!e.hidden);const click=(s)=>d.querySelector(s).click();
assert.equal(visible().length,20);click('#show-more');assert.equal(visible().length,40);click('#clear-filters');assert.equal(visible().length,20);
click('[data-topic="Mitochondrial biology & metabolism"]');assert(!d.getElementById('rawk-accepted').hidden);
click('[data-topic="Machine learning & statistical methods"]');assert(!d.getElementById('rawk-accepted').hidden);assert(visible().every(r=>JSON.parse(r.dataset.methods).includes('Machine learning & statistical methods')));
const search=d.getElementById('publication-search');search.value='Rawk:';search.dispatchEvent(new w.Event('input'));assert.equal(visible().length,1);
search.value='no-such-paper-xyz';search.dispatchEvent(new w.Event('input'));assert.equal(visible().length,0);assert(!d.getElementById('catalog-empty').hidden);
click('#clear-filters');assert.equal(visible().length,20);assert.equal(search.value,'');
click('[data-topic="Physics & biophysics"]');assert(visible().length>0&&visible().length<20);click('[data-topic="Physics & biophysics"]');assert.equal(visible().length,20);
assert(Array.from(d.querySelectorAll('.topic-button')).every(b=>b.getAttribute('aria-pressed')==='false'));
console.log('PASS interaction tests: search, category intersections/toggles, reset, no results, pagination');

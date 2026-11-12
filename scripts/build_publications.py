#!/usr/bin/env python3
"""Render an escaped, searchable publication list. No network calls or private notes."""
import html,json,hashlib,re
from urllib.parse import quote
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def versioned_asset(relative):
    source=ROOT/relative
    digest=hashlib.sha256(source.read_bytes()).hexdigest()[:12]
    target=ROOT/'assets'/f'{source.stem}.{digest}{source.suffix}'
    target.parent.mkdir(exist_ok=True)
    target.write_bytes(source.read_bytes())
    return '/'+target.relative_to(ROOT).as_posix()
def esc(s):return html.escape(str(s),quote=True)
def render(data):
    script_path=versioned_asset('publications/catalog.js')
    records=[r for r in data['records'] if r['public_listing']]
    records.sort(key=lambda r:(-int(r['fields'].get('year','0')),r['fields']['title'].lower()))
    out=['''---
layout: default
title: Publications
nav: publications
description: Research across informatics, genetics, molecular biology, medicine and physics.
---
<section class="section shell publication-catalog" id="publications" aria-labelledby="publications-title">
  <div class="section-intro"><p class="eyebrow">Publications</p><div><h1 id="publications-title">Ideas across disciplines</h1><p>Explore research spanning knowledge representation, machine learning, data infrastructure, developmental biology, clinical research and physical science.</p></div></div>
  <div class="catalog-controls" id="catalog-controls" hidden>
    <label class="catalog-search">Search this research<input id="publication-search" type="search" placeholder="Title, author, journal or topic" autocomplete="off"></label>''']
    out.append('<div class="catalog-topics"><label for="publication-topic">Browse by topic<select id="publication-topic" aria-describedby="filter-help"><option value="">All publications</option>')
    for category in sorted(set(data['categories']['methods']+data['categories']['domains']),key=str.casefold):
        n=sum(category in r['methods']+r['domains'] for r in records)
        out.append(f'<option value="{esc(category)}">{esc(category)} ({n})</option>')
    out.append('</select></label></div>')
    out.append('''<div class="catalog-reset"><button type="button" id="clear-filters">All publications</button><span id="filter-help">Choose any topic to explore, or search within it. Papers can appear under multiple topics. Counts reflect your search; results are newest first.</span></div></div>
<p class="catalog-status" id="catalog-status" role="status" aria-live="polite">'''+str(len(records))+''' records</p>
<details class="catalog-note"><summary>About this bibliography</summary><p>Based on a Google Scholar export supplied on November 12, 2026. The list includes journal records, preprints, conference contributions and other research outputs. “Journal record” does not distinguish full articles from abstracts or corrections. Topic tags aid discovery and are primarily based on titles, with selected corrections supported by article content. They are not a comprehensive full-text classification. Clinical study design &amp; diagnostic validation includes trials, observational cohorts and research-stage diagnostic evaluation; the tag does not imply clinical approval or established clinical utility. Papers can appear in multiple categories.</p><p>Reconciliation with OSF and NIH My Bibliography is pending. Related versions have not been silently merged; repeated-title records are marked for review. Two incomplete-title records are withheld pending correction. Years and citation details are reproduced from the export.</p></details>
<noscript><p>All records are listed below. Enable JavaScript to search and filter.</p></noscript>
<div class="catalog-list">''')
    for r in records:
        f=r['fields'];year=f.get('year','Undated');title=f['title']
        attrs=' '.join(f'data-{k}="{esc(json.dumps(r[k],ensure_ascii=False))}"' for k in ['methods','domains'])
        citation=' · '.join(filter(None,[f.get('journal',f.get('booktitle',f.get('school',''))), 'Volume '+f['volume'] if f.get('volume') else '', 'Issue '+f['number'] if f.get('number') else '', f.get('pages','')]))
        authors=f['author'].replace(' and others',', et al.').replace(' and ','; ')
        out.append(f'<article class="catalog-record" id="{r["id"]}" {attrs} data-year="{year}" data-format="{esc(r["format"])}">')
        out.append(f'<p class="catalog-meta">{year} · {esc(r["format"])}</p><h2>{esc(title)}</h2><p class="catalog-authors">{esc(authors)}</p>')
        if citation:out.append(f'<p class="catalog-citation">{esc(citation)}</p>')
        if r['methods'] or r['domains']:out.append('<ul class="catalog-tags" aria-label="Research categories">'+''.join(f'<li>{esc(c)}</li>' for c in r['methods']+r['domains'])+'</ul>')
        if r['review_flags']:out.append('<p class="catalog-review">'+esc('; '.join(r['review_flags']))+'.</p>')
        if not r['links']:
            out.append(f'<a class="catalog-source-link" href="https://scholar.google.com/scholar?q={quote(chr(34)+title+chr(34))}">Find this title in Scholar</a>')
        for link in r['links']:out.append(f'<a href="{esc(link["url"])}">{esc(link["label"])}</a>')
        out.append('</article>')
    out.append('''</div><button type="button" id="show-more" hidden>Show more publications</button><div id="catalog-empty" hidden><p id="catalog-empty-message"></p><div class="catalog-empty-actions"><button type="button" id="clear-search">Clear search</button><button type="button" id="empty-reset">Show all publications</button></div></div>
<p class="catalog-footer">Additional source: <a href="https://www.med.upenn.edu/apps/faculty/index.php/g20001121/p8820417">Penn faculty profile</a>.</p>
</section>
<script src="{{ '__CATALOG_ASSET__' | relative_url }}" defer></script>
''')
    # Retain existing compact verified preprint section, consistent with homepage.
    old=(ROOT/'scripts/preprints.html').read_text()
    return '\n'.join(out).replace('__CATALOG_ASSET__',script_path)+old
if __name__=='__main__':
    layout=ROOT/'_layouts/default.html'
    layout.write_text(re.sub(r'<link rel="stylesheet" href="[^"]+">', '<link rel="stylesheet" href="{{ \"'+versioned_asset('styles.css')+'\" | relative_url }}">', layout.read_text()))
    data=json.loads((ROOT/'data/publications.json').read_text());(ROOT/'publications/index.html').write_text(render(data))

#!/usr/bin/env python3
"""Import a Scholar BibTeX export without merging records or inventing metadata.
Dependencies: bibtexparser==2.1.0, pylatexenc==2.11.
"""
import argparse, collections, hashlib, json, re
from pathlib import Path
import bibtexparser
from pylatexenc.latex2text import LatexNodes2Text

ROOT = Path(__file__).resolve().parents[1]
DECODER = LatexNodes2Text()

def clean(value):
    return re.sub(r'\s+', ' ', DECODER.latex_to_text(value)).strip()

def parse(source):
    records=[]
    # Parse separately: Scholar can reuse BibTeX keys for distinct versions.
    for i, block in enumerate(re.split(r'(?=^@)', source.strip().strip('`').strip(), flags=re.M), 1):
        if not block.strip(): continue
        parsed = bibtexparser.parse_string(block)
        if len(parsed.entries) != 1 or parsed.failed_blocks:
            raise ValueError(f'Cannot parse source record {i}')
        entry=parsed.entries[0]
        raw={k:v.value for k,v in entry.fields_dict.items()}
        fields={k:clean(v) for k,v in raw.items()}
        records.append({'id':f'scholar-{i:03d}', 'citation_key':entry.key,
                        'bibtex_type':entry.entry_type, 'fields':fields,
                        'source_fields':raw, 'methods':[], 'domains':[],
                        'classification_basis':'Unclassified', 'review_flags':[]})
    keys=collections.Counter(r['citation_key'] for r in records)
    titles=collections.Counter(r['fields']['title'].casefold() for r in records)
    for r in records:
        f=r['fields']; flags=r['review_flags']
        if keys[r['citation_key']]>1: flags.append('Repeated citation key; version review pending')
        if titles[f['title'].casefold()]>1: flags.append('Repeated title; version review pending')
        if not f.get('year'): flags.append('Year not supplied')
        if not f.get('journal') and not f.get('booktitle') and r['bibtex_type']!='phdthesis': flags.append('Venue not supplied')
        r['public_listing']=f['title'] not in ['and Richard T. Scott Jr., MD, HCLD','Stratification of Neurogenic Bladder Risk in']
        if not r['public_listing']: flags.append('Incomplete title; withheld from public listing')
        venue=f.get('journal','').lower()
        r['format']='Preprint' if any(s in venue for s in ['biorxiv','arxiv','ssrn','medrxiv']) else {'inproceedings':'Conference contribution','phdthesis':'Thesis','misc':'Other record'}.get(r['bibtex_type'],'Journal record')
        # Journal record does not assert full-length article or peer review.
        r['links']=[]
    return records

def main():
    p=argparse.ArgumentParser();p.add_argument('source');p.add_argument('--output',default=str(ROOT/'data/publications.json'));a=p.parse_args()
    b=Path(a.source).read_bytes();records=parse(b.decode('utf-8'))
    payload={'source':'Google Scholar BibTeX export supplied by Deanne Taylor','source_date':'2026-11-12','source_sha256':hashlib.sha256(b).hexdigest(),'reconciliation':'OSF and NIH My Bibliography reconciliation pending','records':records}
    Path(a.output).write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n')
    print(f'{len(records)} records; {sum(r["public_listing"] for r in records)} listed; no records merged.')
if __name__=='__main__': main()

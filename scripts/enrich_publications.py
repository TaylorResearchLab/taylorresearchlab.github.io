#!/usr/bin/env python3
"""Apply verified public links already used by the website; record accepted RAWK separately."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
LINKS={
'Petagraph: A large-scale unifying knowledge graph framework for integrating biomolecular and biomedical data':'https://www.nature.com/articles/s41597-024-04070-w',
'Benchmarking transformer embedding models for biomedical terminology standardization':'https://pubmed.ncbi.nlm.nih.gov/40718094/',
'MOSAIC: Learning Graph Node Embeddings from Spectrally Isolated Dominant Subspaces of Accumulated Diffusion Operators':'https://doi.org/10.64898/2026.09.28.754397',
}
def enrich(data):
    for r in data['records']:
        if r['fields']['title'] in LINKS:r['links']=[{'label':'Read paper','url':LINKS[r['fields']['title']]}]
    data['records']=[r for r in data['records'] if r['id']!='rawk-accepted']
    data['records'].append({
      'id':'rawk-accepted','citation_key':None,'bibtex_type':'article',
      'fields':{'title':'Rawk: Metabolic pathway local enrichment analysis via random walks on metabolic reaction network',
        'author':'Zhang, Yuanchao and Stear, Benjamin J and Keith, Kelsey and Mitchell, Dana V and Lahiri, Aditya and Ahooyi, Taha Mohseni and Taylor, Deanne Marie',
        'journal':'PLOS Computational Biology','year':'2026'},
      'source_fields':{},'source':'Title and authors from revised manuscript; acceptance reported by Deanne Taylor on November 12, 2026',
      'methods':['Machine learning & statistical methods'],'domains':['Mitochondrial biology & metabolism'],
      'classification_basis':'Research area confirmed by Deanne Taylor; random-walk enrichment method stated in manuscript title',
      'review_flags':['Accepted; final published citation pending. Title and authors shown from revised manuscript'],
      'public_listing':True,'format':'Accepted manuscript',
      'links':[{'label':'Code','url':'https://github.com/TaylorResearchLab/Rawk'}]})
    return data
if __name__=='__main__':
    p=ROOT/'data/publications.json';p.write_text(json.dumps(enrich(json.loads(p.read_text())),ensure_ascii=False,indent=2)+'\n')

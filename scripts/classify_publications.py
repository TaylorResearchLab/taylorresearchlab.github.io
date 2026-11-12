#!/usr/bin/env python3
"""Conservative, reviewable title-based discovery tags, not full-text conclusions."""
import json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
METHODS={
'Knowledge representation & semantic integration':r'knowledge graph|ontology|ontolog|semantic|phenotype ontology|phenotype similarity|biomarkerkb|terminology standardization|bifo:',
'Machine learning & statistical methods':r'embedding|mosaic:|classifier|classification|statistical|survival analysis|association stud|association scan|snp-set|gene-based analys|gene-based genome|gene-interaction-sensitive|representation learning|metabolic variation|models of cellular metabolism|pathvar|gene set analysis',
'Data infrastructure & research software':r'data resource|data ecosystem|genelab|pipeline|workflow|interoperab|federated|fair |research support|reporting single-cell|scedar|rna-seq 2g|gsa-genie|open pediatric cancer|harmoniz|open science|agent skill|ddkg\. skill|personas|library services',
'Multiscale analysis & visualization':r'single.cell|spatial|multi.omics|multiomics|atlas|tableau|visualization|transcriptome|transcriptomic|gene expression|rna-seq|rna-sequencing|proteomic|peptidom',
'Measurement, signal processing & physical theory':r'nuclear magnetic|\bnmr\b|\bmri\b|coherence transfer|dipolar|chemical shift|quantum|electromagnetic|screening methodology|development and validation|capzyme|xact-seq|transcript end readout|dna fingerprint|sequencing.*methodology|snp array based|q.?pcr|quantitative real.time',
}
DOMAINS={
'Development & reproduction':r'developmental|development at single|prenatal|pediatric cell atlas|gtex|reproduc|embryo|oocyte|blastocyst|trophectoderm|aneuploid|fertil|\bivf\b|ovum|donor|pregnan|ovarian|follicle|azoosperm|preimplant|sacrocolpo|prolapse|uterine|vulvodynia|monogenic disease',
'Genetics & congenital disease':r'congenital|birth defect|conotruncal|22q11|spina bifida|neurogenic bladder|ap2m1|encephalopath|scn2a|telomere biology disorders|pathogenic.*variant|gene-trait|genomic medicine|genetic research|germline',
'Cancer':r'cancer|leukemia|leukaemia|lymphoma|melanoma|tumor|oncogene|medulloblastoma|\baml\b|neoplasm|car t.cell|cart-19|cd22.directed',
'Infection, immunity & clinical outcomes':r'covid|sars|coronavirus|sepsis|meningitis|infect|inflamm|immun|\bhiv\b|respiratory distress|\bards\b|\bsle\b|cvid|clinical outcome|electronic health|real.world data|stat3|stat signaling|t cell|macrophage',
'Mitochondrial biology & metabolism':r'mitochond|metaboli|ndufs2|oxidative phosphorylation|lipid dysregulation|eating|obesity|metabolic|one-carbon',
'Molecular & cellular mechanisms':r'transcription|splic|rna.binding|rna metabolism|polymerase|promoter|clathrin|telomere|dna damage|smooth muscle|bone formation|bone loss|cell growth|cell proliferation|glucocorticoid|sphingosine|ire1|receptor|hematopoietic|chromatin|regulatory t cell|cd9|bap1|microrna|mir-2392',
'Physics & biophysics':r'nuclear magnetic|\bnmr\b|\bmri\b|coherence transfer|dipolar|chemical shift|quantum|electromagnetic',
}

def classify(records):
    for r in records:
        title=r['fields']['title'].lower()
        r['methods']=[name for name,pattern in METHODS.items() if re.search(pattern,title)]
        r['domains']=[name for name,pattern in DOMAINS.items() if re.search(pattern,title)]
        r['classification_basis']='Title-based discovery tags; full-text classification not reviewed'
    return records
if __name__=='__main__':
    p=ROOT/'data/publications.json';data=json.loads(p.read_text());classify(data['records'])
    data['categories']={'methods':list(METHODS),'domains':list(DOMAINS)}
    p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    print('Unclassified:',[(r['id'],r['fields']['title']) for r in data['records'] if not r['methods'] and not r['domains']])

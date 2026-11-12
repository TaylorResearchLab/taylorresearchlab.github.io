import importlib.util,json,unittest
from pathlib import Path
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('builder',ROOT/'scripts/build_publications.py');builder=importlib.util.module_from_spec(spec);spec.loader.exec_module(builder)
class PublicationTests(unittest.TestCase):
 def setUp(self):self.data=json.loads((ROOT/'data/publications.json').read_text())
 def test_source_conservation(self):
  records=self.data['records'];original=[r for r in records if r['id'].startswith('scholar-')]
  self.assertEqual(len(original),231);self.assertEqual(len({r['id'] for r in records}),232)
  self.assertEqual(sum(r['public_listing'] for r in original),229)
  self.assertTrue(all(r['fields'].get('title') and r['fields'].get('author') for r in records))
 def test_generated_file_current(self):self.assertEqual((ROOT/'publications/index.html').read_text(),builder.render(self.data))
 def test_only_declared_categories(self):
  for r in self.data['records']:
   for axis in ['methods','domains']:self.assertTrue(set(r[axis])<=set(self.data['categories'][axis]))
  self.assertNotIn('Space biology',self.data['categories']['domains'])
  rawk=next(r for r in self.data['records'] if r['id']=='rawk-accepted')
  self.assertIn('Mitochondrial biology & metabolism',rawk['domains'])
 def test_newest_first(self):
  class Articles(HTMLParser):
   def __init__(self):super().__init__();self.years=[]
   def handle_starttag(self,tag,attrs):
    d=dict(attrs)
    if tag=='article' and d.get('class')=='catalog-record':self.years.append(int(d['data-year']) if d['data-year'].isdigit() else 0)
  parser=Articles();parser.feed(builder.render(self.data));self.assertEqual(len(parser.years),230);self.assertEqual(parser.years,sorted(parser.years,reverse=True))
 def test_escape(self):self.assertEqual(builder.esc('<script>"&'), '&lt;script&gt;&quot;&amp;')
 def test_private_content_not_exported(self):
  text=(ROOT/'publications/index.html').read_text()
  for forbidden in ['libfile_','/user_notes/','notion.so','app.notion.com','CalpicoFile_']:self.assertNotIn(forbidden,text)
 def test_preprint_preview_retained(self):
  preview=(ROOT/'scripts/preprints.html').read_text();home=(ROOT/'index.html').read_text()
  for url in ['https://doi.org/10.64898/2026.09.28.754397','https://www.biorxiv.org/content/10.64898/2026.09.26.754400v1']:
   self.assertIn(url,preview);self.assertIn(url,home)
if __name__=='__main__':unittest.main()

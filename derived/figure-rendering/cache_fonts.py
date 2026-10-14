from pathlib import Path
import re,urllib.request,hashlib
D=Path(__file__).resolve().parent;A=D/'preview-app';F=A/'fonts';F.mkdir(exist_ok=True)
if not (D/'google-fonts.css').exists():
 url='https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
 (D/'google-fonts.css').write_bytes(urllib.request.urlopen(url).read())
css=(D/'google-fonts.css').read_text()
urls=set(re.findall(r'url\((https://fonts\.gstatic\.com/[^)]+)\)',css))
for url in urls:
 name=hashlib.sha256(url.encode()).hexdigest()[:16]+'.ttf'
 if not (F/name).exists():(F/name).write_bytes(urllib.request.urlopen(url).read())
 css=css.replace(url,'fonts/'+name)
current=(A/'preview.css').read_text();current=re.sub(r'@import url\("https://fonts\.googleapis\.com/[^\"]+"\);', '',current)
(A/'preview.css').write_text(css+'\n'+current)
print('Cached original Google font family files:',len(urls))

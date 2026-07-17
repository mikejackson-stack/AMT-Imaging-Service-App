import re
c = open('index.html', encoding='utf-8').read()
scripts = list(re.finditer(r'<script>', c))
m = scripts[1]
end = c.find('</script>', m.end())
js = c[m.end():end]
open('C:/temp/app_check.js', 'w', encoding='utf-8').write(js)
print('Length:', len(js), 'File:', len(c))

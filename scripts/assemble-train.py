"""Builds train.html from src/train.js, reusing the CSS of index.html so both pages look the same.
Run after editing src/train.js:  python3 scripts/assemble-train.py"""
import pathlib
root = pathlib.Path(__file__).resolve().parent.parent
idx = (root / 'index.html').read_text(encoding='utf-8')
css = idx[idx.index('<style>'):idx.index('</style>') + len('</style>')]
js = (root / 'src' / 'train.js').read_text(encoding='utf-8')
head = (root / 'src' / 'train-head.html').read_text(encoding='utf-8')
body = (root / 'src' / 'train-body.html').read_text(encoding='utf-8')
(root / 'train.html').write_text(head + css + '\n' + body + js + '\n</script>\n</body>\n</html>\n', encoding='utf-8')
print('Built train.html')

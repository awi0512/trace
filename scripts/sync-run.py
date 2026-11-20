"""Copies the shared BHAGODA block (src/run.js, between /*RUN-BEGIN*/ and /*RUN-END*/) into index.html and
src/train.js (the engine train.html, bus.html and port.html are built from). Run before the assemblers."""
import pathlib
root = pathlib.Path(__file__).resolve().parent.parent
block = (root / 'src' / 'run.js').read_text(encoding='utf-8').strip() + '\n'
for name in ['index.html', 'src/train.js']:
    p = root / name; s = p.read_text(encoding='utf-8')
    if '/*RUN-BEGIN*/' in s:
        i = s.index('/*RUN-BEGIN*/'); j = s.index('/*RUN-END*/', i) + len('/*RUN-END*/\n')
        s = s[:i] + block + s[j:]
    else:
        a = s.index('function storyRecord('); a = s.index('\n}', a) if False else s.index('saveC(C);return C;}\n', a) + len('saveC(C);return C;}\n')
        s = s[:a] + block + s[a:]
    p.write_text(s, encoding='utf-8')
print('Synced run block')

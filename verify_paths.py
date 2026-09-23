import os
import sys
import re

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

matches = re.findall(r'src="([^"]+)"', html)
missing = []
found = 0

for m in matches:
    # ignore external links or data URIs
    if m.startswith('http') or m.startswith('data:'):
        continue
    if not os.path.exists(m):
        missing.append(m)
    else:
        found += 1

print(f"Kiểm tra {len(matches)} thẻ src trong index.html:")
print(f" - Tồn tại hợp lệ: {found} files")
print(f" - Bị thiếu: {len(missing)} files")

if missing:
    print("\nDanh sách file thiếu:")
    for m in missing:
        print("  -", m)

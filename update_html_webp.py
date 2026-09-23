import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace .jpg references in 'Ảnh chương I', 'Ảnh chương II', 'Ảnh chương III' with .webp
def fix_img_paths(text):
    text = text.replace('.jpg"', '.webp"')
    return text

# Match story-media-stack containers
pattern = re.compile(r'(<div class="timeline-media story-media-stack".*?<!-- END STORY MEDIA STACK -->|<div class="timeline-media story-media-stack".*?</div>\s*</div>)', re.DOTALL)

def replacer(match):
    return match.group(0).replace('.jpg"', '.webp"')

new_content = re.sub(r'assets/images/Ảnh chương (I|II|III)/([^"]+)\.jpg', r'assets/images/Ảnh chương \1/\2.webp', content)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated all Chapter I, II, III image paths in index.html to WebP.")

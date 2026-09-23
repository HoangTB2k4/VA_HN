import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

def process_img(match):
    img_tag = match.group(0)
    # Skip if already has loading attribute or is hero/vinyl image
    if 'loading=' in img_tag or 'hero-img' in img_tag or 'vpc-photo-img' in img_tag:
        return img_tag
    
    # Add loading="lazy" decoding="async"
    new_tag = img_tag.replace('<img ', '<img loading="lazy" decoding="async" ')
    return new_tag

pattern = re.compile(r'<img\s+[^>]+>', re.IGNORECASE)
updated_content = pattern.sub(process_img, content)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(updated_content)

print("Successfully updated index.html with lazy loading attributes!")

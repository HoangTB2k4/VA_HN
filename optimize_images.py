import os
import sys
from PIL import Image, ImageOps

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')


IMAGES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "assets", "images"))

def optimize_image(filepath):
    try:
        rel_path = os.path.relpath(filepath, IMAGES_DIR)
        orig_size = os.path.getsize(filepath)
        
        # Determine max dimension based on folder/file type
        if "thumbs" in rel_path.lower():
            max_dim = 600
            quality = 80
        elif "qr" in rel_path.lower():
            max_dim = 800
            quality = 85
        else:
            max_dim = 1200
            quality = 83

        with Image.open(filepath) as img:
            # Auto-rotate based on EXIF tag
            try:
                img = ImageOps.exif_transpose(img)
            except Exception:
                pass

            # Convert RGBA / P to RGB if JPEG output
            if img.mode in ("RGBA", "P", "LA"):
                background = Image.new("RGB", img.size, (255, 255, 255))
                if img.mode == "P":
                    img = img.convert("RGBA")
                background.paste(img, mask=img.split()[-1] if "A" in img.mode else None)
                img = background

            w, h = img.size
            needs_resize = w > max_dim or h > max_dim

            if needs_resize:
                if w > h:
                    new_w = max_dim
                    new_h = int(h * (max_dim / w))
                else:
                    new_h = max_dim
                    new_w = int(w * (max_dim / h))
                img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)

            # Save optimized JPEG
            tmp_path = filepath + ".tmp.jpg"
            img.save(tmp_path, "JPEG", quality=quality, optimize=True, progressive=True)
            
            new_size = os.path.getsize(tmp_path)
            
            # If optimized size is smaller, replace original
            if new_size < orig_size:
                os.replace(tmp_path, filepath)
                saved_bytes = orig_size - new_size
                print(f"[OPTIMIZED] {rel_path}: {orig_size/1024/1024:.2f}MB -> {new_size/1024/1024:.2f}MB (saved {saved_bytes/1024/1024:.2f}MB)")
                return orig_size, new_size
            else:
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)
                print(f"[SKIPPED] {rel_path}: Already optimal ({orig_size/1024:.1f}KB)")
                return orig_size, orig_size

    except Exception as e:
        print(f"[ERROR] {filepath}: {e}")
        return 0, 0

def main():
    print(f"Scanning images in: {IMAGES_DIR}")
    total_orig = 0
    total_new = 0
    count = 0

    valid_exts = (".jpg", ".jpeg", ".png", ".webp")

    for root, dirs, files in os.walk(IMAGES_DIR):
        for file in files:
            if file.lower().endswith(valid_exts) and not file.endswith(".tmp.jpg"):
                filepath = os.path.join(root, file)
                orig, new = optimize_image(filepath)
                total_orig += orig
                total_new += new
                count += 1

    total_saved = total_orig - total_new
    saved_percent = (total_saved / total_orig * 100) if total_orig > 0 else 0
    print("\n" + "="*50)
    print(f"SUMMARY: Processed {count} images.")
    print(f"Original total size: {total_orig / 1024 / 1024:.2f} MB")
    print(f"Optimized total size: {total_new / 1024 / 1024:.2f} MB")
    print(f"Total space saved:   {total_saved / 1024 / 1024:.2f} MB ({saved_percent:.1f}%)")
    print("="*50)

if __name__ == "__main__":
    main()

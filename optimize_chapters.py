import os
import sys
from PIL import Image, ImageOps

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHAPTER_FOLDERS = ["Ảnh chương I", "Ảnh chương II", "Ảnh chương III"]

def cleanup_and_fix_filenames():
    print("=== DỌN DẸP & KHẮC PHỤC TÊN FILE ===")
    for folder in CHAPTER_FOLDERS:
        dir_path = os.path.join(BASE_DIR, "assets", "images", folder)
        if not os.path.exists(dir_path):
            continue
        
        for fname in os.listdir(dir_path):
            fpath = os.path.join(dir_path, fname)
            
            # Xóa các file tạm .tmp.jpg
            if fname.endswith(".tmp.jpg"):
                print(f"Xóa file tạm: {fname}")
                os.remove(fpath)
                continue
            
            # Sửa các file không có phần mở rộng (ví dụ file 13, file 6)
            if not os.path.splitext(fname)[1]:
                try:
                    with Image.open(fpath) as img:
                        fmt = img.format.lower() if img.format else "jpg"
                        if fmt == "jpeg":
                            fmt = "jpg"
                        new_fname = f"{fname}.{fmt}"
                        new_fpath = os.path.join(dir_path, new_fname)
                        print(f"Đổi tên file không đuôi: {fname} -> {new_fname}")
                        os.rename(fpath, new_fpath)
                except Exception as e:
                    print(f"Không thể đọc file {fname}: {e}")

def convert_to_webp(max_dim=900, quality=80):
    print("\n=== CHUYỂN ĐỔI ẢNH CHƯƠNG SANG WEBP ===")
    total_orig_size = 0
    total_webp_size = 0
    count = 0

    valid_exts = (".jpg", ".jpeg", ".png")

    for folder in CHAPTER_FOLDERS:
        dir_path = os.path.join(BASE_DIR, "assets", "images", folder)
        if not os.path.exists(dir_path):
            continue
        
        print(f"\nProcessing folder: {folder}")
        for fname in os.listdir(dir_path):
            ext = os.path.splitext(fname)[1].lower()
            if ext in valid_exts:
                orig_path = os.path.join(dir_path, fname)
                base_name = os.path.splitext(fname)[0]
                webp_path = os.path.join(dir_path, f"{base_name}.webp")
                
                orig_size = os.path.getsize(orig_path)
                total_orig_size += orig_size
                
                try:
                    with Image.open(orig_path) as img:
                        # Tự động xoay ảnh theo EXIF orientation
                        try:
                            img = ImageOps.exif_transpose(img)
                        except Exception:
                            pass
                        
                        # Chuyển RGBA / P sang RGB
                        if img.mode in ("RGBA", "P", "LA"):
                            bg = Image.new("RGB", img.size, (255, 255, 255))
                            if img.mode == "P":
                                img = img.convert("RGBA")
                            bg.paste(img, mask=img.split()[-1] if "A" in img.mode else None)
                            img = bg
                        elif img.mode != "RGB":
                            img = img.convert("RGB")
                        
                        w, h = img.size
                        if w > max_dim or h > max_dim:
                            if w > h:
                                new_w = max_dim
                                new_h = int(h * (max_dim / w))
                            else:
                                new_h = max_dim
                                new_w = int(w * (max_dim / h))
                            img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
                        
                        img.save(webp_path, "WEBP", quality=quality, method=6)
                        
                        webp_size = os.path.getsize(webp_path)
                        total_webp_size += webp_size
                        count += 1
                        
                        saved_kb = (orig_size - webp_size) / 1024
                        percent = (1 - webp_size / orig_size) * 100
                        print(f"  [WEBP] {fname} ({orig_size/1024:.1f}KB) -> {base_name}.webp ({webp_size/1024:.1f}KB, -{percent:.1f}%)")
                        
                except Exception as e:
                    print(f"  [LỖI] {fname}: {e}")

    print("\n" + "=" * 55)
    print(f"TỔNG KẾT NÉN ẢNH {count} TẤM 3 CHƯƠNG:")
    print(f"Dung lượng ban đầu : {total_orig_size / 1024 / 1024:.2f} MB")
    print(f"Dung lượng sau WebP : {total_webp_size / 1024 / 1024:.2f} MB")
    saved_mb = (total_orig_size - total_webp_size) / 1024 / 1024
    saved_pct = (1 - total_webp_size / total_orig_size) * 100 if total_orig_size > 0 else 0
    print(f"Tiết kiệm được      : {saved_mb:.2f} MB ({saved_pct:.1f}%)")
    print("=" * 55)

if __name__ == "__main__":
    cleanup_and_fix_filenames()
    convert_to_webp(max_dim=900, quality=80)

# Thiệp cưới online — Vân Anh & Hoài Nam

Thiệp cưới dạng trang web 1 trang (single-page), responsive trên cả máy tính và điện thoại,
có đếm ngược, album ảnh, nhạc nền, và form RSVP gửi ngầm vào Google Sheet.

---

## 1. Cấu trúc thư mục

```
wedding-invitation/
├── index.html
├── style.css
├── script.js
├── assets/
│   ├── images/          ← ảnh của bạn để vào đây
│   └── audio/
│       └── background-music.mp3   ← nhạc nền của bạn để vào đây
└── README.md
```

---

## 2. Việc bạn cần làm trước khi đăng (checklist)

### A. Thay ảnh
Mở `index.html`, tìm các dòng có chữ `TODO(bạn)` — mỗi dòng đó có 1 comment
chỉ rõ ảnh nào cần thay. Cách thay đơn giản nhất:
1. Đặt ảnh của bạn vào thư mục `assets/images/` (đặt tên file dễ nhớ, không dấu, không khoảng trắng — ví dụ `hero-cover.jpg`).
2. Trong `index.html`, tìm dòng `<img src="...">` tương ứng, sửa `src="..."` thành đường dẫn ảnh của bạn, ví dụ:
   ```html
   <img src="assets/images/hero-cover.jpg" alt="Vân Anh và Hoài Nam">
   ```
3. Ảnh album nằm trong phần `<div id="album-grid">` — bạn có thể thêm/xoá bớt các
   khối `<div class="album-item">...</div>` tuỳ số lượng ảnh bạn có.

### B. Thêm nhạc nền
1. Chuẩn bị file nhạc định dạng `.mp3`, dung lượng nên dưới ~8MB để tải nhanh.
2. Đặt file vào `assets/audio/background-music.mp3` — **đúng tên này thì không cần sửa code**.
   Nếu muốn đặt tên khác, mở `index.html`, tìm dòng:
   ```html
   <source src="assets/audio/background-music.mp3" type="audio/mpeg">
   ```
   và sửa lại đường dẫn cho khớp.
3. Nút loa 🔊 ở góc phải màn hình dùng để bật/tắt nhạc. Một số trình duyệt (đặc biệt
   trên điện thoại) chặn tự động phát nhạc — nhạc sẽ tự thử phát khi khách bấm "Mở thiệp mời",
   nếu bị chặn thì khách chỉ cần bấm nút loa 1 lần.

### C. Điền ngày giờ, địa điểm cưới thật
Có 2 chỗ cần sửa:

**1. Trong `script.js`** (để đếm ngược chạy đúng), tìm dòng:
```js
const WEDDING_DATETIME = "2026-12-31T17:00:00+07:00";
```
Sửa lại đúng ngày giờ cưới của bạn, giữ nguyên định dạng `YYYY-MM-DDTHH:mm:ss+07:00`.

**2. Trong `index.html`**, tìm các dòng có `<!-- TODO(bạn): điền ngày cưới... -->`
hoặc `<!-- TODO(bạn): điền tên địa điểm... -->` và sửa nội dung hiển thị (ngày, giờ đón khách,
tên + địa chỉ nhà hàng/trung tâm tiệc cưới, lịch trình chi tiết).

Với phần bản đồ, tìm dòng:
```html
<a href="https://www.google.com/maps" ...>Xem bản đồ</a>
```
Thay bằng link Google Maps thật của địa điểm bạn (mở Google Maps, tìm địa điểm, bấm
"Chia sẻ" → "Sao chép liên kết", dán link đó vào `href="..."`).

### D. Cấu hình Google Form để nhận RSVP về Google Sheet

Đây là phần quan trọng nhất — làm theo đúng thứ tự:

**Bước 1 — Tạo Google Form**
1. Vào [forms.google.com](https://forms.google.com) → tạo form mới.
2. Thêm đúng 4 câu hỏi theo thứ tự (tên câu hỏi tuỳ ý, không ảnh hưởng code):
   - Câu 1: dạng "Đoạn" (Short answer) — Họ và tên
   - Câu 2: dạng "Đoạn" (Short answer) — Bạn có tham dự?
   - Câu 3: dạng "Đoạn" (Short answer) — Số người tham dự
   - Câu 4: dạng "Đoạn văn" (Paragraph) — Lời nhắn
3. Vào tab **Câu trả lời (Responses)** → bấm biểu tượng Google Sheets màu xanh
   để tạo 1 Google Sheet liên kết tự động nhận dữ liệu.

**Bước 2 — Lấy entry ID của từng câu hỏi**
1. Mở form ở chế độ xem trước (bấm icon con mắt 👁 góc trên phải).
2. Nhấn `F12` (hoặc chuột phải → "Kiểm tra"/Inspect) để mở DevTools.
3. Bấm `Ctrl+F` (tìm trong DevTools) và gõ `entry.` — bạn sẽ thấy mỗi câu hỏi
   có 1 mã dạng `entry.123456789`.
4. Ghi lại đúng 4 mã theo đúng thứ tự câu hỏi (Họ tên / Tham dự / Số người / Lời nhắn).

*Cách khác dễ hơn nếu bạn không quen DevTools:* tìm trên YouTube từ khoá
"lấy entry id google form" — có rất nhiều video hướng dẫn trực quan bằng tiếng Việt.

**Bước 3 — Lấy link submit**
1. Bấm nút "Gửi" (Send) trên form → chọn tab link (biểu tượng 🔗) → sao chép link.
2. Link sẽ có dạng: `https://docs.google.com/forms/d/e/1FAIpQL.../viewform`
3. Đổi chữ `viewform` ở cuối thành `formResponse`:
   `https://docs.google.com/forms/d/e/1FAIpQL.../formResponse`

**Bước 4 — Dán vào code**
Mở `script.js`, tìm khối:
```js
const GOOGLE_FORM_CONFIG = {
  formActionUrl: "https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse",
  entryIds: {
    name: "entry.111111111",
    attend: "entry.222222222",
    guests: "entry.333333333",
    message: "entry.444444444"
  }
};
```
Thay `formActionUrl` bằng link `formResponse` bạn vừa lấy, và thay 4 mã `entry.xxxxxxx`
đúng theo thứ tự bạn ghi lại ở Bước 2.

**Lưu ý:** vì giới hạn kỹ thuật của Google Form, trang web sẽ luôn báo "gửi thành công"
sau khi bấm nút (không thể kiểm tra chắc chắn Google có nhận được hay không do
cơ chế bảo mật của Google). Bạn nên tự gửi thử 1 lần để kiểm tra dữ liệu có về
đúng Google Sheet không, trước khi gửi link cho khách mời.

### E. QR chuyển khoản mừng cưới (tuỳ chọn)
Đặt ảnh QR vào `assets/images/qr-bank.png`, và sửa các dòng
`<!-- TODO(bạn): tên ngân hàng -->`, `<!-- TODO(bạn): số tài khoản -->` trong `index.html`.
Nếu không dùng phần này, có thể xoá cả section `<section id="gift">...</section>`.

---

## 3. Đăng lên GitHub Pages (miễn phí)

1. Tạo tài khoản GitHub nếu chưa có: [github.com](https://github.com)
2. Tạo repository mới (ví dụ tên `van-anh-hoai-nam-wedding`), để chế độ **Public**.
3. Upload toàn bộ file/thư mục trong `wedding-invitation/` lên repo đó
   (dùng giao diện web GitHub: "Add file" → "Upload files", kéo thả cả thư mục vào).
4. Vào **Settings** của repo → mục **Pages** (thanh bên trái).
5. Ở "Source", chọn nhánh `main`, thư mục `/ (root)` → bấm **Save**.
6. Đợi khoảng 1–2 phút, link trang sẽ hiện dạng:
   `https://<tên-tài-khoản>.github.io/<tên-repo>/`
7. Mở link đó để kiểm tra, rồi gửi cho khách mời.

**Mẹo:** mỗi lần bạn sửa ảnh/nội dung và upload lại file lên GitHub, trang sẽ tự
cập nhật sau khoảng 1 phút, không cần làm lại từ đầu.

---

## 4. Kiểm tra trước khi gửi cho khách

- [ ] Mở thử trên điện thoại thật (không chỉ máy tính) để chắc chắn responsive đẹp
- [ ] Bấm nút loa kiểm tra nhạc phát được
- [ ] Gửi thử 1 RSVP để chắc dữ liệu về đúng Google Sheet
- [ ] Kiểm tra link Google Maps dẫn đúng địa điểm
- [ ] Kiểm tra tất cả ảnh đã thay đúng (không còn ảnh mẫu Unsplash)
- [ ] Kiểm tra ngày giờ đếm ngược đúng
- [ ] Thử chia sẻ link qua Zalo/Messenger xem ảnh preview (Open Graph) hiện đúng chưa

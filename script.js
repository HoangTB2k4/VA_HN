/* =========================================================
   VÂN ANH & HOÀI NAM — SCRIPT.JS
   ========================================================= */

/* ---------------------------------------------------------
   CẤU HÌNH — BẠN CHỈ CẦN SỬA Ở ĐÂY
   --------------------------------------------------------- */

// TODO(bạn): điền ngày giờ cưới chính xác để đếm ngược chạy đúng
// Định dạng: "YYYY-MM-DDTHH:mm:ss" theo giờ Việt Nam (+07:00)
const WEDDING_DATETIME = "2026-12-31T17:00:00+07:00";

// TODO(bạn): cấu hình Google Form ẩn cho RSVP
// Cách lấy:
// 1. Tạo 1 Google Form với các câu hỏi: Họ tên / Bạn có tham dự? / Số người / Lời nhắn
// 2. Mở Form ở chế độ xem trước (Preview) > bấm chuột phải > "Xem nguồn trang" (View Page Source)
//    hoặc dùng DevTools (F12) > tìm các thẻ <input> có "name=entry.xxxxxxx"
// 3. Lấy link submit: thay "viewform" trong link Form bằng "formResponse"
//    Ví dụ: https://docs.google.com/forms/d/e/XXXXXXXXX/formResponse
const GOOGLE_FORM_CONFIG = {
  formActionUrl: "https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse", // TODO(bạn)
  entryIds: {
    name: "entry.111111111",      // TODO(bạn): entry ID của câu "Họ và tên"
    attend: "entry.222222222",    // TODO(bạn): entry ID của câu "Bạn có tham dự?"
    guests: "entry.333333333",    // TODO(bạn): entry ID của câu "Số người tham dự"
    message: "entry.444444444"    // TODO(bạn): entry ID của câu "Lời nhắn"
  }
};

/* ---------------------------------------------------------
   0. HIỆU ỨNG CÁNH HOA RƠI & KIM TUYẾN LẤP LÁNH (PETAL CANVAS)
   --------------------------------------------------------- */
(function initPetalCanvas() {
  const canvas = document.getElementById('petal-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const petals = [];
  const TOTAL_PETALS = 28;
  const TOTAL_SPARKLES = 20;

  class Petal {
    constructor() {
      this.reset(true);
    }
    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -20;
      this.size = Math.random() * 8 + 7;
      this.speedY = Math.random() * 0.8 + 0.5;
      this.speedX = Math.random() * 0.5 - 0.25;
      this.angle = Math.random() * Math.PI * 2;
      this.spin = (Math.random() - 0.5) * 0.02;
      this.opacity = Math.random() * 0.6 + 0.35;
      // Soft rose & blush gold colors
      const colors = [
        'rgba(242, 190, 199, ',
        'rgba(235, 178, 178, ',
        'rgba(248, 220, 210, ',
        'rgba(212, 175, 55, '
      ];
      this.colorBase = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.y += this.speedY;
      this.x += Math.sin(this.y * 0.01) + this.speedX;
      this.angle += this.spin;

      if (this.y > height + 20 || this.x < -20 || this.x > width + 20) {
        this.reset();
      }
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.fillStyle = this.colorBase + this.opacity + ')';
      ctx.beginPath();
      // Draw petal shape
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-this.size / 2, -this.size / 2, -this.size, this.size / 3, 0, this.size);
      ctx.bezierCurveTo(this.size, this.size / 3, this.size / 2, -this.size / 2, 0, 0);
      ctx.fill();
      ctx.restore();
    }
  }

  class Sparkle {
    constructor() {
      this.reset(true);
    }
    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.size = Math.random() * 2 + 1;
      this.speedY = -(Math.random() * 0.4 + 0.2);
      this.opacity = Math.random() * 0.7 + 0.3;
      this.fade = (Math.random() - 0.5) * 0.01;
    }
    update() {
      this.y += this.speedY;
      this.opacity += this.fade;
      if (this.opacity <= 0.1 || this.opacity >= 0.9) this.fade = -this.fade;
      if (this.y < -10) this.reset();
    }
    draw() {
      ctx.save();
      ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < TOTAL_PETALS; i++) petals.push(new Petal());
  for (let i = 0; i < TOTAL_SPARKLES; i++) petals.push(new Sparkle());

  function animate() {
    ctx.clearRect(0, 0, width, height);
    petals.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ---------------------------------------------------------
   1. MÀN HÌNH MỞ THIỆP
   --------------------------------------------------------- */
(function initEnvelope() {
  const envelope = document.getElementById('envelope-screen');
  const openBtn = document.getElementById('open-invitation-btn');
  if (!envelope || !openBtn) return;

  openBtn.addEventListener('click', () => {
    envelope.classList.add('is-closed');
    document.body.style.overflow = '';
    // Thử tự phát nhạc ngay khi mở thiệp (trình duyệt có thể chặn, nút loa vẫn dùng được bình thường)
    tryAutoplayMusic();
  }, { once: true });

  // Khoá scroll khi màn hình mở thiệp còn hiện
  document.body.style.overflow = 'hidden';
})();

/* ---------------------------------------------------------
   2. NHẠC NỀN
   --------------------------------------------------------- */
const bgAudio = document.getElementById('bg-audio');
const musicToggle = document.getElementById('music-toggle');
let musicStarted = false;

function tryAutoplayMusic() {
  if (!bgAudio || musicStarted) return;
  bgAudio.volume = 0.55;
  const playPromise = bgAudio.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        musicStarted = true;
        musicToggle.classList.add('is-playing');
      })
      .catch(() => {
        // Trình duyệt chặn autoplay — người dùng sẽ tự bấm nút loa
      });
  }
}

if (musicToggle && bgAudio) {
  musicToggle.addEventListener('click', () => {
    if (bgAudio.paused) {
      bgAudio.volume = 0.55;
      bgAudio.play().then(() => {
        musicStarted = true;
        musicToggle.classList.add('is-playing');
      }).catch(() => {
        console.warn('Không thể phát nhạc — kiểm tra file assets/audio/background-music.mp3 đã được upload chưa.');
      });
    } else {
      bgAudio.pause();
      musicToggle.classList.remove('is-playing');
    }
  });
}

/* ---------------------------------------------------------
   3. NAVBAR: đổi nền khi cuộn + menu mobile
   --------------------------------------------------------- */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('is-scrolled', window.scrollY > 40);
  }, { passive: true });

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('is-open');
      navToggle.classList.toggle('is-active', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Đóng menu khi bấm 1 link
    navMenu.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('is-open');
        navToggle.classList.remove('is-active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
})();

/* ---------------------------------------------------------
   4. ĐẾM NGƯỢC
   --------------------------------------------------------- */
(function initCountdown() {
  const elDays = document.getElementById('cd-days');
  const elHours = document.getElementById('cd-hours');
  const elMinutes = document.getElementById('cd-minutes');
  const elSeconds = document.getElementById('cd-seconds');
  if (!elDays) return;

  const target = new Date(WEDDING_DATETIME).getTime();

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const now = Date.now();
    const diff = target - now;

    if (isNaN(target)) {
      elDays.textContent = '--';
      elHours.textContent = '--';
      elMinutes.textContent = '--';
      elSeconds.textContent = '--';
      return;
    }

    if (diff <= 0) {
      elDays.textContent = '00';
      elHours.textContent = '00';
      elMinutes.textContent = '00';
      elSeconds.textContent = '00';
      clearInterval(timer);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    elDays.textContent = pad(days);
    elHours.textContent = pad(hours);
    elMinutes.textContent = pad(minutes);
    elSeconds.textContent = pad(seconds);
  }

  tick();
  const timer = setInterval(tick, 1000);
})();

/* ---------------------------------------------------------
   4B. BỘ ẢNH TƯƠNG TÁC & STORY LIGHTBOX MODAL (CHUYỆN CHÚNG MÌNH)
   --------------------------------------------------------- */
(function initStoryPhotoStackAndModal() {
  const stacks = document.querySelectorAll('.story-media-stack');
  const modal = document.getElementById('story-modal');
  if (!stacks.length || !modal) return;

  const modalRange = document.getElementById('story-modal-range');
  const modalTitle = document.getElementById('story-modal-title');
  const modalImg = document.getElementById('story-modal-img');
  const modalCounter = document.getElementById('story-modal-counter');
  const modalCaption = document.getElementById('story-modal-caption');
  const modalThumbs = document.getElementById('story-modal-thumbs');
  const btnClose = document.getElementById('story-modal-close');
  const btnPrev = document.getElementById('story-modal-prev');
  const btnNext = document.getElementById('story-modal-next');
  const backdrop = modal.querySelector('.story-modal-backdrop');

  let currentImageData = [];
  let currentModalIndex = 0;

  // 1. Khởi tạo từng bộ ảnh stack trong Timeline
  stacks.forEach((stack) => {
    const cards = Array.from(stack.querySelectorAll('.stack-card'));
    const dotsContainer = stack.querySelector('.stack-dots');
    const btnPrevCard = stack.querySelector('.stack-prev');
    const btnNextCard = stack.querySelector('.stack-next');
    let cardIndex = 0;

    if (!cards.length) return;

    // Tạo chấm điều hướng dots dựa trên số lượng ảnh
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      cards.forEach((_, idx) => {
        const dot = document.createElement('span');
        dot.className = `stack-dot ${idx === 0 ? 'is-active' : ''}`;
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          setCardIndex(idx);
        });
        dotsContainer.appendChild(dot);
      });
    }

    function setCardIndex(idx) {
      cardIndex = (idx + cards.length) % cards.length;
      cards.forEach((card, i) => {
        card.classList.remove('is-active', 'is-next', 'is-prev');
        if (i === cardIndex) {
          card.classList.add('is-active');
        } else if (i === (cardIndex + 1) % cards.length) {
          card.classList.add('is-next');
        } else if (i === (cardIndex - 1 + cards.length) % cards.length) {
          card.classList.add('is-prev');
        }
      });

      if (dotsContainer) {
        const dots = dotsContainer.querySelectorAll('.stack-dot');
        dots.forEach((d, i) => d.classList.toggle('is-active', i === cardIndex));
      }
    }

    setCardIndex(0);

    if (btnPrevCard) {
      btnPrevCard.addEventListener('click', (e) => {
        e.stopPropagation();
        setCardIndex(cardIndex - 1);
      });
    }
    if (btnNextCard) {
      btnNextCard.addEventListener('click', (e) => {
        e.stopPropagation();
        setCardIndex(cardIndex + 1);
      });
    }

    // Bấm vào vùng ảnh / badge để mở Story Lightbox Modal
    stack.addEventListener('click', (e) => {
      // Nếu không bấm vào nút prev/next/dot thì mở modal
      if (e.target.closest('.stack-btn') || e.target.closest('.stack-dot')) return;
      openModal(stack, cardIndex);
    });
  });

  // 2. Mở Story Lightbox Modal
  function openModal(stackEl, startIndex = 0) {
    const chapterTitle = stackEl.dataset.chapterTitle || 'Chuyện chúng mình';
    const chapterRange = stackEl.dataset.chapterRange || '';
    const cards = Array.from(stackEl.querySelectorAll('.stack-card'));

    currentImageData = cards.map((card) => {
      const img = card.querySelector('img');
      return {
        src: img ? img.src : '',
        alt: img ? img.alt : '',
        caption: card.dataset.caption || img.alt || ''
      };
    });

    if (!currentImageData.length) return;

    modalRange.textContent = chapterRange;
    modalTitle.textContent = chapterTitle;
    currentModalIndex = startIndex;

    // Render danh sách Thumbnails
    if (modalThumbs) {
      modalThumbs.innerHTML = '';
      currentImageData.forEach((item, idx) => {
        const thumb = document.createElement('div');
        thumb.className = `story-thumb ${idx === currentModalIndex ? 'is-active' : ''}`;
        thumb.innerHTML = `<img src="${item.src}" alt="${item.alt}">`;
        thumb.addEventListener('click', () => updateModalImage(idx));
        modalThumbs.appendChild(thumb);
      });
    }

    updateModalImage(currentModalIndex);
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function updateModalImage(index) {
    currentModalIndex = (index + currentImageData.length) % currentImageData.length;
    const current = currentImageData[currentModalIndex];

    modalImg.style.opacity = '0.3';
    setTimeout(() => {
      modalImg.src = current.src;
      modalImg.alt = current.alt;
      modalImg.style.opacity = '1';
    }, 120);

    modalCounter.textContent = `${currentModalIndex + 1} / ${currentImageData.length}`;
    modalCaption.textContent = current.caption;

    if (modalThumbs) {
      const thumbs = modalThumbs.querySelectorAll('.story-thumb');
      thumbs.forEach((t, i) => t.classList.toggle('is-active', i === currentModalIndex));
    }
  }

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);

  if (btnPrev) btnPrev.addEventListener('click', () => updateModalImage(currentModalIndex - 1));
  if (btnNext) btnNext.addEventListener('click', () => updateModalImage(currentModalIndex + 1));

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') updateModalImage(currentModalIndex - 1);
    if (e.key === 'ArrowRight') updateModalImage(currentModalIndex + 1);
  });

  // Hỗ trợ vuốt (swipe) cảm ứng trên di động
  let touchStartX = 0;
  let touchEndX = 0;
  modal.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  modal.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX > 50) {
      updateModalImage(currentModalIndex + 1); // Swipe Left -> Next
    } else if (touchEndX - touchStartX > 50) {
      updateModalImage(currentModalIndex - 1); // Swipe Right -> Prev
    }
  }, { passive: true });
})();

/* ---------------------------------------------------------
   5. ALBUM LIGHTBOX
   --------------------------------------------------------- */
(function initLightbox() {
  const grid = document.getElementById('album-grid');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const btnClose = document.getElementById('lightbox-close');
  const btnPrev = document.getElementById('lightbox-prev');
  const btnNext = document.getElementById('lightbox-next');
  if (!grid || !lightbox) return;

  const items = Array.from(grid.querySelectorAll('.album-item img'));
  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    lightboxImg.src = items[currentIndex].src;
    lightboxImg.alt = items[currentIndex].alt;
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function showRelative(delta) {
    currentIndex = (currentIndex + delta + items.length) % items.length;
    lightboxImg.src = items[currentIndex].src;
    lightboxImg.alt = items[currentIndex].alt;
  }

  items.forEach((img, index) => {
    img.parentElement.addEventListener('click', () => openLightbox(index));
  });

  btnClose.addEventListener('click', closeLightbox);
  btnPrev.addEventListener('click', () => showRelative(-1));
  btnNext.addEventListener('click', () => showRelative(1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showRelative(-1);
    if (e.key === 'ArrowRight') showRelative(1);
  });
})();

/* ---------------------------------------------------------
   5B. ALBUM CATEGORY FILTER TABS
   --------------------------------------------------------- */
(function initAlbumFilter() {
  const filterBtns = document.querySelectorAll('.album-filter-btn');
  const albumItems = document.querySelectorAll('.album-item');
  if (!filterBtns.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      albumItems.forEach((item) => {
        if (filter === 'all' || item.dataset.category === filter) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
})();

/* ---------------------------------------------------------
   6. GIFT TABS (Vân Anh / Hoài Nam)
   --------------------------------------------------------- */
(function initGiftTabs() {
  const tabs = document.querySelectorAll('.gift-tab');
  const panels = document.querySelectorAll('.gift-panel');
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      panels.forEach((p) => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.target).classList.add('active');
    });
  });
})();

/* ---------------------------------------------------------
   7. RSVP FORM — GỬI NGẦM VÀO GOOGLE FORM
   --------------------------------------------------------- */
(function initRsvpForm() {
  const form = document.getElementById('rsvp-form');
  const submitBtn = document.getElementById('rsvp-submit-btn');
  const statusEl = document.getElementById('rsvp-status');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('rsvp-name').value.trim();
    const attend = form.querySelector('input[name="rsvp-attend"]:checked').value;
    const guests = document.getElementById('rsvp-guests').value;
    const message = document.getElementById('rsvp-message').value.trim();

    if (!name) {
      statusEl.textContent = 'Bạn vui lòng nhập họ tên nhé.';
      statusEl.className = 'rsvp-status error';
      return;
    }

    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;

    const formData = new FormData();
    formData.append(GOOGLE_FORM_CONFIG.entryIds.name, name);
    formData.append(GOOGLE_FORM_CONFIG.entryIds.attend, attend);
    formData.append(GOOGLE_FORM_CONFIG.entryIds.guests, guests);
    formData.append(GOOGLE_FORM_CONFIG.entryIds.message, message);

    // Google Form không cho phép đọc phản hồi qua fetch (CORS bị chặn có chủ đích),
    // nên ta dùng mode: 'no-cors' — gửi thành công nhưng không đọc được response.
    // Vì vậy ta luôn hiển thị thông báo thành công sau khi request được gửi đi.
    fetch(GOOGLE_FORM_CONFIG.formActionUrl, {
      method: 'POST',
      mode: 'no-cors',
      body: formData
    })
      .then(() => {
        statusEl.textContent = 'Cảm ơn bạn! Chúng mình đã nhận được xác nhận của bạn.';
        statusEl.className = 'rsvp-status success';
        form.reset();
      })
      .catch(() => {
        statusEl.textContent = 'Có lỗi khi gửi, bạn vui lòng thử lại giúp mình nhé.';
        statusEl.className = 'rsvp-status error';
      })
      .finally(() => {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
      });
  });
})();

/* ---------------------------------------------------------
   8. FADE-IN KHI CUỘN (một hiệu ứng nhẹ, dùng chung)
   --------------------------------------------------------- */
(function initScrollReveal() {
  const revealTargets = document.querySelectorAll(
    '.timeline-item, .event-card, .schedule, .album-item, .countdown-item'
  );
  if (!revealTargets.length || !('IntersectionObserver' in window)) return;

  revealTargets.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealTargets.forEach((el) => observer.observe(el));
})();

/* ---------------------------------------------------------
   9. SAO CHÉP SỐ TÀI KHOẢN (COPY STK TO CLIPBOARD)
   --------------------------------------------------------- */
(function initCopyStk() {
  const copyBtns = document.querySelectorAll('.btn-copy');
  const toast = document.getElementById('toast');
  if (!copyBtns.length) return;

  copyBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy') || '0000000000';
      navigator.clipboard.writeText(textToCopy).then(() => {
        if (toast) {
          toast.classList.add('show');
          setTimeout(() => toast.classList.remove('show'), 2500);
        }
      }).catch((err) => {
        console.error('Không thể sao chép: ', err);
      });
    });
  });
})();

/* ---------------------------------------------------------
   10. CHỈ HIỆN NAVBAR KHI CUỘN XUỐNG CÁC TRANG DƯỚI
   --------------------------------------------------------- */
(function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function updateNavbar() {
    if (window.scrollY > 100) {
      navbar.classList.add('is-scrolled');
    } else {
      navbar.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();
})();

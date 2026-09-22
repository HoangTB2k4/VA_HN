/* =========================================================
   VÂN ANH & HOÀI NAM — SCRIPT.JS
   ========================================================= */

/* ---------------------------------------------------------
   CẤU HÌNH NGÀY CƯỚI CHÍNH THỨC
   --------------------------------------------------------- */
// Ngày cưới chính thức: 04.10.2026 13:30
const WEDDING_DATETIME = "2026-10-04T13:30:00+07:00";

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
    if (!document.hidden) {
      ctx.clearRect(0, 0, width, height);
      petals.forEach(p => {
        p.update();
        p.draw();
      });
    }
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ---------------------------------------------------------
   1. KHỞI TẠO TRANG & NHẠC NỀN
   --------------------------------------------------------- */
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

const bgAudio = document.getElementById('bg-audio');
const musicToggle = document.getElementById('music-toggle');
let isUserPaused = false; // Chỉ dừng phát nhạc khi người dùng chủ động bấm nút tắt

function updateMusicUI(isPlaying) {
  if (!musicToggle) return;
  if (isPlaying) {
    musicToggle.classList.add('is-playing');
  } else {
    musicToggle.classList.remove('is-playing');
  }
}

function startMusic() {
  if (!bgAudio || isUserPaused) return;
  bgAudio.volume = 0.55;
  
  const playPromise = bgAudio.play();
  if (playPromise !== undefined) {
    playPromise.then(() => {
      updateMusicUI(true);
    }).catch(() => {
      updateMusicUI(false);
    });
  }
}

// Mở khóa âm thanh ngầm mượt mà ngay khi người dùng chạm hoặc vuốt màn hình trên điện thoại
function silentUnlockAudio() {
  if (isUserPaused || !bgAudio) return;
  if (bgAudio.paused) {
    bgAudio.volume = 0.55;
    const promise = bgAudio.play();
    if (promise !== undefined) {
      promise.then(() => {
        updateMusicUI(true);
      }).catch(() => {});
    }
  }
}

const silentEvents = ['touchstart', 'touchend', 'touchmove', 'pointerdown', 'mousedown', 'click', 'scroll', 'pageshow'];
silentEvents.forEach(evt => {
  window.addEventListener(evt, silentUnlockAudio, { capture: true, passive: true });
});

// Thử tự động phát nhạc ngay giây đầu tiên mở trang
startMusic();
document.addEventListener('DOMContentLoaded', startMusic);
window.addEventListener('load', startMusic);
window.addEventListener('pageshow', startMusic);
document.addEventListener('WeixinJSBridgeReady', startMusic, false);

// Nút biểu tượng âm nhạc: Bấm/chạm trực tiếp vào icon để Bật hoặc Tắt nhạc
if (musicToggle && bgAudio) {
  musicToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (bgAudio.paused) {
      isUserPaused = false;
      startMusic();
    } else {
      isUserPaused = true;
      bgAudio.pause();
      updateMusicUI(false);
    }
  });
}

/* ---------------------------------------------------------
   3. NAVBAR
   --------------------------------------------------------- */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
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

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('is-open');
      navToggle.classList.toggle('is-active', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

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
   4B. BỘ ẢNH TƯƠNG TÁC & STORY LIGHTBOX MODAL
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

  stacks.forEach((stack) => {
    const cards = Array.from(stack.querySelectorAll('.stack-card'));
    const dotsContainer = stack.querySelector('.stack-dots');
    const btnPrevCard = stack.querySelector('.stack-prev');
    const btnNextCard = stack.querySelector('.stack-next');
    let cardIndex = 0;

    if (!cards.length) return;

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

    stack.addEventListener('click', (e) => {
      if (e.target.closest('.stack-btn') || e.target.closest('.stack-dot')) return;
      openModal(stack, cardIndex);
    });
  });

  function openModal(stackEl, startIndex = 0) {
    const chapterTitle = stackEl.dataset.chapterTitle || 'Chuyện chúng mình';
    const chapterRange = stackEl.dataset.chapterRange || '';
    const cards = Array.from(stackEl.querySelectorAll('.stack-card'));

    currentImageData = cards.map((card) => {
      const img = card.querySelector('img');
      const fallback = img ? img.getAttribute('onerror') : '';
      return {
        src: img ? img.src : '',
        alt: img ? img.alt : '',
        caption: card.dataset.caption || img.alt || '',
        onerror: fallback
      };
    });

    if (!currentImageData.length) return;

    modalRange.textContent = chapterRange;
    modalTitle.textContent = chapterTitle;
    currentModalIndex = startIndex;

    if (modalThumbs) {
      modalThumbs.innerHTML = '';
      currentImageData.forEach((item, idx) => {
        const thumb = document.createElement('div');
        thumb.className = `story-thumb ${idx === currentModalIndex ? 'is-active' : ''}`;
        thumb.innerHTML = `<img src="${item.src}" alt="${item.alt}" ${item.onerror ? `onerror="${item.onerror}"` : ''}>`;
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
    if (current.onerror) {
      modalImg.setAttribute('onerror', current.onerror);
    } else {
      modalImg.removeAttribute('onerror');
    }
    setTimeout(() => {
      modalImg.src = current.src;
      modalImg.alt = current.alt;
      modalImg.style.opacity = '1';
    }, 120);

    modalCounter.textContent = `${currentModalIndex + 1} / ${currentImageData.length}`;
    if (modalCaption) modalCaption.textContent = '';

    if (modalThumbs) {
      const thumbs = modalThumbs.querySelectorAll('.story-thumb');
      thumbs.forEach((t, i) => t.classList.toggle('is-active', i === currentModalIndex));
    }
  }

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if (btnClose) btnClose.addEventListener('click', (e) => { e.stopPropagation(); closeModal(); });
  if (backdrop) backdrop.addEventListener('click', closeModal);

  if (btnPrev) btnPrev.addEventListener('click', (e) => { e.stopPropagation(); updateModalImage(currentModalIndex - 1); });
  if (btnNext) btnNext.addEventListener('click', (e) => { e.stopPropagation(); updateModalImage(currentModalIndex + 1); });

  // Vuốt chuyển ảnh trên điện thoại cho Story Modal
  let storyTouchStartX = 0;
  let storyTouchStartY = 0;
  if (modal) {
    modal.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        storyTouchStartX = e.touches[0].clientX;
        storyTouchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    modal.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1) {
        const deltaX = e.changedTouches[0].clientX - storyTouchStartX;
        const deltaY = e.changedTouches[0].clientY - storyTouchStartY;
        if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX < 0) {
            updateModalImage(currentModalIndex + 1);
          } else {
            updateModalImage(currentModalIndex - 1);
          }
        }
      }
    }, { passive: true });
  }

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') updateModalImage(currentModalIndex - 1);
    if (e.key === 'ArrowRight') updateModalImage(currentModalIndex + 1);
  });
})();

/* ---------------------------------------------------------
   4C. XEM THÊM / THU GỌN NỘI DUNG CÂU CHUYỆN (STORY TOGGLE)
   --------------------------------------------------------- */
(function initStoryTextToggle() {
  const toggleBtns = document.querySelectorAll('.btn-story-toggle');
  toggleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const box = btn.closest('.story-content-box');
      if (!box) return;
      const textBody = box.querySelector('.story-text-body');
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';

      if (isExpanded) {
        textBody.classList.add('collapsed');
        btn.setAttribute('aria-expanded', 'false');
        btn.querySelector('.toggle-text').textContent = 'Xem thêm';
        btn.querySelector('.toggle-icon').textContent = '↓';
      } else {
        textBody.classList.remove('collapsed');
        btn.setAttribute('aria-expanded', 'true');
        btn.querySelector('.toggle-text').textContent = 'Thu gọn';
        btn.querySelector('.toggle-icon').textContent = '↓';
      }
    });
  });
})();

/* ---------------------------------------------------------
   5. ALBUM SLIDER CAROUSEL (4 ÁNH 1 LƯỢT & LIGHTBOX)
   --------------------------------------------------------- */
(function initAlbumCarousel() {
  const grid = document.getElementById('album-grid');
  const btnPrev = document.getElementById('album-carousel-prev');
  const btnNext = document.getElementById('album-carousel-next');
  const dotsContainer = document.getElementById('album-pagination-dots');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lbClose = document.getElementById('lightbox-close');
  const lbPrev = document.getElementById('lightbox-prev');
  const lbNext = document.getElementById('lightbox-next');

  if (!grid) return;

  const items = Array.from(grid.querySelectorAll('.album-item'));
  let currentPage = 0;
  const itemsPerPage = 4;
  const totalPages = Math.ceil(items.length / itemsPerPage);

  function loadItemImage(img) {
    if (!img) return;
    if (img.dataset.src && (!img.getAttribute('src') || img.src === window.location.href)) {
      img.src = img.dataset.src;
    }
  }

  function renderPage(page) {
    currentPage = (page + totalPages) % totalPages;
    items.forEach((item, index) => {
      const img = item.querySelector('img');
      if (index >= currentPage * itemsPerPage && index < (currentPage + 1) * itemsPerPage) {
        item.style.display = 'block';
        if (img) loadItemImage(img);
      } else {
        item.style.display = 'none';
      }
    });

    // Preload next page in background
    const nextPage = (currentPage + 1) % totalPages;
    for (let i = nextPage * itemsPerPage; i < (nextPage + 1) * itemsPerPage && i < items.length; i++) {
      const nextImg = items[i].querySelector('img');
      if (nextImg) loadItemImage(nextImg);
    }

    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.album-dot');
      dots.forEach((d, i) => d.classList.toggle('active', i === currentPage));
    }
  }

  // Khởi tạo Dots
  if (dotsContainer && totalPages > 1) {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('button');
      dot.className = `album-dot ${i === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Trang album ${i + 1}`);
      dot.addEventListener('click', () => renderPage(i));
      dotsContainer.appendChild(dot);
    }
  }

  if (btnPrev) btnPrev.addEventListener('click', () => renderPage(currentPage - 1));
  if (btnNext) btnNext.addEventListener('click', () => renderPage(currentPage + 1));

  renderPage(0);

  // Lightbox functionality
  let currentLightboxIndex = 0;

  function openLightbox(index) {
    currentLightboxIndex = index;
    const img = items[currentLightboxIndex].querySelector('img');
    if (!img) return;
    loadItemImage(img);
    lightboxImg.src = img.dataset.full || img.src || img.dataset.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function showLightboxRelative(delta) {
    currentLightboxIndex = (currentLightboxIndex + delta + items.length) % items.length;
    const img = items[currentLightboxIndex].querySelector('img');
    if (img) {
      loadItemImage(img);
      lightboxImg.src = img.dataset.full || img.src || img.dataset.src;
      lightboxImg.alt = img.alt;
    }
  }

  items.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
  });

  if (lbClose) lbClose.addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });
  if (lbPrev) lbPrev.addEventListener('click', (e) => { e.stopPropagation(); showLightboxRelative(-1); });
  if (lbNext) lbNext.addEventListener('click', (e) => { e.stopPropagation(); showLightboxRelative(1); });

  // Vuốt chuyển ảnh trên điện thoại cho Album Lightbox
  let lbTouchStartX = 0;
  let lbTouchStartY = 0;
  if (lightbox) {
    lightbox.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        lbTouchStartX = e.touches[0].clientX;
        lbTouchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1) {
        const deltaX = e.changedTouches[0].clientX - lbTouchStartX;
        const deltaY = e.changedTouches[0].clientY - lbTouchStartY;
        if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX < 0) {
            showLightboxRelative(1);
          } else {
            showLightboxRelative(-1);
          }
        }
      }
    }, { passive: true });

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showLightboxRelative(-1);
    if (e.key === 'ArrowRight') showLightboxRelative(1);
  });
})();

/* ---------------------------------------------------------
   6. BANK STK POPUP MODAL (ẤN CÔ DÂU HOẶC CHÚ RỂ RỒI HIỆN POPUP)
   --------------------------------------------------------- */
(function initBankModal() {
  const modal = document.getElementById('bank-modal');
  const triggers = document.querySelectorAll('.gift-card-trigger');
  const closeBtn = document.getElementById('bank-modal-close');
  const panelBride = document.getElementById('bank-panel-bride');
  const panelGroom = document.getElementById('bank-panel-groom');
  if (!modal || !triggers.length) return;

  const backdrop = modal.querySelector('.bank-modal-backdrop');

  function openBankModal(person) {
    if (person === 'bride') {
      if (panelBride) panelBride.classList.add('active');
      if (panelGroom) panelGroom.classList.remove('active');
    } else {
      if (panelGroom) panelGroom.classList.add('active');
      if (panelBride) panelBride.classList.remove('active');
    }
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeBankModal() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const person = trigger.getAttribute('data-person');
      openBankModal(person);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeBankModal);
  if (backdrop) backdrop.addEventListener('click', closeBankModal);

  document.addEventListener('keydown', (e) => {
    if (modal.classList.contains('is-open') && e.key === 'Escape') {
      closeBankModal();
    }
  });
})();

/* ---------------------------------------------------------
   7. SAO CHÉP SỐ TÀI KHOẢN (COPY STK TO CLIPBOARD)
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
   8. FADE-IN KHI CUỘN
   --------------------------------------------------------- */
(function initScrollReveal() {
  const revealTargets = document.querySelectorAll(
    '.timeline-item, .family-event-card, .album-item, .countdown-item, .gift-card-trigger'
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

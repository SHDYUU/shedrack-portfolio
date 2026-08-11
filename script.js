/* ==========================================
   RH.DESIGN INSPIRED INTERACTIVE ENGINE
   Shedrack Dojillo - Video Editor & Computer Engineering
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMouseFollower();
  initNavbarScrollObserver();
  initNavMailAnimation();
  initNavSmoothScroll();
  initMobileMenu();
  initMarqueeSlider();
  initHoverPlayVideos();
  initVideoModal();
  initContactForm();
});

/* --- 1. Custom Interactive Mouse Follower --- */
function initMouseFollower() {
  const follower = document.getElementById('mouse-follower');
  const badgeText = document.getElementById('mouse-text');
  const badgeIcon = document.getElementById('mouse-icon');
  if (!follower) return;

  let mouseX = 0;
  let mouseY = 0;
  let followerX = 0;
  let followerY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Smooth lerp movement loop
  function render() {
    followerX += (mouseX - followerX) * 0.2;
    followerY += (mouseY - followerY) * 0.2;

    follower.style.left = `${followerX}px`;
    follower.style.top = `${followerY}px`;

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  // Trigger on hover over elements with data-cursor
  document.querySelectorAll('[data-cursor]').forEach((el) => {
    const cursorType = el.getAttribute('data-cursor');

    el.addEventListener('mouseenter', () => {
      follower.classList.add('visible');

      if (cursorType === 'drag') {
        if (badgeText) badgeText.textContent = 'Drag me';
        if (badgeIcon) badgeIcon.className = 'fa-solid fa-arrows-left-right';
      } else if (cursorType === 'project') {
        if (badgeText) badgeText.textContent = 'See preview';
        if (badgeIcon) badgeIcon.className = 'fa-solid fa-arrow-up-right';
      }
    });

    el.addEventListener('mouseleave', () => {
      follower.classList.remove('visible');
    });
  });
}

/* --- 2. Adaptive Floating Navbar Dark Mode Observer --- */
function initNavbarScrollObserver() {
  const navbar = document.getElementById('navbar');
  const darkZone = document.getElementById('dark-zone');
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!navbar) return;

  function updateNavbar() {
    const scrollY = window.scrollY;

    // Add .scrolled class when scrolling past 40px
    if (scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Check if navbar center is inside darkZone
    if (darkZone) {
      const navbarRect = navbar.getBoundingClientRect();
      const navbarCenter = navbarRect.top + navbarRect.height / 2;
      const darkZoneRect = darkZone.getBoundingClientRect();

      if (navbarCenter >= darkZoneRect.top && navbarCenter <= darkZoneRect.bottom) {
        navbar.classList.add('dark-mode');
      } else {
        navbar.classList.remove('dark-mode');
      }
    }

    // Highlight active scrollspy link
    let currentId = 'home';
    const navSections = document.querySelectorAll('section[id]');
    navSections.forEach((section) => {
      const sectionTop = section.getBoundingClientRect().top + scrollY - 180;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();
}

/* --- 2b. Navbar Mail Icon Click Animation --- */
function initNavMailAnimation() {
  const touchBtn = document.getElementById('btn-get-in-touch');
  const circle = document.getElementById('circle-mail-wrapper');

  if (!touchBtn || !circle) return;

  touchBtn.addEventListener('click', () => {
    circle.classList.remove('mail-click-anim');
    void circle.offsetWidth; // trigger reflow
    circle.classList.add('mail-click-anim');

    setTimeout(() => {
      circle.classList.remove('mail-click-anim');
    }, 550);
  });
}

/* --- 2c. Smooth Scroll for Nav Links --- */
function initNavSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        e.preventDefault();
        targetSection.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
}

/* --- 3. Mobile Navigation Menu Toggle --- */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    const icon = toggleBtn.querySelector('i');
    if (navMenu.classList.contains('active')) {
      icon.className = 'fa-solid fa-xmark';
    } else {
      icon.className = 'fa-solid fa-bars';
    }
  });

  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      if (toggleBtn.querySelector('i')) {
        toggleBtn.querySelector('i').className = 'fa-solid fa-bars';
      }
    });
  });
}

/* --- 4. Infinite Marquee Reel Slider with Drag Support --- */
function initMarqueeSlider() {
  const container = document.getElementById('marquee-container');
  const track = document.getElementById('marquee-track');

  if (!container || !track) return;

  // Save the original slides before cloning
  const originalSlides = Array.from(track.children);
  if (!originalSlides.length) return;

  // Duplicate original slides 3 times for full viewport coverage
  for (let i = 0; i < 3; i++) {
    originalSlides.forEach((slide) => {
      track.appendChild(slide.cloneNode(true));
    });
  }

  let currentTranslate = 0;
  let isDragging = false;
  let lastX = 0;
  let startX = 0;
  let startY = 0;
  let lastY = 0;
  let isHorizontalDrag = null;
  const speed = 0.8;

  function getLoopWidth() {
    return track.scrollWidth / 4;
  }

  function wrapPosition() {
    const loopWidth = getLoopWidth();
    if (!loopWidth) return;

    while (currentTranslate <= -loopWidth) {
      currentTranslate += loopWidth;
    }

    while (currentTranslate > 0) {
      currentTranslate -= loopWidth;
    }
  }

  function updatePosition() {
    track.style.transform = `translate3d(${currentTranslate}px, 0, 0)`;
  }

  function animate() {
    if (!isDragging) {
      currentTranslate -= speed;
      wrapPosition();
      updatePosition();
    }
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  // Mouse Dragging
  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    container.classList.add('dragging');
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastX;
    lastX = e.clientX;

    currentTranslate += deltaX;

    wrapPosition();
    updatePosition();
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    container.classList.remove('dragging');
  });

  // Touch Dragging
  container.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) return;
    isDragging = true;
    isHorizontalDrag = null;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    lastX = startX;
    lastY = startY;
    container.classList.add('dragging');
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging || !e.touches || !e.touches.length) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - lastX;
    const deltaY = currentY - lastY;

    // Detect gesture direction threshold
    if (isHorizontalDrag === null) {
      const totalDeltaX = Math.abs(currentX - startX);
      const totalDeltaY = Math.abs(currentY - startY);
      if (totalDeltaX > 5 || totalDeltaY > 5) {
        isHorizontalDrag = totalDeltaX > totalDeltaY;
      }
    }

    if (isHorizontalDrag === true) {
      if (e.cancelable) {
        e.preventDefault();
      }
      currentTranslate += deltaX;
      wrapPosition();
      updatePosition();
    }

    lastX = currentX;
    lastY = currentY;
  }, { passive: false });

  const stopTouchDrag = () => {
    if (!isDragging) return;
    isDragging = false;
    isHorizontalDrag = null;
    container.classList.remove('dragging');
  };

  window.addEventListener('touchend', stopTouchDrag);
  window.addEventListener('touchcancel', stopTouchDrag);

  window.addEventListener('resize', () => {
    wrapPosition();
    updatePosition();
  });
}

/* --- 5. Hover Video Preview --- */
function initHoverPlayVideos() {
  const cards = document.querySelectorAll('.portfolio-card');

  cards.forEach((card) => {
    const video = card.querySelector('.card-media video');
    if (!video) return;

    card.addEventListener('mouseenter', () => {
      video.play().catch(() => { });
    });

    card.addEventListener('mouseleave', () => {
      video.pause();
      video.currentTime = 0;
    });
  });
}

/* --- 6. Lightbox Video Modal --- */
function initVideoModal() {
  const modalOverlay = document.getElementById('video-modal');
  const modalVideoWrapper = document.getElementById('modal-video-wrapper');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalClose = document.getElementById('modal-close');
  const videoCards = document.querySelectorAll('.portfolio-card[data-video]');

  videoCards.forEach((card) => {
    card.addEventListener('click', () => {
      const videoUrl = card.getAttribute('data-video');
      const title = card.querySelector('.card-title')?.textContent || 'Video Preview';
      const desc = card.querySelector('.card-desc')?.textContent || '';

      if (videoUrl && modalVideoWrapper) {
        modalVideoWrapper.innerHTML = `
          <video src="${videoUrl}" controls autoplay playsinline style="width:100%; height:100%; object-fit:contain; background:#000;"></video>
        `;

        if (modalTitle) modalTitle.textContent = title;
        if (modalDesc) modalDesc.textContent = desc;

        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  const closeModal = () => {
    modalOverlay.classList.remove('active');
    if (modalVideoWrapper) modalVideoWrapper.innerHTML = '';
    document.body.style.overflow = '';
  };

  if (modalClose) modalClose.addEventListener('click', closeModal);

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });
}

/* --- 7. Contact Form Handling --- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const toast = document.getElementById('toast-notification');
  const toastMessage = document.getElementById('toast-message');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
    const name = document.getElementById('form-name')?.value || 'there';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Sending...`;
    }

    const formData = new FormData(form);
    const actionUrl = form.getAttribute('action') || 'https://api.web3forms.com/submit';

    try {
      const response = await fetch(actionUrl, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      const result = await response.json();

      if (response.ok && (result.success || result.ok)) {
        showToast(`Thank you, ${name}! Your message has been sent successfully.`);
        form.reset();
      } else {
        showToast(result.message || 'Something went wrong. Please try again.', true);
      }
    } catch (error) {
      showToast('Unable to send message. Please check your network connection.', true);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    }
  });

  function showToast(msg, isError = false) {
    if (toast && toastMessage) {
      toastMessage.textContent = msg;
      toast.style.borderLeft = isError ? '4px solid #EF4444' : '4px solid var(--accent-yellow)';
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 5000);
    }
  }
}

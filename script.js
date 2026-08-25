/* Naman Duggavathi — site interactions
   Vanilla JS, no dependencies. */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Back to top ---------- */
  document.querySelectorAll('a[href="#top"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      history.replaceState(null, '', '#top');
    });
  });

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile menu ---------- */
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');

  function closeMobileNav() {
    mobileNav.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('is-open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobileNav);
    });
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Portfolio lightbox ---------- */
  const portfolioItems = document.querySelectorAll('.p-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxInner = document.getElementById('lightbox-inner');
  const lightboxClose = document.getElementById('lightbox-close');

  function openLightbox(item) {
    const svg = item.querySelector('.ph-svg');
    const caption = item.querySelector('figcaption');
    lightboxInner.innerHTML = '';
    if (svg) lightboxInner.appendChild(svg.cloneNode(true));
    if (caption) {
      const cap = document.createElement('p');
      cap.style.color = '#FAFAF6';
      cap.style.marginTop = '16px';
      cap.style.fontSize = '13px';
      cap.style.letterSpacing = '0.04em';
      cap.textContent = caption.textContent;
      lightboxInner.appendChild(cap);
    }
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
  }

  portfolioItems.forEach(item => {
    item.addEventListener('click', () => openLightbox(item));
  });
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  /* ---------- Before / after sliders (supports multiple on one page) ---------- */
  document.querySelectorAll('[data-ba-slider]').forEach((baSlider) => {
    const baBeforeLayer = baSlider.querySelector('[data-ba-before-layer]');
    const baHandle = baSlider.querySelector('[data-ba-handle]');
    if (!baBeforeLayer || !baHandle) return;

    let dragging = false;

    function setPosition(clientX) {
      const rect = baSlider.getBoundingClientRect();
      let x = clientX - rect.left;
      x = Math.max(0, Math.min(rect.width, x));
      const pct = (x / rect.width) * 100;
      baBeforeLayer.style.clipPath = `inset(0 ${rect.width - x}px 0 0)`;
      baHandle.style.left = x + 'px';
      baHandle.setAttribute('aria-valuenow', Math.round(pct));
    }

    function startDrag(e) {
      dragging = true;
      if (e.type === 'mousedown') e.preventDefault();
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      setPosition(x);
    }
    function duringDrag(e) {
      if (!dragging) return;
      if (e.type === 'mousemove') e.preventDefault();
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      setPosition(x);
    }
    function endDrag() { dragging = false; }

    baSlider.addEventListener('dragstart', (e) => e.preventDefault());
    baSlider.addEventListener('selectstart', (e) => e.preventDefault());

    baHandle.addEventListener('mousedown', startDrag);
    baSlider.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', duringDrag);
    window.addEventListener('mouseup', endDrag);

    baHandle.addEventListener('touchstart', startDrag, { passive: true });
    baSlider.addEventListener('touchstart', startDrag, { passive: true });
    window.addEventListener('touchmove', duringDrag, { passive: true });
    window.addEventListener('touchend', endDrag);

    baHandle.addEventListener('keydown', (e) => {
      const current = parseFloat(baHandle.getAttribute('aria-valuenow')) || 50;
      if (e.key === 'ArrowLeft') {
        const rect = baSlider.getBoundingClientRect();
        setPosition(rect.left + (rect.width * (current - 5) / 100));
      }
      if (e.key === 'ArrowRight') {
        const rect = baSlider.getBoundingClientRect();
        setPosition(rect.left + (rect.width * (current + 5) / 100));
      }
    });
  });

  /* ---------- Pricing "Read more" toggle ---------- */
  document.querySelectorAll('.price-more-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      const isOpen = target.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(isOpen));
      btn.textContent = isOpen ? 'Show less' : 'Read more';
    });
  });

  /* ---------- Pricing CTA -> pre-fill contact form ---------- */
  const priceCtas = document.querySelectorAll('.price-cta');
  const packageSelect = document.getElementById('f-package');

  priceCtas.forEach(cta => {
    cta.addEventListener('click', () => {
      const pkg = cta.dataset.package;
      if (packageSelect && pkg) {
        [...packageSelect.options].forEach(opt => {
          if (opt.value === pkg) packageSelect.value = pkg;
        });
      }
    });
  });

  /* ---------- Contact form ----------
     Submissions are sent via FormSubmit (https://formsubmit.co) —
     a free form-to-email service that requires no account or
     server of your own. The very first submission triggers a
     one-time confirmation email to BUSINESS_EMAIL; click the link
     in that email to activate delivery for all future submissions. */
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const BUSINESS_EMAIL = 'naman.duggavathi@gmail.com';
  const FORMSUBMIT_ENDPOINT = `https://formsubmit.co/ajax/${BUSINESS_EMAIL}`;

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const data = new FormData(form);
      const address = data.get('address') || '';

      // Extra fields FormSubmit uses to shape the email it sends.
      data.append('_subject', `Shoot request — ${address}`);
      data.append('_template', 'table');
      data.append('_captcha', 'false');

      const submitBtn = form.querySelector('.form-submit');
      if (submitBtn) submitBtn.disabled = true;
      if (status) status.textContent = 'Sending your request…';

      fetch(FORMSUBMIT_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      })
        .then((res) => {
          if (!res.ok) throw new Error('Request failed');
          return res.json();
        })
        .then(() => {
          if (status) status.textContent = 'Thanks! Your request has been sent — I\'ll follow up shortly.';
          form.reset();
        })
        .catch(() => {
          if (status) {
            status.textContent = `Something went wrong sending this automatically. Please email me directly at ${BUSINESS_EMAIL}.`;
          }
        })
        .finally(() => {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }

  /* ---------- Editing showcase — click through the edit stages ---------- */
  const editStageMain = document.getElementById('edit-stage-main');
  const editMainImage = document.getElementById('edit-main-image');
  const editStepCount = document.getElementById('edit-step-count');
  const editImageLabel = document.getElementById('edit-image-label');
  const editCaptionTitle = document.getElementById('edit-caption-title');
  const editCaptionText = document.getElementById('edit-caption-text');
  const editSteps = document.querySelectorAll('[data-edit-step]');

  const editStageData = [
    { image: 'images/edit-stage-1.webp', label: '01 · Base capture', title: 'Start with a clean base.', text: 'A 3-5 stop high dynamic range image is kept flat for flexibility during post-processing.' },
    { image: 'images/edit-stage-2.webp', label: '02 · Light balance', title: 'Recover the full scene.', text: 'Highlights, shadows, and exposure are balanced so the property reads clearly from edge to edge.' },
    { image: 'images/edit-stage-3.webp', label: '03 · White balance', title: 'Make the light feel right.', text: 'Temperature and tint are refined to keep the property naturally inviting.' },
    { image: 'images/edit-stage-4.webp', label: '04 · Color grade', title: 'Add depth without overdoing it.', text: 'Color and saturation are shaped for a polished look while keeping the property itself in focus.' },
    { image: 'images/edit-stage-5.webp', label: '05 · Final polish', title: 'Finish for the listing.', text: 'The final touches. Add a little haze effect to accentuate the sunset and get a premium listing photograph.' }
  ];

  function setEditStage(index) {
    if (!editStageMain || !editStageData[index]) return;
    const stage = editStageData[index];
    editSteps.forEach((step, i) => {
      const active = i === index;
      step.classList.toggle('is-active', active);
      step.setAttribute('aria-selected', String(active));
    });

    editMainImage.classList.add('is-changing');
    window.setTimeout(() => {
      editStageMain.src = stage.image;
      editStageMain.alt = stage.title;
      editStepCount.textContent = `${String(index + 1).padStart(2, '0')} / 05`;
      editImageLabel.textContent = stage.label;
      editCaptionTitle.textContent = stage.title;
      editCaptionText.textContent = stage.text;
      editMainImage.classList.remove('is-changing');
    }, 140);
  }

  editSteps.forEach((step) => {
    step.addEventListener('click', () => setEditStage(Number(step.dataset.editStep)));
    step.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = (Number(step.dataset.editStep) + 1) % editStageData.length;
        setEditStage(next);
        editSteps[next].focus();
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = (Number(step.dataset.editStep) - 1 + editStageData.length) % editStageData.length;
        setEditStage(prev);
        editSteps[prev].focus();
      }
    });
  });


  /* ---------- Unified tactile motion system ---------- */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);

  /* Back to top */
  const header = document.querySelector('.site-header');
  const backTop = document.createElement('a');
  backTop.href = '#top';
  backTop.className = 'back-top';
  backTop.setAttribute('aria-label', 'Back to top');
  backTop.textContent = '↑';
  document.body.appendChild(backTop);
  backTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({top:0, behavior:'smooth'});
  });

  /* Active navigation */
  const navLinks = [...document.querySelectorAll('.site-nav a')];
  const navTargets = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id));
        }
      });
    }, {rootMargin:'-35% 0px -55% 0px', threshold:0});
    navTargets.forEach(section => sectionObserver.observe(section));
  }

  /* Scroll-linked progress + very light hero parallax. */
  const heroImage = document.querySelector('.hero-image');
  const heroWrap = document.querySelector('.hero-backdrop');
  let scrollTick = false;
  function onScroll() {
    if (scrollTick) return;
    scrollTick = true;
    requestAnimationFrame(() => {
      scrollTick = false;
      const scrollY = window.scrollY;
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      progress.style.transform = `scaleX(${scrollY / max})`;
      if (header) header.classList.toggle('scrolled', scrollY > 35);
      backTop.classList.toggle('is-visible', scrollY > 700);
      if (!reduceMotion && heroImage && heroWrap) {
        const r = heroWrap.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) {
          const offset = (innerHeight / 2 - (r.top + r.height / 2)) * .02;
          heroImage.style.setProperty('--scroll-y', `${offset.toFixed(2)}px`);
        }
      }
    });
  }
  addEventListener('scroll', onScroll, {passive:true});
  addEventListener('resize', onScroll, {passive:true});
  onScroll();

  /* Staggered reveal: more motion, less jumpiness. */
  const revealItems = [...document.querySelectorAll('.reveal')];
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('motion-in');
        revealObserver.unobserve(entry.target);
      });
    }, {threshold:.08, rootMargin:'0px 0px -8% 0px'});
    revealItems.forEach((el, i) => {
      el.style.setProperty('--reveal-delay', `${Math.min(i % 6, 5) * 55}ms`);
      revealObserver.observe(el);
    });
  } else revealItems.forEach(el => el.classList.add('motion-in'));

  if (finePointer && !reduceMotion) {
    document.body.classList.add('tactile-active');

    /* Lightweight custom cursor. It grows only a little, so it never feels heavy. */
    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.append(dot, ring);
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    let cursorRAF = 0;
    addEventListener('pointermove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate3d(${mx}px,${my}px,0)`;
      document.documentElement.style.setProperty('--spot-x', `${mx}px`);
      document.documentElement.style.setProperty('--spot-y', `${my}px`);
      if (!cursorRAF) cursorRAF = requestAnimationFrame(() => {
        cursorRAF = 0;
        rx += (mx-rx)*.18; ry += (my-ry)*.18;
        ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      });
    }, {passive:true});

    const hoverables = document.querySelectorAll('a,button,input,textarea,select,.p-item,.service-card,.price-card,.week-cal-day,.edit-step,.ba-slider');
    hoverables.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    /* Tiny magnetic pull — intentionally restrained for speed. */
    document.querySelectorAll('.primary-btn,.header-book,.price-cta,.accent-btn,.form-submit,.mobile-cta,.back-top').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const dx = Math.max(-4, Math.min(4, (e.clientX - (r.left + r.width/2)) * .055));
        const dy = Math.max(-3, Math.min(3, (e.clientY - (r.top + r.height/2)) * .055));
        btn.style.setProperty('--mag-x', `${dx}px`);
        btn.style.setProperty('--mag-y', `${dy}px`);
      }, {passive:true});
      btn.addEventListener('pointerleave', () => {
        btn.style.removeProperty('--mag-x');
        btn.style.removeProperty('--mag-y');
      });
    });

    /* Cards tilt subtly instead of scaling up. */
    document.querySelectorAll('.service-card,.price-card,.p-item,.glass-panel').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX-r.left)/r.width-.5;
        const y = (e.clientY-r.top)/r.height-.5;
        card.style.setProperty('--tilt-x', `${(-y*2.2).toFixed(2)}deg`);
        card.style.setProperty('--tilt-y', `${(x*2.2).toFixed(2)}deg`);
        card.style.setProperty('--mx', `${e.clientX-r.left}px`);
        card.style.setProperty('--my', `${e.clientY-r.top}px`);
      }, {passive:true});
      card.addEventListener('pointerleave', () => {
        card.style.removeProperty('--tilt-x');
        card.style.removeProperty('--tilt-y');
      });
    });

    /* One efficient image-depth handler; no duplicate pointer listeners. */
    document.querySelectorAll('.p-item,.service-art,.ba-slider').forEach(surface => {
      surface.classList.add('liquid-image-target');
      const lens = document.createElement('span');
      lens.className = 'liquid-lens';
      surface.appendChild(lens);
      const img = surface.querySelector('img');
      surface.addEventListener('pointermove', e => {
        const r = surface.getBoundingClientRect();
        const x = (e.clientX-r.left)/r.width-.5;
        const y = (e.clientY-r.top)/r.height-.5;
        lens.style.left = `${e.clientX-r.left}px`;
        lens.style.top = `${e.clientY-r.top}px`;
        surface.style.setProperty('--mx', `${e.clientX-r.left}px`);
        surface.style.setProperty('--my', `${e.clientY-r.top}px`);
        if (img) img.style.setProperty('--image-x', `${(-x*5).toFixed(2)}px`);
        if (img) img.style.setProperty('--image-y', `${(-y*5).toFixed(2)}px`);
      }, {passive:true});
      surface.addEventListener('pointerenter', () => lens.classList.add('is-active'));
      surface.addEventListener('pointerleave', () => {
        lens.classList.remove('is-active');
        if (img) { img.style.removeProperty('--image-x'); img.style.removeProperty('--image-y'); }
      });
    });

    /* Press feedback without layout-changing transforms. */
    document.querySelectorAll('button,.week-cal-day,.edit-step').forEach(el => {
      el.addEventListener('pointerdown', e => {
        el.classList.add('is-pressed');
        if (['BUTTON','A'].includes(el.tagName)) {
          const r = el.getBoundingClientRect();
          const ripple = document.createElement('span');
          ripple.className = 'tactile-ripple';
          ripple.style.left = `${e.clientX-r.left}px`;
          ripple.style.top = `${e.clientY-r.top}px`;
          el.appendChild(ripple);
          ripple.addEventListener('animationend', () => ripple.remove(), {once:true});
        }
      });
      ['pointerup','pointercancel','pointerleave'].forEach(type => el.addEventListener(type, () => el.classList.remove('is-pressed')));
    });

    /* Availability days become responsive controls. */
    const days = [...document.querySelectorAll('.week-cal-day')];
    days.forEach((day,index) => {
      day.setAttribute('tabindex','0');
      const select = () => {
        days.forEach(d => d.classList.remove('is-selected'));
        day.classList.add('is-selected');
      };
      day.addEventListener('click', select);
      day.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(); }
      });
      if (index === 0) day.classList.add('is-selected');
    });

    /* Hero depth: gentle enough to stay buttery. */
    const hero = document.querySelector('.hero');
    const heroCopy = document.querySelector('.hero-copy');
    const heroFloat = document.querySelector('.hero-float');
    if (hero && heroCopy) {
      hero.addEventListener('pointermove', e => {
        const r = hero.getBoundingClientRect();
        const x = (e.clientX-r.left)/r.width-.5;
        const y = (e.clientY-r.top)/r.height-.5;
        hero.style.setProperty('--hero-x', `${(x*14).toFixed(2)}px`);
        hero.style.setProperty('--hero-y', `${(y*10).toFixed(2)}px`);
      }, {passive:true});
      hero.addEventListener('pointerleave', () => {
        hero.style.setProperty('--hero-x','0px');
        hero.style.setProperty('--hero-y','0px');
      });
    }

    /* Animated counters when they enter view. */
    document.querySelectorAll('[data-count]').forEach(counter => {
      const target = Number(counter.dataset.count);
      const suffix = counter.dataset.suffix || '';
      const run = () => {
        const start = performance.now(), duration = 900;
        const tick = now => {
          const p = Math.min(1,(now-start)/duration);
          const eased = 1-Math.pow(1-p,3);
          counter.textContent = Math.round(target*eased) + suffix;
          if(p<1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      };
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(es => { if(es.some(e=>e.isIntersecting)){run();io.disconnect();}}, {threshold:.6});
        io.observe(counter);
      } else run();
    });
  }

  /* Decorative liquid atmosphere. */
  if (!reduceMotion) {
    const field = document.createElement('div');
    field.className = 'liquid-field';
    field.innerHTML = '<span class="liquid-blob"></span><span class="liquid-blob"></span><span class="liquid-blob"></span><span class="liquid-blob"></span>';
    document.body.prepend(field);

    // Motion is CSS-driven; no perpetual JS animation loop needed.
    field.style.setProperty('--drift', '0px');
  }

});

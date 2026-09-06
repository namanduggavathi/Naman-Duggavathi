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
  const lightboxFermer = document.getElementById('lightbox-close');

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
  if (lightboxFermer) lightboxFermer.addEventListener('click', closeLightbox);
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
    const baBeforeImg = baBeforeLayer ? baBeforeLayer.querySelector('img') : null;
    const baHandle = baSlider.querySelector('[data-ba-handle]');
    if (!baBeforeLayer || !baHandle || !baBeforeImg) return;

    let dragging = false;

    function syncImageSize() {
      const rect = baSlider.getBoundingClientRect();
      baBeforeImg.style.width = rect.width + 'px';
      baBeforeImg.style.height = rect.height + 'px';
    }

    function setPosition(clientX) {
      const rect = baSlider.getBoundingClientRect();
      let x = clientX - rect.left;
      x = Math.max(0, Math.min(rect.width, x));
      const pct = (x / rect.width) * 100;
      baBeforeLayer.style.width = x + 'px';
      baHandle.style.left = x + 'px';
      baHandle.setAttribute('aria-valuenow', Math.round(pct));
    }

    syncImageSize();
    window.addEventListener('resize', syncImageSize);

    function startDrag(e) {
      dragging = true;
      baSlider.classList.add('is-dragging');
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
    function endDrag() { dragging = false; baSlider.classList.remove('is-dragging'); }

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

  /* ---------- Tarifs "Lire la suite" toggle ---------- */
  document.querySelectorAll('.price-more-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      const isOpen = target.classList.toggle('is-open');
      const card = btn.closest('.price-card');
      if (card) {
        card.classList.toggle('price-card-expanded', isOpen);
        card.setAttribute('data-details-open', String(isOpen));
      }
      btn.setAttribute('aria-expanded', String(isOpen));
      btn.textContent = isOpen ? 'Réduire' : 'Lire la suite';
    });
  });

  /* ---------- Tarifs CTA -> pre-fill contact form ---------- */
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
    { image: 'images/edit-stage-1.webp', label: '01 · Prise de vue de base', title: 'Commencer par une base propre.', text: 'Une image HDR de 3 à 5 stops est conservée à plat pour offrir plus de souplesse en postproduction.' },
    { image: 'images/edit-stage-2.webp', label: '02 · Équilibre de la lumière', title: 'Récupérer toute la scène.', text: 'Les hautes lumières, les ombres et l’exposition sont équilibrées pour que la propriété reste lisible d’un bord à l’autre.' },
    { image: 'images/edit-stage-3.webp', label: '03 · Balance des blancs', title: 'Donner à la lumière le bon rendu.', text: 'La température et la teinte sont ajustées pour conserver un rendu naturel et accueillant.' },
    { image: 'images/edit-stage-4.webp', label: '04 · Étalonnage couleur', title: 'Ajouter de la profondeur sans exagérer.', text: 'La couleur et la saturation sont travaillées pour un rendu soigné tout en gardant la propriété au premier plan.' },
    { image: 'images/edit-stage-5.webp', label: '05 · Finition finale', title: 'Finaliser pour l’annonce.', text: 'Les dernières touches. Un léger effet de brume accentue le coucher de soleil pour obtenir une photo immobilière haut de gamme.' }
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

    /* Disponibilités days become responsive controls. */
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


/* ================================================================
   HERO CARD DOT FIELD — same liquid warp, clipped to the tactile card
   ================================================================ */
(function(){
  const card = document.querySelector('.hero-copy');
  if (!card || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (card.querySelector('.hero-dot-grid')) return;

  const c = document.createElement('canvas');
  c.className = 'hero-dot-grid';
  card.prepend(c);
  const ctx = c.getContext('2d', {alpha:true});
  if (!ctx) return;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w=0,h=0,gap=24,pts=[],target={x:-9999,y:-9999};
  let raf=0;
  const resize=()=>{
    const r=card.getBoundingClientRect();
    w=Math.max(1,r.width); h=Math.max(1,r.height);
    dpr=Math.min(window.devicePixelRatio||1,2);
    c.width=Math.round(w*dpr); c.height=Math.round(h*dpr);
    c.style.width=w+'px'; c.style.height=h+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    gap=w<600?20:24;
    pts=[];
    for(let y=gap/2;y<h+gap;y+=gap) for(let x=gap/2;x<w+gap;x+=gap)
      pts.push({x,y,dx:0,dy:0,vx:0,vy:0});
  };
  const move=e=>{const r=card.getBoundingClientRect(); target.x=e.clientX-r.left; target.y=e.clientY-r.top; start();};
  const leave=()=>{target.x=-9999;target.y=-9999;};
  function draw(){
    raf=0; ctx.clearRect(0,0,w,h);
    const influence=Math.min(145,Math.max(95,w*.30)), strength=38;
    for(const p of pts){
      const dx=p.x-target.x,dy=p.y-target.y,d=Math.hypot(dx,dy);
      const f=Math.max(0,1-d/influence),e=f*f*(3-2*f);
      const nx=d?dx/d:0,ny=d?dy/d:0;
      const tx=nx*e*strength,ty=ny*e*strength;
      p.vx+=(tx-p.dx)*.18;p.vy+=(ty-p.dy)*.18;p.vx*=.80;p.vy*=.80;p.dx+=p.vx;p.dy+=p.vy;
      const local=Math.max(0,1-d/(influence*1.08));
      const size=1.0+local*1.8;
      ctx.beginPath();ctx.arc(p.x+p.dx,p.y+p.dy,size,0,Math.PI*2);
      ctx.fillStyle=`rgba(52,58,63,${.34+local*.42})`;ctx.fill();
      if(local>.02){ctx.beginPath();ctx.arc(p.x+p.dx,p.y+p.dy,size+local*1.8,0,Math.PI*2);ctx.strokeStyle=`rgba(178,134,67,${local*.14})`;ctx.lineWidth=.7;ctx.stroke();}
    }
    if(pts.some(p=>Math.abs(p.dx)+Math.abs(p.dy)>.05)) start();
  }
  function start(){if(!raf)raf=requestAnimationFrame(draw)}
  card.addEventListener('pointermove',move,{passive:true});
  card.addEventListener('pointerleave',leave,{passive:true});
  addEventListener('resize',resize,{passive:true});
  resize();draw();
})();

/* ================================================================
   TACTILE DOT FIELD — perfectly regular grid with liquid-glass warp
   ================================================================ */
(function(){
  const canvas = document.getElementById('tactile-dot-field');
  if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = canvas.getContext('2d', {alpha:true});
  if (!ctx) return;
  let dpr = Math.min(window.devicePixelRatio || 1, 2), w = 0, h = 0, cols = 0, rows = 0, gap = 34;
  let points = [], target = {x:-9999,y:-9999}, raf = 0;
  const resize=()=>{w=innerWidth;h=innerHeight;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);gap=w<700?26:34;cols=Math.ceil(w/gap)+2;rows=Math.ceil(h/gap)+2;points=[];const ox=(w-(cols-1)*gap)/2,oy=(h-(rows-1)*gap)/2;for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)points.push({x:ox+x*gap,y:oy+y*gap,dx:0,dy:0,vx:0,vy:0});};
  const move=e=>{target.x=e.clientX;target.y=e.clientY;if(!raf)raf=requestAnimationFrame(draw)};
  const leave=()=>{target.x=-9999;target.y=-9999};
  function draw(){ctx.clearRect(0,0,w,h);const strength=w<700?28:52,influence=w<700?105:150;for(const p of points){const dx=p.x-target.x,dy=p.y-target.y,dist=Math.hypot(dx,dy),force=Math.max(0,1-dist/influence),ease=force*force*(3-2*force),nx=dist?dx/dist:0,ny=dist?dy/dist:0;const tx=nx*ease*strength,ty=ny*ease*strength;p.vx+=(tx-p.dx)*.15;p.vy+=(ty-p.dy)*.15;p.vx*=.82;p.vy*=.82;p.dx+=p.vx;p.dy+=p.vy;const local=Math.max(0,1-dist/(influence*1.05)),size=1.15+local*1.7,x=p.x+p.dx,y=p.y+p.dy;ctx.beginPath();ctx.arc(x,y,size,0,Math.PI*2);ctx.fillStyle=`rgba(105,115,127,${.25+local*.42})`;ctx.fill();if(local>.02){ctx.beginPath();ctx.arc(x,y,size+local*2.2,0,Math.PI*2);ctx.strokeStyle=`rgba(177,141,82,${local*.16})`;ctx.lineWidth=.8;ctx.stroke()}}raf=requestAnimationFrame(draw)}
  addEventListener('resize',resize,{passive:true});addEventListener('pointermove',move,{passive:true});addEventListener('pointerleave',leave,{passive:true});resize();draw();
})();

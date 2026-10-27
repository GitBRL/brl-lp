/* =========================================================================
   BRL EXPERIENCE 2026 — movimento
   GSAP 3 + ScrollTrigger. Tudo que entra em cena, entra animado.
   ========================================================================= */

gsap.registerPlugin(ScrollTrigger);

// marca que o GSAP está de pé — só então o CSS esconde os [data-reveal]
document.documentElement.classList.add('gsap-ready');

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

/* Divide um texto em palavras mascaradas: <span class="w"><i>palavra</i></span> */
const splitWords = el => {
  const words = el.textContent.trim().split(/[ \n\t]+/);
  el.innerHTML = words.map(w => '<span class="w"><i>' + w + '</i></span>').join(' ');
  return $$('.w > i', el);
};

gsap.defaults({ ease: 'power3.out' });


/* =============================================================== MENU ==== */

const $nav = $('.nav');
const $trigger = $('.nav-trigger');
let navOpen = false;

const navTL = gsap.timeline({ paused: true })
  .to('.nav-bg', { scaleY: 1, duration: .7, ease: 'power4.inOut' })
  .set('.nav-inner', { opacity: 1 }, '-=.25')
  .from('.nav-link', { yPercent: 115, duration: .7, stagger: .06 }, '-=.3')
  .from('.nav-meta p', { y: 24, opacity: 0, duration: .5, stagger: .07 }, '-=.4');

const burgerTL = gsap.timeline({ paused: true })
  .to('.bar-1', { y: 3, rotate: 45, duration: .35, ease: 'power2.inOut' })
  .to('.bar-2', { y: -3, rotate: -45, duration: .35, ease: 'power2.inOut' }, 0);

const openNav = () => {
  navOpen = true;
  $nav.classList.add('-open');
  $nav.setAttribute('aria-hidden', 'false');
  navTL.timeScale(1).play();
  burgerTL.play();
};

const closeNav = () => {
  navOpen = false;
  $nav.classList.remove('-open');
  $nav.setAttribute('aria-hidden', 'true');
  navTL.timeScale(1.8).reverse();
  burgerTL.reverse();
};

$trigger.addEventListener('click', () => (navOpen ? closeNav() : openNav()));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && navOpen) closeNav(); });

const goTo = id => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
};

$$('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    const target = link.dataset.target;
    closeNav();
    setTimeout(() => goTo(target), 500);
  });
});

$$('[data-target]:not(.nav-link)').forEach(btn => {
  btn.addEventListener('click', () => goTo(btn.dataset.target));
});


/* =========================================================== PROGRESSO === */

gsap.to('.progress-bar', {
  scaleX: 1,
  ease: 'none',
  scrollTrigger: { start: 0, end: 'max', scrub: .3 }
});


/* ================================================================ HERO === */

const heroIn = () => {
  const tl = gsap.timeline();
  tl.from('.hero-media img', { scale: 1.25, duration: 1.8, ease: 'power2.out' })
    .from('.hero-logo', { y: -18, opacity: 0, duration: .8 }, .2)
    .from('.clock-tag, .clock-unit', { y: -14, opacity: 0, duration: .6, stagger: .06 }, .3)
    .from('.hero-kicker', { y: 16, opacity: 0, duration: .7 }, .4)
    .from('.hero-title .line > span', { yPercent: 115, duration: 1.1, stagger: .1, ease: 'power4.out' }, .45)
    .from('.hero-sub', { y: 22, opacity: 0, duration: .8 }, .9)
    .from('.hero-foot', { y: 20, opacity: 0, duration: .8 }, 1)
    .from('.hero-fact', { opacity: 0, duration: .5, stagger: .08 }, 1.1)
    // a quina amarela cresce a partir do canto — o .nav-trigger-bg mantém
    // a rotação de 45° do CSS, então animamos o contêiner, não ele
    .from('.nav-trigger-container', {
      scale: 0, opacity: 0, transformOrigin: 'top right', duration: 1, ease: 'power4.out'
    }, .25);
  return tl;
};

// A abertura roda de imediato: esperar a fonte remota deixaria o hero em
// branco se o woff2 demorasse. As fontes só disparam um refresh de medidas.
heroIn();
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}

// pulso contínuo da indicação de scroll
gsap.to('.hero-cue i', { scaleY: 0, transformOrigin: 'bottom', duration: 1.1, repeat: -1, ease: 'power2.inOut', yoyo: true });

// parallax de saída do hero
if (!REDUCED) {
  gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
    .to('.hero-body', { yPercent: -45, opacity: 0, ease: 'none' }, 0)
    .to('.hero-foot', { y: 60, opacity: 0, ease: 'none' }, 0)
    .to('.hero-media img', { scale: 1.15, yPercent: 8, ease: 'none' }, 0);
}


/* =========================================================== MANIFESTO === */

const $manifesto = $('.manifesto-text');
if ($manifesto) {
  const words = splitWords($manifesto);
  gsap.to(words, {
    color: '#ffffff',
    ease: 'none',
    stagger: 1,
    scrollTrigger: {
      trigger: '.manifesto',
      start: 'top top',
      end: '+=' + (words.length * 90),
      pin: '.manifesto-stage',
      scrub: .4
    }
  });
}


/* ============================================ ZOOM / PERSPECTIVA APPLE === */

const $zoomCard = $('.zoom-card');
if ($zoomCard) {
  // a frase da sobreposição precisa estar dividida ANTES de entrar na timeline
  const $zoomTitle = $('.zoom-title');
  if ($zoomTitle) splitWords($zoomTitle);

  // fator exato para a carta preencher a tela ao final do scroll
  const fillScale = () => Math.max(
    window.innerWidth / $zoomCard.offsetWidth,
    window.innerHeight / $zoomCard.offsetHeight
  ) * 1.04;

  gsap.timeline({
    scrollTrigger: {
      trigger: '.zoom',
      start: 'top top',
      end: '+=1600',
      pin: '.zoom-stage',
      scrub: .6,
      invalidateOnRefresh: true
    }
  })
    .fromTo($zoomCard,
      { scale: .72, rotateX: 34, rotateY: -12, z: -340 },
      { scale: fillScale, rotateX: 0, rotateY: 0, z: 0, ease: 'none' }, 0)
    .fromTo('.zoom-caption', { opacity: 1 }, { opacity: 0, ease: 'none', duration: .35 }, 0)
    .fromTo('.zoom-card img', { scale: 1.3 }, { scale: 1, ease: 'none' }, 0)
    .fromTo('.zoom-title .w > i',
      { yPercent: 130 },
      { yPercent: 0, ease: 'power2.out', stagger: .12, duration: .5 }, .62);
}


/* ============================================================== TÚNEL === */

const layers = $$('.tunnel-layer');
if (layers.length) {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.tunnel',
      start: 'top top',
      end: '+=' + (layers.length * 420),
      pin: '.tunnel-stage',
      scrub: .5
    }
  });

  layers.forEach((layer, i) => {
    tl.fromTo(layer,
      { z: -2600, opacity: 0 },
      { z: -60, opacity: 1, duration: .62, ease: 'none' }, i * .5)
      // o z de saída fica abaixo da perspectiva (900px): passar dela estoura
      // a escala no ponto de fuga e gera um flash
      .to(layer,
        { z: 620, opacity: 0, duration: .38, ease: 'none' }, i * .5 + .62);
  });
}


/* ============================================================== STATS === */

$$('[data-count]').forEach(el => {
  const target = parseFloat(el.dataset.count);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const asBR = el.dataset.format === 'br';
  const render = n => prefix + (asBR ? n.toLocaleString('pt-BR') : n) + suffix;

  if (REDUCED) { el.textContent = render(target); return; }

  const obj = { v: 0 };

  gsap.to(obj, {
    v: target,
    duration: 1.8,
    ease: 'power2.out',
    scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    onUpdate: () => { el.textContent = render(Math.round(obj.v)); }
  });
});


/* fundo desfocado do Ravell respira junto com o scroll */
if (!REDUCED && $('.stats-bg img')) {
  gsap.to('.stats-bg img', {
    yPercent: -14,
    scale: 1.22,
    ease: 'none',
    scrollTrigger: { trigger: '.stats', start: 'top bottom', end: 'bottom top', scrub: .6 }
  });
}


/* =============================================== ATOS (scroll lateral) === */

const $track = $('.acts-track');
if ($track) {
  const distance = () => Math.max(0, $track.scrollWidth - window.innerWidth);

  gsap.to($track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: '.acts',
      start: 'top top',
      end: () => '+=' + distance(),
      pin: true,
      scrub: .8,
      invalidateOnRefresh: true
    }
  });

  // cada carta entra levemente deslocada enquanto a faixa anda
  gsap.from('.act:not(.act-intro)', {
    y: 70,
    opacity: 0,
    duration: .8,
    stagger: .08,
    scrollTrigger: { trigger: '.acts', start: 'top 60%' }
  });
}


/* ========================================================== CONVIDADOS === */

const $guests = $('.guest-list');
if ($guests) {
  // miniatura que segue o cursor sobre a lista
  const $preview = $('.guest-preview');
  const moveX = gsap.quickTo($preview, 'x', { duration: .5, ease: 'power3' });
  const moveY = gsap.quickTo($preview, 'y', { duration: .5, ease: 'power3' });



  $guests.addEventListener('mousemove', e => {
    moveX(e.clientX + 28);
    moveY(e.clientY - 150);
  });
}


/* =============================================================== FINAL === */

gsap.from('.finale-title .line > span', {
  yPercent: 120,
  duration: 1.1,
  stagger: .12,
  ease: 'power4.out',
  scrollTrigger: { trigger: '.finale', start: 'top 65%' }
});

gsap.to('.marquee-track', { xPercent: -33.333, duration: 26, ease: 'none', repeat: -1 });


/* ====================================================== SCROLL REVEAL ==== */
/* Um sistema só para a página inteira. Cada elemento marcado com
   data-reveal entra em cena ao cruzar o viewport; o valor escolhe o estilo. */

const REVEALS = {
  up:   { from: { y: 48, opacity: 0 },                 duration: .9 },
  flip: { from: { rotateY: -26, y: 80, opacity: 0 },   duration: 1 },
  zoom: { from: { scale: .88, opacity: 0 },            duration: .8 },
  left: { from: { x: -56, opacity: 0 },                duration: .9 }
};

if (!REDUCED) {
  const groups = {};
  $$('[data-reveal]').forEach(el => {
    const kind = el.dataset.reveal || 'up';
    (groups[kind] = groups[kind] || []).push(el);
  });

  Object.keys(groups).forEach(kind => {
    const spec = REVEALS[kind] || REVEALS.up;
    const els = groups[kind];

    gsap.set(els, spec.from);

    ScrollTrigger.batch(els, {
      start: 'top 88%',
      onEnter: batch => gsap.to(batch, {
        y: 0, x: 0, scale: 1, rotateY: 0, opacity: 1,
        duration: spec.duration,
        stagger: .09,
        ease: 'power3.out',
        overwrite: true,
        // só depois de entrar em cena o elemento aceita interação com transform
        // (senão a inclinação dos cards brigaria com a animação de entrada)
        onComplete: () => batch.forEach(el => { el.dataset.live = '1'; })
      })
    });
  });
}

// frases que entram palavra a palavra
$$('[data-words]:not(.manifesto-text):not(.zoom-title)').forEach(el => {
  const words = splitWords(el);
  gsap.from(words, {
    yPercent: 120,
    duration: .9,
    stagger: .05,
    ease: 'power4.out',
    scrollTrigger: { trigger: el, start: 'top 85%' }
  });
});


/* ============================================================ CONTAGEM === */
/* Quanto falta para 20/11/2026 — cada dígito rola ao mudar de valor. */

const EVENT_DATE = new Date('2026-11-20T09:00:00-03:00');
const clock = {
  d: $('[data-cd="d"]'), h: $('[data-cd="h"]'),
  m: $('[data-cd="m"]'), s: $('[data-cd="s"]')
};
const pad = n => String(n).padStart(2, '0');

const setUnit = (el, value) => {
  if (!el || el.textContent === value) return;
  el.textContent = value;
  if (!REDUCED) gsap.fromTo(el, { yPercent: 115 }, { yPercent: 0, duration: .45, ease: 'power3.out' });
};

if (clock.d && clock.h && clock.m && clock.s) {
  const tick = () => {
    const total = Math.max(0, Math.floor((EVENT_DATE - Date.now()) / 1000));
    setUnit(clock.d, String(Math.floor(total / 86400)));
    setUnit(clock.h, pad(Math.floor(total / 3600) % 24));
    setUnit(clock.m, pad(Math.floor(total / 60) % 60));
    setUnit(clock.s, pad(total % 60));
  };
  tick();
  setInterval(tick, 1000);
}


/* =========================================== CARDS DE COMPRA (ingressos) = */
/* Inclinação 3D no cursor, afundar no clique e onda saindo do ponto clicado.
   O anel girando e o brilho pulsante são do CSS, em loop. */

$$('.ticket').forEach(card => {
  if (REDUCED) return;

  const press = gsap.quickTo(card, 'scale', { duration: .25, ease: 'power3' });
  const tiltX = gsap.quickTo(card, 'rotateX', { duration: .5, ease: 'power3' });
  const tiltY = gsap.quickTo(card, 'rotateY', { duration: .5, ease: 'power3' });

  card.addEventListener('mousemove', e => {
    // só inclina depois que o card terminou de entrar em cena
    if (!card.dataset.live) return;
    const r = card.getBoundingClientRect();
    tiltY(((e.clientX - r.left) / r.width - .5) * 14);
    tiltX(((e.clientY - r.top) / r.height - .5) * -12);
  });

  card.addEventListener('mouseleave', () => {
    if (!card.dataset.live) return;
    tiltX(0); tiltY(0); press(1);
  });

  card.addEventListener('pointerdown', e => {
    press(.97);

    const r = card.getBoundingClientRect();
    const wave = document.createElement('span');
    wave.className = 'ticket-wave';
    wave.style.left = (e.clientX - r.left) + 'px';
    wave.style.top = (e.clientY - r.top) + 'px';
    card.appendChild(wave);

    gsap.fromTo(wave,
      { scale: 0, opacity: .6 },
      { scale: 1, opacity: 0, duration: .85, ease: 'power2.out', onComplete: () => wave.remove() });
  });

  card.addEventListener('pointerup', () => press(1));
  card.addEventListener('pointercancel', () => press(1));
});


/* ============================================================== AJUSTES == */

// Acessibilidade: com movimento reduzido tudo fica estático e visível.
if (REDUCED) {
  ScrollTrigger.getAll().forEach(t => t.kill());
  gsap.killTweensOf('*');
  gsap.set([
    '.line > span', '.w > i', '[data-reveal]', '.act', '.guest-list li',
    '.hero-media img', '.hero-body', '.hero-foot', '.hero-logo', '.clock-tag', '.clock-unit',
    '.hero-kicker', '.hero-sub', '.hero-fact', '.nav-trigger-container', '.hero-cue i',
    '.btn-lg', '.marquee-track'
  ], { clearProps: 'all' });
  gsap.set('.progress-bar', { scaleX: 1 });
}

window.addEventListener('load', () => ScrollTrigger.refresh());

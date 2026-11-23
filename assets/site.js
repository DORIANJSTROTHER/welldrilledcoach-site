(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Reveal on scroll */
  const els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    els.forEach((el) => io.observe(el));
  } else { els.forEach((el) => el.classList.add('in')); }

  /* Count-up numbers */
  const counters = document.querySelectorAll('[data-count]');
  const run = (el) => {
    const end = +el.dataset.count, dur = 1100, t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
      el.textContent = v; if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window && !reduce) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { run(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach((c) => { c.textContent = '0'; co.observe(c); });
  }

  /* Live drill timer (Practice 1 preview) */
  const card = document.querySelector('[data-timer]');
  if (card) {
    const blocks = [
      { stage: 'PRESENT', name: 'Arrival and welcome', secs: 300, say: 'Circle up. Name the skill. 60 seconds, then play.', look: 'Team word: Control.' },
      { stage: 'PRACTICE', name: 'Dribble Tag', secs: 480, say: 'Eyes up. Find the tagger.', look: 'Dribble by your hip, not out in front.' },
      { stage: 'PRACTICE', name: 'Ball-Handling Series', secs: 600, say: 'One cue, then let them play.', look: 'Every player can dribble with eyes up.' }
    ];
    const total = 8;
    let i = 1, left = blocks[1].secs, tick = null;
    const $ = (s) => card.querySelector(s);
    const fmt = (s) => { const m = Math.floor(s / 60), r = s % 60; return `${String(m).padStart(2, '0')}<span class="colon">:</span>${String(r).padStart(2, '0')}`; };
    const draw = () => {
      const b = blocks[i];
      $('.stage-chip').textContent = b.stage;
      $('.block-of').textContent = `Block ${i + 1} of ${total}`;
      $('.drill-name').textContent = b.name;
      $('.clock').innerHTML = fmt(left);
      $('[data-say]').textContent = b.say;
      $('[data-look]').textContent = b.look;
      const nx = blocks[i + 1];
      $('[data-next]').textContent = nx ? `${nx.name} · ${nx.secs / 60} min` : 'Red Light, Green Light';
      card.querySelectorAll('.progress i').forEach((p, k) => { p.className = k < i ? 'done' : k === i ? 'on' : ''; });
      $('.start').textContent = tick ? 'Pause' : 'Start';
      card.classList.toggle('running', !!tick);
    };
    const stop = () => { clearInterval(tick); tick = null; };
    $('.start').addEventListener('click', () => {
      if (tick) { stop(); } else {
        tick = setInterval(() => { left = Math.max(0, left - 1); if (!left) stop(); draw(); }, 1000);
      }
      draw();
    });
    $('[data-prev]').addEventListener('click', () => { stop(); i = Math.max(0, i - 1); left = blocks[i].secs; draw(); });
    $('[data-nextbtn]').addEventListener('click', () => { stop(); i = Math.min(blocks.length - 1, i + 1); left = blocks[i].secs; draw(); });
    draw();
  }

  /* Drill demo switcher */
  const demo = document.querySelector('[data-demo]');
  if (demo) {
    const tabs = demo.querySelectorAll('[role="tab"]');
    const img = demo.querySelector('[data-demo-img]'), say = demo.querySelector('[data-demo-say]'), look = demo.querySelector('[data-demo-look]');
    let auto = null, idx = 0;
    const show = (k, focus) => {
      idx = k; const t = tabs[k];
      tabs.forEach((x) => { x.setAttribute('aria-selected', x === t ? 'true' : 'false'); x.tabIndex = x === t ? 0 : -1; });
      img.style.opacity = 0;
      setTimeout(() => {
        if (img.tagName === 'VIDEO') {
          img.poster = t.dataset.img; img.setAttribute('aria-label', t.dataset.alt);
          if (!reduce && t.dataset.vid) { img.src = t.dataset.vid; img.play().catch(() => {}); } else { img.removeAttribute('src'); img.load(); }
        } else { img.src = t.dataset.img; img.alt = t.dataset.alt; }
        say.textContent = t.dataset.say; look.textContent = t.dataset.look; img.style.opacity = 1;
      }, reduce ? 0 : 180);
      if (focus) t.focus();
    };
    tabs.forEach((t, k) => {
      t.addEventListener('click', () => { clearInterval(auto); show(k); });
      t.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); clearInterval(auto); show((k + 1) % tabs.length, true); }
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); clearInterval(auto); show((k - 1 + tabs.length) % tabs.length, true); }
      });
    });
    if (reduce && img.tagName === 'VIDEO') { img.removeAttribute('autoplay'); img.pause(); img.removeAttribute('src'); img.load(); }
    if (!reduce) auto = setInterval(() => show((idx + 1) % tabs.length), 6000);
  }

  /* Post wall: duplicate for a seamless loop */
  const track = document.querySelector('.wall-track');
  if (track) track.innerHTML += track.innerHTML.replace(/<img /g, '<img aria-hidden="true" alt="" ');
})();

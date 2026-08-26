// ========================================================================
// site.js — perilaku yang dipakai bersama di semua halaman Hutao SMP
// (menu mobile, animasi reveal saat scroll, partikel ambient, tombol salin)
// ========================================================================

document.addEventListener('DOMContentLoaded', () => {

  // ---------- reveal-on-scroll ----------
  const revealTargets = document.querySelectorAll('.scroll-reveal');
  if (revealTargets.length) {
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
      revealTargets.forEach(t => io.observe(t));
    } else {
      revealTargets.forEach(t => t.classList.add('in-view'));
    }
  }

  // ---------- copy buttons ----------
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-copy');
      navigator.clipboard?.writeText(text).catch(() => {});
      const original = btn.textContent;
      btn.textContent = '✓ Disalin';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = original; btn.classList.remove('copied'); }, 1500);
    });
  });

  // ---------- mobile menu toggle ----------
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', open);
    });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }));
  }

  // ---------- floating overworld blocks in a hero section ----------
  const heroWrap = document.getElementById('heroWrap');
  if (heroWrap) {
    const blockTypes = ['b-grass', 'b-gold', 'b-stone', 'b-diamond'];
    const blockDefs = [
      { size: 34, top: 14, left: 6, delay: 0 },
      { size: 22, top: 30, left: 88, delay: .6 },
      { size: 16, top: 64, left: 3, delay: 1.1 },
      { size: 26, top: 8, left: 78, delay: .3 },
      { size: 18, top: 50, left: 93, delay: 1.5 },
    ];
    blockDefs.forEach((b, i) => {
      const el = document.createElement('div');
      el.className = 'float-block ' + blockTypes[i % blockTypes.length];
      el.style.width = b.size + 'px';
      el.style.height = b.size + 'px';
      el.style.top = b.top + 'px';
      el.style.left = b.left + '%';
      el.style.animationDelay = b.delay + 's';
      heroWrap.appendChild(el);
    });
  }

  // ---------- rising ambient sparkles ----------
  const sparkleLayer = document.getElementById('sparkles');
  if (sparkleLayer) {
    const sparkleCount = window.innerWidth < 480 ? 14 : 24;
    for (let i = 0; i < sparkleCount; i++) {
      const s = document.createElement('div');
      s.className = 'sparkle';
      const size = 2 + Math.random() * 4;
      const startX = Math.random() * 100;
      const drift = (Math.random() * 60 - 30) + 'px';
      const duration = 7 + Math.random() * 8;
      const delay = Math.random() * 10;
      s.style.width = size + 'px';
      s.style.height = size + 'px';
      s.style.left = startX + 'vw';
      s.style.setProperty('--drift', drift);
      s.style.animation = `rise ${duration}s linear ${delay}s infinite`;
      sparkleLayer.appendChild(s);
    }
  }

  // ---------- store category tabs (only runs if present on the page) ----------
  const tabButtons = document.querySelectorAll('.tab-btn');
  const storePanels = document.querySelectorAll('.store-panel');
  if (tabButtons.length && storePanels.length) {
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab');
        tabButtons.forEach(b => b.classList.remove('active'));
        storePanels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(target)?.classList.add('active');
      });
    });
  }

  // ---------- leaderboard category tabs ----------
  const lbTabButtons = document.querySelectorAll('.lb-tab-btn');
  const lbPanels = document.querySelectorAll('.lb-panel');
  if (lbTabButtons.length && lbPanels.length) {
    lbTabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-lb');
        lbTabButtons.forEach(b => b.classList.remove('active'));
        lbPanels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(target)?.classList.add('active');
      });
    });
  }

  // ---------- IP edition tabs (Java / Bedrock) ----------
  const ipTabButtons = document.querySelectorAll('.ip-tab-btn');
  const ipPanels = document.querySelectorAll('.ip-panel');
  if (ipTabButtons.length && ipPanels.length) {
    ipTabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-iptab');
        ipTabButtons.forEach(b => b.classList.remove('active'));
        ipPanels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(target)?.classList.add('active');
      });
    });
  }

  // ---------- FAQ accordion ----------
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      q.parentElement.classList.toggle('open');
    });
  });

});

// ---------- top up quantity stepper (rank.html only — Hu Tao SMP custom feature) ----------
(function () {
  const offers = {
    money: { rate: 5000, unit: 'Rp100rb Saldo', label: 'Money' },
    point: { rate: 1000, unit: '20 Point', label: 'Point' },
    skill: { rate: 7000, unit: '1 Skill', label: 'Skill' },
  };
  const WA_NUMBER = '6285761779383';
  const qty = { money: 1, point: 1, skill: 1 };

  function formatRupiah(n) {
    return 'Rp' + n.toLocaleString('id-ID');
  }

  function updateOffer(key) {
    const cfg = offers[key];
    if (!cfg) return;
    const qtyEl = document.getElementById(key + '-qty');
    const totalEl = document.getElementById(key + '-total');
    const linkEl = document.getElementById(key + '-link');
    if (!qtyEl || !totalEl || !linkEl) return;

    const total = qty[key] * cfg.rate;
    qtyEl.value = qty[key];
    totalEl.textContent = formatRupiah(total);

    const msg = `Halo Admin, saya mau top up ${cfg.label} sejumlah ${qty[key]}x ${cfg.unit} (Total ${formatRupiah(total)}) IGN: `;
    linkEl.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  }

  window.stepQty = function (key, delta) {
    if (!offers[key]) return;
    qty[key] = Math.max(1, qty[key] + delta);
    updateOffer(key);
  };

  document.addEventListener('DOMContentLoaded', () => {
    Object.keys(offers).forEach(updateOffer);
  });
})();

(() => {
  const projects = [
    {
      match: ['cvent-pass', 'cvent', 'Reducing Cognitive Load', 'skyviewer'],
      href: '/skyviewer',
      badge: 'Geoint & Inteligência 3D',
      badgeBg: '#e7702b',
      title: 'Skyviewer · Monitoramento Territorial',
      highlight: 'com Mapbox 3D e Análise Espacial',
      role: 'Product Designer & Front-End @ HEX360',
      note: '・Entregue em produção',
      video: '/assets/projects/skyviewer.mp4'
    },
    {
      match: ['stardog', 'Who are you', 'cozybed'],
      href: '/cozybed',
      badge: 'E-commerce & Brand Experience',
      badgeBg: '#0080a5',
      title: 'Cozybed · Loja Virtual Imersiva',
      highlight: 'e Customizador 3D de Roupa de Cama',
      role: 'UI/UX Designer & Web Developer @ Cozybed',
      note: '・Tema Shopify Customizado',
      video: '/assets/projects/cozybed.mp4'
    },
    {
      match: ['snoozefest', 'Sleeping Habits', 'vertice-agro'],
      href: '/vertice-agro',
      badge: 'AgTech & Finanças Rurais',
      badgeBg: '#2d7a4d',
      title: 'Vértice Agro · Crédito Rural',
      highlight: 'e Análise de Risco Climático',
      role: 'Product Designer @ Vértice Agro',
      note: '・Plataforma Analítica Web',
      video: '/assets/projects/vertice-agro.mp4'
    },
    {
      match: ['dishcovery', 'Meal Kits', 'skynet'],
      href: '/skynet',
      badge: 'Cybersecurity & Operations UI',
      badgeBg: '#b72d4d',
      title: 'Skynet Tech · Dashboard Cibersegurança',
      highlight: 'para Monitoramento de Alta Densidade',
      role: 'UI Designer & Component System @ Skynet',
      note: '・Design System & UI Kit',
      video: '/assets/projects/skynet.mp4'
    }
  ];

  function applyProject(card, p) {
    if (card.dataset.mfApplied === p.href) return;
    card.dataset.mfApplied = p.href;
    card.setAttribute('href', p.href);

    // Update Badge
    const badge = card.querySelector('.framer-1wfgy2p h6, .framer-1vpehe2 h6, .framer-dd6atx h6');
    if (badge) badge.textContent = p.badge;
    const badgeBox = card.querySelector('.framer-1wfgy2p');
    if (badgeBox && p.badgeBg) badgeBox.style.backgroundColor = p.badgeBg;

    // Update Title H2
    const h2 = card.querySelector('h2');
    if (h2) {
      h2.innerHTML = `${p.title}<br class="framer-text"><mark class="framer-text" style="--framer-text-background-color:rgba(231,112,43,0.15)"><span class="framer-text" style="color:${p.badgeBg || '#e7702b'}">${p.highlight}</span></mark>`;
    }

    // Update Subtitles H6
    const h6s = card.querySelectorAll('h6');
    h6s.forEach(h6 => {
      const text = h6.textContent.trim();
      if (text.includes('@') || text.includes('Designer') || text.includes('Intern') || text.includes('Researcher') || text.includes('Developer')) {
        h6.textContent = p.role;
      } else if (text.startsWith('・') || text.includes('Delivered') || text.includes('Handed') || text.includes('Project') || text.includes('Entregue') || text.includes('Tema')) {
        h6.textContent = p.note;
      }
    });

    // Ensure Video plays smoothly
    const vid = card.querySelector('video');
    if (vid) {
      vid.removeAttribute('preload');
      vid.autoplay = true;
      vid.loop = true;
      vid.muted = true;
      vid.playsInline = true;
      if (vid.src && !vid.src.includes(p.video)) {
        vid.src = p.video;
      }
      vid.play().catch(() => {});
    }
  }

  function updateCards() {
    const anchors = document.querySelectorAll('a[href*="cvent"], a[href*="stardog"], a[href*="snoozefest"], a[href*="dishcovery"], a[href*="skyviewer"], a[href*="cozybed"], a[href*="vertice-agro"], a[href*="skynet"], a[data-mf-applied]');
    anchors.forEach(a => {
      const href = a.getAttribute('href') || '';
      for (const p of projects) {
        if (p.match.some(m => href.includes(m) || a.textContent.includes(m)) || a.dataset.mfApplied === p.href) {
          applyProject(a, p);
          break;
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateCards);
  } else {
    updateCards();
  }

  const observer = new MutationObserver(updateCards);
  observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
  window.addEventListener('load', updateCards);
  setInterval(updateCards, 500);
})();

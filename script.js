/**
 * MATHEUS FARIAS — PORTFOLIO KERNEL ENGINE
 * Features: Web Audio Synthesis, Interactive Node Canvas / Matrix Rain,
 * UNIX-style CLI Parser, Command Palette (Cmd+K), Live Telemetry & i18n.
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. WEB AUDIO SYNTHESIS ENGINE (ZERO ASSETS NEEDED)
  // =========================================================================
  let audioCtx = null;
  let soundEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playClickSound() {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(850, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, audioCtx.currentTime + 0.035);

      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.035);
    } catch (e) {}
  }

  function playChimeSound() {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    try {
      const now = audioCtx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        gain.gain.setValueAtTime(0.06, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.15);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.15);
      });
    } catch (e) {}
  }

  // Audio Toggle Button
  const audioBtn = document.getElementById('audio-toggle-btn');
  const iconOn = document.getElementById('audio-icon-on');
  const iconOff = document.getElementById('audio-icon-off');

  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      if (soundEnabled) {
        iconOn.classList.remove('hidden');
        iconOff.classList.add('hidden');
        playChimeSound();
      } else {
        iconOn.classList.add('hidden');
        iconOff.classList.remove('hidden');
      }
    });
  }

  // Bind click sounds to interactive items
  document.addEventListener('click', (e) => {
    if (e.target.closest('.btn-sound') || e.target.closest('a') || e.target.closest('button')) {
      playClickSound();
    }
  });

  // =========================================================================
  // 2. BACKGROUND CANVAS: INTERACTIVE NEURAL MESH & MATRIX RAIN
  // =========================================================================
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const particleCount = 55;
  let mouse = { x: null, y: null, radius: 140 };
  let matrixMode = false;
  let matrixDrops = [];

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initMatrix();
  }

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.7;
      this.vy = (Math.random() - 0.5) * 0.7;
      this.radius = Math.random() * 1.6 + 0.6;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse repulsion/attraction
      if (mouse.x !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 1.5;
          this.y -= (dy / dist) * force * 1.5;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }

  function initMatrix() {
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    matrixDrops = [];
    for (let i = 0; i < columns; i++) {
      matrixDrops[i] = Math.floor(Math.random() * -50);
    }
  }

  function drawMatrix() {
    ctx.fillStyle = 'rgba(8, 9, 13, 0.15)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#34d399';
    ctx.font = '13px "JetBrains Mono", monospace';

    const chars = '0123456789ABCDEFMATHEUSFARIASKERNELSYSTEM';
    for (let i = 0; i < matrixDrops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * 14, matrixDrops[i] * 14);

      if (matrixDrops[i] * 14 > height && Math.random() > 0.975) {
        matrixDrops[i] = 0;
      }
      matrixDrops[i]++;
    }
  }

  function renderCanvas() {
    if (matrixMode) {
      drawMatrix();
    } else {
      ctx.clearRect(0, 0, width, height);

      // Draw lines between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.12 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Update & draw particles
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
    }

    requestAnimationFrame(renderCanvas);
  }

  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  resizeCanvas();
  initParticles();
  requestAnimationFrame(renderCanvas);

  // =========================================================================
  // 3. LIVE FPS TELEMETRY COUNTER
  // =========================================================================
  const fpsElement = document.getElementById('live-fps');
  let lastFrameTime = performance.now();
  let frameCount = 0;
  let fps = 60.0;

  function measureFps(now) {
    frameCount++;
    if (now - lastFrameTime >= 1000) {
      fps = ((frameCount * 1000) / (now - lastFrameTime)).toFixed(1);
      if (fpsElement) {
        fpsElement.textContent = `${fps} FPS`;
      }
      frameCount = 0;
      lastFrameTime = now;
    }
    requestAnimationFrame(measureFps);
  }
  requestAnimationFrame(measureFps);

  // =========================================================================
  // 4. INTERACTIVE TERMINAL ENGINE
  // =========================================================================
  const terminalScreen = document.getElementById('terminal-screen');
  const terminalForm = document.getElementById('terminal-form');
  const termInput = document.getElementById('term-input');
  const cmdPills = document.querySelectorAll('.cmd-pill');
  let cmdHistory = [];
  let historyIndex = -1;

  const terminalCommands = {
    help: () => `
<div class="space-y-1 text-gray-300">
  <span class="text-cyan-400 font-bold">COMANDOS DISPONÍVEIS NO MF-KERNEL:</span><br>
  <span class="text-yellow-400 font-bold">projects</span>    - Lista completa de projetos reais com links e métricas<br>
  <span class="text-yellow-400 font-bold">skills</span>      - Matriz técnica de linguagens, frameworks e arquitetura<br>
  <span class="text-yellow-400 font-bold">manifesto</span>   - 4 princípios fundamentais e inegociáveis de engenharia<br>
  <span class="text-yellow-400 font-bold">benchmark</span>   - Executa teste de performance de computação no browser<br>
  <span class="text-yellow-400 font-bold">contact</span>     - Acesso direto a WhatsApp, E-mail e GitHub<br>
  <span class="text-yellow-400 font-bold">whoami</span>      - Perfil direto de Matheus Carvalho Farias<br>
  <span class="text-yellow-400 font-bold">matrix</span>      - Alterna o modo visual de chuva Matrix no fundo<br>
  <span class="text-yellow-400 font-bold">hire</span>        - Informações de disponibilidade para projetos e contratos<br>
  <span class="text-yellow-400 font-bold">clear</span>       - Limpa o histórico da tela
</div>`,

    projects: () => `
<div class="space-y-2 text-gray-300">
  <span class="text-cyan-400 font-bold">PROJETOS EM DESTAQUE NO GITHUB:</span><br>
  1. <strong class="text-white">UPAVET</strong> (github.com/matheuscarvalhofarias/upavet)
     - Landing page de alta conversão, slider interativo antes/depois, modal dinâmico WhatsApp.<br>
  2. <strong class="text-white">Arca Forte</strong> (github.com/matheuscarvalhofarias/arca-forte)
     - Ecossistema web institucional com arquitetura leve e design refinado.<br>
  3. <strong class="text-white">Persona 3 Web</strong> (github.com/matheuscarvalhofarias/persona3-website)
     - Interface estilizada neo-noir, áudio interativo e design de alta fidelidade.<br>
  4. <strong class="text-white">Levitate</strong> (github.com/matheuscarvalhofarias/levitate)
     - Mecanismo leve de física cinética para interações fluidas a 60 FPS.<br>
  5. <strong class="text-white">Obsidian Suite</strong> (github.com/matheuscarvalhofarias/Obsidian)
     - Scripts para automação de grafos de conhecimento e fluxos de documentação técnica.
</div>`,

    skills: () => `
<div class="space-y-1 text-gray-300">
  <span class="text-cyan-400 font-bold">MATRIZ TÉCNICA // CAPACIDADES REAIS:</span><br>
  • <span class="text-emerald-400 font-semibold">Frontend:</span> TypeScript, JavaScript Moderno (ES6+), Tailwind CSS, Canvas API, Web Audio API, Micro-Interactions.<br>
  • <span class="text-emerald-400 font-semibold">Backend &amp; Sistemas:</span> Node.js, Express, REST APIs, Python, Automação de Tarefas, Webhooks.<br>
  • <span class="text-emerald-400 font-semibold">Performance:</span> Carregamento sub-segundo, Zero dependências desnecessárias, Lighthouse 100/100.<br>
  • <span class="text-emerald-400 font-semibold">Tooling:</span> Git, GitHub Actions, Linux/UNIX, CI/CD, Vite, Docker.
</div>`,

    manifesto: () => `
<div class="space-y-1 text-gray-300">
  <span class="text-cyan-400 font-bold">MANIFESTO DE ENGENHARIA (4 REGRAS):</span><br>
  1. <span class="text-white">Velocidade com Robustez:</span> Código limpo não é vaidade, é velocidade de entrega.<br>
  2. <span class="text-white">Design Funcional:</span> Se precisa de tutorial para usar, a interface falhou.<br>
  3. <span class="text-white">Performance Brutal:</span> Cada 100ms conta. Tolerância zero a bloatware.<br>
  4. <span class="text-white">Foco no Negócio:</span> Menos reuniões vazias, mais código funcional em produção.
</div>`,

    whoami: () => `
<div class="text-gray-300 space-y-1">
  <span class="text-cyan-400 font-bold">IDENTIDADE DO SISTEMA:</span><br>
  Nome: <span class="text-white font-bold">Matheus Carvalho Farias</span><br>
  Papel: Software Engineer &amp; Creative Developer<br>
  Origem: Brasília, DF - Brasil<br>
  Abordagem: Pragmatismo absoluto, execução veloz e estética de ponta.
</div>`,

    hire: () => `
<div class="text-gray-300 space-y-1">
  <span class="text-emerald-400 font-bold">STATUS DE CONTRATAÇÃO: DISPONÍVEL</span><br>
  Projetos aceitos: Landing Pages de Alta Conversão, Aplicações Web Full-Stack, Automações e Otimização de Performance.<br>
  Iniciar conversa direta agora: <a href="https://wa.me/5561999233249" target="_blank" class="text-cyan-400 underline">WhatsApp (61) 99923-3249</a>
</div>`,

    contact: () => `
<div class="space-y-1 text-gray-300">
  <span class="text-cyan-400 font-bold">CANAIS DE CONTATO OFICIAIS:</span><br>
  • WhatsApp: <span class="text-emerald-400 font-bold">(61) 99923-3249</span><br>
  • E-mail: <span class="text-cyan-300">matheusfarias.98@hotmail.com</span><br>
  • GitHub: <a href="https://github.com/matheuscarvalhofarias" target="_blank" class="text-indigo-400 underline">github.com/matheuscarvalhofarias</a>
</div>`,

    matrix: () => {
      matrixMode = !matrixMode;
      return matrixMode
        ? '<span class="text-emerald-400 font-bold">✓ Modo Matrix ATIVADO no canvas de fundo.</span>'
        : '<span class="text-cyan-400 font-bold">✓ Modo Matrix DESATIVADO. Retornando ao Neural Mesh.</span>';
    },

    benchmark: () => {
      runBenchmark();
      return '<span class="text-yellow-400">⚡ Executando benchmark de CPU e renderização no cliente...</span>';
    },

    clear: () => {
      terminalScreen.innerHTML = '';
      return '';
    },

    sudo: () => `<span class="text-red-400">Permissão negada: o usuário 'guest' não está no arquivo sudoers. Este incidente foi registrado.</span>`,
    coffee: () => `<pre class="text-amber-400 font-mono text-[10px]">
    (  )   (   )  )
     ) (   )  (  (
     ( )  (    ) )
     _____________
    <_____________> ===[ COFFEE: 100% FUEL ]
     |           |/  
     |   JAVA    |
     |___________|
    </pre>`
  };

  function appendTerminalOutput(cmd, output) {
    const cmdLine = document.createElement('div');
    cmdLine.innerHTML = `<span class="text-emerald-400 font-bold">matheus@kernel:~$</span> <span class="text-white">${escapeHtml(cmd)}</span>`;
    terminalScreen.appendChild(cmdLine);

    if (output) {
      const outLine = document.createElement('div');
      outLine.innerHTML = output;
      terminalScreen.appendChild(outLine);
    }

    terminalScreen.scrollTop = terminalScreen.scrollHeight;
    playChimeSound();
  }

  function handleCommand(rawCmd) {
    const cmd = rawCmd.trim().toLowerCase();
    if (!cmd) return;

    cmdHistory.push(cmd);
    historyIndex = cmdHistory.length;

    if (terminalCommands[cmd]) {
      const res = terminalCommands[cmd]();
      if (cmd !== 'clear') {
        appendTerminalOutput(cmd, res);
      }
    } else {
      appendTerminalOutput(
        cmd,
        `<span class="text-red-400">Comando não reconhecido: '${escapeHtml(cmd)}'. Digite <strong class="text-yellow-400">help</strong> para ver a lista de comandos.</span>`
      );
    }
  }

  function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, (tag) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
  }

  if (terminalForm) {
    terminalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = termInput.value;
      termInput.value = '';
      handleCommand(val);
    });
  }

  // Key navigation for terminal command history
  if (termInput) {
    termInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') {
        if (cmdHistory.length > 0 && historyIndex > 0) {
          historyIndex--;
          termInput.value = cmdHistory[historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        if (historyIndex < cmdHistory.length - 1) {
          historyIndex++;
          termInput.value = cmdHistory[historyIndex];
        } else {
          historyIndex = cmdHistory.length;
          termInput.value = '';
        }
      }
    });
  }

  // Quick Command Pills Click Handler
  cmdPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const cmd = pill.getAttribute('data-cmd');
      if (cmd) {
        handleCommand(cmd);
      }
    });
  });

  // Window Topbar Dummy Controls
  const termCloseBtn = document.getElementById('term-close-btn');
  if (termCloseBtn) {
    termCloseBtn.addEventListener('click', () => {
      terminalScreen.innerHTML = '<p class="text-gray-500 italic">Console minimizado. Digite comandos ou use as pílulas para reiniciar.</p>';
    });
  }

  // =========================================================================
  // 5. LIVE BROWSER BENCHMARK TOY
  // =========================================================================
  const runBenchBtn = document.getElementById('run-benchmark-btn');
  const benchResult = document.getElementById('benchmark-result');

  function runBenchmark() {
    if (!benchResult) return;
    benchResult.classList.remove('hidden');
    benchResult.innerHTML = '<span class="text-yellow-400 animate-pulse">Calculando 5.000.000 operações...</span>';

    setTimeout(() => {
      const start = performance.now();
      let x = 0;
      for (let i = 0; i < 5000000; i++) {
        x += Math.sqrt(i) * 0.5;
      }
      const duration = (performance.now() - start).toFixed(2);

      let classification = '⚡ ULTRA-RÁPIDO';
      let colorClass = 'text-emerald-400';
      if (duration > 30) {
        classification = 'MÉDIO';
        colorClass = 'text-yellow-400';
      }

      benchResult.innerHTML = `Tempo: <strong class="text-white">${duration}ms</strong> | Score: <strong class="${colorClass}">${classification}</strong>`;
      playChimeSound();
    }, 50);
  }

  if (runBenchBtn) {
    runBenchBtn.addEventListener('click', runBenchmark);
  }

  // =========================================================================
  // 6. 1-CLICK COPY EMAIL WITH VISUAL FEEDBACK
  // =========================================================================
  const copyEmailCard = document.getElementById('copy-email-card');
  const copyFeedbackLabel = document.getElementById('copy-feedback-label');
  const emailText = 'matheusfarias.98@hotmail.com';

  if (copyEmailCard) {
    copyEmailCard.addEventListener('click', () => {
      navigator.clipboard.writeText(emailText).then(() => {
        if (copyFeedbackLabel) {
          const original = copyFeedbackLabel.innerHTML;
          copyFeedbackLabel.innerHTML = '<span class="text-emerald-400">Copiado! ✓</span>';
          playChimeSound();
          setTimeout(() => {
            copyFeedbackLabel.innerHTML = original;
          }, 2500);
        }
      });
    });
  }

  // =========================================================================
  // 7. COMMAND PALETTE (CMD+K / CTRL+K)
  // =========================================================================
  const paletteBackdrop = document.getElementById('cmd-palette-backdrop');
  const palette = document.getElementById('cmd-palette');
  const cmdInput = document.getElementById('cmd-input');
  const cmdResults = document.getElementById('cmd-results');
  const openPaletteBtn = document.getElementById('open-palette-btn');

  const paletteItems = [
    { label: '01. Ir para Sobre / Início', action: () => (window.location.hash = '#sobre') },
    { label: '02. Ver Projetos no GitHub', action: () => (window.location.hash = '#projetos') },
    { label: '03. Ler Manifesto de Engenharia', action: () => (window.location.hash = '#manifesto') },
    { label: '04. Abrir Console Terminal (MF-CLI)', action: () => (window.location.hash = '#terminal') },
    { label: '05. Falar no WhatsApp Direto', action: () => window.open('https://wa.me/5561999233249', '_blank') },
    { label: '06. Copiar E-mail Profissional', action: () => copyEmailCard.click() },
    { label: '07. Abrir Perfil GitHub', action: () => window.open('https://github.com/matheuscarvalhofarias', '_blank') },
    { label: '08. Alternar Som / Audio SFX', action: () => audioBtn.click() },
    { label: '09. Alternar Modo Matrix no Fundo', action: () => handleCommand('matrix') },
    { label: '10. Executar Teste de Performance', action: () => runBenchmark() }
  ];

  function openPalette() {
    paletteBackdrop.classList.remove('hidden');
    setTimeout(() => {
      paletteBackdrop.classList.remove('opacity-0');
      palette.classList.remove('scale-95');
      palette.classList.add('scale-100');
      cmdInput.focus();
    }, 10);
    renderPaletteItems(paletteItems);
  }

  function closePalette() {
    paletteBackdrop.classList.add('opacity-0');
    palette.classList.remove('scale-100');
    palette.classList.add('scale-95');
    setTimeout(() => {
      paletteBackdrop.classList.add('hidden');
    }, 200);
  }

  function renderPaletteItems(items) {
    cmdResults.innerHTML = '';
    if (items.length === 0) {
      cmdResults.innerHTML = '<div class="p-3 text-gray-500 italic">Nenhum comando encontrado.</div>';
      return;
    }

    items.forEach((item, idx) => {
      const el = document.createElement('div');
      el.className = `cmd-item p-2.5 rounded-lg cursor-pointer flex items-center justify-between text-gray-300 hover:bg-[#1a2136] hover:text-cyan-400 ${
        idx === 0 ? 'bg-[#151b2c] text-cyan-400' : ''
      }`;
      el.innerHTML = `<span>${item.label}</span> <span class="text-[10px] text-gray-500">EXEC</span>`;
      el.addEventListener('click', () => {
        closePalette();
        item.action();
      });
      cmdResults.appendChild(el);
    });
  }

  if (openPaletteBtn) {
    openPaletteBtn.addEventListener('click', openPalette);
  }

  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      if (paletteBackdrop.classList.contains('hidden')) {
        openPalette();
      } else {
        closePalette();
      }
    } else if (e.key === 'Escape' && !paletteBackdrop.classList.contains('hidden')) {
      closePalette();
    }
  });

  if (paletteBackdrop) {
    paletteBackdrop.addEventListener('click', (e) => {
      if (e.target === paletteBackdrop) {
        closePalette();
      }
    });
  }

  if (cmdInput) {
    cmdInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const filtered = paletteItems.filter((i) => i.label.toLowerCase().includes(q));
      renderPaletteItems(filtered);
    });
  }

  // =========================================================================
  // 8. BILINGUAL TRANSLATION ENGINE (PT-BR / EN)
  // =========================================================================
  let currentLang = 'PT';
  const langToggleBtn = document.getElementById('lang-toggle-btn');
  const langIndicator = document.getElementById('lang-indicator');

  const translations = {
    PT: {
      'nav.about': 'Sobre',
      'nav.projects': 'Projetos',
      'nav.manifesto': 'Manifesto',
      'nav.terminal': 'Terminal',
      'nav.contact': 'Contato',
      'nav.cmd': 'Comandos',
      'hero.status': 'ENGENHARIA EM TEMPO REAL • BRASÍLIA, DF',
      'hero.desc':
        'Engenharia de software implacável, design interativo de alta precisão e arquiteturas prontas para escala. Sem jargões corporativos vazios, sem código descartável. Apenas execução direta que move a agulha do seu produto.',
      'hero.cta_wa': 'Falar no WhatsApp Direto',
      'hero.cta_term': 'Abrir Terminal Interativo',
      'hero.cta_proj': 'Ver Projetos',
      'tele.status': 'Status Operacional',
      'tele.location': 'Localização',
      'tele.stack': 'Stack Principal',
      'tele.fps': 'Client FPS',
      'tele.latency': 'Tempo Resposta',
      'tele.quote': 'DIRETIVA DE ENGENHARIA:',
      'kpi.1': 'Foco em Entrega & Produção',
      'kpi.2': 'Paciência com Interfaces Lentas',
      'kpi.3': 'Arquitetura de Ponta a Ponta',
      'kpi.4': 'Tempo de Carregamento Web',
      'proj.title': 'PROJETOS & ENTREGAS',
      'proj.subtitle': 'Sistemas desenhados para resolver problemas reais de conversão, experiência de usuário e integridade de dados.',
      'man.title': 'O MANIFESTO DE ENGENHARIA',
      'man.subtitle':
        'Não sou fã de modismos ou frameworks com ciclo de vida de seis meses. Meu foco é entregar valor real, código manutenível e produtos que geram receita.',
      'bench.title': 'TESTE DE PERFORMANCE DO SEU BROWSER',
      'bench.desc': 'Execute um benchmark em tempo real direto na thread do seu navegador para medir capacidade de computação e latência de rendering.',
      'bench.btn': 'Rodar Benchmark ⚡',
      'term.title': 'O TERMINAL MF-CLI',
      'term.subtitle': 'Prefere navegar via linha de comando? Digite comandos ou clique nos atalhos abaixo.',
      'contact.title': 'VAMOS CONSTRUIR ALGO GRANDE',
      'contact.subtitle': 'Tem um projeto em mente, precisa de engenharia de ponta ou quer acelerar seu produto? Fale diretamente comigo.'
    },
    EN: {
      'nav.about': 'About',
      'nav.projects': 'Projects',
      'nav.manifesto': 'Manifesto',
      'nav.terminal': 'Terminal',
      'nav.contact': 'Contact',
      'nav.cmd': 'Commands',
      'hero.status': 'REAL-TIME ENGINEERING • BRASÍLIA, BRAZIL',
      'hero.desc':
        'Relentless software engineering, high-precision interactive design, and scale-ready architecture. Zero corporate fluff, zero throwaway code. Pure direct execution that moves the needle on your product.',
      'hero.cta_wa': 'Chat on WhatsApp Direct',
      'hero.cta_term': 'Open Interactive Terminal',
      'hero.cta_proj': 'View Projects',
      'tele.status': 'Operational Status',
      'tele.location': 'Location',
      'tele.stack': 'Primary Stack',
      'tele.fps': 'Client FPS',
      'tele.latency': 'Response Time',
      'tele.quote': 'ENGINEERING DIRECTIVE:',
      'kpi.1': 'Production & Delivery Focus',
      'kpi.2': 'Patience for Slow Interfaces',
      'kpi.3': 'End-to-End Architecture',
      'kpi.4': 'Web Initial Load Time',
      'proj.title': 'PROJECTS & DELIVERIES',
      'proj.subtitle': 'Systems architected to solve real conversion hurdles, user friction, and data integrity challenges.',
      'man.title': 'ENGINEERING MANIFESTO',
      'man.subtitle':
        'I do not chase six-month hype cycles. My focus is engineering real value, maintainable codebases, and products that drive revenue.',
      'bench.title': 'IN-BROWSER PERFORMANCE TEST',
      'bench.desc': 'Run a real-time computation benchmark directly in your browser thread to evaluate CPU throughput and rendering overhead.',
      'bench.btn': 'Run Benchmark ⚡',
      'term.title': 'THE MF-CLI TERMINAL',
      'term.subtitle': 'Prefer keyboard-driven navigation? Run commands or click quick suggestions below.',
      'contact.title': "LET'S BUILD SOMETHING RELENTLESS",
      'contact.subtitle': 'Have an ambitious project, need top-tier engineering, or want to accelerate your product? Reach out directly.'
    }
  };

  function updateLanguage(lang) {
    currentLang = lang;
    if (langIndicator) langIndicator.textContent = lang;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang] && translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });
    playChimeSound();
  }

  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      updateLanguage(currentLang === 'PT' ? 'EN' : 'PT');
    });
  }

  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  console.log('%c MF-KERNEL INITIALIZED %c v2.6.4 — Software Engineer & Builder', 'background: #38bdf8; color: #000; font-weight: bold;', 'background: #1e2436; color: #fff;');
})();

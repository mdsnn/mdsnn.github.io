/**
 * Windows 11 (Mwiko Edition) - Complete OS Logic
 * - Audio Synthesizer (Web Audio API for Portal warp & Windows clicks)
 * - Blog Reader (Blog.exe)
 * - In-OS Case Study Reader (Reader.exe)
 * - Interdimensional Portal Gun
 * - Windows 11 Context Menu
 * - Windows PowerShell & Contact Form
 */

document.addEventListener('DOMContentLoaded', () => {
  let highestZ = 100;
  let activeWindow = null;
  const windows = {};
  let startMenuOpen = false;
  let soundEnabled = localStorage.getItem('mwiko_sound_enabled') === 'true';

  // =========================================
  // 1. SYNTHESIZED WEB AUDIO ENGINE
  // =========================================
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playClickSound() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (e) {}
  }

  function playPortalSound() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(950, ctx.currentTime + 0.4);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.75);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.75);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.75);
    } catch (e) {}
  }

  // Sound tray button setup
  const soundBtn = document.getElementById('tray-sound-btn');
  function updateSoundIcon() {
    if (!soundBtn) return;
    if (soundEnabled) {
      soundBtn.title = 'Sound: ON (Click to mute)';
      soundBtn.style.color = '#38bdf8';
    } else {
      soundBtn.title = 'Sound: MUTED (Click to enable)';
      soundBtn.style.color = 'var(--text-muted)';
    }
  }
  if (soundBtn) {
    updateSoundIcon();
    soundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      localStorage.setItem('mwiko_sound_enabled', soundEnabled);
      updateSoundIcon();
      if (soundEnabled) playClickSound();
      showToast('Audio Settings', soundEnabled ? 'Windows & Portal sound effects enabled.' : 'Sound muted.');
    });
  }

  // =========================================
  // 2. DIMENSIONS & PORTAL GUN
  // =========================================
  const dimensions = [
    {
      id: 'c137',
      name: 'Dimension C-137 (Cosmic Portal)',
      url: 'images/rick_and_morty_wallpaper.jpg',
      tag: 'C-137'
    },
    {
      id: 'citadel',
      name: 'The Citadel of Ricks (Space Metropolis)',
      url: 'images/citadel_wallpaper.jpg',
      tag: 'CITADEL-001'
    },
    {
      id: 'win11',
      name: 'Classic Windows 11 Dark Bloom',
      url: 'images/desktop wallpaper.jpg',
      tag: 'WIN-11'
    }
  ];

  let currentDimIndex = 0;

  window.firePortalGun = function(targetIndex = null) {
    if (targetIndex !== null) {
      currentDimIndex = targetIndex % dimensions.length;
    } else {
      currentDimIndex = (currentDimIndex + 1) % dimensions.length;
    }

    const nextDim = dimensions[currentDimIndex];
    const overlay = document.getElementById('portal-overlay');

    playPortalSound();

    if (overlay) {
      overlay.innerHTML = '<div class="portal-ring"></div>';
      overlay.classList.add('active');
      setTimeout(() => {
        overlay.classList.remove('active');
        overlay.innerHTML = '';
      }, 750);
    }

    document.body.style.backgroundImage = `url('${nextDim.url}'), radial-gradient(circle at 50% 40%, #10b981 0%, #030712 70%)`;

    const dimTag = document.getElementById('widget-dim-tag');
    if (dimTag) dimTag.textContent = nextDim.tag;

    showToast('Portal Gun Discharged', `Transported to ${nextDim.name}`);
  };

  // Toast Notification
  function showToast(title, message) {
    const toast = document.getElementById('win-toast');
    if (!toast) return;

    toast.querySelector('.toast-title').textContent = title;
    toast.querySelector('.toast-body').textContent = message;
    toast.classList.add('show');

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }

  // =========================================
  // 3. WINDOWS 11 CONTEXT MENU
  // =========================================
  const contextMenu = document.getElementById('win-context-menu');
  const desktop = document.querySelector('.desktop');

  if (contextMenu && desktop) {
    desktop.addEventListener('contextmenu', (e) => {
      if (e.target.closest('.os-window')) return;
      e.preventDefault();

      let x = e.clientX;
      let y = e.clientY;
      const menuWidth = 230;
      const menuHeight = 240;
      if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 10;
      if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 50;

      contextMenu.style.left = `${x}px`;
      contextMenu.style.top = `${y}px`;
      contextMenu.style.display = 'block';
      playClickSound();
    });

    document.addEventListener('click', () => {
      contextMenu.style.display = 'none';
    });
  }

  // =========================================
  // 4. WINDOWS TRAY & START MENU
  // =========================================
  function updateTrayClock() {
    const timeEl = document.getElementById('tray-time');
    const dateEl = document.getElementById('tray-date');
    if (!timeEl || !dateEl) return;

    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    dateEl.textContent = now.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: 'numeric' });
  }
  updateTrayClock();
  setInterval(updateTrayClock, 1000);

  const startBtn = document.getElementById('win-start-btn');
  const startMenu = document.getElementById('win-start-menu');

  if (startBtn && startMenu) {
    startBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      startMenuOpen = !startMenuOpen;
      startMenu.classList.toggle('open', startMenuOpen);
      playClickSound();
    });

    document.addEventListener('click', (e) => {
      if (!startMenu.contains(e.target) && !startBtn.contains(e.target)) {
        startMenu.classList.remove('open');
        startMenuOpen = false;
      }
    });
  }

  // =========================================
  // 5. WINDOW MANAGEMENT
  // =========================================
  document.querySelectorAll('.os-window').forEach((win) => {
    const id = win.id;
    windows[id] = win;

    win.addEventListener('mousedown', () => bringToFront(win));

    const minBtn = win.querySelector('.win-minimize');
    const maxBtn = win.querySelector('.win-maximize');
    const closeBtn = win.querySelector('.win-close');

    if (minBtn) minBtn.addEventListener('click', () => minimizeWindow(id));
    if (maxBtn) maxBtn.addEventListener('click', () => toggleMaximize(id));
    if (closeBtn) closeBtn.addEventListener('click', () => closeWindow(id));

    makeDraggable(win);
  });

  function bringToFront(win) {
    highestZ += 1;
    win.style.zIndex = highestZ;
    activeWindow = win;
    updateTaskbarButtons();
  }

  function openWindow(id) {
    const win = windows[id];
    if (!win) return;

    if (startMenu) {
      startMenu.classList.remove('open');
      startMenuOpen = false;
    }

    win.classList.remove('hidden');
    win.classList.remove('minimized');
    bringToFront(win);
    updateTaskbarButtons();
    playClickSound();
  }
  // Expose window management globally so inline onclick handlers in dynamic HTML work
  window.openWindow = openWindow;
  window.closeWindow = closeWindow;
  window.minimizeWindow = minimizeWindow;

  function closeWindow(id) {
    const win = windows[id];
    if (!win) return;
    win.classList.add('hidden');
    win.classList.remove('maximized');
    updateTaskbarButtons();
    playClickSound();
  }

  function minimizeWindow(id) {
    const win = windows[id];
    if (!win) return;
    win.classList.add('minimized');
    updateTaskbarButtons();
    playClickSound();
  }

  function toggleMaximize(id) {
    const win = windows[id];
    if (!win) return;
    win.classList.toggle('maximized');
    playClickSound();
  }

  // Peek Desktop
  const peekBtn = document.getElementById('peek-desktop-btn');
  let desktopHidden = false;
  if (peekBtn) {
    peekBtn.addEventListener('click', () => {
      desktopHidden = !desktopHidden;
      Object.values(windows).forEach(win => {
        if (desktopHidden) {
          win.classList.add('minimized');
        } else {
          win.classList.remove('minimized');
        }
      });
      updateTaskbarButtons();
      playClickSound();
    });
  }

  function updateTaskbarButtons() {
    document.querySelectorAll('.taskbar-btn[data-app]').forEach(btn => {
      const appId = btn.getAttribute('data-app');
      const win = windows[appId];

      if (win && !win.classList.contains('hidden')) {
        btn.classList.add('running');
        if (win === activeWindow && !win.classList.contains('minimized')) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      } else {
        btn.classList.remove('running');
        btn.classList.remove('active');
      }
    });
  }

  function makeDraggable(win) {
    const header = win.querySelector('.window-header');
    if (!header) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    const onPointerDown = (e) => {
      if (e.target.closest('.win-btn')) return;
      if (win.classList.contains('maximized')) return;

      isDragging = true;
      bringToFront(win);

      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);

      startX = clientX;
      startY = clientY;

      const rect = win.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      document.addEventListener('mousemove', onPointerMove);
      document.addEventListener('mouseup', onPointerUp);
      document.addEventListener('touchmove', onPointerMove, { passive: false });
      document.addEventListener('touchend', onPointerUp);
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      if (e.cancelable) e.preventDefault();

      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);

      const dx = clientX - startX;
      const dy = clientY - startY;

      let newLeft = initialLeft + dx;
      let newTop = initialTop + dy;

      const minTop = 0;
      const maxTop = window.innerHeight - 50;
      const minLeft = -win.offsetWidth + 100;
      const maxLeft = window.innerWidth - 100;

      newTop = Math.max(minTop, Math.min(newTop, maxTop));
      newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));

      win.style.left = `${newLeft}px`;
      win.style.top = `${newTop}px`;
    };

    const onPointerUp = () => {
      isDragging = false;
      document.removeEventListener('mousemove', onPointerMove);
      document.removeEventListener('mouseup', onPointerUp);
      document.removeEventListener('touchmove', onPointerMove);
      document.removeEventListener('touchend', onPointerUp);
    };

    header.addEventListener('mousedown', onPointerDown);
    header.addEventListener('touchstart', onPointerDown, { passive: false });
  }

  // App Launcher Triggers
  document.querySelectorAll('[data-open-window]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = trigger.getAttribute('data-open-window');
      const win = windows[targetId];

      if (trigger.classList.contains('taskbar-btn') && win && !win.classList.contains('hidden') && win === activeWindow && !win.classList.contains('minimized')) {
        minimizeWindow(targetId);
      } else {
        openWindow(targetId);
      }
    });
  });

  // Initial Window Positions
  function initWindowPositions() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (width > 768) {
      const aboutWin = windows['win-about'];
      if (aboutWin) {
        aboutWin.style.left = `${Math.max(40, Math.floor(width * 0.08))}px`;
        aboutWin.style.top = '60px';
        aboutWin.style.width = '520px';
        aboutWin.style.height = '490px';
      }

      const projectsWin = windows['win-projects'];
      if (projectsWin) {
        projectsWin.style.left = `${Math.max(60, Math.floor(width * 0.35))}px`;
        projectsWin.style.top = '70px';
        projectsWin.style.width = '640px';
        projectsWin.style.height = '520px';
      }

      const blogWin = windows['win-blog'];
      if (blogWin) {
        blogWin.style.left = `${Math.max(50, Math.floor(width * 0.2))}px`;
        blogWin.style.top = '80px';
        blogWin.style.width = `${Math.min(840, width - 100)}px`;
        blogWin.style.height = '540px';
      }

      const readerWin = windows['win-reader'];
      if (readerWin) {
        readerWin.style.left = `${Math.max(50, Math.floor(width * 0.22))}px`;
        readerWin.style.top = '70px';
        readerWin.style.width = `${Math.min(760, width - 100)}px`;
        readerWin.style.height = '520px';
      }

      const terminalWin = windows['win-terminal'];
      if (terminalWin) {
        terminalWin.style.left = `${Math.max(60, Math.floor(width * 0.24))}px`;
        terminalWin.style.top = '140px';
        terminalWin.style.width = '620px';
        terminalWin.style.height = '380px';
      }
    }
  }

  initWindowPositions();
  openWindow('win-about');

  // =========================================
  // 6. BLOG ENGINE (BLOG.EXE)
  // =========================================
  const blogListContainer = document.getElementById('blog-list');
  const blogReaderPane = document.getElementById('blog-reader');

  if (blogListContainer && blogReaderPane && window.BLOG_POSTS) {
    function renderBlogList() {
      blogListContainer.innerHTML = '';
      window.BLOG_POSTS.forEach((post, index) => {
        const item = document.createElement('div');
        item.className = `blog-item-card ${index === 0 ? 'active' : ''}`;
        item.innerHTML = `
          <div class="blog-item-date">${post.date} &bull; ${post.readTime}</div>
          <div class="blog-item-title">${post.title}</div>
          <div class="blog-item-tags">
            ${post.tags.map(t => `<span class="blog-item-tag">${t}</span>`).join('')}
          </div>
        `;
        item.addEventListener('click', () => {
          document.querySelectorAll('.blog-item-card').forEach(c => c.classList.remove('active'));
          item.classList.add('active');
          renderBlogPost(post);
          playClickSound();
        });
        blogListContainer.appendChild(item);
      });
      renderBlogPost(window.BLOG_POSTS[0]);
    }

    function renderBlogPost(post) {
      const shareUrl = `${window.location.origin}${window.location.pathname}?blog=${post.id}`;
      blogReaderPane.innerHTML = `
        <div class="blog-post-header">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div class="blog-post-meta" style="margin: 0;">
              <span>Published on ${post.date}</span> &bull; <span>${post.readTime}</span> &bull; <span>By Mwiko Sinyangwe</span>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn-secondary" style="padding: 5px 10px; font-size: 11px;" onclick="window.copyBlogLink('${post.id}')" title="Copy shareable link to this article">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                <span>Share Link</span>
              </button>
              <button class="btn-secondary" style="padding: 5px 10px; font-size: 11px;" onclick="window.switchAcrobatDoc('tall'); openWindow('win-resume');" title="Open in Adobe Acrobat Reader">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#ED1C24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
                <span>View in Acrobat</span>
              </button>
            </div>
          </div>
          <h1 class="blog-post-title">${post.title}</h1>
        </div>
        <div class="blog-post-body">
          ${post.content}
        </div>
      `;
    }

    window.copyBlogLink = function(blogId) {
      const shareUrl = `${window.location.origin}${window.location.pathname}?blog=${blogId}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl).then(() => {
          showToast('Share Link Copied', `Link copied: ${shareUrl}`);
        });
      } else {
        prompt('Copy this shareable link:', shareUrl);
      }
      playClickSound();
    };

    renderBlogList();

    // Check if user arrived via a shared blog link (e.g. ?blog=tall-stack-2026)
    function checkUrlBlogRouting() {
      const params = new URLSearchParams(window.location.search);
      const blogId = params.get('blog') || (window.location.hash.startsWith('#blog/') ? window.location.hash.replace('#blog/', '') : null);
      if (blogId && window.BLOG_POSTS) {
        const post = window.BLOG_POSTS.find(p => p.id === blogId);
        if (post) {
          openWindow('win-blog');
          renderBlogPost(post);
          document.querySelectorAll('.blog-item-card').forEach((card, idx) => {
            card.classList.toggle('active', window.BLOG_POSTS[idx].id === blogId);
          });
          document.title = `${post.title} | Mwiko Sinyangwe`;
          showToast('Article Loaded', `Opened "${post.title}"`);
        }
      }
    }
    checkUrlBlogRouting();
  }

  // =========================================
  // 7. IN-OS CASE STUDY READER (READER.EXE)
  // =========================================
  const caseStudies = {
    laragigs: {
      title: 'Laragigs — Laravel Developer Employment Portal',
      badge: 'PRODUCTION CASE STUDY',
      intro: 'Laragigs was architected to address the challenge of matching high-caliber Laravel developers with remote tech teams through a clean, tag-indexed job marketplace.',
      arch: [
        { name: 'Database', desc: 'MySQL / Indexed Tags' },
        { name: 'Backend API', desc: 'Laravel 10 / Eloquent ORM' },
        { name: 'Frontend UI', desc: 'Tailwind CSS / Blade' }
      ],
      metrics: [
        { val: '100%', lbl: 'Responsive Coverage' },
        { val: '<120ms', lbl: 'Average Query Latency' },
        { val: 'Zero', lbl: 'N+1 Query Leaks' }
      ],
      details: 'Implemented authentication with encrypted session security, image uploading with storage optimization, and automated tag search indexes allowing instant job discovery.',
      demoUrl: 'postJob.html'
    },
    store: {
      title: 'Online Store — E-Commerce & Checkout Engine',
      badge: 'FINANCIAL INTEGRATION',
      intro: 'A full-featured digital shopping experience featuring guest carts, persistent session storage, and automated PayPal SDK payment verification hooks.',
      arch: [
        { name: 'Cart Engine', desc: 'Session & LocalStorage Sync' },
        { name: 'Payment Gateway', desc: 'PayPal REST APIs' },
        { name: 'Admin Hub', desc: 'Order & Inventory Tracking' }
      ],
      metrics: [
        { val: '99.9%', lbl: 'Payment Webhook Reliability' },
        { val: '1-Click', lbl: 'Guest Checkout Flow' },
        { val: 'Encrypted', lbl: 'Customer Data Handling' }
      ],
      details: 'Engineered an automated IPN (Instant Payment Notification) listener to securely mark orders as fulfilled and trigger confirmation receipts without manual intervention.',
      demoUrl: 'postEcom.html'
    }
  };

  window.openCaseStudy = function(studyId) {
    const study = caseStudies[studyId];
    if (!study) return;

    const readerWin = windows['win-reader'];
    const body = document.getElementById('case-study-body');
    if (!readerWin || !body) return;

    body.innerHTML = `
      <div class="reader-hero">
        <div>
          <span class="reader-title-badge">${study.badge}</span>
          <h2 class="reader-project-title">${study.title}</h2>
        </div>
        <a class="btn-primary" href="${study.demoUrl}" target="_blank">View Full Story</a>
      </div>

      <p style="font-size: 13.5px; line-height: 1.6; color: #cbd5e1; margin-bottom: 16px;">${study.intro}</p>

      <div class="reader-arch-diagram">
        <div class="arch-node">
          <div class="arch-node-name">${study.arch[0].name}</div>
          <div class="arch-node-desc">${study.arch[0].desc}</div>
        </div>
        <div class="arch-arrow">&rarr;</div>
        <div class="arch-node">
          <div class="arch-node-name">${study.arch[1].name}</div>
          <div class="arch-node-desc">${study.arch[1].desc}</div>
        </div>
        <div class="arch-arrow">&rarr;</div>
        <div class="arch-node">
          <div class="arch-node-name">${study.arch[2].name}</div>
          <div class="arch-node-desc">${study.arch[2].desc}</div>
        </div>
      </div>

      <div class="reader-metrics-grid">
        ${study.metrics.map(m => `
          <div class="reader-metric-box">
            <div class="reader-metric-val">${m.val}</div>
            <div class="reader-metric-lbl">${m.lbl}</div>
          </div>
        `).join('')}
      </div>

      <div class="bio-card" style="margin-top: 16px;">
        <h4 style="color: #fff; margin-bottom: 8px; font-size: 13px;">Engineering Deliverable</h4>
        <p style="font-size: 12.5px; margin: 0;">${study.details}</p>
      </div>
    `;

    openWindow('win-reader');
  };

  // =========================================
  // ADOBE ACROBAT READER DC SIMULATION
  // =========================================
  let currentDocKey = 'resume';
  let currentDocPage = 1;
  let acrobatZoom = 1.0;
  let highlighterActive = false;

  const acrobatDocs = {
    resume: {
      title: 'Resume_Mwiko_Sinyangwe.pdf',
      totalPages: 2,
      pages: {
        1: `
          <div class="pdf-doc-header">
            <div>
              <div class="pdf-doc-title">MWIKO SINYANGWE</div>
              <div class="pdf-doc-subtitle">Full-Stack Software Engineer &bull; TALL Stack Specialist</div>
            </div>
            <div class="pdf-doc-contact">
              Lusaka, Zambia (CAT / UTC+2)<br>
              mwikosinyangwe@gmail.com<br>
              github.com/mdsnn &bull; twitter.com/andmds__
            </div>
          </div>

          <div class="pdf-section-title">Professional Summary</div>
          <p style="font-size: 12px; color: #374151; line-height: 1.6; margin-bottom: 12px;">
            Full-stack software engineer with deep expertise in designing, shipping, and scaling web applications utilizing <strong>Laravel, Livewire, Tailwind CSS, Alpine.js</strong>, and <strong>React</strong>. Proven track record in multi-tenant architectures, payment gateway integrations, and fluid micro-interactions.
          </p>

          <div class="pdf-section-title">Core Competencies &amp; Technical Skills</div>
          <div class="pdf-skill-chips">
            <span class="pdf-chip">PHP (7.x / 8.x)</span>
            <span class="pdf-chip">Laravel 10 / 11</span>
            <span class="pdf-chip">Livewire</span>
            <span class="pdf-chip">Tailwind CSS</span>
            <span class="pdf-chip">Alpine.js</span>
            <span class="pdf-chip">React.js</span>
            <span class="pdf-chip">JavaScript (ES6+)</span>
            <span class="pdf-chip">Python / Django</span>
            <span class="pdf-chip">Ruby on Rails</span>
            <span class="pdf-chip">MySQL / PostgreSQL</span>
            <span class="pdf-chip">RESTful APIs</span>
            <span class="pdf-chip">Git / CI/CD</span>
            <span class="pdf-chip">Linux Environment</span>
          </div>

          <div class="pdf-section-title">Professional Experience &amp; Engineering Deliverables</div>
          
          <div class="pdf-exp-row">
            <div>
              <span class="pdf-exp-role">Full-Stack Software Engineer</span> &bull; <span class="pdf-exp-company">Contract / Freelance</span>
            </div>
            <span class="pdf-exp-date">2023 &ndash; Present</span>
          </div>
          <p class="pdf-exp-desc">
            &bull; Engineered production web platforms utilizing Laravel, Livewire, and Tailwind CSS with sub-150ms query response times.<br>
            &bull; Implemented multi-tenant database schemas with strict global scopes, preventing data crossover across corporate clients.<br>
            &bull; Integrated automated webhook processing for PayPal and mobile money checkout gateways with 99.9% uptime.
          </p>

          <div class="pdf-exp-row">
            <div>
              <span class="pdf-exp-role">Web Developer</span> &bull; <span class="pdf-exp-company">Independent Projects &amp; Open Source</span>
            </div>
            <span class="pdf-exp-date">2021 &ndash; 2023</span>
          </div>
          <p class="pdf-exp-desc">
            &bull; Built <em>Laragigs</em>, a high-traffic developer recruitment platform featuring custom auth, tag-based faceted search, and resume upload workflows.<br>
            &bull; Designed and developed real-time financial dashboards and lending calculators supporting diverse credit categories.
          </p>

          <div style="margin-top: 30px; text-align: right; font-size: 10px; color: #9ca3af; font-family: var(--font-mono);">
            Page 1 of 2 &bull; Adobe Acrobat Document Stream &bull; SHA-256 Verified
          </div>
        `,
        2: `
          <div class="pdf-doc-header">
            <div>
              <div class="pdf-doc-title">MWIKO SINYANGWE</div>
              <div class="pdf-doc-subtitle">Project Portfolio &amp; Technical Methodologies</div>
            </div>
            <div class="pdf-doc-contact">
              Page 2 of 2<br>
              mwikosinyangwe@gmail.com
            </div>
          </div>

          <div class="pdf-section-title">Highlighted Production Projects</div>

          <div class="pdf-exp-row">
            <div>
              <span class="pdf-exp-role">Laragigs &mdash; Developer Portal</span>
            </div>
            <span class="pdf-exp-date">Laravel / MySQL / Tailwind</span>
          </div>
          <p class="pdf-exp-desc">
            Full recruitment portal built with custom authentication policies, tag indexing, and automated candidate filtering.
          </p>

          <div class="pdf-exp-row">
            <div>
              <span class="pdf-exp-role">PotBELLY &mdash; Food Marketplace</span>
            </div>
            <span class="pdf-exp-date">JavaScript / CSS Grid / Alpine</span>
          </div>
          <p class="pdf-exp-desc">
            Interactive food marketplace with dynamic menu pricing calculations and checkout carts.
          </p>

          <div class="pdf-exp-row">
            <div>
              <span class="pdf-exp-role">Online Store &mdash; E-Commerce Platform</span>
            </div>
            <span class="pdf-exp-date">PHP / PayPal SDK / MySQL</span>
          </div>
          <p class="pdf-exp-desc">
            Full e-commerce platform with automated PayPal checkout flow, guest shopping carts, and order management admin.
          </p>

          <div class="pdf-section-title">Education &amp; Methodologies</div>
          <p class="pdf-exp-desc">
            &bull; <strong>Clean Architecture:</strong> Strong adherence to SOLID design principles, modular service layers, and repository patterns.<br>
            &bull; <strong>Testing:</strong> Unit &amp; integration testing via PHPUnit and Pest.<br>
            &bull; <strong>Pragmatic Execution:</strong> Focused on shipping real business value with high speed and zero bloat.
          </p>

          <div class="pdf-section-title">Multiverse Authorization Stamp</div>
          <div style="background: #fdf2f8; border: 1px dashed #ec4899; padding: 12px; border-radius: 6px; margin-top: 10px; font-size: 11px; color: #9d174d;">
            <strong>CERTIFIED C-137 CANDIDATE:</strong> Recommended by Rick Sanchez for high-impact software engineering roles across all dimensions.
          </div>

          <div style="margin-top: 80px; text-align: right; font-size: 10px; color: #9ca3af; font-family: var(--font-mono);">
            Page 2 of 2 &bull; End of Document
          </div>
        `
      }
    },
    tall: {
      title: 'TALL_Stack_Superpower_2026.pdf',
      totalPages: 2,
      pages: {
        1: `
          <div class="pdf-doc-header">
            <div>
              <div class="pdf-doc-title">THE TALL STACK IN 2026</div>
              <div class="pdf-doc-subtitle">Engineering Whitepaper by Mwiko Sinyangwe</div>
            </div>
            <div class="pdf-doc-contact">
              Technical Architecture Series<br>
              mwikosinyangwe@gmail.com
            </div>
          </div>

          <div class="pdf-section-title">Abstract</div>
          <p style="font-size: 12px; color: #374151; line-height: 1.6;">
            As frontend build tooling grows in complexity, solo engineers and small product teams require stacks that minimize glue code while maximizing shipping speed. The TALL stack (Tailwind CSS, Alpine.js, Laravel, Livewire) provides a unified fullstack model where the server remains the single source of truth without sacrificing interface reactivity.
          </p>

          <div class="pdf-section-title">Core Pillars of the Stack</div>
          <p class="pdf-exp-desc">
            <strong>1. Tailwind CSS:</strong> Rapid UI construction directly in template files, avoiding CSS bundle bloat.<br>
            <strong>2. Alpine.js:</strong> Micro-reactivity handled natively in the DOM without virtual DOM overhead.<br>
            <strong>3. Laravel 11:</strong> Robust backend primitives including queues, events, and Eloquent ORM.<br>
            <strong>4. Livewire 3:</strong> Component-driven DOM morphing that eliminates the need for separate REST API endpoints.
          </p>

          <div style="margin-top: 60px; text-align: right; font-size: 10px; color: #9ca3af; font-family: var(--font-mono);">
            Page 1 of 2 &bull; Adobe Acrobat Whitepaper
          </div>
        `,
        2: `
          <div class="pdf-doc-header">
            <div>
              <div class="pdf-doc-title">THE TALL STACK IN 2026</div>
              <div class="pdf-doc-subtitle">Section 2: Velocity &amp; Benchmarks</div>
            </div>
            <div class="pdf-doc-contact">
              Page 2 of 2
            </div>
          </div>

          <div class="pdf-section-title">Shipping Velocity Comparison</div>
          <p style="font-size: 12px; color: #374151; line-height: 1.6;">
            Teams utilizing the TALL stack report up to a <strong>60% reduction</strong> in code duplication between backend models and frontend view states. Because validation rules and database logic reside in a single ecosystem, security vulnerabilities and state synchronization bugs are dramatically minimized.
          </p>

          <div class="pdf-section-title">Conclusion</div>
          <p style="font-size: 12px; color: #374151; line-height: 1.6;">
            For ambitious products and modern SaaS platforms, the TALL stack remains one of the highest leverage technical choices available today.
          </p>

          <div style="margin-top: 120px; text-align: right; font-size: 10px; color: #9ca3af; font-family: var(--font-mono);">
            Page 2 of 2 &bull; End of Whitepaper
          </div>
        `
      }
    },
    multi: {
      title: 'MultiTenant_Architecture_Spec.pdf',
      totalPages: 1,
      pages: {
        1: `
          <div class="pdf-doc-header">
            <div>
              <div class="pdf-doc-title">MULTI-TENANT SAAS ARCHITECTURE</div>
              <div class="pdf-doc-subtitle">Database Scoping &amp; Security Protocols</div>
            </div>
            <div class="pdf-doc-contact">
              System Specification<br>
              Author: Mwiko Sinyangwe
            </div>
          </div>

          <div class="pdf-section-title">1. Architectural Objective</div>
          <p style="font-size: 12px; color: #374151; line-height: 1.6;">
            Establish zero-leakage tenant isolation across shared relational infrastructure, maintaining sub-100ms response times while simplifying automated tenant migrations.
          </p>

          <div class="pdf-section-title">2. Global Scope Enforcement</div>
          <p style="font-size: 12px; color: #374151; line-height: 1.6;">
            Every Eloquent database model inherits a tenant scope trait that automatically injects tenant constraints on all queries, updates, and deletes at compile-time.
          </p>

          <div style="margin-top: 180px; text-align: right; font-size: 10px; color: #9ca3af; font-family: var(--font-mono);">
            Page 1 of 1 &bull; Technical Specification Complete
          </div>
        `
      }
    }
  };

  window.renderAcrobatDocument = function() {
    const doc = acrobatDocs[currentDocKey];
    if (!doc) return;

    // Window Title
    const titleEl = document.getElementById('acrobat-window-title');
    if (titleEl) titleEl.textContent = `Adobe Acrobat Reader (64-bit) • ${doc.title}`;

    // Stepper
    const currentInput = document.getElementById('acrobat-current-page');
    const totalInput = document.getElementById('acrobat-total-pages');
    if (currentInput) currentInput.value = currentDocPage;
    if (totalInput) totalInput.textContent = doc.totalPages;

    // Sheet Content
    const sheet = document.getElementById('pdf-page-sheet');
    if (sheet) {
      sheet.innerHTML = doc.pages[currentDocPage] || doc.pages[1];
      sheet.style.transform = `scale(${acrobatZoom})`;
      sheet.classList.toggle('highlighter-mode', highlighterActive);
    }

    // Update thumbnail active states
    document.querySelectorAll('.thumb-preview-box').forEach((box, idx) => {
      box.classList.toggle('active', idx + 1 === currentDocPage);
    });
  };

  window.switchAcrobatDoc = function(docKey) {
    if (!acrobatDocs[docKey]) return;
    currentDocKey = docKey;
    currentDocPage = 1;

    document.querySelectorAll('.acrobat-tab').forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-doc') === docKey);
    });

    renderAcrobatDocument();
    playClickSound();
  };

  window.setAcrobatPage = function(pageNum) {
    const doc = acrobatDocs[currentDocKey];
    if (!doc) return;
    if (pageNum >= 1 && pageNum <= doc.totalPages) {
      currentDocPage = pageNum;
      renderAcrobatDocument();
      playClickSound();
    }
  };

  window.acrobatNextPage = function() {
    window.setAcrobatPage(currentDocPage + 1);
  };

  window.acrobatPrevPage = function() {
    window.setAcrobatPage(currentDocPage - 1);
  };

  window.acrobatZoomIn = function() {
    acrobatZoom = Math.min(1.5, acrobatZoom + 0.1);
    updateAcrobatZoomLabel();
  };

  window.acrobatZoomOut = function() {
    acrobatZoom = Math.max(0.6, acrobatZoom - 0.1);
    updateAcrobatZoomLabel();
  };

  window.acrobatResetZoom = function() {
    acrobatZoom = 1.0;
    updateAcrobatZoomLabel();
  };

  function updateAcrobatZoomLabel() {
    const label = document.getElementById('acrobat-zoom-label');
    if (label) label.textContent = `${Math.round(acrobatZoom * 100)}%`;
    const sheet = document.getElementById('pdf-page-sheet');
    if (sheet) sheet.style.transform = `scale(${acrobatZoom})`;
    playClickSound();
  }

  window.toggleAcrobatHighlighter = function() {
    highlighterActive = !highlighterActive;
    const btn = document.getElementById('acrobat-highlighter-btn');
    if (btn) btn.classList.toggle('active', highlighterActive);
    const sheet = document.getElementById('pdf-page-sheet');
    if (sheet) sheet.classList.toggle('highlighter-mode', highlighterActive);
    showToast('Acrobat Tool', highlighterActive ? 'Highlighter Mode Active: Select text to highlight in yellow.' : 'Highlighter Mode Off.');
    playClickSound();
  };

  window.toggleAcrobatThumbPane = function() {
    const pane = document.getElementById('acrobat-thumb-pane');
    const icon = document.getElementById('acrobat-thumb-toggle');
    if (pane) {
      const isVisible = pane.style.display !== 'none';
      pane.style.display = isVisible ? 'none' : 'flex';
      if (icon) icon.classList.toggle('active', !isVisible);
    }
    playClickSound();
  };

  // Render initial document
  renderAcrobatDocument();


  // Stack-to-Project Finder
  document.querySelectorAll('.skill-badge').forEach(badge => {
    badge.style.cursor = 'pointer';
    badge.title = 'Click to find projects using this tech!';
    badge.addEventListener('click', () => {
      const tech = badge.textContent.trim().toLowerCase();
      openWindow('win-projects');

      let matchCount = 0;
      document.querySelectorAll('.project-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(tech) || (tech.includes('laravel') && text.includes('laravel')) || (tech.includes('php') && text.includes('php'))) {
          card.classList.add('glow-pulse');
          card.style.display = 'flex';
          matchCount++;
        } else {
          card.classList.remove('glow-pulse');
        }
      });

      showToast(`Stack Filter: ${badge.textContent}`, `Found ${matchCount} matching project(s) highlighted in File Explorer.`);

      setTimeout(() => {
        document.querySelectorAll('.project-card').forEach(c => c.classList.remove('glow-pulse'));
      }, 4000);
    });
  });

  // Project filtering
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      document.querySelectorAll('.project-card').forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category').includes(filter)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
      playClickSound();
    });
  });

  // =========================================
  // 8. WINDOWS POWERSHELL INTERACTIVE CLI
  // =========================================
  const psInput = document.getElementById('powershell-input');
  const psOutput = document.getElementById('powershell-output');

  if (psInput && psOutput) {
    const history = [];
    let historyIdx = -1;

    const commands = {
      help: () => `
Windows PowerShell Commands:
  <span class="ps-highlight">dir / ls</span>       - List projects & files
  <span class="ps-highlight">portal</span>        - Fire Interdimensional Portal Gun 🌀
  <span class="ps-highlight">blog</span>          - Launch Engineering Blog reader
  <span class="ps-highlight">dimension</span>     - Print current multiverse coordinate
  <span class="ps-highlight">wubba</span>         - Interdimensional transmission
  <span class="ps-highlight">Get-Bio</span>       - Mwiko Sinyangwe's background
  <span class="ps-highlight">Get-Skills</span>    - Technical stack & proficiencies
  <span class="ps-highlight">sudo hire</span>     - Launch high-priority contact channel
  <span class="ps-highlight">contact</span>       - Open Mail
  <span class="ps-highlight">ipconfig</span>      - Connection details
  <span class="ps-highlight">cls / clear</span>   - Clear terminal
      `,
      portal: () => {
        window.firePortalGun();
        return '🌀 <span class="ps-highlight">PORTAL FLUID CHARGED:</span> Transporting desktop to next dimension...';
      },
      blog: () => {
        openWindow('win-blog');
        return 'Opening Engineering Blog (Blog.exe)...';
      },
      dimension: () => `
Current Multiverse Coordinates:
  • <span class="ps-highlight">Dimension</span>: ${dimensions[currentDimIndex].name}
  • <span class="ps-highlight">Portal Gun Status</span>: 100% Fluid Available
  • <span class="ps-highlight">Host Engineer</span>: Mwiko Sinyangwe
      `,
      wubba: () => `
🧪 <span class="ps-highlight">"Wubba Lubba Dub Dub!"</span> — Rick Sanchez
"Sometimes science is more art than science, Morty. A lot of people don't get that."
      `,
      wubbalubbadubdub: () => commands.wubba(),
      rick: () => commands.wubba(),
      morty: () => `
Aw jeez, Rick! Are you sure this full-stack portfolio is safe?!
"Relax, Morty! It's built with Laravel, Tailwind, and React. It's more resilient than the entire Galactic Federation!"
      `,
      dir: () => `
    Directory: C:\\Users\\Mwiko\\Portfolio

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----         2026-10-26  00:05           <DIR>  Projects
-a----         2026-10-26  00:05            4201  About_Me.txt
-a----         2026-10-26  00:05            1337  Stack.json
-a----         2026-10-26  00:05           12984  Blog.exe
-a----         2026-10-26  00:05          586664  Resume.pdf
-a----         2026-10-26  00:05           18492  Laragigs.lar
-a----         2026-10-26  00:05            9999  Portal_Gun.exe
      `,
      ls: () => commands.dir(),
      'get-bio': () => `
Mwiko Sinyangwe
Fullstack Software Engineer specializing in Laravel, React, and the TALL stack.
Mission: Building clean, resilient, and human-valuable web applications.
Location: Zambia (CAT / UTC+2)
      `,
      bio: () => commands['get-bio'](),
      'get-skills': () => `
[Backend]   PHP, Laravel Framework, Livewire, Python, Django, Ruby on Rails
[Frontend]  Tailwind CSS, Alpine.js, React, JavaScript (ES6+), HTML5/CSS3
[Databases] MySQL, PostgreSQL, SQLite
[Tools]     Git, GitHub, Composer, npm, REST APIs, Linux/Windows CLI
      `,
      skills: () => commands['get-skills'](),
      ipconfig: () => `
Windows IP Configuration

Ethernet adapter vEthernet (MwikoOS):
   IPv4 Address. . . . . . . . . . . : 192.168.1.137
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1
   Status. . . . . . . . . . . . . . : Online (Available for Hire)
      `,
      'sudo hire': () => {
        openWindow('win-contact');
        return '🚀 <span class="ps-highlight">Permission Granted!</span> Opening Mail client for Mwiko...';
      },
      contact: () => {
        openWindow('win-contact');
        return 'Opening Contact window...';
      }
    };

    psInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const rawCmd = psInput.value.trim();
        const cmd = rawCmd.toLowerCase();
        playClickSound();

        if (rawCmd) {
          history.push(rawCmd);
          historyIdx = history.length;
        }

        const cmdRow = document.createElement('div');
        cmdRow.className = 'ps-line';
        cmdRow.innerHTML = `<span class="ps-prompt">PS C:\\Users\\Mwiko&gt;</span> <span class="ps-cmd">${rawCmd}</span>`;
        psOutput.appendChild(cmdRow);

        if (cmd === 'cls' || cmd === 'clear') {
          psOutput.innerHTML = '';
        } else if (commands[cmd]) {
          const res = commands[cmd]();
          const resRow = document.createElement('div');
          resRow.className = 'ps-line';
          resRow.innerHTML = res.trim().replace(/\n/g, '<br>');
          psOutput.appendChild(resRow);
        } else if (cmd !== '') {
          const errRow = document.createElement('div');
          errRow.className = 'ps-line';
          errRow.style.color = '#f87171';
          errRow.textContent = `'${rawCmd}' is not recognized as the name of a cmdlet or function. Type 'help' for available commands.`;
          psOutput.appendChild(errRow);
        }

        psInput.value = '';
        const psBody = document.querySelector('.powershell-body');
        if (psBody) psBody.scrollTop = psBody.scrollHeight;
      } else if (e.key === 'ArrowUp') {
        if (historyIdx > 0) {
          historyIdx--;
          psInput.value = history[historyIdx];
        }
      } else if (e.key === 'ArrowDown') {
        if (historyIdx < history.length - 1) {
          historyIdx++;
          psInput.value = history[historyIdx];
        } else {
          historyIdx = history.length;
          psInput.value = '';
        }
      }
    });
  }

  // =========================================
  // 9. REAL CONTACT FORM DISPATCH
  // =========================================
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const name = contactForm.querySelector('input[name="name"]')?.value || 'Visitor';
      const email = contactForm.querySelector('input[name="email"]')?.value || '';
      const subject = contactForm.querySelector('input[name="subject"]')?.value || 'Portfolio Contact';
      const message = contactForm.querySelector('textarea[name="message"]')?.value || '';

      if (submitBtn) {
        submitBtn.textContent = 'Transmitting...';
        submitBtn.disabled = true;
      }

      // Send via FormSubmit direct AJAX endpoint to mwikosinyangwe@gmail.com
      try {
        const response = await fetch('https://formsubmit.co/ajax/mwikosinyangwe@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name: name,
            email: email,
            _subject: `[Portfolio Inquiry] ${subject}`,
            message: message,
            _template: 'table'
          })
        });

        const resData = await response.json();
        if (response.ok && (resData.success === 'true' || resData.success === true || resData.message)) {
          if (formStatus) {
            formStatus.className = 'form-status success';
            formStatus.textContent = '✓ Message delivered directly to Mwiko\'s inbox!';
          }
          contactForm.reset();
        } else {
          throw new Error('Fallback dispatch');
        }
      } catch (err) {
        // Fallback: Opens user's default email client prefilled to Mwiko
        window.location.href = `mailto:mwikosinyangwe@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent("Name: " + name + "\nEmail: " + email + "\n\n" + message)}`;
        if (formStatus) {
          formStatus.className = 'form-status success';
          formStatus.textContent = '✓ Opening email client to send message to Mwiko...';
        }
      } finally {
        if (submitBtn) {
          submitBtn.textContent = 'Sent Successfully';
          submitBtn.disabled = false;
        }
        showToast('Message Dispatched', 'Inquiry processed for mwikosinyangwe@gmail.com');
      }
    });
  }
});

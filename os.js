/**
 * MwikoOS 2.0 - Window Manager & Desktop Interactivity
 */

document.addEventListener('DOMContentLoaded', () => {
  let highestZ = 100;
  let activeWindow = null;
  const windows = {};
  let soundEnabled = false;

  // Initialize Audio Context for subtle tactile feedback
  let audioCtx = null;
  function playClickSound(freq = 600, duration = 0.03) {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy
    }
  }

  // --- Clock ---
  function updateClock() {
    const clockEl = document.getElementById('system-clock');
    if (!clockEl) return;
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const dayName = now.toLocaleDateString('en-US', { weekday: 'short' });
    const month = now.toLocaleDateString('en-US', { month: 'short' });
    const day = now.getDate();
    clockEl.textContent = `${dayName} ${month} ${day}  ${hours}:${minutes}`;
  }
  updateClock();
  setInterval(updateClock, 1000);

  // --- Sound Toggle ---
  const soundBtn = document.getElementById('sound-toggle-btn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      soundBtn.style.color = soundEnabled ? 'var(--accent-cyan)' : 'var(--menubar-text)';
      if (soundEnabled) playClickSound(880, 0.05);
    });
  }

  // --- Theme / Wallpaper Switcher ---
  const themeToggle = document.getElementById('theme-toggle-btn');
  const themeDropdown = document.getElementById('theme-dropdown');
  if (themeToggle && themeDropdown) {
    themeToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      themeDropdown.classList.toggle('active');
    });

    document.addEventListener('click', () => {
      themeDropdown.classList.remove('active');
    });

    document.querySelectorAll('.dropdown-item[data-set-theme]').forEach(item => {
      item.addEventListener('click', () => {
        const theme = item.getAttribute('data-set-theme');
        if (theme === 'default') {
          document.body.removeAttribute('data-theme');
          localStorage.removeItem('mwiko_os_theme');
        } else {
          document.body.setAttribute('data-theme', theme);
          localStorage.setItem('mwiko_os_theme', theme);
        }
        playClickSound(750, 0.04);
      });
    });

    // Restore saved theme
    const savedTheme = localStorage.getItem('mwiko_os_theme');
    if (savedTheme) {
      document.body.setAttribute('data-theme', savedTheme);
    }
  }

  // --- Window Management ---
  document.querySelectorAll('.os-window').forEach((win) => {
    const id = win.id;
    windows[id] = win;

    // Bring window to front on mousedown
    win.addEventListener('mousedown', () => {
      bringToFront(win);
    });

    // Window controls
    const closeBtn = win.querySelector('.traffic-close');
    const minBtn = win.querySelector('.traffic-minimize');
    const maxBtn = win.querySelector('.traffic-maximize');

    if (closeBtn) closeBtn.addEventListener('click', () => closeWindow(id));
    if (minBtn) minBtn.addEventListener('click', () => minimizeWindow(id));
    if (maxBtn) maxBtn.addEventListener('click', () => toggleMaximize(id));

    // Make window draggable
    makeDraggable(win);
  });

  function bringToFront(win) {
    highestZ += 1;
    win.style.zIndex = highestZ;
    activeWindow = win;
  }

  function openWindow(id) {
    const win = windows[id];
    if (!win) return;

    win.classList.remove('hidden');
    win.classList.remove('minimized');
    bringToFront(win);
    playClickSound(520, 0.04);

    // Update Dock dot
    updateDockIndicators();
  }

  function closeWindow(id) {
    const win = windows[id];
    if (!win) return;
    win.classList.add('hidden');
    win.classList.remove('maximized');
    playClickSound(380, 0.04);
    updateDockIndicators();
  }

  function minimizeWindow(id) {
    const win = windows[id];
    if (!win) return;
    win.classList.add('minimized');
    playClickSound(320, 0.04);
  }

  function toggleMaximize(id) {
    const win = windows[id];
    if (!win) return;
    win.classList.toggle('maximized');
    playClickSound(640, 0.04);
  }

  function updateDockIndicators() {
    document.querySelectorAll('.dock-item[data-app]').forEach(item => {
      const appId = item.getAttribute('data-app');
      const win = windows[appId];
      if (win && !win.classList.contains('hidden')) {
        item.classList.add('running');
      } else {
        item.classList.remove('running');
      }
    });
  }

  // --- Draggable logic with boundary checking ---
  function makeDraggable(win) {
    const header = win.querySelector('.window-header');
    if (!header) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    const onPointerDown = (e) => {
      // Don't drag if clicking buttons
      if (e.target.closest('.traffic-light')) return;
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

      // Keep inside bounds
      const minTop = 34; // menubar
      const maxTop = window.innerHeight - 80;
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

  // --- App Launcher Triggers (Desktop Icons & Dock Items) ---
  document.querySelectorAll('[data-open-window]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = trigger.getAttribute('data-open-window');
      openWindow(targetId);
    });
  });

  // Default opening state: open "About Me" and "Projects" centered nicely
  function initWindowPositions() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (width > 768) {
      const aboutWin = windows['win-about'];
      if (aboutWin) {
        aboutWin.style.left = `${Math.max(40, Math.floor(width * 0.12))}px`;
        aboutWin.style.top = '70px';
        aboutWin.style.width = '520px';
        aboutWin.style.height = '480px';
      }

      const projectsWin = windows['win-projects'];
      if (projectsWin) {
        projectsWin.style.left = `${Math.max(80, Math.floor(width * 0.42))}px`;
        projectsWin.style.top = '100px';
        projectsWin.style.width = '640px';
        projectsWin.style.height = '520px';
      }

      const terminalWin = windows['win-terminal'];
      if (terminalWin) {
        terminalWin.style.left = `${Math.max(60, Math.floor(width * 0.22))}px`;
        terminalWin.style.top = '180px';
        terminalWin.style.width = '560px';
        terminalWin.style.height = '360px';
      }

      const skillsWin = windows['win-skills'];
      if (skillsWin) {
        skillsWin.style.left = `${Math.max(50, Math.floor(width * 0.28))}px`;
        skillsWin.style.top = '120px';
        skillsWin.style.width = '580px';
        skillsWin.style.height = '460px';
      }

      const contactWin = windows['win-contact'];
      if (contactWin) {
        contactWin.style.left = `${Math.max(50, Math.floor(width * 0.3))}px`;
        contactWin.style.top = '110px';
        contactWin.style.width = '480px';
        contactWin.style.height = '440px';
      }

      const dashWin = windows['win-dashboard'];
      if (dashWin) {
        dashWin.style.left = '60px';
        dashWin.style.top = '60px';
        dashWin.style.width = `${Math.min(900, width - 120)}px`;
        dashWin.style.height = `${Math.min(620, height - 160)}px`;
      }

      const calcWin = windows['win-calc'];
      if (calcWin) {
        calcWin.style.left = '80px';
        calcWin.style.top = '70px';
        calcWin.style.width = `${Math.min(840, width - 160)}px`;
        calcWin.style.height = `${Math.min(580, height - 180)}px`;
      }
    }
  }

  initWindowPositions();
  // Open About Me by default
  openWindow('win-about');

  // --- Project Filtering ---
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
      playClickSound(700, 0.03);
    });
  });

  // --- Interactive Terminal ---
  const termInput = document.getElementById('terminal-input');
  const termOutput = document.getElementById('terminal-output');

  if (termInput && termOutput) {
    const history = [];
    let historyIdx = -1;

    const commands = {
      help: () => `
Available Commands:
  <span class="term-highlight">bio</span>        - Learn about Mwiko
  <span class="term-highlight">skills</span>     - List technical proficiencies
  <span class="term-highlight">projects</span>   - View highlighted applications
  <span class="term-highlight">sudo hire</span>  - Fast-track hiring transmission 🎉
  <span class="term-highlight">contact</span>    - Open message composer
  <span class="term-highlight">specs</span>      - Display MwikoOS specifications
  <span class="term-highlight">date</span>       - Current timestamp
  <span class="term-highlight">clear</span>      - Clear terminal screen
      `,
      bio: () => `
Mwiko Sinyangwe
Full-stack software engineer specializing in Laravel, React, Livewire, and the TALL stack.
Focused on architecting scalable web applications, fluid responsive interfaces, and pragmatic developer experiences.
      `,
      skills: () => `
<span class="term-highlight">[Backend]</span>   PHP, Laravel, Python, Django, Ruby on Rails, MySQL, PostgreSQL
<span class="term-highlight">[Frontend]</span>  Tailwind CSS, Alpine.js, Livewire, React, JavaScript (ES6+), HTML5/CSS3
<span class="term-highlight">[Mobile]</span>    React Native
<span class="term-highlight">[Tools]</span>     Git, Composer, npm, REST APIs, Linux CLI
      `,
      projects: () => `
Highlighted Projects:
  1. <span class="term-highlight">PotBELLY</span>: Food marketplace and financial calculator
  2. <span class="term-highlight">Laragigs</span>: Laravel developer employment portal
  3. <span class="term-highlight">Online Store</span>: E-commerce platform with PayPal integration
  4. <span class="term-highlight">Social Network</span>: Community interaction platform
  5. <span class="term-highlight">Financial Dashboard</span>: Sales reports and analytics visualization
  6. <span class="term-highlight">Lending Firm Website</span>: Financial service portal
      `,
      specs: () => `
  <span class="term-prompt">OS</span>: MwikoOS v2.0 (Web Architecture)
  <span class="term-prompt">Host</span>: GitHub Pages / Edge CDN
  <span class="term-prompt">Kernel</span>: HTML5 + Modern CSS + Vanilla JS
  <span class="term-prompt">Uptime</span>: 100% resilient
  <span class="term-prompt">Core Focus</span>: TALL Stack + Modern React
      `,
      date: () => new Date().toString(),
      'sudo hire': () => {
        openWindow('win-contact');
        return `
🚀 <span class="term-highlight">ACCESS GRANTED: Priority Contact Channel Initiated!</span>
Opening Mail.app to connect directly with Mwiko...
        `;
      },
      contact: () => {
        openWindow('win-contact');
        return 'Opening Mail.app...';
      }
    };

    termInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const rawCmd = termInput.value.trim();
        const cmd = rawCmd.toLowerCase();
        playClickSound(800, 0.02);

        // Add to history
        if (rawCmd) {
          history.push(rawCmd);
          historyIdx = history.length;
        }

        // Print command row
        const cmdRow = document.createElement('div');
        cmdRow.className = 'terminal-line';
        cmdRow.innerHTML = `<span class="term-prompt">guest@mwiko-os:~$</span> <span class="term-cmd">${rawCmd}</span>`;
        termOutput.appendChild(cmdRow);

        // Process command
        if (cmd === 'clear') {
          termOutput.innerHTML = '';
        } else if (commands[cmd]) {
          const res = commands[cmd]();
          const resRow = document.createElement('div');
          resRow.className = 'terminal-line term-text';
          resRow.innerHTML = res.trim().replace(/\n/g, '<br>');
          termOutput.appendChild(resRow);
        } else if (cmd !== '') {
          const errRow = document.createElement('div');
          errRow.className = 'terminal-line';
          errRow.style.color = '#f87171';
          errRow.textContent = `zsh: command not found: ${rawCmd}. Type "help" for a list of commands.`;
          termOutput.appendChild(errRow);
        }

        termInput.value = '';
        // Scroll terminal to bottom
        const termBody = document.querySelector('.terminal-body');
        if (termBody) termBody.scrollTop = termBody.scrollHeight;
      } else if (e.key === 'ArrowUp') {
        if (historyIdx > 0) {
          historyIdx--;
          termInput.value = history[historyIdx];
        }
      } else if (e.key === 'ArrowDown') {
        if (historyIdx < history.length - 1) {
          historyIdx++;
          termInput.value = history[historyIdx];
        } else {
          historyIdx = history.length;
          termInput.value = '';
        }
      }
    });
  }

  // --- Contact Form Submission Simulation ---
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.textContent = 'Transmitting...';
        submitBtn.disabled = true;
      }

      setTimeout(() => {
        if (formStatus) {
          formStatus.className = 'form-status success';
          formStatus.textContent = '✓ Message received! Mwiko will reply promptly.';
        }
        contactForm.reset();
        if (submitBtn) {
          submitBtn.textContent = 'Sent Successfully';
          submitBtn.disabled = false;
        }
        playClickSound(950, 0.08);
      }, 1000);
    });
  }
});

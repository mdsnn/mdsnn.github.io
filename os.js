/**
 * Windows 11 (Mwiko Edition) - Window Manager & System Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  let highestZ = 100;
  let activeWindow = null;
  const windows = {};
  let startMenuOpen = false;

  // --- Windows Tray Clock (Time on top, Date below) ---
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

  // --- Windows Start Menu ---
  const startBtn = document.getElementById('win-start-btn');
  const startMenu = document.getElementById('win-start-menu');

  if (startBtn && startMenu) {
    startBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      startMenuOpen = !startMenuOpen;
      startMenu.classList.toggle('open', startMenuOpen);
    });

    // Close Start Menu when clicking anywhere else
    document.addEventListener('click', (e) => {
      if (!startMenu.contains(e.target) && !startBtn.contains(e.target)) {
        startMenu.classList.remove('open');
        startMenuOpen = false;
      }
    });
  }

  // --- Windows Management ---
  document.querySelectorAll('.os-window').forEach((win) => {
    const id = win.id;
    windows[id] = win;

    // Bring to front on click
    win.addEventListener('mousedown', () => {
      bringToFront(win);
    });

    // Windows controls (Minimize, Maximize, Close)
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

    // Close Start Menu if open
    if (startMenu) {
      startMenu.classList.remove('open');
      startMenuOpen = false;
    }

    win.classList.remove('hidden');
    win.classList.remove('minimized');
    bringToFront(win);
    updateTaskbarButtons();
  }

  function closeWindow(id) {
    const win = windows[id];
    if (!win) return;
    win.classList.add('hidden');
    win.classList.remove('maximized');
    updateTaskbarButtons();
  }

  function minimizeWindow(id) {
    const win = windows[id];
    if (!win) return;
    win.classList.add('minimized');
    updateTaskbarButtons();
  }

  function toggleMaximize(id) {
    const win = windows[id];
    if (!win) return;
    win.classList.toggle('maximized');
  }

  // --- Show Desktop (Peek strip on bottom right) ---
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
    });
  }

  // --- Update Taskbar Button Indicators ---
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

  // --- Make Draggable ---
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

  // --- App Launcher Triggers (Desktop Icons, Taskbar, Start Menu) ---
  document.querySelectorAll('[data-open-window]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = trigger.getAttribute('data-open-window');
      const win = windows[targetId];

      // If clicked from taskbar and already active, minimize it
      if (trigger.classList.contains('taskbar-btn') && win && !win.classList.contains('hidden') && win === activeWindow && !win.classList.contains('minimized')) {
        minimizeWindow(targetId);
      } else {
        openWindow(targetId);
      }
    });
  });

  // --- Initial Positions ---
  function initWindowPositions() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (width > 768) {
      const aboutWin = windows['win-about'];
      if (aboutWin) {
        aboutWin.style.left = `${Math.max(40, Math.floor(width * 0.12))}px`;
        aboutWin.style.top = '60px';
        aboutWin.style.width = '540px';
        aboutWin.style.height = '490px';
      }

      const projectsWin = windows['win-projects'];
      if (projectsWin) {
        projectsWin.style.left = `${Math.max(80, Math.floor(width * 0.4))}px`;
        projectsWin.style.top = '80px';
        projectsWin.style.width = '640px';
        projectsWin.style.height = '520px';
      }

      const terminalWin = windows['win-terminal'];
      if (terminalWin) {
        terminalWin.style.left = `${Math.max(60, Math.floor(width * 0.24))}px`;
        terminalWin.style.top = '140px';
        terminalWin.style.width = '620px';
        terminalWin.style.height = '380px';
      }

      const skillsWin = windows['win-skills'];
      if (skillsWin) {
        skillsWin.style.left = `${Math.max(50, Math.floor(width * 0.28))}px`;
        skillsWin.style.top = '100px';
        skillsWin.style.width = '580px';
        skillsWin.style.height = '460px';
      }

      const contactWin = windows['win-contact'];
      if (contactWin) {
        contactWin.style.left = `${Math.max(50, Math.floor(width * 0.3))}px`;
        contactWin.style.top = '90px';
        contactWin.style.width = '500px';
        contactWin.style.height = '460px';
      }

      const dashWin = windows['win-dashboard'];
      if (dashWin) {
        dashWin.style.left = '60px';
        dashWin.style.top = '40px';
        dashWin.style.width = `${Math.min(940, width - 120)}px`;
        dashWin.style.height = `${Math.min(640, height - 120)}px`;
      }

      const calcWin = windows['win-calc'];
      if (calcWin) {
        calcWin.style.left = '80px';
        calcWin.style.top = '50px';
        calcWin.style.width = `${Math.min(840, width - 160)}px`;
        calcWin.style.height = `${Math.min(600, height - 140)}px`;
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
    });
  });

  // --- Windows PowerShell Interactive Terminal ---
  const psInput = document.getElementById('powershell-input');
  const psOutput = document.getElementById('powershell-output');

  if (psInput && psOutput) {
    const history = [];
    let historyIdx = -1;

    const commands = {
      help: () => `
Windows PowerShell Commands:
  <span class="ps-highlight">dir / ls</span>      - List projects & files
  <span class="ps-highlight">Get-Bio</span>       - Mwiko Sinyangwe's background
  <span class="ps-highlight">Get-Skills</span>    - Technical stack & proficiencies
  <span class="ps-highlight">sudo hire</span>     - Launch high-priority contact channel
  <span class="ps-highlight">contact</span>       - Open Mail
  <span class="ps-highlight">ipconfig</span>      - Connection details
  <span class="ps-highlight">cls / clear</span>   - Clear terminal
      `,
      dir: () => `
    Directory: C:\\Users\\Mwiko\\Portfolio

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----         2026-10-25  23:30           <DIR>  Projects
-a----         2026-10-25  23:30            4201  About_Me.txt
-a----         2026-10-25  23:30            1337  Stack.json
-a----         2026-10-25  23:30          586664  Resume.pdf
-a----         2026-10-25  23:30           18492  Laragigs.lar
-a----         2026-10-25  23:30           24910  PotBELLY.exe
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

  // --- Contact Form ---
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
      }

      setTimeout(() => {
        if (formStatus) {
          formStatus.className = 'form-status success';
          formStatus.textContent = '✓ Message sent! Mwiko will reply promptly.';
        }
        contactForm.reset();
        if (submitBtn) {
          submitBtn.textContent = 'Sent Successfully';
          submitBtn.disabled = false;
        }
      }, 800);
    });
  }
});

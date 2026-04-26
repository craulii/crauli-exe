/**
 * ============================================================
 * CRAULI.EXE — MAIN.JS
 * ============================================================
 * All application logic for crauli.exe
 *
 * DEPENDENCIES:
 *   - config.js must be loaded before this file (see index.html)
 *   - The CONFIG object from config.js is accessed globally
 *
 * MODULE STRUCTURE (IIFEs — each module is self-contained):
 *   1. EntryScreen     — warning gate, reveals main site
 *   2. VisitCounter    — localStorage-based hit counter
 *   3. AudioControl    — background music toggle
 *   4. FloatingPhotos  — DVD-screensaver-style bouncing images
 *   5. RuletaRusa      — random link roulette image
 *   6. TCGGallery      — auto-build carousels from config
 *   7. Guestbook       — localStorage form + post list
 *   8. HeaderClock     — live clock in header statusbar
 *   9. GlitchEffects   — random DOM glitch bursts
 *  10. EasterEggs      — Konami code, 66 clicks, idle
 *
 * HOW TO MODIFY:
 *   - To change behavior: find the module by name above
 *   - To add a feature: create a new IIFE module at the bottom
 *   - Configuration (links, filenames, etc.) lives in config.js
 * ============================================================
 */

'use strict';

// Wait for DOM to be fully parsed before running any module
document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  // MODULE 1: ENTRY SCREEN
  // Handles the warning gate. On click: fades out #entry-screen,
  // reveals #main-site, triggers audio attempt, increments counter.
  // ============================================================
  const EntryScreen = (() => {

    const entryEl   = document.getElementById('entry-screen');
    const mainEl    = document.getElementById('main-site');
    const enterBtn  = document.getElementById('enter-btn');
    const warningEl = document.getElementById('entry-warning-text');

    function init() {
      // Fill warning text from CONFIG (preserves \n as line breaks)
      if (warningEl && CONFIG.warningText) {
        warningEl.textContent = CONFIG.warningText;
      }

      // Bind the enter button
      if (enterBtn) {
        enterBtn.addEventListener('click', enter);
        // Also support keyboard activation (Enter / Space)
        enterBtn.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            enter();
          }
        });
      }
    }

    function enter() {
      if (!entryEl || !mainEl) return;

      // Apply exit animation class
      entryEl.classList.add('entry-screen--exiting');

      // After animation completes, fully hide entry and reveal main
      setTimeout(() => {
        entryEl.style.display = 'none';
        mainEl.style.display  = 'block';
        mainEl.removeAttribute('aria-hidden');
        mainEl.classList.add('fade-in');

        // Trigger all modules that need the site to be visible
        VisitCounter.increment();
        AudioControl.tryAutoplay();
        FloatingPhotos.init();
        RuletaRusa.init();
        TCGGallery.init();
        Guestbook.init();
        HeaderClock.init();
        GlitchEffects.init();
        EasterEggs.init();
        PhotoGallery.init();

      }, 500); // must match transition duration in CSS
    }

    return { init };
  })();


  // ============================================================
  // MODULE 2: VISIT COUNTER
  // Reads/writes a simple integer in localStorage.
  // Key: 'crauli_visits'
  // ============================================================
  const VisitCounter = (() => {

    const STORAGE_KEY = 'crauli_visits';
    const displayEl   = document.getElementById('counter-value');

    function _getCount() {
      return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
    }

    function _setCount(n) {
      localStorage.setItem(STORAGE_KEY, String(n));
    }

    function _render(n) {
      if (!displayEl) return;
      // Pad to 6 digits for retro odometer look
      displayEl.textContent = String(n).padStart(6, '0');
    }

    function increment() {
      const next = _getCount() + 1;
      _setCount(next);
      _render(next);
    }

    // Init just renders the current count without incrementing
    // (increment is called explicitly by EntryScreen.enter())
    function init() {
      _render(_getCount());
    }

    return { init, increment };
  })();


  // ============================================================
  // MODULE 3: AUDIO CONTROL
  // Creates an <audio> element and wires the toggle button.
  // Browser autoplay policy requires a user gesture — we set
  // playOnInteraction flag and attempt play on entry button click.
  // ============================================================
  const AudioControl = (() => {

    const toggleBtn  = document.getElementById('audio-toggle');
    const statusEl   = document.getElementById('audio-status');
    const iconEl     = document.getElementById('audio-icon');
    let   audio      = null;
    let   isPlaying  = false;

    function _createAudio() {
      audio = new Audio(CONFIG.audioPath);
      audio.loop   = true;
      audio.volume = CONFIG.audioVolume;

      // Handle missing audio file gracefully
      audio.addEventListener('error', () => {
        console.warn('[AudioControl] Audio file not found at:', CONFIG.audioPath);
        if (toggleBtn) toggleBtn.title = 'Audio file not found — add MP3 to /assets/audio/';
      });
    }

    function _updateUI(playing) {
      isPlaying = playing;
      if (!statusEl || !iconEl) return;

      if (playing) {
        statusEl.textContent = 'ON';
        statusEl.classList.add('is-on');
        iconEl.style.animationPlayState = 'running';
      } else {
        statusEl.textContent = 'OFF';
        statusEl.classList.remove('is-on');
        iconEl.style.animationPlayState = 'paused';
      }
    }

    function toggle() {
      if (!audio) _createAudio();

      if (isPlaying) {
        audio.pause();
        _updateUI(false);
      } else {
        audio.play()
          .then(() => _updateUI(true))
          .catch(err => console.warn('[AudioControl] Play failed:', err));
      }
    }

    // Called by EntryScreen after the user gesture (button click)
    function tryAutoplay() {
      if (!audio) _createAudio();
      audio.play()
        .then(() => _updateUI(true))
        .catch(() => {
          // Autoplay blocked — user can click the toggle manually
          _updateUI(false);
        });
    }

    function init() {
      _createAudio();
      _updateUI(false);

      if (toggleBtn) {
        toggleBtn.addEventListener('click', toggle);
      }
    }

    return { init, tryAutoplay, toggle };
  })();


  // ============================================================
  // MODULE 4: FLOATING PHOTOS
  // Injects images from CONFIG.floatingPhotos into #floating-layer.
  // Each image bounces like a DVD screensaver:
  //   - Assigned random starting position and velocity
  //   - requestAnimationFrame loop updates position
  //   - Bounces off window edges, rotates slightly on bounce
  //   - Click opens CONFIG.linkedinURL
  // ============================================================
  const FloatingPhotos = (() => {

    const container = document.getElementById('floating-layer');

    // Physics state for each image
    const photos = [];

    function init() {
      if (!container || !CONFIG.floatingPhotos || CONFIG.floatingPhotos.length === 0) return;

      CONFIG.floatingPhotos.forEach((filename, i) => {
        const img = document.createElement('img');
        img.src   = `./assets/me/${filename}`;
        img.alt   = `Foto de Crauli — click para LinkedIn`;
        img.classList.add('floating-photo');

        // Show broken image indicator while still useful for bounce
        img.addEventListener('error', () => {
          img.style.background = 'rgba(192,57,43,0.3)';
          img.style.border = '2px solid #c0392b';
        });

        // Click → LinkedIn in new tab
        img.addEventListener('click', () => {
          window.open(CONFIG.linkedinURL, '_blank', 'noopener,noreferrer');
        });

        container.appendChild(img);

        // Random starting state
        const size = Math.max(80, Math.min(140, window.innerWidth * 0.1));
        const state = {
          el:       img,
          x:        Math.random() * (window.innerWidth  - size),
          y:        Math.random() * (window.innerHeight - size),
          vx:       (Math.random() * 1.5 + 0.5) * (Math.random() > 0.5 ? 1 : -1),
          vy:       (Math.random() * 1.5 + 0.5) * (Math.random() > 0.5 ? 1 : -1),
          rotation: Math.random() * 20 - 10, // -10 to +10 degrees
          size:     size,
        };

        // Stagger start time slightly per image for variety
        state.vx *= (1 + i * 0.1);
        state.vy *= (1 + i * 0.15);

        photos.push(state);
      });

      // Start the animation loop
      requestAnimationFrame(_tick);
    }

    function _tick() {
      const W = window.innerWidth;
      const H = window.innerHeight;

      photos.forEach(p => {
        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off right/left edge — slight rotation flip on bounce
        if (p.x + p.size >= W) {
          p.x  = W - p.size;
          p.vx = -Math.abs(p.vx);
          p.rotation = -(Math.random() * 15 + 5);
        } else if (p.x <= 0) {
          p.x  = 0;
          p.vx = Math.abs(p.vx);
          p.rotation = (Math.random() * 15 + 5);
        }

        // Bounce off bottom/top edge
        if (p.y + p.size >= H) {
          p.y  = H - p.size;
          p.vy = -Math.abs(p.vy);
          p.rotation = -(Math.random() * 15 + 5);
        } else if (p.y <= 0) {
          p.y  = 0;
          p.vy = Math.abs(p.vy);
          p.rotation = (Math.random() * 15 + 5);
        }

        // Apply to DOM
        p.el.style.left      = `${p.x}px`;
        p.el.style.top       = `${p.y}px`;
        p.el.style.transform = `rotate(${p.rotation}deg)`;
      });

      requestAnimationFrame(_tick);
    }

    return { init };
  })();


  // ============================================================
  // MODULE 5: RULETA RUSA
  // Sets src of #ruleta-img from CONFIG.ruletaImage.
  // On click: picks random URL from CONFIG.ruletaLinks and opens it.
  // Adds shake CSS class for visual feedback on click.
  // ============================================================
  const RuletaRusa = (() => {

    const wrap    = document.getElementById('ruleta-image-wrap');
    const imgEl   = document.getElementById('ruleta-img');
    const hintEl  = document.getElementById('ruleta-hint');

    function _getRandomLink() {
      const links = CONFIG.ruletaLinks;
      if (!links || links.length === 0) return '#';
      return links[Math.floor(Math.random() * links.length)];
    }

    function _handleClick() {
      const url = _getRandomLink();

      // Update hint text
      if (hintEl) {
        hintEl.textContent = '[ abriendo portal... ]';
        setTimeout(() => {
          hintEl.textContent = '[ destino desconocido · haz click para descubrir ]';
        }, 2000);
      }

      // Shake animation
      if (wrap) {
        wrap.classList.add('is-shaking');
        wrap.addEventListener('animationend', () => {
          wrap.classList.remove('is-shaking');
        }, { once: true });
      }

      // Open the random URL
      setTimeout(() => {
        window.open(url, '_blank', 'noopener,noreferrer');
      }, 200);
    }

    function init() {
      // Set the image source
      if (imgEl && CONFIG.ruletaImage) {
        imgEl.src = CONFIG.ruletaImage;

        // Fallback if image doesn't exist
        imgEl.addEventListener('error', () => {
          imgEl.style.display = 'none';
          if (wrap) {
            wrap.style.minWidth  = '300px';
            wrap.style.minHeight = '200px';
            wrap.style.background = 'rgba(192,57,43,0.1)';
            const placeholder = document.createElement('p');
            placeholder.textContent = '[ AÑADE TU IMAGEN EN /assets/me/ Y ACTUALIZA config.js ]';
            placeholder.style.cssText = 'font-family:VT323,monospace;color:#c0392b;padding:2rem;font-size:1rem;text-align:center;';
            wrap.insertBefore(placeholder, wrap.firstChild);
          }
        });
      }

      // Click and keyboard handlers
      if (wrap) {
        wrap.addEventListener('click', _handleClick);
        wrap.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            _handleClick();
          }
        });
      }
    }

    return { init };
  })();


  // ============================================================
  // MODULE 6: TCG GALLERY
  // Builds the gallery DOM from CONFIG.tcgImages.
  // Creates one horizontal scroll carousel per category.
  // Filename (minus extension) becomes the card's visible title.
  // ============================================================
  const TCGGallery = (() => {

    const container = document.getElementById('tcg-gallery-container');

    // Category display config: emoji icon, label
    const CATEGORY_META = {
      pokemon:  { label: 'POKÉMON',   icon: '⚡' },
      onepiece: { label: 'ONE PIECE', icon: '☠' },
      magic:    { label: 'MAGIC: THE GATHERING', icon: '✦' },
    };

    function _buildCategory(categoryKey, filenames) {
      const meta = CATEGORY_META[categoryKey] || { label: categoryKey.toUpperCase(), icon: '🃏' };

      // Outer wrapper
      const section = document.createElement('div');
      section.classList.add('tcg-category');
      section.setAttribute('data-category', categoryKey);
      section.setAttribute('aria-label', `Colección de ${meta.label}`);

      // Category heading
      const heading = document.createElement('h3');
      heading.classList.add('tcg-category-title');
      heading.innerHTML = `<span>${meta.icon}</span> ${meta.label}`;
      section.appendChild(heading);

      // Horizontal scroll track
      const scrollTrack = document.createElement('div');
      scrollTrack.classList.add('tcg-scroll');
      scrollTrack.setAttribute('role', 'list');

      // Handle empty category
      if (!filenames || filenames.length === 0) {
        const empty = document.createElement('p');
        empty.classList.add('tcg-empty');
        empty.textContent = `[ No hay cartas configuradas para ${meta.label} — añade en config.js ]`;
        section.appendChild(empty);
        return section;
      }

      // Build a card for each filename
      filenames.forEach(filename => {
        const figure  = document.createElement('figure');
        figure.classList.add('tcg-card');
        figure.setAttribute('role', 'listitem');

        const img = document.createElement('img');
        img.src     = `./assets/tcg/${categoryKey}/${filename}`;
        img.alt     = _filenameToTitle(filename);
        img.loading = 'lazy'; // lazy load for performance

        // Fallback for missing images
        img.addEventListener('error', () => {
          img.style.background  = 'rgba(10,10,10,0.8)';
          img.style.borderColor = '#7b241c';
          img.alt = `[MISSING: ${filename}]`;
        });

        const caption = document.createElement('figcaption');
        caption.textContent = _filenameToTitle(filename);

        figure.appendChild(img);
        figure.appendChild(caption);
        scrollTrack.appendChild(figure);
      });

      section.appendChild(scrollTrack);

      // Drag-to-scroll behavior
      _addDragScroll(scrollTrack);

      return section;
    }

    // Remove extension and replace dashes/underscores with spaces
    function _filenameToTitle(filename) {
      return filename
        .replace(/\.[^.]+$/, '')           // remove extension
        .replace(/[-_]/g, ' ')             // dashes/underscores → spaces
        .replace(/\b\w/g, c => c.toUpperCase()); // Title Case
    }

    // Mouse drag-to-scroll for desktop
    function _addDragScroll(el) {
      let isDown = false;
      let startX, scrollLeft;

      el.addEventListener('mousedown', (e) => {
        isDown = true;
        el.classList.add('is-dragging');
        startX     = e.pageX - el.offsetLeft;
        scrollLeft = el.scrollLeft;
      });

      el.addEventListener('mouseleave', () => {
        isDown = false;
        el.classList.remove('is-dragging');
      });

      el.addEventListener('mouseup', () => {
        isDown = false;
        el.classList.remove('is-dragging');
      });

      el.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x    = e.pageX - el.offsetLeft;
        const walk = (x - startX) * 1.5; // scroll speed multiplier
        el.scrollLeft = scrollLeft - walk;
      });
    }

    function init() {
      if (!container) return;

      // Clear loading placeholder
      container.innerHTML = '';

      const categories = Object.keys(CONFIG.tcgImages);

      if (categories.length === 0) {
        container.innerHTML = '<p class="gallery-loading">[ Sin categorías configuradas — edita tcgImages en config.js ]</p>';
        return;
      }

      categories.forEach(key => {
        const categoryEl = _buildCategory(key, CONFIG.tcgImages[key]);
        container.appendChild(categoryEl);
      });
    }

    return { init };
  })();


  // ============================================================
  // MODULE 7: GUESTBOOK
  // Stores messages in localStorage as a JSON array.
  // Key: 'crauli_guestbook'
  // Each message: { name: string, text: string, timestamp: string }
  // ============================================================
  const Guestbook = (() => {

    const STORAGE_KEY  = 'crauli_guestbook';
    const form         = document.getElementById('guestbook-form');
    const nameInput    = document.getElementById('gb-name');
    const messageInput = document.getElementById('gb-message');
    const messagesEl   = document.getElementById('guestbook-messages');
    const feedbackEl   = document.getElementById('form-feedback');

    // Max messages stored (oldest are dropped to prevent bloat)
    const MAX_MESSAGES = 100;

    function _loadMessages() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      } catch {
        return [];
      }
    }

    function _saveMessages(messages) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }

    function _addMessage(name, text) {
      const messages = _loadMessages();
      messages.unshift({
        name:      _sanitize(name.trim()),
        text:      _sanitize(text.trim()),
        timestamp: new Date().toISOString(),
      });
      // Keep only the most recent MAX_MESSAGES entries
      _saveMessages(messages.slice(0, MAX_MESSAGES));
    }

    // Basic sanitization: escape HTML special chars to prevent XSS
    // since these strings are later set as textContent (not innerHTML),
    // this is a defense-in-depth measure only
    function _sanitize(str) {
      return str
        .replace(/&/g,  '&amp;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;')
        .replace(/"/g,  '&quot;')
        .replace(/'/g,  '&#x27;');
    }

    function _formatDate(isoString) {
      try {
        const d = new Date(isoString);
        // Format: DD/MM/YYYY HH:MM
        return d.toLocaleDateString('es-CL', {
          day:   '2-digit',
          month: '2-digit',
          year:  'numeric',
          hour:  '2-digit',
          minute: '2-digit',
        });
      } catch {
        return isoString;
      }
    }

    function renderMessages() {
      if (!messagesEl) return;

      const messages = _loadMessages();

      if (messages.length === 0) {
        messagesEl.innerHTML = '<p class="gb-empty">[ Sin mensajes aún — sé el primero en escribir ]</p>';
        return;
      }

      // Build HTML using textContent to prevent XSS
      messagesEl.innerHTML = '';

      messages.forEach(msg => {
        const article = document.createElement('article');
        article.classList.add('gb-post');

        const header = document.createElement('header');
        header.classList.add('gb-post-header');

        const authorEl = document.createElement('span');
        authorEl.classList.add('gb-author');
        authorEl.textContent = msg.name; // textContent, not innerHTML — XSS safe

        const timeEl = document.createElement('time');
        timeEl.classList.add('gb-time');
        timeEl.setAttribute('datetime', msg.timestamp);
        timeEl.textContent = _formatDate(msg.timestamp);

        header.appendChild(authorEl);
        header.appendChild(timeEl);

        const bodyEl = document.createElement('p');
        bodyEl.classList.add('gb-body');
        bodyEl.textContent = msg.text; // textContent — XSS safe

        article.appendChild(header);
        article.appendChild(bodyEl);
        messagesEl.appendChild(article);
      });
    }

    function _setFeedback(msg, isError = false) {
      if (!feedbackEl) return;
      feedbackEl.textContent = msg;
      feedbackEl.classList.toggle('is-error', isError);
      // Clear feedback after 3 seconds
      setTimeout(() => {
        feedbackEl.textContent = '';
        feedbackEl.classList.remove('is-error');
      }, 3000);
    }

    function _handleSubmit(e) {
      e.preventDefault();

      const name = nameInput?.value?.trim() || '';
      const text = messageInput?.value?.trim() || '';

      // Validation
      if (!name) {
        _setFeedback('[ ERROR: Nombre requerido ]', true);
        nameInput?.focus();
        return;
      }
      if (!text) {
        _setFeedback('[ ERROR: Mensaje requerido ]', true);
        messageInput?.focus();
        return;
      }
      if (name.length > 50) {
        _setFeedback('[ ERROR: Nombre demasiado largo (máx 50) ]', true);
        return;
      }
      if (text.length > 500) {
        _setFeedback('[ ERROR: Mensaje demasiado largo (máx 500) ]', true);
        return;
      }

      // Save and re-render
      _addMessage(name, text);
      renderMessages();
      form.reset();
      _setFeedback('[ MENSAJE ENVIADO AL ABISMO ✓ ]');

      // Scroll to messages
      if (messagesEl) {
        messagesEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    function init() {
      renderMessages();

      if (form) {
        form.addEventListener('submit', _handleSubmit);
      }
    }

    return { init, renderMessages };
  })();


  // ============================================================
  // MODULE 8: HEADER CLOCK
  // Updates the time display in the header status bar every second.
  // ============================================================
  const HeaderClock = (() => {

    const timeEl = document.getElementById('header-time');

    function _tick() {
      if (!timeEl) return;
      const now = new Date();
      const hh  = String(now.getHours()).padStart(2, '0');
      const mm  = String(now.getMinutes()).padStart(2, '0');
      const ss  = String(now.getSeconds()).padStart(2, '0');
      timeEl.textContent = `${hh}:${mm}:${ss}`;
    }

    function init() {
      // Fill tagline from config
      const taglineEl = document.getElementById('site-tagline');
      if (taglineEl && CONFIG.tagline) {
        taglineEl.textContent = CONFIG.tagline;
      }

      _tick();
      setInterval(_tick, 1000);
    }

    return { init };
  })();


  // ============================================================
  // MODULE 9: GLITCH EFFECTS
  // Periodically applies glitch class to random DOM elements.
  // Simulates spontaneous CRT corruption. Non-intrusive — only
  // affects decorative text elements, not interactive controls.
  // ============================================================
  const GlitchEffects = (() => {

    // Selectors of elements eligible for random glitch
    const ELIGIBLE_SELECTORS = [
      '.section-title',
      '.about-block-title',
      '.nav-link',
      '.counter-label',
    ];

    function _triggerRandomGlitch() {
      // Pick a random eligible element
      const allEligible = ELIGIBLE_SELECTORS.flatMap(
        sel => Array.from(document.querySelectorAll(sel))
      );

      if (allEligible.length === 0) return;

      const target = allEligible[Math.floor(Math.random() * allEligible.length)];

      target.classList.add('is-glitching');
      target.addEventListener('animationend', () => {
        target.classList.remove('is-glitching');
      }, { once: true });
    }

    function init() {
      // Schedule random glitches every 5–15 seconds
      const scheduleNext = () => {
        const delay = 5000 + Math.random() * 10000; // 5–15s
        setTimeout(() => {
          _triggerRandomGlitch();
          scheduleNext(); // re-schedule after each trigger
        }, delay);
      };

      scheduleNext();
    }

    return { init };
  })();


  // ============================================================
  // MODULE 10: EASTER EGGS
  //
  // 1. KONAMI CODE (↑↑↓↓←→←→BA):
  //    Shows #easter-konami overlay with ASCII art and message
  //
  // 2. CLICK COUNTER (66 clicks anywhere):
  //    Shows #easter-demon overlay with invocation message
  //    Threshold set via CONFIG.demonClickThreshold
  //
  // 3. IDLE TIMEOUT (30s no mouse/key activity):
  //    Shows #easter-nosignal "NO SIGNAL" screen
  //    Duration set via CONFIG.idleTimeoutSeconds
  // ============================================================
  const EasterEggs = (() => {

    // Konami sequence: ↑↑↓↓←→←→BA
    const KONAMI = [
      'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
      'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
      'b','a'
    ];

    let konamiIndex    = 0;
    let clickCount     = 0;
    let idleTimer      = null;
    let hasShownNosignal = false; // only trigger no-signal once per session

    // Overlay elements
    const konamiOverlay  = document.getElementById('easter-konami');
    const demonOverlay   = document.getElementById('easter-demon');
    const nosignalOverlay = document.getElementById('easter-nosignal');

    // Close buttons
    function _bindCloseButtons() {
      document.querySelectorAll('.easter-close').forEach(btn => {
        btn.addEventListener('click', _closeAll);
      });
    }

    function _showOverlay(el) {
      if (!el) return;
      el.classList.add('is-visible');
      el.removeAttribute('aria-hidden');
      // Also trigger a body glitch
      document.body.classList.add('is-glitching');
      document.body.addEventListener('animationend', () => {
        document.body.classList.remove('is-glitching');
      }, { once: true });
    }

    function _closeAll() {
      [konamiOverlay, demonOverlay, nosignalOverlay].forEach(el => {
        if (!el) return;
        el.classList.remove('is-visible');
        el.setAttribute('aria-hidden', 'true');
      });
      _resetIdleTimer(); // reset idle after dismissal
    }

    // ── Konami code listener ────────────────────────────────
    function _handleKonamiKey(e) {
      if (e.key === KONAMI[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === KONAMI.length) {
          konamiIndex = 0;
          _showOverlay(konamiOverlay);
        }
      } else {
        // Reset on wrong key, but check if this key starts the sequence
        konamiIndex = (e.key === KONAMI[0]) ? 1 : 0;
      }
    }

    // ── 66-click counter ────────────────────────────────────
    function _handleBodyClick(e) {
      // Don't count clicks on easter egg close buttons
      if (e.target.classList.contains('easter-close')) return;

      clickCount++;
      if (
        CONFIG.demonClickThreshold > 0 &&
        clickCount === CONFIG.demonClickThreshold
      ) {
        _showOverlay(demonOverlay);
        clickCount = 0; // reset for next invocation
      }
    }

    // ── Idle timer ──────────────────────────────────────────
    function _resetIdleTimer() {
      if (!CONFIG.idleTimeoutSeconds || CONFIG.idleTimeoutSeconds <= 0) return;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(_triggerNoSignal, CONFIG.idleTimeoutSeconds * 1000);
    }

    function _triggerNoSignal() {
      if (hasShownNosignal) return;
      hasShownNosignal = true;
      _showOverlay(nosignalOverlay);

      // Auto-dismiss after 4 seconds
      setTimeout(() => {
        if (nosignalOverlay?.classList.contains('is-visible')) {
          _closeAll();
          hasShownNosignal = false; // allow triggering again after dismiss
        }
      }, 4000);
    }

    function init() {
      _bindCloseButtons();

      // Konami listener on document
      document.addEventListener('keydown', _handleKonamiKey);

      // 66-click counter on document body
      document.addEventListener('click', _handleBodyClick);

      // Idle detection — reset timer on any user activity
      if (CONFIG.idleTimeoutSeconds > 0) {
        ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'].forEach(evt => {
          document.addEventListener(evt, _resetIdleTimer, { passive: true });
        });
        _resetIdleTimer(); // start initial timer
      }
    }

    return { init };
  })();


  // ============================================================
  // MODULE 11: PHOTO GALLERY
  // Builds a grid from CONFIG.galleryPhotos.
  // Click on any photo → opens lightbox with prev/next navigation.
  // ============================================================
  const PhotoGallery = (() => {

    const gridEl     = document.getElementById('photo-gallery-grid');
    const lightbox   = document.getElementById('photo-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn   = document.getElementById('lightbox-close');
    const prevBtn    = document.getElementById('lightbox-prev');
    const nextBtn    = document.getElementById('lightbox-next');
    const counterEl  = document.getElementById('lightbox-counter');

    let currentIndex = 0;
    let photos       = [];

    function _open(index) {
      currentIndex = index;
      const src = `./assets/me/${photos[currentIndex]}`;
      lightboxImg.src = src;
      lightboxImg.alt = `Foto ${currentIndex + 1} de ${photos.length}`;
      if (counterEl) counterEl.textContent = `${currentIndex + 1} / ${photos.length}`;
      lightbox.classList.add('is-open');
      lightbox.removeAttribute('aria-hidden');
      closeBtn?.focus();
    }

    function _close() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
    }

    function _prev() {
      currentIndex = (currentIndex - 1 + photos.length) % photos.length;
      _open(currentIndex);
    }

    function _next() {
      currentIndex = (currentIndex + 1) % photos.length;
      _open(currentIndex);
    }

    function init() {
      if (!gridEl || !CONFIG.galleryPhotos || CONFIG.galleryPhotos.length === 0) return;

      photos = CONFIG.galleryPhotos;
      gridEl.innerHTML = '';

      photos.forEach((filename, i) => {
        const cell = document.createElement('div');
        cell.classList.add('photo-cell');
        cell.setAttribute('role', 'button');
        cell.setAttribute('tabindex', '0');
        cell.setAttribute('aria-label', `Foto ${i + 1} — click para ampliar`);
        // Slight random tilt for cursed feel
        const tilt = (Math.random() * 2 - 1).toFixed(2);
        cell.style.transform = `rotate(${tilt}deg)`;

        const img = document.createElement('img');
        img.src     = `./assets/me/${filename}`;
        img.alt     = `Foto personal ${i + 1}`;
        img.loading = 'lazy';
        img.addEventListener('error', () => {
          cell.style.background = 'rgba(192,57,43,0.1)';
          cell.style.display = 'flex';
          cell.style.alignItems = 'center';
          cell.style.justifyContent = 'center';
          img.style.display = 'none';
        });

        const overlay = document.createElement('div');
        overlay.classList.add('photo-cell-overlay');
        overlay.setAttribute('aria-hidden', 'true');
        const num = document.createElement('span');
        num.classList.add('photo-cell-num');
        num.textContent = String(i + 1).padStart(2, '0');
        overlay.appendChild(num);

        cell.appendChild(img);
        cell.appendChild(overlay);
        gridEl.appendChild(cell);

        cell.addEventListener('click', () => _open(i));
        cell.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); _open(i); }
        });
      });

      // Lightbox controls
      closeBtn?.addEventListener('click', _close);
      prevBtn?.addEventListener('click', _prev);
      nextBtn?.addEventListener('click', _next);

      // Click outside image closes lightbox
      lightbox?.addEventListener('click', (e) => {
        if (e.target === lightbox) _close();
      });

      // Keyboard navigation inside lightbox
      document.addEventListener('keydown', (e) => {
        if (!lightbox?.classList.contains('is-open')) return;
        if (e.key === 'Escape')      _close();
        if (e.key === 'ArrowLeft')   _prev();
        if (e.key === 'ArrowRight')  _next();
      });
    }

    return { init };
  })();


  // ============================================================
  // INITIALIZATION
  // Only EntryScreen is initialized here — all other modules are
  // initialized by EntryScreen.enter() once the user clicks in.
  // This prevents modules from running while the entry gate is up.
  // ============================================================
  EntryScreen.init();
  VisitCounter.init(); // render current count on load (before increment)

});

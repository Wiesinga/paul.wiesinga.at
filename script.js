/**
 * Paul Wiesinger – Personal Digital Business Card (paul.wiesinga.at)
 * - Rock-solid static card (zero distracting tilt)
 * - Smooth, interactive background particle canvas & ambient cursor glow
 * - 1-Click vCard (.vcf) download & clipboard copy
 * - Clean tab navigation & theme persistence
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const html = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const qrBtn = document.getElementById('qrBtn');
  const qrModal = document.getElementById('qrModal');
  const closeQrModal = document.getElementById('closeQrModal');
  const downloadVCardBtn = document.getElementById('downloadVCard');
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  const copyBtnText = document.getElementById('copyBtnText');
  const toast = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');
  const cursorGlow = document.getElementById('cursorGlow');
  const tabButtons = document.querySelectorAll('.nav-pill');
  const tabPanels = document.querySelectorAll('.tab-card');
  const currentYearSpan = document.getElementById('currentYear');
  const canvas = document.getElementById('bgCanvas');

  // Contact Data
  const CONTACT = {
    name: 'Paul Wiesinger',
    firstName: 'Paul',
    lastName: 'Wiesinger',
    email: 'paul@wiesinga.at',
    website: 'https://paul.wiesinga.at',
    role: 'Software Developer',
    location: 'Oberösterreich, Österreich'
  };

  // 1. Year
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // 2. Theme Toggle (Dark / Light)
  const savedTheme = localStorage.getItem('pw_theme') ||
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  setTheme(savedTheme);

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('pw_theme', theme);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = html.getAttribute('data-theme') || 'dark';
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(nextTheme);
      showToast(`Design: ${nextTheme === 'dark' ? 'Dunkel' : 'Hell'}`);
    });
  }

  // 3. Tab Navigation
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });

  // 4. vCard Download (.vcf)
  if (downloadVCardBtn) {
    downloadVCardBtn.addEventListener('click', () => {
      const vcard = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${CONTACT.lastName};${CONTACT.firstName};;;`,
        `FN:${CONTACT.name}`,
        `TITLE:${CONTACT.role}`,
        `EMAIL;TYPE=INTERNET,PREF:${CONTACT.email}`,
        `URL;TYPE=WORK:${CONTACT.website}`,
        `ADR;TYPE=HOME:;;;${CONTACT.location};;;`,
        'NOTE:Digitale Visitenkarte via paul.wiesinga.at',
        'END:VCARD'
      ].join('\r\n');

      const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${CONTACT.firstName.toLowerCase()}-${CONTACT.lastName.toLowerCase()}.vcf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('vCard heruntergeladen 📇');
    });
  }

  // 5. Copy Email
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(CONTACT.email)
          .then(onCopied)
          .catch(() => fallbackCopy(CONTACT.email));
      } else {
        fallbackCopy(CONTACT.email);
      }
    });
  }

  function fallbackCopy(text) {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand('copy');
      onCopied();
    } catch (e) {
      showToast('Kopieren nicht unterstützt');
    }
    document.body.removeChild(input);
  }

  function onCopied() {
    if (copyBtnText) copyBtnText.textContent = 'Kopiert! ✓';
    showToast(`${CONTACT.email} kopiert!`);
    setTimeout(() => {
      if (copyBtnText) copyBtnText.textContent = CONTACT.email;
    }, 2000);
  }

  // 6. QR Modal
  function openModal() {
    if (qrModal) {
      qrModal.classList.add('open');
      qrModal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeModal() {
    if (qrModal) {
      qrModal.classList.remove('open');
      qrModal.setAttribute('aria-hidden', 'true');
    }
  }

  if (qrBtn) qrBtn.addEventListener('click', openModal);
  if (closeQrModal) closeQrModal.addEventListener('click', closeModal);
  if (qrModal) {
    qrModal.addEventListener('click', (e) => {
      if (e.target === qrModal) closeModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // 7. Toast Feedback
  let toastTimer;
  function showToast(text) {
    if (!toast) return;
    if (toastMessage) toastMessage.textContent = text;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }

  // 8. Custom Avatar Detection
  const profileImg = document.getElementById('profileImg');
  if (profileImg) {
    const testImg = new Image();
    testImg.src = 'assets/avatar.jpg';
    testImg.onload = () => {
      profileImg.src = 'assets/avatar.jpg';
    };
  }

  // =========================================================================
  // 9. Interactive Background Canvas (Particles & Soft Cursor Ambient Light)
  // =========================================================================
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let particles = [];
    const particleCount = 42;
    const mouse = { x: -1000, y: -1000, active: false };

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    // Mouse tracking for background
    window.addEventListener('pointermove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;

      // Move CSS cursor glow
      if (cursorGlow) {
        cursorGlow.style.left = `${e.clientX}px`;
        cursorGlow.style.top = `${e.clientY}px`;
      }
    });

    window.addEventListener('pointerleave', () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    });

    // Particle class
    class Particle {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * width;
        this.y = init ? Math.random() * height : (Math.random() < 0.5 ? -10 : height + 10);
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.radius = Math.random() * 1.6 + 0.8;
        this.baseAlpha = Math.random() * 0.35 + 0.15;
        this.alpha = this.baseAlpha;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce gently at screen edges
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Distance to mouse pointer
        if (mouse.active) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 160;

          if (dist < maxDist) {
            // Soft illumination near cursor
            const factor = 1 - dist / maxDist;
            this.alpha = Math.min(0.85, this.baseAlpha + factor * 0.6);

            // Subtle attraction towards or glide around mouse
            this.x += (dx / dist) * factor * 0.4;
            this.y += (dy / dist) * factor * 0.4;
          } else {
            this.alpha += (this.baseAlpha - this.alpha) * 0.05;
          }
        } else {
          this.alpha += (this.baseAlpha - this.alpha) * 0.05;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148, 163, 184, ${this.alpha})`;
        ctx.fill();
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation Loop
    let animationFrameId;
    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Connect particles to mouse with faint elegant lines if nearby
      if (mouse.active) {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            const lineAlpha = (1 - dist / 130) * 0.35;
            ctx.strokeStyle = `rgba(99, 102, 241, ${lineAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          // Also connect neighbouring particles if close to each other
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const pDx = p.x - p2.x;
            const pDy = p.y - p2.y;
            const pDist = Math.sqrt(pDx * pDx + pDy * pDy);

            if (pDist < 85) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              const linkAlpha = (1 - pDist / 85) * 0.15;
              ctx.strokeStyle = `rgba(148, 163, 184, ${linkAlpha})`;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }
        }
      }

      // Update and draw each particle
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    // Pause when tab is not visible to conserve battery
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        animate();
      }
    });
  }
});

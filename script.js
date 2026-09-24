/**
 * Paul Wiesinger – Personal Digital Business Card
 * Interactions: 3D Tilt, Dynamic Spotlight, Theme Switcher,
 * Tab Switcher, vCard Export, Clipboard & QR-Modal
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
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
  const tiltWrapper = document.getElementById('tiltWrapper');
  const tiltCard = document.getElementById('tiltCard');
  const ambientGlow = document.getElementById('ambientGlow');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const currentYearSpan = document.getElementById('currentYear');

  // Contact Information Constants
  const CONTACT = {
    firstName: 'Paul',
    lastName: 'Wiesinger',
    email: 'paul@wiesinga.at',
    website: 'https://paul.wiesinga.at',
    title: 'Software Developer & IT-Spezialist',
    location: 'Oberösterreich, Österreich'
  };

  // 1. Set current year
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // 2. Theme Management (Dark / Light with localStorage persistence)
  const savedTheme = localStorage.getItem('pw_theme') ||
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  setTheme(savedTheme);

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('pw_theme', theme);
  }

  function toggleTheme() {
    const currentTheme = html.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    showToast(`Design auf ${newTheme === 'dark' ? 'Dunkel' : 'Hell'} umgestellt`);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // 3. Ambient Background & 3D Tilt + Dynamic Spotlight
  let bounds;

  function updateBounds() {
    if (tiltCard) {
      bounds = tiltCard.getBoundingClientRect();
    }
  }

  window.addEventListener('resize', updateBounds);
  window.addEventListener('scroll', updateBounds);
  updateBounds();

  // Pointer movement tracking
  window.addEventListener('pointermove', (e) => {
    // Ambient page glow
    const xPct = Math.round((e.clientX / window.innerWidth) * 100);
    const yPct = Math.round((e.clientY / window.innerHeight) * 100);
    document.documentElement.style.setProperty('--mouse-x', `${xPct}%`);
    document.documentElement.style.setProperty('--mouse-y', `${yPct}%`);

    // 3D Card tilt (only on desktop / hover devices)
    if (window.matchMedia('(pointer: fine)').matches && tiltWrapper && tiltCard) {
      if (!bounds) updateBounds();
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const isInside = (
        mouseX >= bounds.left - 40 &&
        mouseX <= bounds.right + 40 &&
        mouseY >= bounds.top - 40 &&
        mouseY <= bounds.bottom + 40
      );

      if (isInside) {
        const leftX = mouseX - bounds.x;
        const topY = mouseY - bounds.y;
        const center = {
          x: leftX - bounds.width / 2,
          y: topY - bounds.height / 2
        };

        // Smooth subtle tilt angles (max ~6 degrees for elegant feel)
        const rotateX = -(center.y / (bounds.height / 2)) * 6;
        const rotateY = (center.x / (bounds.width / 2)) * 6;

        tiltWrapper.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;

        // Update spotlight on card
        tiltCard.style.setProperty('--card-mouse-x', `${leftX}px`);
        tiltCard.style.setProperty('--card-mouse-y', `${topY}px`);
      } else {
        tiltWrapper.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
      }
    }
  });

  if (tiltCard) {
    tiltCard.addEventListener('pointerleave', () => {
      if (tiltWrapper) {
        tiltWrapper.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
      }
    });
  }

  // 4. Tab Navigation
  tabButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      switchTab(btn);
    });
  });

  function switchTab(targetBtn) {
    const targetId = targetBtn.getAttribute('data-tab');

    tabButtons.forEach(b => b.classList.remove('active'));
    tabPanels.forEach(p => p.classList.remove('active'));

    targetBtn.classList.add('active');
    const activePanel = document.getElementById(targetId);
    if (activePanel) {
      activePanel.classList.add('active');
    }

    // Refresh bounds when card content height changes
    setTimeout(updateBounds, 100);
  }

  // 5. vCard Export (.vcf generation)
  if (downloadVCardBtn) {
    downloadVCardBtn.addEventListener('click', generateAndDownloadVCard);
  }

  function generateAndDownloadVCard() {
    const vCardData = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${CONTACT.lastName};${CONTACT.firstName};;;`,
      `FN:${CONTACT.firstName} ${CONTACT.lastName}`,
      `TITLE:${CONTACT.title}`,
      `EMAIL;TYPE=INTERNET,PREF:${CONTACT.email}`,
      `URL;TYPE=WORK:${CONTACT.website}`,
      `ADR;TYPE=HOME:;;;${CONTACT.location};;;`,
      'NOTE:Digitale Visitenkarte via paul.wiesinga.at',
      'REV:' + new Date().toISOString(),
      'END:VCARD'
    ].join('\r\n');

    const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${CONTACT.firstName.toLowerCase()}-${CONTACT.lastName.toLowerCase()}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('vCard-Kontaktdatei heruntergeladen! 📇');
  }

  // 6. Copy Email with feedback
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', copyEmail);
  }

  function copyEmail() {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(CONTACT.email)
        .then(() => triggerCopySuccess())
        .catch(() => fallbackCopy(CONTACT.email));
    } else {
      fallbackCopy(CONTACT.email);
    }
  }

  function fallbackCopy(text) {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand('copy');
      triggerCopySuccess();
    } catch (err) {
      showToast('Kopieren fehlgeschlagen.');
    }
    document.body.removeChild(tempInput);
  }

  function triggerCopySuccess() {
    if (copyBtnText) copyBtnText.textContent = 'Kopiert! ✓';
    showToast(`${CONTACT.email} in die Zwischenablage kopiert!`);
    setTimeout(() => {
      if (copyBtnText) copyBtnText.textContent = 'E-Mail kopieren';
    }, 2200);
  }

  // 7. QR-Code Modal
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

  // 8. Toast Notification Utility
  let toastTimer;
  function showToast(msg) {
    if (!toast) return;
    if (toastMessage) toastMessage.textContent = msg;

    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  // 9. Keyboard Shortcuts for power users
  window.addEventListener('keydown', (e) => {
    // Ignore keystrokes if an input or editable field is active
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    const key = e.key.toUpperCase();

    if (e.key === 'Escape') {
      closeModal();
    } else if (key === 'T') {
      toggleTheme();
    } else if (key === 'C') {
      copyEmail();
    } else if (key === 'V') {
      generateAndDownloadVCard();
    } else if (key === 'Q') {
      if (qrModal && qrModal.classList.contains('open')) {
        closeModal();
      } else {
        openModal();
      }
    } else if (['1', '2', '3', '4'].includes(e.key)) {
      const idx = parseInt(e.key, 10) - 1;
      if (tabButtons[idx]) {
        switchTab(tabButtons[idx]);
      }
    }
  });

  // Check if custom avatar exists (assets/avatar.jpg or avatar.png)
  const avatarImg = document.getElementById('profileImg');
  if (avatarImg) {
    const testImg = new Image();
    testImg.src = 'assets/avatar.jpg';
    testImg.onload = () => {
      avatarImg.src = 'assets/avatar.jpg';
    };
  }
});

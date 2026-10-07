// LockscreenGif — Client initialization script for redesigned UI
document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileNav();
  initActiveNavObserver();
  initLockScreenClock();
  initFaqAccordion();
  initCopyCommand();
  fetchLiveReleaseData();
});

/**
 * Sticky header blur and border state on scroll
 */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 15);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/**
 * Mobile navigation menu toggle
 */
function initMobileNav() {
  const header = document.querySelector('.site-header');
  const toggleBtn = document.getElementById('nav-toggle');
  const navList = document.getElementById('primary-nav');
  if (!toggleBtn || !header) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = header.classList.toggle('is-menu-open');
    toggleBtn.setAttribute('aria-expanded', String(isOpen));
  });

  if (navList) {
    navList.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        header.classList.remove('is-menu-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

/**
 * Active nav link indicator on scroll using IntersectionObserver
 */
function initActiveNavObserver() {
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-links .nav-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          const isMatch = href === `#${id}`;
          link.classList.toggle('is-active', isMatch);
        });
      }
    });
  }, { rootMargin: '-20% 0px -60% 0px' });

  sections.forEach(sec => observer.observe(sec));
}

/**
 * Lock screen live clock and date formatted to visitor's locale and updated each minute
 */
function initLockScreenClock() {
  const timeEl = document.getElementById('lockscreen-time');
  const dateEl = document.getElementById('lockscreen-date');
  if (!timeEl || !dateEl) return;

  function updateClock() {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
    timeEl.setAttribute('datetime', now.toISOString());

    dateEl.textContent = now.toLocaleDateString([], {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  }

  updateClock();
  const msToNextMinute = (60 - new Date().getSeconds()) * 1000;
  setTimeout(() => {
    updateClock();
    setInterval(updateClock, 60000);
  }, msToNextMinute);
}

/**
 * Interactive FAQ Accordion
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      
      // Close all others for clean accordion experience
      faqItems.forEach(other => {
        if (other !== item) other.classList.remove('is-open');
      });

      item.classList.toggle('is-open', !isOpen);
    });
  });
}

/**
 * Copy portable run command to clipboard
 */
function initCopyCommand() {
  const btn = document.getElementById('btn-copy-cmd');
  const code = document.getElementById('cmd-run');
  if (!btn || !code) return;

  btn.addEventListener('click', async () => {
    const textToCopy = code.textContent.trim();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const temp = document.createElement('textarea');
        temp.value = textToCopy;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }

      const originalHtml = btn.innerHTML;
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
      setTimeout(() => {
        btn.innerHTML = originalHtml;
      }, 2000);
    } catch (e) {
      // Ignore clipboard write failures
    }
  });
}

/**
 * Live GitHub release metadata check
 */
async function fetchLiveReleaseData() {
  try {
    const res = await fetch('https://api.github.com/repos/SubhamPro11/lockscreengtf/releases/latest');
    if (!res.ok) return;
    const release = await res.json();
    if (!release || !release.assets) return;

    const msiAsset = release.assets.find(a => a.name.endsWith('.msi'));
    const zipAsset = release.assets.find(a => a.name.endsWith('.zip'));

    if (msiAsset) {
      const heroBtn = document.getElementById('hero-btn-download');
      if (heroBtn) heroBtn.href = msiAsset.browser_download_url;
    }
  } catch (e) {
    // Graceful offline fallback
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initThemeSwitcher();
  initStickyHeader();
  initMobileNav();
  initActiveNavObserver();
  initCopyCommand();
  fetchLiveReleaseData();
});

function initThemeSwitcher() {
  const STORAGE_KEY = 'lockscreengtf-theme';
  const html = document.documentElement;
  const themeButtons = document.querySelectorAll('.theme-segmented-ctrl .theme-pill-btn');

  function getSystemPreference() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(themeChoice) {
    const effectiveTheme = themeChoice === 'system' ? getSystemPreference() : themeChoice;
    
    if (effectiveTheme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', effectiveTheme === 'dark' ? '#12110F' : '#EFEAE0');
    }

    themeButtons.forEach(btn => {
      const btnTheme = btn.getAttribute('data-theme');
      const isActive = btnTheme === themeChoice;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-checked', String(isActive));
    });
  }

  const savedTheme = localStorage.getItem(STORAGE_KEY) || 'system';
  applyTheme(savedTheme);

  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const chosenTheme = btn.getAttribute('data-theme');
      if (!chosenTheme) return;
      localStorage.setItem(STORAGE_KEY, chosenTheme);
      applyTheme(chosenTheme);
    });
  });

  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      const currentChoice = localStorage.getItem(STORAGE_KEY) || 'system';
      if (currentChoice === 'system') {
        applyTheme('system');
      }
    });
  }
}

function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 15);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initMobileNav() {
  const toggleBtn = document.getElementById('nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  if (!toggleBtn || !mobileNav) return;

  const openIcon = toggleBtn.querySelector('.menu-open-icon');
  const closeIcon = toggleBtn.querySelector('.menu-close-icon');

  toggleBtn.addEventListener('click', () => {
    const isHidden = mobileNav.classList.toggle('hidden');
    const isOpen = !isHidden;
    toggleBtn.setAttribute('aria-expanded', String(isOpen));
    if (openIcon) openIcon.classList.toggle('hidden', isOpen);
    if (closeIcon) closeIcon.classList.toggle('hidden', !isOpen);
  });

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.add('hidden');
      toggleBtn.setAttribute('aria-expanded', 'false');
      if (openIcon) openIcon.classList.remove('hidden');
      if (closeIcon) closeIcon.classList.add('hidden');
    });
  });
}

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
          link.classList.toggle('is-active', href === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-20% 0px -60% 0px' });

  sections.forEach(sec => observer.observe(sec));
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;opacity:0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  ta.remove();
  return Promise.resolve();
}

function copyToClipboard(text) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  }
  return fallbackCopy(text);
}

function initCopyCommand() {
  const buttons = document.querySelectorAll('.btn-copy-code');
  buttons.forEach(btn => {
    const targetId = btn.getAttribute('data-copy-target');
    const code = document.getElementById(targetId);
    if (!code) return;

    const copyIcon = btn.querySelector('.copy-icon');
    const checkIcon = btn.querySelector('.check-icon');
    const defaultLabel = btn.getAttribute('aria-label') || 'Copy command';

    btn.addEventListener('click', async () => {
      const textToCopy = code.textContent.trim();
      try {
        await copyToClipboard(textToCopy);
      } catch (_) {}
      if (copyIcon) copyIcon.classList.add('hidden');
      if (checkIcon) checkIcon.classList.remove('hidden');
      btn.classList.add('is-copied');
      btn.setAttribute('aria-label', 'Command copied to clipboard');
      setTimeout(() => {
        if (copyIcon) copyIcon.classList.remove('hidden');
        if (checkIcon) checkIcon.classList.add('hidden');
        btn.classList.remove('is-copied');
        btn.setAttribute('aria-label', defaultLabel);
      }, 2000);
    });
  });
}

function isSafeReleaseUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && 
      (parsed.hostname === 'github.com' || parsed.hostname.endsWith('.github.com') || parsed.hostname === 'objects.githubusercontent.com');
  } catch {
    return false;
  }
}

async function fetchLiveReleaseData() {
  try {
    const res = await fetch('https://api.github.com/repos/SubhamPro11/lockscreengtf/releases/latest');
    if (!res.ok) return;
    const release = await res.json();
    if (!release?.assets) return;

    const msi = release.assets.find(a => a.name.endsWith('.msi'))?.browser_download_url;
    if (msi && isSafeReleaseUrl(msi)) {
      ['hero-btn-download', 'nav-download-btn', 'req-btn-msi'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.href = msi;
      });
    }
    const zip = release.assets.find(a => a.name.endsWith('.zip'))?.browser_download_url;
    if (zip && isSafeReleaseUrl(zip)) {
      ['hero-btn-zip', 'req-btn-zip'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.href = zip;
      });
    }
  } catch (_) {}
}

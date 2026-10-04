// LockscreenGif — Client initialization script
document.addEventListener('DOMContentLoaded', () => {
  initDevMode();
  initMobileNav();
  initStickyHeader();
  initActiveNavObserver();
  initScreenshotsVisibility();
  detectOperatingSystem();
  initDemoVideo();
  initLockScreenClock();
  initInstallTabs();
  initVerifyCopy();
  fetchLiveReleaseData();
});

/**
 * Sticky header: gains 1px bottom border only after scroll, and reveals quick download action
 */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  const hero = document.getElementById('download');
  const stickyBtn = document.getElementById('nav-sticky-download');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (hero && stickyBtn) {
    const observer = new IntersectionObserver(([entry]) => {
      stickyBtn.classList.toggle('is-visible', !entry.isIntersecting);
    }, { threshold: 0.1 });
    observer.observe(hero);
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
  }, { rootMargin: '-20% 0px -65% 0px' });

  sections.forEach(sec => observer.observe(sec));
}

/**
 * Enable developer placeholders if URL contains ?dev
 */
function initDevMode() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.has('dev')) {
      document.body.classList.add('is-dev-mode');
    }
  } catch (e) {
    // Ignore URL parsing errors
  }
}

/**
 * Setup copy-to-clipboard for PowerShell hash verification command
 */
function initVerifyCopy() {
  const btn = document.getElementById('btn-copy-verify');
  const code = document.getElementById('verify-cmd');
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

      btn.classList.add('is-copied');
      const copyTextEl = btn.querySelector('.copy-text');
      if (copyTextEl) copyTextEl.textContent = 'Copied!';
      setTimeout(() => {
        btn.classList.remove('is-copied');
        if (copyTextEl) copyTextEl.textContent = 'Copy the command';
      }, 2000);
    } catch (err) {
      const copyTextEl = btn.querySelector('.copy-text');
      if (copyTextEl) copyTextEl.textContent = 'Press Ctrl+C';
      setTimeout(() => {
        if (copyTextEl) copyTextEl.textContent = 'Copy the command';
      }, 2000);
    }
  });
}

/**
 * Probe screenshot assets: if both images exist, show the section and reveal images.
 * If in ?dev mode, show intentional mockups. Otherwise keep section completely hidden from visitors.
 */
function initScreenshotsVisibility() {
  const section = document.getElementById('preview');
  if (!section) return;

  const isDev = document.body.classList.contains('is-dev-mode');
  if (isDev) {
    section.removeAttribute('data-needs-assets');
    return;
  }

  const img1 = new Image();
  const img2 = new Image();
  let loaded = 0;

  const onLoaded = () => {
    loaded++;
    if (loaded === 2) {
      section.removeAttribute('data-needs-assets');
      const el1 = document.getElementById('img-shot-choose');
      const el2 = document.getElementById('img-shot-editor');
      const mock1 = document.getElementById('mockup-shot-choose');
      const mock2 = document.getElementById('mockup-shot-editor');
      if (el1) el1.style.display = 'block';
      if (el2) el2.style.display = 'block';
      if (mock1) mock1.style.display = 'none';
      if (mock2) mock2.style.display = 'none';
    }
  };

  img1.onload = onLoaded;
  img2.onload = onLoaded;
  img1.src = 'assets/shot-choose.png';
  img2.src = 'assets/shot-editor.png';
}

/**
 * Fetch latest release from GitHub API with 10-minute sessionStorage caching.
 * Progressive enhancement: silently falls back to direct releases URL on any error.
 */
function fetchLiveReleaseData() {
  const REPO = 'SubhamPro11/lockscreengtf';
  const API_URL = `https://api.github.com/repos/${REPO}/releases?per_page=1`;
  const CACHE_KEY = 'lockscreengif_latest_release';
  const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  // Elements
  const btnMsi = document.getElementById('btn-download-msi');
  const btnZip = document.getElementById('btn-download-zip');
  const metaMsi = document.getElementById('msi-meta');
  const metaZip = document.getElementById('zip-meta');
  const tabMsiMeta = document.getElementById('tab-msi-meta');
  const tabZipMeta = document.getElementById('tab-zip-meta');
  const secBtnMsi = document.getElementById('sec-btn-msi');
  const secBtnZip = document.getElementById('sec-btn-zip');
  const secMsiSize = document.getElementById('sec-msi-size');
  const secZipSize = document.getElementById('sec-zip-size');
  const verifyCmd = document.getElementById('verify-cmd');
  const releaseBar = document.getElementById('release-info-bar');
  const tagEl = document.getElementById('release-tag-name');
  const dateEl = document.getElementById('release-date');
  const prereleaseBadge = document.getElementById('release-prerelease-badge');
  const shaLink = document.getElementById('link-sha256sums');

  // Try reading from sessionStorage
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_TTL && parsed.data) {
        applyReleaseData(parsed.data);
        return;
      }
    }
  } catch (e) {
    // Ignore storage errors (e.g. private mode restrictions)
  }

  // Network fetch using the list endpoint to capture pre-releases published by CI
  fetch(API_URL, {
    headers: { 'Accept': 'application/vnd.github.v3+json' }
  })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      if (!Array.isArray(data) || data.length === 0) return;
      const release = data[0];

      // Cache successful response
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          timestamp: Date.now(),
          data: release
        }));
      } catch (e) {
        // Ignore cache storage errors
      }

      applyReleaseData(release);
    })
    .catch(() => {
      // Silent failure: preserve default fallback links to github.com/.../releases
    });

  function applyReleaseData(release) {
    if (!release || !Array.isArray(release.assets)) return;

    const assets = release.assets;
    const msiAsset = assets.find(a => a.name && a.name.toLowerCase().endsWith('.msi'));
    const zipAsset = assets.find(a => a.name && a.name.toLowerCase().endsWith('.zip'));
    const shaAsset = assets.find(a => a.name && (a.name === 'SHA256SUMS' || a.name.endsWith('.sha256')));

    // Update MSI button and tab metadata
    if (msiAsset) {
      if (btnMsi) {
        btnMsi.href = msiAsset.browser_download_url;
        if (metaMsi && msiAsset.size) {
          metaMsi.textContent = `(${formatBytes(msiAsset.size)})`;
        }
      }
      if (tabMsiMeta && msiAsset.size) {
        tabMsiMeta.textContent = `${release.tag_name || '.msi'}, ${formatBytes(msiAsset.size)}`;
      }
      if (secBtnMsi) {
        secBtnMsi.href = msiAsset.browser_download_url;
        if (secMsiSize && msiAsset.size) {
          const tagPrefix = release.tag_name ? `${release.tag_name} ` : '';
          secMsiSize.textContent = `${tagPrefix}(${formatBytes(msiAsset.size)})`;
        }
      }
      if (verifyCmd && msiAsset.name) {
        verifyCmd.textContent = `Get-FileHash .\\${msiAsset.name} -Algorithm SHA256`;
      }
    }

    // Update ZIP button and tab metadata
    if (zipAsset) {
      if (btnZip) {
        btnZip.href = zipAsset.browser_download_url;
        if (metaZip && zipAsset.size) {
          metaZip.textContent = `(${formatBytes(zipAsset.size)})`;
        }
      }
      if (tabZipMeta && zipAsset.size) {
        tabZipMeta.textContent = `${release.tag_name || '.zip'}, ${formatBytes(zipAsset.size)}`;
      }
      if (secBtnZip) {
        secBtnZip.href = zipAsset.browser_download_url;
        if (secZipSize && zipAsset.size) {
          const tagPrefix = release.tag_name ? `${release.tag_name} ` : '';
          secZipSize.textContent = `${tagPrefix}(${formatBytes(zipAsset.size)})`;
        }
      }
    }

    // Update SHA256SUMS link if present
    if (shaAsset && shaLink) {
      shaLink.href = shaAsset.browser_download_url;
    }

      // Render hero summary line as a natural sentence (no middle dots)
      const summaryLine = document.getElementById('hero-summary-line');
      if (summaryLine && release.tag_name) {
        let dateStr = '';
        if (release.published_at) {
          const dateObj = new Date(release.published_at);
          dateStr = dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
        }

        const msiSizeStr = msiAsset && msiAsset.size ? formatBytes(msiAsset.size) : '';
        const zipSizeStr = zipAsset && zipAsset.size ? formatBytes(zipAsset.size) : '';

        const details = [];
        if (dateStr) details.push(dateStr);
        if (msiSizeStr && zipSizeStr) {
          details.push(`${msiSizeStr} MSI, ${zipSizeStr} portable ZIP`);
        } else if (msiSizeStr) {
          details.push(`${msiSizeStr} MSI`);
        }

        const detailsStr = details.length ? ` (${details.join(', ')})` : '';

        summaryLine.innerHTML = `LockscreenGif ${release.tag_name}${detailsStr} requires 64-bit Windows 11 24H2 or later and the <a href="https://dotnet.microsoft.com/download/dotnet/10.0" target="_blank" rel="noopener noreferrer">.NET 10 Desktop Runtime</a>.`;
      }
    }
  }

  function formatBytes(bytes) {
    if (!bytes || bytes <= 0) return '';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
  }
}

/**
 * Installation method tab switcher (MSI vs Portable ZIP)
 * Fully keyboard accessible (Arrow keys, Home, End, Enter, Space)
 */
function initInstallTabs() {
  const switcher = document.getElementById('install-switcher');
  if (!switcher) return;

  // Enable JS-enhanced tabs mode
  switcher.classList.add('js-tabs-enabled');

  const tabButtons = switcher.querySelectorAll('[role="tab"]');
  const tabPanels = switcher.querySelectorAll('[role="tabpanel"]');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      selectTab(btn);
    });

    btn.addEventListener('keydown', (e) => {
      const tabs = Array.from(tabButtons);
      const index = tabs.indexOf(btn);

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (index + 1) % tabs.length;
        tabs[nextIndex].focus();
        selectTab(tabs[nextIndex]);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = (index - 1 + tabs.length) % tabs.length;
        tabs[prevIndex].focus();
        selectTab(tabs[prevIndex]);
      }
    });
  });

  function selectTab(selectedBtn) {
    const targetPanelId = selectedBtn.getAttribute('aria-controls');

    tabButtons.forEach(btn => {
      const isSelected = btn === selectedBtn;
      btn.setAttribute('aria-selected', String(isSelected));
      btn.setAttribute('tabindex', isSelected ? '0' : '-1');
    });

    tabPanels.forEach(panel => {
      if (panel.id === targetPanelId) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
    });
  }
}

/**
 * Mobile navigation collapse handler
 */
function initMobileNav() {
  const toggleBtn = document.getElementById('nav-toggle');
  const navList = document.getElementById('primary-nav');

  if (!toggleBtn || !navList) return;

  toggleBtn.addEventListener('click', () => {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', String(!isExpanded));
    navList.classList.toggle('is-open', !isExpanded);
  });

  // Close nav when clicking a link
  navList.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggleBtn.setAttribute('aria-expanded', 'false');
      navList.classList.remove('is-open');
    });
  });
}

/**
 * Detect non-Windows operating systems and display a quiet advisory
 */
function detectOperatingSystem() {
  const osNotice = document.getElementById('os-notice');
  if (!osNotice) return;

  const userAgent = navigator.userAgent || '';
  const isWindows = /Windows/i.test(userAgent);

  // If definitely not Windows, show the quiet notice
  if (!isWindows && userAgent.length > 0) {
    osNotice.removeAttribute('hidden');
  }
}

/**
 * Lock screen demo video playback handling
 */
function initDemoVideo() {
  const video = document.getElementById('hero-demo-video');
  if (!video) return;

  video.addEventListener('canplay', () => {
    video.play().catch(() => {});
  });

  video.addEventListener('error', () => {
    // If video fails or assets/demo.mp4 doesn't exist, keep serene still backdrop
    video.style.display = 'none';
  });
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
    // Time in visitor's locale format without seconds
    timeEl.textContent = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
    timeEl.setAttribute('datetime', now.toISOString());

    // Date in visitor's locale format: weekday, month, day
    dateEl.textContent = now.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  }

  updateClock();
  // Check every 10 seconds so clock flips accurately with system minute
  setInterval(updateClock, 10000);
}

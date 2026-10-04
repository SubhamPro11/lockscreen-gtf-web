// LockscreenGif — Client initialization script
document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  detectOperatingSystem();
  initDemoVideo();
  initInstallTabs();
  fetchLiveReleaseData();
});

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

    // Update MSI button
    if (msiAsset && btnMsi) {
      btnMsi.href = msiAsset.browser_download_url;
      if (metaMsi && msiAsset.size) {
        metaMsi.textContent = `(${formatBytes(msiAsset.size)})`;
      }
    }

    // Update ZIP button
    if (zipAsset && btnZip) {
      btnZip.href = zipAsset.browser_download_url;
      if (metaZip && zipAsset.size) {
        metaZip.textContent = `(${formatBytes(zipAsset.size)})`;
      }
    }

    // Update SHA256SUMS link if present
    if (shaAsset && shaLink) {
      shaLink.href = shaAsset.browser_download_url;
    }

    // Render release bar metadata
    if (releaseBar && release.tag_name) {
      if (tagEl) tagEl.textContent = release.tag_name;
      if (dateEl && release.published_at) {
        const dateObj = new Date(release.published_at);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        dateEl.textContent = `· ${formattedDate}`;
      }

      // Pre-release indicator
      if (prereleaseBadge) {
        if (release.prerelease) {
          prereleaseBadge.removeAttribute('hidden');
        } else {
          prereleaseBadge.setAttribute('hidden', '');
        }
      }

      releaseBar.removeAttribute('hidden');
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
 * Demo video playback & placeholder handling
 */
function initDemoVideo() {
  const video = document.getElementById('hero-demo-video');
  const placeholder = document.getElementById('hero-demo-placeholder');

  if (!video || !placeholder) return;

  video.addEventListener('canplay', () => {
    placeholder.style.display = 'none';
  });

  video.addEventListener('error', () => {
    // Keep placeholder visible if assets/demo.mp4 is missing or fails to decode
    placeholder.style.display = 'flex';
  });
}

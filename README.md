# LockscreenGif — Official Web Portal

[![License: MIT](https://img.shields.io/badge/License-MIT-c9a66b.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows%2011%2024H2%2B%20(x64)-1c1f23.svg?logo=windows&logoColor=d9d4c7)](https://github.com/SubhamPro11/lockscreengtf)
[![Runtime](https://img.shields.io/badge/.NET-10%20Desktop%20Runtime-7f9a8a.svg?logo=dotnet&logoColor=15171a)](https://dotnet.microsoft.com/download/dotnet/10.0)
[![Deployment](https://img.shields.io/badge/Deployed%20on-Cloudflare%20Workers-f38020.svg?logo=cloudflare&logoColor=white)](https://lockscreen-gtf-web.morbius.workers.dev/)
[![Lighthouse Accessibility](https://img.shields.io/badge/Lighthouse-100%2F100%20A11y-7f9a8a.svg)](https://lockscreen-gtf-web.morbius.workers.dev/)

The official landing, documentation, and distribution website for **LockscreenGif** — a lightweight Windows utility that brings animated GIFs and video loops to the Windows 11 lock screen without running background daemons or resident background processes.

🌐 **Live Website**: [https://lockscreen-gtf-web.morbius.workers.dev](https://lockscreen-gtf-web.morbius.workers.dev)

---

## Overview

Windows Settings natively restricts lock screen backgrounds to static image files. **LockscreenGif** bypasses this restriction by writing animation frames directly into the protected Windows lock screen image cache (`SystemData`) through a one-time elevated helper service.

Once the animation frames are committed, the main application closes completely. The Windows Desktop Compositor handles loop playback natively at zero ongoing CPU/RAM cost.

### Core Utility Specifications
- **Operating System:** Windows 11 24H2+ (Build 26100+, x64 only).
- **Runtime & UI Framework:** Microsoft .NET 10 Desktop Runtime (x64), WinUI 3 / Windows App SDK, and CommunityToolkit.Mvvm.
- **Supported Formats:** `.gif`, `.mp4`, `.webm`, `.avi`, `.mov`, `.mkv` (video trimming, frame rate adjustments, and color quantization powered by FFmpeg & Gifski).
- **Diagnostics & Recovery:** Built-in Diagnostics suite with ETW trace validation, 5s live test countdown, sanitized ZIP bundle export, and one-click removal under `Settings > Remove Animated Lockscreen`.
- **Security & Privileges:** Standard user space operation; one-time UAC elevation only when committing frames to system cache.

---

## Web Portal Architecture & Engineering

This website is engineered as a high-performance, accessible static web application built without heavy front-end frameworks or third-party tracking scripts.

```text
lockscreen-gif/
├── index.html          # Semantic HTML5 landing page with schema & accessible landmarks
├── 404.html            # Zero-dependency 404 fallback page
├── css/
│   └── style.css       # Vintage instrument panel design system (pure vanilla CSS)
├── js/
│   └── main.js         # Lightweight client logic (<5KB: live releases, nav, clipboard)
├── fonts/              # Self-hosted WOFF2 fonts (IBM Plex Mono & Instrument Sans)
├── assets/             # Real media assets (demo.mp4 loop, lockscreen-preview.gif)
├── wrangler.jsonc      # Cloudflare Workers static assets deployment configuration
├── package.json        # Project scripts & development dependencies
├── robots.txt          # Search engine crawler directives
└── sitemap.xml         # Canonical search engine sitemap
```

### Design Identity: Vintage Instrument Panel
The visual identity reflects a precision cockpit/laboratory instrument panel:
- **Chassis Background:** `#15171a` (deep milled graphite).
- **Panel Surface:** `#1c1f23` (recessed slate cards and terminal blocks).
- **Metal Seam Borders:** `#30343a` (hairline framing).
- **Dial Typography:** `#d9d4c7` (warm ivory dial text, 11+:1 contrast ratio).
- **Muted Legends:** `#8d8f8a` (secondary dial markings and subtext).
- **Primary Accent:** `#c9a66b` (dull antique brass controls — zero neon).
- **Secondary Accent:** `#7f9a8a` (cockpit gauge indicator grey-green).

### Performance & Accessibility Standards
- **Score:** 100/100 Lighthouse Accessibility compliance.
- **Payload:** `< 5KB` JavaScript (`js/main.js`), zero framework dependencies.
- **Privacy:** Self-hosted WOFF2 typography (`IBM Plex Mono` for technical readouts, `Instrument Sans` for prose); zero external Google Fonts or telemetry tracking calls.
- **Keyboard Navigation:** Explicit visible focus rings, skip-to-content links, and fully navigable disclosure widgets (`<details>`).

---

## Local Development

Preview the web portal locally using Node or Python:

```bash
# Clone the repository
git clone https://github.com/SubhamPro11/lockscreen-gtf-web.git
cd lockscreen-gtf-web

# Run local dev server (Node.js)
npm run dev

# Or with Python 3
python -m http.server 3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment to Cloudflare Workers

The portal is deployed globally on Cloudflare's edge network using Static Assets on Cloudflare Workers:

```bash
# Preview on local Workers simulator
npm run preview

# Deploy to Cloudflare Workers production
npm run deploy
```

Configuration is defined in [`wrangler.jsonc`](wrangler.jsonc) pointing to the root directory for static asset delivery.

---

## Checksum Verification

To verify the integrity of the downloaded MSI package against official release hashes:

```powershell
Get-FileHash .\LockscreenGif-*-x64.msi -Algorithm SHA256
```

Compare the resulting SHA256 string against the published hash in the [GitHub Releases](https://github.com/SubhamPro11/lockscreengtf/releases) notes.

---

## Lineage & Acknowledgements

- **Original Application Implementation:** [Leapward-Koex / LockscreenGif](https://github.com/Leapward-Koex/LockscreenGif).
- **Repository Maintenance & Distribution:** [SubhamPro11 / lockscreengtf](https://github.com/SubhamPro11/lockscreengtf).
- **UI & Architecture Frameworks:** [WinUI 3 / Windows App SDK](https://github.com/microsoft/WindowsAppSDK) & [CommunityToolkit.Mvvm](https://github.com/CommunityToolkit/dotnet).
- **Media Transcoding Tooling:** [FFmpeg](https://www.ffmpeg.org/) and [Gifski](https://gif.ski/).

---

## License

Distributed under the [MIT License](LICENSE).

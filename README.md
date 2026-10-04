# LockscreenGif — Download Website

Static download landing page for **LockscreenGif**, a lightweight Windows desktop utility that sets animated GIFs and videos as the Windows 11 lock screen by writing directly to the protected Windows lock screen image cache.

## Project Structure

```text
lockscreen-gif/
├── index.html        # Main semantic landing page (accessible landmarks, schema, Open Graph)
├── css/
│   └── style.css     # Design system (navy #0a0e14, lime #39FF14, modular type & spacing tokens)
├── js/
│   └── main.js       # Live GitHub releases fetcher (10m cache), tab switcher, OS detection
├── assets/           # Media folder for video demo and workflow screenshots
├── robots.txt        # Search crawler directives
└── sitemap.xml       # Canonical XML sitemap
```

## Running Locally

No build step or node package installation is required. You can preview the website with any static file server:

```powershell
# Using Python
python -m http.server 3000

# Or using Node (npx)
npx serve .
```

Then navigate to `http://localhost:3000/` in your browser.

## Adding Real Media Captures

Place the following files in the `assets/` directory to replace the dashed placeholder frames:

1. **`assets/demo.mp4`** & **`assets/poster.jpg`**:
   Compress `Demos/Video Example.mp4` using FFmpeg:
   ```bash
   ffmpeg -i "Demos/Video Example.mp4" -c:v libx264 -crf 26 -preset slow -an -movflags +faststart assets/demo.mp4
   ffmpeg -ss 00:00:01 -i "Demos/Video Example.mp4" -vframes 1 -q:v 2 assets/poster.jpg
   ```
2. **`assets/shot-choose.png`**: Screenshot of the file selection view.
3. **`assets/shot-editor.png`**: Screenshot of the video trimmer/timeline editor view.

## Live Release Data

The client script ([`js/main.js`](js/main.js)) queries:
`https://api.github.com/repos/SubhamPro11/lockscreengtf/releases?per_page=1`

- Automatically maps the latest `.msi`, `.zip`, and `SHA256SUMS` download links to the primary and secondary download buttons.
- Caches the release response in `sessionStorage` for 10 minutes to respect GitHub API rate limits.
- Silently falls back to direct repository release links if offline or unauthenticated rate limits occur.

## Attribution & License

- Original software architecture and implementation: [Leapward-Koex](https://github.com/Leapward-Koex/LockscreenGif).
- Repository distribution and website maintenance: [SubhamPro11](https://github.com/SubhamPro11/lockscreengtf).
- Video and animation processing: [FFmpeg](https://www.ffmpeg.org/) and [Gifski](https://gif.ski/).
- Licensed under the [MIT License](https://opensource.org/licenses/MIT).

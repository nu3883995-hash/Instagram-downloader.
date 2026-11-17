# Instagram Public Video Downloader

A self-hosted Node.js app for downloading publicly accessible Instagram Reels/posts that you own or have permission to save. It does not bypass private accounts, login walls, or other access controls.

## Run locally

Requirements: Node.js 18+, yt-dlp, and FFmpeg.

```bash
npm install
npm start
```

Open http://localhost:3000.

## Deploy free on Render (Docker)

1. Create a GitHub repository and upload the contents of this folder (including `Dockerfile`).
2. In Render, choose **New > Web Service**, connect the GitHub repository, and select the **Free** plan.
3. Choose **Docker** as the runtime. Leave build/start commands blank so Render uses the included Dockerfile.
4. Create the service and wait for the deploy to finish. Render will provide an `onrender.com` URL.
5. Open `https://YOUR-SERVICE.onrender.com/health`; a healthy app returns `{"ok":true}`.

Free Render services can sleep after inactivity, have limited resources, and are intended for testing/hobby projects rather than production. Video processing may be slow or exceed free resource limits.

## Notes

- Instagram may change its service and public downloads may stop working without notice.
- The app intentionally does not accept cookies or credentials and cannot download private/login-restricted content.
- Download only content you own or have permission to save. Review applicable law, copyright, and Instagram's terms.
- Before seeking advertising, add substantial original, useful content and clear About, Contact, Privacy, and Terms pages. A downloader alone does not guarantee advertising approval.

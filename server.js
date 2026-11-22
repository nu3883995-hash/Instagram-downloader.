const express = require("express");
const { execFile } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { promisify } = require("util");

const app = express();
const execFileAsync = promisify(execFile);
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10kb" }));

app.get("/robots.txt", (req, res) => {
  res.type("text/plain").send(
    "User-agent: *\nAllow: /\n\nSitemap: https://instagram-downloader-2-7ct4.onrender.com/sitemap.xml\n"
  );
});

app.use(express.static(__dirname));
const activeDownloads = new Set();

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

function validInstagramUrl(value) {
  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" &&
      ["instagram.com", "www.instagram.com"].includes(url.hostname) &&
      /^\/(reel|reels|p|tv)\/[A-Za-z0-9_-]+\/?/.test(url.pathname)
    );
  } catch {
    return false;
  }
}

app.post("/api/download", async (req, res) => {
  const url = req.body?.url;

  if (typeof url !== "string" || !validInstagramUrl(url)) {
    return res.status(400).json({
      error: "Please enter a valid public Instagram Reel or post URL."
    });
  }

  if (activeDownloads.size >= 2) {
    return res.status(429).json({
      error: "The server is busy. Please try again shortly."
    });
  }

  const jobId = crypto.randomUUID();
  const folder = path.join(os.tmpdir(), `ig-${jobId}`);
  activeDownloads.add(jobId);

  try {
    fs.mkdirSync(folder, { recursive: true });

    const output = path.join(folder, "video.%(ext)s");

    await execFileAsync(
      "yt-dlp",
      [
        "--no-playlist",
        "--no-warnings",
        "--restrict-filenames",
        "-f", "best[ext=mp4]/best",
        "--merge-output-format", "mp4",
        "-o", output,
        "--max-filesize", "100M",
        "--socket-timeout", "20",
        "--retries", "1",
        url
      ],
      {
        timeout: 120000,
        maxBuffer: 2 * 1024 * 1024
      }
    );

    const files = fs.readdirSync(folder);
    const video = files.find(file =>
      /\.(mp4|webm|mov|mkv)$/i.test(file)
    );

    if (!video) {
      throw new Error("No downloadable video was found.");
    }

    const filePath = path.join(folder, video);

    res.download(filePath, "instagram-video.mp4", () => {
      fs.rmSync(folder, { recursive: true, force: true });
      activeDownloads.delete(jobId);
    });

    res.on("close", () => {
      fs.rmSync(folder, { recursive: true, force: true });
      activeDownloads.delete(jobId);
    });

  } catch (error) {
    console.error("Download error:", error.message);

    fs.rmSync(folder, { recursive: true, force: true });
    activeDownloads.delete(jobId);

    if (!res.headersSent) {
      res.status(500).json({
        error: "Download unavailable. The post may be private, restricted, or unsupported. Please try again later."
      });
    }
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Instagram Downloader running on port ${PORT}`);
});
    

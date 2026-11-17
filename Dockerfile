
FROM node:20-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg python3 python3-pip ca-certificates \
    && pip3 install --break-system-packages --no-cache-dir yt-dlp \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY instagram-downloader/package*.json ./

RUN npm install --omit=dev

COPY instagram-downloader/ ./

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]

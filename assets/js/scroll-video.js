/* =========================================
   CYBERCITY 2050 — SCROLL VIDEO ANIMATION
   Apple-style scroll-bound frame animation
   ========================================= */

const ScrollVideo = {
  canvas: null,
  ctx: null,
  frames: [],
  totalFrames: 7,
  currentFrame: 0,
  isLoaded: false,

  frameFiles: [
    "assets/images/frame01.png",
    "assets/images/frame02.png",
    "assets/images/frame03.png",
    "assets/images/frame04.png",
    "assets/images/frame05.png",
    "assets/images/frame06.png",
    "assets/images/frame07.png",
  ],

  frameCaptions: [
    { label: "CYBERCITY 2050", title: "Dawn breaks over the city of tomorrow" },
    { label: "SOLAR AWAKENING", title: "Clean energy powers 8.4 million lives" },
    { label: "SMART MOBILITY", title: "AI-managed transport flows seamlessly" },
    { label: "PEAK EFFICIENCY", title: "100% renewable. Zero emissions." },
    { label: "CITY SYSTEMS", title: "Every building, road and park — connected" },
    { label: "GOLDEN HOUR", title: "A sustainable city thrives at every hour" },
    { label: "CITY AT REST", title: "Smart systems never sleep. Citizens do." },
  ],

  init() {
    this.canvas = document.getElementById("scroll-canvas");
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
    this.preloadFrames().then(() => {
      this.isLoaded = true;
      this.drawFrame(0);
    });
    window.addEventListener("scroll", () => this.onScroll());
  },

  resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    if (this.isLoaded && this.frames[this.currentFrame]) {
      this.drawFrame(this.currentFrame);
    }
  },

  preloadFrames() {
    const promises = this.frameFiles.map((src, i) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          this.frames[i] = img;
          resolve();
        };
        img.onerror = () => resolve();
        img.src = src;
      });
    });
    return Promise.all(promises);
  },

  drawFrame(index) {
    if (!this.ctx || !this.frames[index]) return;
    const img = this.frames[index];
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const sw = img.naturalWidth * scale;
    const sh = img.naturalHeight * scale;
    const sx = (cw - sw) / 2;
    const sy = (ch - sh) / 2;
    this.ctx.clearRect(0, 0, cw, ch);
    this.ctx.drawImage(img, sx, sy, sw, sh);
    // dark overlay
    this.ctx.fillStyle = "rgba(8,11,15,0.45)";
    this.ctx.fillRect(0, 0, cw, ch);
    this.currentFrame = index;
    // update caption
    this.updateCaption(index);
  },

  updateCaption(index) {
    const cap = this.frameCaptions[index];
    if (!cap) return;
    const labelEl = document.getElementById("scroll-label");
    const titleEl = document.getElementById("scroll-title");
    const textWrap = document.getElementById("scroll-text-wrap");
    if (labelEl) labelEl.textContent = cap.label;
    if (titleEl) titleEl.textContent = cap.title;
    if (textWrap) textWrap.classList.add("visible");
  },

  onScroll() {
    const section = document.getElementById("scroll-video-section");
    if (!section || !this.isLoaded) return;
    const rect = section.getBoundingClientRect();
    const sectionH = section.offsetHeight;
    const scrolled = -rect.top;
    const progress = Math.min(Math.max(scrolled / (sectionH - window.innerHeight), 0), 1);
    const frameIndex = Math.min(
      Math.floor(progress * this.totalFrames),
      this.totalFrames - 1
    );
    if (frameIndex !== this.currentFrame) {
      this.drawFrame(frameIndex);
    }
  },
};

document.addEventListener("DOMContentLoaded", () => ScrollVideo.init());

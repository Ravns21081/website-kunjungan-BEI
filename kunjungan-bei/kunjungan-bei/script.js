/* =====================================================
   PENGATURAN — ubah bagian ini saja untuk menyesuaikan isi web
   ===================================================== */
const CONFIG = {
  judulBaris1: "Bursa Efek",
  judulBaris2: "Indonesia",
  subjudul: "Catatan dan dokumentasi kunjungan industri untuk mengenal pasar modal Indonesia secara langsung.",
  tanggal: "Isi tanggal kunjungan",
  instansi: "Nama sekolah / kampus / kelompok",
  lokasi: "Gedung BEI, SCBD, Jakarta",
  kutipan: "“Investasi terbaik dimulai dari pengetahuan.”",

  // Foto latar bagian atas (kosongkan "" jika tidak ingin memakai foto)
  hero: "images/hero.jpg",

  // CARA GANTI FOTO:
  // 1) Salin foto Anda ke folder "images"
  // 2) Samakan nama file dengan "src" di bawah (atau ubah "src"-nya)
  // 3) Ubah "caption" sesuai keterangan foto. Tambah/hapus baris sesuka Anda.
  foto: [
    { src: "images/foto-1.jpg", caption: "Memaparkan Pasar Saham Live" },
    { src: "images/foto-2.jpg", caption: "Pemaparan materi pasar modal" },
    { src: "images/foto-3.jpg", caption: "Suasana ruang presentasi" },
    { src: "images/foto-4.jpg", caption: "Menuju gedung BEI" },
    { src: "images/foto-5.jpg", caption: "Sesi tanya jawab dengan narasumber" },
  ]
};

/* =====================================================
   KODE PROGRAM — tidak perlu diubah
   ===================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const STORE = "bei_foto_";

/* Isi teks dari CONFIG */
$$("[data-cfg]").forEach(el => { const v = CONFIG[el.dataset.cfg]; if (v) el.textContent = v; });
$("#year").textContent = new Date().getFullYear();

/* Foto cadangan jika file belum ada */
function placeholder(i) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#142245"/><stop offset="1" stop-color="#4a0d1d"/></linearGradient></defs>
  <rect width="800" height="600" fill="url(#g)"/>
  <g stroke="#ffffff22" stroke-width="2"><path d="M0 450 L120 380 L220 410 L330 300 L430 340 L560 200 L680 240 L800 120" fill="none"/></g>
  <text x="400" y="290" fill="#fff" font-family="Arial" font-size="40" text-anchor="middle" font-weight="700">Foto ${i + 1}</text>
  <text x="400" y="335" fill="#ffffffaa" font-family="Arial" font-size="22" text-anchor="middle">Letakkan file di folder images/</text></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
function getSrc(i) {
  try { const s = localStorage.getItem(STORE + i); if (s) return s; } catch (e) { }
  return CONFIG.foto[i].src;
}

/* Foto latar hero */
(function () {
  if (!CONFIG.hero) return;
  const t = new Image();
  t.onload = () => { $("#heroBg").style.backgroundImage = `url("${CONFIG.hero}")`; };
  t.src = CONFIG.hero;
})();

/* Galeri */
const gallery = $("#gallery");
function renderGallery() {
  gallery.innerHTML = "";
  CONFIG.foto.forEach((f, i) => {
    const fig = document.createElement("figure");
    fig.className = "ph reveal";
    fig.innerHTML = `<img alt="${f.caption}" loading="lazy"><figcaption>${f.caption}</figcaption><button class="swap" type="button">Ganti</button>`;
    const img = $("img", fig);
    img.onerror = () => { img.onerror = null; img.src = placeholder(i); };
    img.src = getSrc(i);
    fig.addEventListener("click", e => { if (!e.target.closest(".swap") && !gallery.classList.contains("edit")) openLB(i); });
    $(".swap", fig).addEventListener("click", e => { e.stopPropagation(); pickFor(i); });
    gallery.appendChild(fig);
    io.observe(fig);
  });
}

/* Ganti foto lewat browser (disimpan di localStorage) */
const filePick = $("#filePick");
let pickIndex = -1;
function pickFor(i) { pickIndex = i; filePick.value = ""; filePick.click(); }
filePick.addEventListener("change", () => {
  const file = filePick.files[0];
  if (!file || pickIndex < 0) return;
  const reader = new FileReader();
  reader.onload = () => {
    const im = new Image();
    im.onload = () => {
      const max = 1400, k = Math.min(1, max / Math.max(im.width, im.height));
      const c = document.createElement("canvas");
      c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
      const data = c.toDataURL("image/jpeg", 0.82);
      try { localStorage.setItem(STORE + pickIndex, data); }
      catch (e) { alert("Penyimpanan browser penuh. Letakkan foto langsung di folder images/ sebagai gantinya."); }
      renderGallery();
    };
    im.src = reader.result;
  };
  reader.readAsDataURL(file);
});
const editToggle = $("#editToggle"), resetBtn = $("#resetPhotos"), editHint = $("#editHint");
editToggle.addEventListener("click", () => {
  const on = gallery.classList.toggle("edit");
  editToggle.textContent = on ? "✔ Selesai" : "✎ Mode Ganti Foto";
  resetBtn.hidden = editHint.hidden = !on;
});
resetBtn.addEventListener("click", () => {
  if (!confirm("Kembalikan semua foto ke file di folder images?")) return;
  CONFIG.foto.forEach((_, i) => { try { localStorage.removeItem(STORE + i); } catch (e) { } });
  renderGallery();
});

/* Lightbox */
const lb = $("#lb"), lbImg = $("#lbImg"), lbCap = $("#lbCap");
let cur = 0;
function showLB() {
  lbImg.onerror = () => { lbImg.onerror = null; lbImg.src = placeholder(cur); };
  lbImg.src = getSrc(cur); lbCap.textContent = CONFIG.foto[cur].caption;
}
function openLB(i) { cur = i; showLB(); lb.hidden = false; document.body.style.overflow = "hidden"; }
function closeLB() { lb.hidden = true; document.body.style.overflow = ""; }
function step(d) { cur = (cur + d + CONFIG.foto.length) % CONFIG.foto.length; showLB(); }
$("#lbClose").onclick = closeLB;
$("#lbPrev").onclick = () => step(-1);
$("#lbNext").onclick = () => step(1);
lb.addEventListener("click", e => { if (e.target === lb) closeLB(); });
document.addEventListener("keydown", e => {
  if (lb.hidden) return;
  if (e.key === "Escape") closeLB();
  if (e.key === "ArrowLeft") step(-1);
  if (e.key === "ArrowRight") step(1);
});

/* Muncul saat scroll + hitung angka */
const io = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add("in");
    const c = $(".count", en.target);
    if (c && !c.done) countUp(c);
    io.unobserve(en.target);
  });
}, { threshold: .15 });
function countUp(el) {
  el.done = true;
  const to = +el.dataset.to, suf = el.dataset.suffix || "", t0 = performance.now(), dur = 1600;
  (function f(t) {
    const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(to * e) + suf;
    if (p < 1) requestAnimationFrame(f);
  })(t0);
}
$$(".reveal").forEach((el, i) => { el.style.transitionDelay = (i % 4) * 80 + "ms"; io.observe(el); });
renderGallery();

/* Navbar, progress bar, menu */
const nav = $("#nav"), prog = $("#progress");
addEventListener("scroll", () => {
  nav.classList.toggle("solid", scrollY > 40);
  const h = document.documentElement.scrollHeight - innerHeight;
  prog.style.width = (h > 0 ? scrollY / h * 100 : 0) + "%";
}, { passive: true });
$("#burger").onclick = () => $("#menu").classList.toggle("open");
$$("#menu a").forEach(a => a.addEventListener("click", () => $("#menu").classList.remove("open")));

/* Tab */
$$("#tabBtns button").forEach(b => b.addEventListener("click", () => {
  $$("#tabBtns button").forEach(x => x.classList.remove("on"));
  $$("#tabBody .pane").forEach(x => x.classList.remove("on"));
  b.classList.add("on");
  $$("#tabBody .pane")[+b.dataset.tab].classList.add("on");
}));

/* Efek miring pada kartu */
$$(".tilt").forEach(c => {
  c.addEventListener("mousemove", e => {
    const r = c.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    c.style.transform = `perspective(700px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg) translateY(-4px)`;
  });
  c.addEventListener("mouseleave", () => { c.style.transform = ""; });
});

/* Ticker ilustrasi (data acak, bukan harga asli) */
(function () {
  const kode = ["BBCA", "BBRI", "BMRI", "TLKM", "ASII", "BBNI", "UNVR", "ICBP", "GOTO", "ADRO", "AMRT", "ANTM", "INDF", "MDKA", "PGAS", "CPIN"];
  const rows = kode.map(k => {
    const price = Math.round(Math.random() * 9000 + 1000);
    const chg = (Math.random() * 5 - 2.4).toFixed(2);
    const cls = chg >= 0 ? "up" : "down";
    return `<span class="tk"><b>${k}</b><span>${price.toLocaleString("id-ID")}</span><span class="${cls}">${chg >= 0 ? "▲" : "▼"} ${Math.abs(chg)}%</span></span>`;
  }).join("");
  $("#ticker").innerHTML = rows + rows;
})();

/* Grafik candlestick animasi di hero */
(function () {
  const cv = $("#chart"), ctx = cv.getContext("2d");
  let W, H, candles = [], dpr = Math.min(devicePixelRatio || 1, 2);
  const N = 60;
  function resize() {
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function make(prev) {
    const o = prev ? prev.c : 0;
    const c = o + (Math.random() - .47) * 0.9;
    return { o, c, h: Math.max(o, c) + Math.random() * .5, l: Math.min(o, c) - Math.random() * .5 };
  }
  for (let i = 0; i < N; i++) candles.push(make(candles[i - 1]));
  let off = 0, last = 0;
  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    const w = W / (N - 2);
    const lo = Math.min(...candles.map(c => c.l)), hi = Math.max(...candles.map(c => c.h));
    const y = v => H * .88 - (v - lo) / (hi - lo || 1) * H * .6;
    ctx.strokeStyle = "rgba(255,255,255,.05)"; ctx.lineWidth = 1;
    for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(0, H * i / 6); ctx.lineTo(W, H * i / 6); ctx.stroke(); }
    candles.forEach((c, i) => {
      const x = i * w - off * w, up = c.c >= c.o;
      ctx.strokeStyle = ctx.fillStyle = up ? "#2ee59d" : "#ff3b5c";
      ctx.beginPath(); ctx.moveTo(x + w / 2, y(c.h)); ctx.lineTo(x + w / 2, y(c.l)); ctx.stroke();
      const top = y(Math.max(c.o, c.c)), bh = Math.max(2, Math.abs(y(c.o) - y(c.c)));
      ctx.fillRect(x + w * .2, top, w * .6, bh);
    });
    if (t - last > 900) { last = t; candles.shift(); candles.push(make(candles[candles.length - 1])); }
    requestAnimationFrame(draw);
  }
  resize(); addEventListener("resize", resize);
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) requestAnimationFrame(draw);
  else { draw(0); }
})();

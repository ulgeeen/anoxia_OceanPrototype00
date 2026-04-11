let jellies = [];
let numJellies = 10;
let hud; // Paneli tutacağımız değişken

// --- SİMÜLE EDİLEN VERİLER ---
let currentPh = 8.1;
let currentO2 = 6.5;
let currentTemp = 1.2;

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Paneli Başlat
  hud = new InfoPanel();

  for (let i = 0; i < numJellies; i++) {
    jellies.push(new Jellyfish());
  }
}

function draw() {
  background('#000009');

  for (let jf of jellies) {
    jf.update();
    jf.show();
  }

  // ── Scale Ruler (defined in panel.js) ────────────────────────────────
  hud.drawScaleRuler();

  // BURAYA İLERİDE ARDUINO'DAN GELEN VERİLERİ BAĞLAYACAKSIN
  // Şimdilik test etmek için rastgele küçük oynamalar yapalım
  currentPh += random(-0.005, 0.005);
  currentO2 += random(-0.01, 0.01);
  currentTemp += random(-0.002, 0.002);

  // Paneli Güncelle (pH, O2, Sıcaklık)
  hud.update(currentPh, currentO2, currentTemp);
}
// =============================================
//  ANOXIA — p5.js Sketch (2D Entegrasyonu)
//  Breathing Jellyfish + Ecosystem Integration
// =============================================

// ---- Global Durum (State) ----
let jellyfish = [];   // Deniz anası objeleri dizisi
let particles = [];   // Mikroplastik parçacıkları dizisi

// DOM Referansları
let sliderCount;
let sliderCO2;
let sliderPhosphorus;
let countDisplay, co2Display, phosphorusDisplay;

// ---- p5 setup() — Yüklenince bir kere çalışır ----
function setup() {
  // WEBGL modunu kaldırıp standart 2D kanvas oluşturuyoruz
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.parent('canvas-container');

  // Nefes alma matematiği için derece kullanıyoruz
  angleMode(DEGREES);

  // HTML'deki slider ve yazı alanlarını çekiyoruz
  sliderCount = select('#countSlider');
  sliderCO2 = select('#co2Slider');
  sliderPhosphorus = select('#phosphorusSlider');
  countDisplay = select('#countDisplay');
  co2Display = select('#co2Display');
  phosphorusDisplay = select('#phosphorusDisplay');

  // Başlangıç deniz analarını oluştur
  let initJellyCount = int(sliderCount.value());
  for (let i = 0; i < initJellyCount; i++) {
    jellyfish.push(new Jellyfish());
  }

  // Başlangıç mikroplastik parçacıklarını oluştur
  let initParticles = particleTarget(initJellyCount);
  for (let i = 0; i < initParticles; i++) {
    particles.push(new Particle());
  }
}

// ---- Slider değerine göre ekrandaki parçacık sayısını belirler ----
function particleTarget(jellyCount) {
  return jellyCount * 8;
}

// ---- p5 draw() — Her karede (frame) bir döngü halinde çalışır ----
function draw() {
  // ---- Güncel Slider Değerlerini Oku ----
  let desiredJelly = int(sliderCount.value());
  let co2Level = int(sliderCO2.value());      // 0–100
  let phosphorus = int(sliderPhosphorus.value()); // 0–100

  // ---- HTML Göstergelerini Güncelle (01, 08, 12 formatı) ----
  countDisplay.html(String(desiredJelly).padStart(2, '0'));
  co2Display.html(String(co2Level).padStart(2, '0'));
  phosphorusDisplay.html(String(phosphorus).padStart(2, '0'));

  // ---- Arka Plan Rengi ve Ekosistem Etkisi ----
  let baseHue = 225;
  let targetHue = 55;
  let bgHue = lerp(baseHue, targetHue, co2Level / 100);
  let bgLight = lerp(4, 1.2, phosphorus / 100);
  let bgSat = lerp(72, 55, co2Level / 100);

  colorMode(HSL, 360, 100, 100, 1);
  background(bgHue, bgSat, bgLight);

  // ---- Deniz Anası Sayısını Slider ile Senkronize Et ----
  if (desiredJelly > jellyfish.length) {
    while (jellyfish.length < desiredJelly) jellyfish.push(new Jellyfish());
  } else if (desiredJelly < jellyfish.length) {
    jellyfish.splice(desiredJelly);
  }

  // ---- Mikroplastik Sayısını Slider ile Senkronize Et ----
  let desiredParticles = particleTarget(desiredJelly);
  if (desiredParticles > particles.length) {
    while (particles.length < desiredParticles) particles.push(new Particle());
  } else if (desiredParticles < particles.length) {
    particles.splice(desiredParticles);
  }

  push();
  // 3D orijin mantığını (merkez 0,0) korumak için 2D uzayda orijini merkeze kaydırıyoruz.
  translate(width / 2, height / 2);

  // ---- Parçacıkları (Mikroplastikleri) Çiz ----
  colorMode(RGB, 255, 255, 255, 255);
  for (let p of particles) {
    p.update();
    p.draw();
  }

  // ---- Deniz Analarını Çiz ----
  for (let jf of jellyfish) {
    jf.update(desiredJelly);
    jf.draw(desiredJelly, phosphorus);
  }

  pop();
}

// ---- Pencere boyutu değiştiğinde Canvas'ı yenile ----
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


// =============================================
//  SINIF: Particle (Mikroplastik Parçacıkları)
// =============================================
class Particle {
  constructor() {
    this.reset(true);
  }

  reset(fullScreen) {
    this.x = random(-width / 2, width / 2);
    this.y = fullScreen ? random(-height / 2, height / 2) : -height / 2 - 50;

    this.r = random(1, 3.5);
    this.speedX = random(-0.18, 0.18);
    this.speedY = random(0.08, 0.5);
    this.alpha = random(140, 220);
    this.noiseOff = random(0, 2000);
  }

  update() {
    let sway = (noise(this.noiseOff) * 2 - 1) * 0.5;
    this.x += this.speedX + sway;
    this.y += this.speedY;
    this.noiseOff += 0.003;

    if (this.x < -width / 2 - 50) this.x = width / 2 + 50;
    if (this.x > width / 2 + 50) this.x = -width / 2 - 50;
    if (this.y > height / 2 + 50) this.reset(false);
  }

  draw() {
    push();
    translate(this.x, this.y); // Z ekseni kaldırıldı
    noStroke();

    fill(255, 50, 50, this.alpha * 0.4);
    ellipse(0, 0, this.r * 4, this.r * 4);

    fill(255, 70, 70, this.alpha);
    ellipse(0, 0, this.r * 2, this.r * 2);
    pop();
  }
}


// =============================================
//  SINIF: Jellyfish (2 Boyutlu Nefes Alan Deniz Anası)
// =============================================
class Jellyfish {
  constructor() {
    this.x = random(-width / 2, width / 2);
    this.y = random(-height / 2, height / 2);

    // Breathing Algoritması Parametreleri
    this.baseSize = random(30, 80);
    this.rez = int(random(4, 9));
    this.baseAmp = random(30, 70);
    this.baseSpeed = random(1.0, 2.5);
    this.pulsePhase = random(360);

    // Doğal süzülme için Perlin Noise
    this.noiseOffsetX = random(1000);
    this.noiseOffsetY = random(1000);

    // Temel Sağlıklı Renk
    this.baseHue = random(185, 210);
    this.baseSat = 100;
    this.baseLight = 65;
  }

  update(mpLevel) {
    let nx = noise(this.noiseOffsetX) * 2 - 1;
    let ny = noise(this.noiseOffsetY) * 2 - 1;

    this.x += nx * 1.5;
    this.y += ny * 1.0 - 0.2;

    this.noiseOffsetX += 0.003;
    this.noiseOffsetY += 0.003;

    let margin = 150;
    if (this.x < -width / 2 - margin) this.x = width / 2 + margin;
    if (this.x > width / 2 + margin) this.x = -width / 2 - margin;
    if (this.y < -height / 2 - margin) this.y = height / 2 + margin;
    if (this.y > height / 2 + margin) this.y = -height / 2 - margin;

    // MİKROPLASTİK STRESİ
    let speedMult = map(mpLevel, 1, 40, 1.0, 0.3);
    this.pulsePhase += this.baseSpeed * speedMult;
  }

  draw(mpLevel, phosphorusLevel) {
    let sizeMult = map(phosphorusLevel, 0, 100, 1.0, 2.0);
    let currentSize = this.baseSize * sizeMult;

    let ampMult = map(mpLevel, 1, 40, 1.0, 0.2);
    let currentAmp = this.baseAmp * ampMult;

    let targetHue = 350;
    let targetSat = 80;
    let targetLight = 70;
    let stressRatio = map(mpLevel, 1, 40, 0, 1);

    let curHue = lerp(this.baseHue, targetHue, stressRatio);
    let curSat = lerp(this.baseSat, targetSat, stressRatio);
    let curLight = lerp(this.baseLight, targetLight, stressRatio);

    push();
    translate(this.x, this.y);

    // 3D yalpalama (rotateX/rotateY) yerine 2D yalpalama (Z ekseni etrafında dönüş)
    let wobble = map(noise(this.noiseOffsetX), 0, 1, -20, 20);
    rotate(wobble);

    colorMode(HSL, 360, 100, 100, 1);
    stroke(curHue, curSat, curLight, 0.7);
    strokeWeight(1.5);
    noFill();

    // ---- NEFES ALAN ELİPSLER (2D Uyarlaması) ----
    for (let i = 0; i < currentSize; i += this.rez) {
      push();
      // Sine matematiğini koruyoruz. 3D'deki Z derinliğini, 2D'de Y ekseni kaymasına (depth) çeviriyoruz.
      // Bu sayede çemberler yukarı-aşağı esneyerek 2D bir deniz anası görünümü yaratır.
      let depth = currentAmp * sin(this.pulsePhase + i);
      translate(0, depth);
      ellipse(0, 0, i, i);
      pop();
    }
    pop();
  }
}
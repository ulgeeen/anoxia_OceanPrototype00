let jellies = [];
let numJellies = 10;
let plastics = [];
let numPlastics = 400;

let fallingPollutants = []; // Yukarıdan dökülen kirlilikler için dizi
let hud;

// --- SİMÜLE EDİLEN VERİLER ---
let currentPh = 7.7;
let currentO2 = 5;
let currentTemp = 3.5;

// ==========================================
// CO2 BLOOM EVENT STATE
// ==========================================
// ── Tweak these values ───────────────────
const CO2_BASELINE_JELLIES = 10;   // normal jellyfish population
const CO2_BLOOM_JELLIES = 30;   // peak population during CO2 bloom
const CO2_BLOOM_TEMP = 5.5;  // °C — temperature during CO2 event
const CO2_BASELINE_TEMP = 3.5;  // °C — normal temperature baseline
const CO2_RECOVERY_SECS = 20;   // seconds until full recovery
// ─────────────────────────────────────────

let co2Active = false;     // is a CO2 event currently running?
let co2RecoveryFrames = 0;         // frames remaining in recovery
const CO2_RECOVERY_TOTAL = CO2_RECOVERY_SECS * 60; // total recovery frames

function setup() {
  createCanvas(windowWidth, windowHeight);
  hud = new InfoPanel();

  for (let i = 0; i < CO2_BASELINE_JELLIES; i++) {
    jellies.push(new Jellyfish());
  }

  for (let i = 0; i < numPlastics; i++) {
    plastics.push(new Microplastic());
  }
}

function draw() {
  background('#010a14');

  // ── CO2 Recovery Tick ──────────────────────────────────────────────────────
  if (co2Active) {
    co2RecoveryFrames--;

    // Recovery progress: 0 = just triggered, 1 = fully recovered
    let progress = 1 - (co2RecoveryFrames / CO2_RECOVERY_TOTAL);

    // Smoothly lerp target population back toward baseline
    let targetCount = round(lerp(CO2_BLOOM_JELLIES, CO2_BASELINE_JELLIES, progress));

    // Spawn extra jellies when population is below target
    while (jellies.length < targetCount) {
      jellies.push(new Jellyfish());
    }

    // Smoothly recover temperature back toward baseline
    currentTemp = lerp(CO2_BLOOM_TEMP, CO2_BASELINE_TEMP, progress);

    // Event over
    if (co2RecoveryFrames <= 0) {
      co2Active = false;
    }
  }
  // ──────────────────────────────────────────────────────────────────────────

  // Arka plan mikroplastiklerini çiz
  for (let p of plastics) {
    p.update();
    p.show();
  }

  // Dökülen Partikülleri Çiz ve Güncelle
  for (let i = fallingPollutants.length - 1; i >= 0; i--) {
    let pol = fallingPollutants[i];
    pol.update();
    pol.show();
    if (pol.isDead()) {
      fallingPollutants.splice(i, 1);
    }
  }

  // Denizanalarını çiz — dead ones are removed and replaced
  let currentTarget = co2Active
    ? round(lerp(CO2_BLOOM_JELLIES, CO2_BASELINE_JELLIES, 1 - co2RecoveryFrames / CO2_RECOVERY_TOTAL))
    : CO2_BASELINE_JELLIES;

  for (let i = jellies.length - 1; i >= 0; i--) {
    jellies[i].update();
    jellies[i].show();
    if (jellies[i].isDead()) {
      jellies.splice(i, 1);
      // Only replace if we're still below the current target population
      if (jellies.length < currentTarget) {
        jellies.push(new Jellyfish());
      }
    }
  }

  hud.drawScaleRuler();

  // Test verileri (small idle drift — CO2 recovery overrides temp when active)
  currentPh += random(-0.005, 0.005);
  currentO2 += random(-0.01, 0.01);
  if (!co2Active) {
    currentTemp += random(-0.002, 0.002);
  }

  hud.update(currentPh, currentO2, currentTemp);
}

// ==========================================
// KİRLİLİK TETİKLEYİCİ SİSTEM
// ==========================================
window.triggerPollution = function (type) {
  let amount = 200; // Her basışta düşecek partikül sayısı
  for (let i = 0; i < amount; i++) {
    fallingPollutants.push(new Pollutant(type));
  }

  // ── CO2: jellyfish bloom + temperature spike ──────────────────────────────
  if (type === 'CO2') {
    co2Active = true;
    co2RecoveryFrames = CO2_RECOVERY_TOTAL; // reset the 20-second countdown

    // Immediately set temperature to peak
    currentTemp = CO2_BLOOM_TEMP;

    // Immediately fill the ocean to bloom population
    while (jellies.length < CO2_BLOOM_JELLIES) {
      jellies.push(new Jellyfish());
    }
  }
  // ─────────────────────────────────────────────────────────────────────────
};
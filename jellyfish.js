// =============================================
//  DOSYA: Jellyfish.js
//  Perlin Noise Rotaları ve Hizalı Rotasyon (Agent Behaviors)
// =============================================

// ── LIFESPAN SETTINGS (tweak here) ──────────────────────────────────────────
const JELLY_MIN_LIFESPAN = 15;  // seconds — minimum life
const JELLY_MAX_LIFESPAN = 50;  // seconds — maximum life
const JELLY_BORN_GROW_TIME = 10; // seconds — how long the scale-in takes on birth
const JELLY_DEATH_FADE_TIME = 4.0; // seconds — how long the fade-out takes on death
// ────────────────────────────────────────────────────────────────────────────

class Jellyfish {
    constructor() {
        this.x = random(width);
        this.y = random(height);
        this.size = random(0.1, 0.3);

        // Biyomekanik Ritim
        this.t = random(100);
        this.tSpeed = random(0.03, 0.05);

        // Perlin Noise ve Yönelim (Steering)
        this.angle = random(TWO_PI);   // Rastgele bir açıyla başlasın
        this.angleNoise = random(1000);     // Her denizanası için farklı bir Perlin offset'i
        this.turnSpeed = random(0.01, 0.03); // Perlin Noise'un akış hızı

        // Hız Ayarları
        this.baseSpeed = random(0.3, 0.6);
        this.burstSpeed = 1;

        // ── Lifecycle ─────────────────────────────────────────────────────────
        // Total lifespan in frames (randomised between min and max seconds)
        let lifespanSeconds = random(JELLY_MIN_LIFESPAN, JELLY_MAX_LIFESPAN);
        this.maxAge = lifespanSeconds * 60;       // assume ~60 fps
        this.age = 0;                          // frames lived

        this.bornFrames = JELLY_BORN_GROW_TIME * 60; // frames for birth scale-in
        this.deathFrames = JELLY_DEATH_FADE_TIME * 60; // frames for death fade-out
        // ──────────────────────────────────────────────────────────────────────
    }

    isDead() {
        return this.age >= this.maxAge;
    }

    update() {
        // ── Lifecycle tick ────────────────────────────────────────────────────
        this.age++;
        // ──────────────────────────────────────────────────────────────────────

        // 1. ZAMAN AKIŞI
        this.t += this.tSpeed;
        this.angleNoise += this.turnSpeed;

        // 2. PERLIN NOISE İLE YÖN BELİRLEME (ORGANİK DİREKSİYON)
        let angleTurn = map(noise(this.angleNoise), 0, 1, -0.01, 0.01);
        this.angle += angleTurn;

        // 3. İTKİ VE HIZ MATEMATİĞİ (BURST)
        let contractionPhase = -sin(this.t - 1);
        let burst = pow(max(0, contractionPhase), 4);
        let currentSpeed = this.baseSpeed + (burst * this.burstSpeed);

        // 4. TRİGONOMETRİK HAREKET (X VE Y EKSENİNDE İLERLEME)
        this.x += cos(this.angle) * currentSpeed;
        this.y += sin(this.angle) * currentSpeed;

        // 5. EKRAN SINIRLARI (WRAP AROUND)
        let margin = 200;
        if (this.x < -margin) this.x = width + margin;
        if (this.x > width + margin) this.x = -margin;
        if (this.y < -margin) this.y = height + margin;
        if (this.y > height + margin) this.y = -margin;
    }

    show() {
        // ── Lifecycle visual modifiers ────────────────────────────────────────

        // Birth scale-in: 0 → 1 over the first bornFrames frames
        let scaleMod = 1;
        if (this.age < this.bornFrames) {
            scaleMod = this.age / this.bornFrames;  // 0 … 1
        }

        // Death fade-out: opacity 1 → 0 over the last deathFrames frames
        let opacity = 1;
        let framesLeft = this.maxAge - this.age;
        if (framesLeft < this.deathFrames) {
            opacity = framesLeft / this.deathFrames; // 1 … 0
        }
        opacity = constrain(opacity, 0, 1);

        // ──────────────────────────────────────────────────────────────────────

        push();
        translate(this.x, this.y);

        // --- KAFA ROTASYONU ---
        rotate(this.angle + PI / 2);
        scale(this.size * scaleMod);  // apply birth scale-in on top of base size

        let spacing = 16;
        let startY = 12 * spacing;
        let numPoints = 25;
        let tentacleLen = 400; // base tentacle length (longest pair uses this value)

        // ── Tentacle lengths by position from centre ──────────────────────
        // posIdx 0 = innermost pair  (tentacles 3 & 4) → longest
        // posIdx 1 = middle pair     (tentacles 2 & 5) → medium
        // posIdx 2 = outermost pair  (tentacles 1 & 6) → shortest
        const tentacleLengths = [
            tentacleLen * 1.0,  // innermost — longest
            tentacleLen * 0.85, // middle    — medium length
            tentacleLen * 0.65, // outermost — shortest
        ];
        // ──────────────────────────────────────────────────────────────────

        // Tentaküller
        for (let j = 0; j < 6; j++) {
            let dir = (j < 3) ? 1 : -1;
            let posIdx = j % 3;                      // 0 = inner, 1 = mid, 2 = outer
            let spreadFactor = (posIdx + 1) * 0.4;
            let startXOffset = (posIdx + 0.5) * 15 * dir;
            let tLen = tentacleLengths[posIdx];    // pick length for this tentacle

            for (let p = 0; p <= numPoints; p++) {
                let normP = p / numPoints;
                let py = startY + normP * tLen;

                let wave = sin(this.t * 1.5 - normP * 6 + j);
                let px = startXOffset + (normP * 80 * spreadFactor * dir) + (wave * 40 * normP);

                stroke(29, 171, 242, (200 - normP * 180) * opacity);
                strokeWeight(normP * 20);
                point(px, py);
            }
        }

        // Gövde (Bell)
        for (let i = 12; i >= 0; i--) {
            let py = i * spacing;
            let baseRx = 320 * sin((i / 9) * PI * 0.5);

            let wave = sin(this.t - i * 0.2);
            let rx = baseRx * (0.9 + 0.3 * wave);
            let ry = 40 * (0.8 + 0.3 * wave);

            if (rx > 0 && ry > 0) {
                noFill();
                stroke(29, 171, 242, (255 - i * 15) * opacity);
                strokeWeight(1.2 * (py / 50));
                ellipse(0, py, rx * 1.5, ry * 1.5);
            }
        }

        pop();
    }
}
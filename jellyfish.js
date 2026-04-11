// =============================================
//  DOSYA: Jellyfish.js
//  Sadece denizanasının görsel ve hareket özellikleri
// =============================================

class Jellyfish {
    constructor() {
        // Başlangıç Pozisyonları ve Boyut
        this.x = random(width);
        this.y = random(height + 200);
        this.size = random(0.4, 0.8); // Büyüklük varyasyonları

        // Trigonometrik Hareket (Zaman ve Hız)
        this.t = random(100); // Her biri farklı bir kasılma fazında başlasın
        this.tSpeed = 0.04;   // Kasılma/Nabız hızı

        // Süzülme Yönü ve Hızı (Okyanus Akıntısı)
        this.driftX = random(-0.4, 0.4);
        this.driftY = random(-0.3, -0.7); // Sürekli yukarı süzülme eğilimi
    }

    update() {
        // Zamanı ve pozisyonu ilerlet
        this.t += this.tSpeed;
        this.x += this.driftX;
        this.y += this.driftY;

        // Sınır Kontrolü: Ekrandan çıkarsa karşı taraftan (veya aşağıdan) geri girsin
        if (this.y < -250) this.y = height + 250;
        if (this.x < -100) this.x = width + 100;
        if (this.x > width + 100) this.x = -100;
    }

    show() {
        push();
        // Koordinat sistemini bu spesifik denizanasının merkezine taşı
        translate(this.x, this.y);
        scale(this.size);

        let spacing = 16;
        let startY = 12 * spacing; // Gövdenin bittiği, dokunaçların başladığı Y noktası

        // --- 1. TENTACLES (DOKUNAÇLAR) ---
        let numPoints = 25;
        let tentacleLen = 400;

        for (let j = 0; j < 6; j++) {
            let dir = (j < 3) ? 1 : -1;
            let spreadFactor = (j % 3 + 1) * 0.4;
            let startXOffset = (j % 3 + 0.5) * 15 * dir;

            for (let p = 0; p <= numPoints; p++) {
                let normP = p / numPoints;
                let py = startY + normP * tentacleLen;

                // Biyomekanik dalgalanma (Sine wave)
                let wave = sin(this.t * 1.5 - normP * 6 + j);
                let px = startXOffset + (normP * 80 * spreadFactor * dir) + (wave * 40 * normP);

                // Uçlara doğru şeffaflaşan neon çizgiler
                stroke(29, 171, 242, 200 - normP * 180);
                strokeWeight(5);
                point(px, py);
            }
        }

        // --- 2. BELL (GÖVDE / STROBİLASYON KATMANLARI) ---
        for (let i = 12; i >= 0; i--) {
            let py = i * spacing;

            // Kubbe (Dome) yapısını veren temel genişlik
            let baseRx = 320 * sin((i / 9) * PI * 0.5);

            // Gövdenin nefes alma/kasılma hareketi
            let wave = sin(this.t - i * 0.2);
            let rx = baseRx * (0.9 + 0.3 * wave);
            let ry = 40 * (0.8 + 0.3 * wave);

            if (rx > 0 && ry > 0) {
                noFill();
                // Yukarıdan aşağıya doğru şeffaflaşma efekti
                stroke(29, 171, 242, 255 - i * 15);
                strokeWeight(1.2);
                ellipse(0, py, rx * 1.5, ry * 1.5);
            }
        }

        pop();
    }
}
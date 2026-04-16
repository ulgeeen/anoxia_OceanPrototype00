// =============================================
//  DOSYA: pollutant.js
//  Kirlilik Partikülleri Sınıfı (Kaotik Yayılım Güncellemesi)
// =============================================

class Pollutant {
    constructor(type) {
        this.x = random(width);
        // 1. Çok daha geniş bir dikey başlangıç alanı (Aynı anda suya çarpmamaları için)
        this.y = random(-1000, -50);
        this.size = random(2, 7);
        this.type = type;
        this.life = 255;

        // İlk düşüş ve saçılma hızları
        this.vx = random(-6, 6);
        this.vy = random(8, 20); // İlk düşüşü daha şiddetli

        // Organik akıntı (Perlin Noise) değişkenleri
        this.noiseOffset = random(1000);
        this.yNoiseOffset = random(2000); // Dikey dalgalanma için YENİ noise

        // YENİ: Suyun içindeki nihai süzülme hızı (Her partikül için farklı ağırlık)
        this.terminalVelocity = random(0.2, 2.0);

        this.inWater = false;

        // Tip bazlı renkler
        if (type === 'MP') {
            this.r = 42; this.g = 176; this.b = 242; // Mavi
        } else if (type === 'CO2') {
            this.r = 231; this.g = 236; this.b = 242; // Beyaz
        } else if (type === 'NP') {
            this.r = 239; this.g = 55; this.b = 95;  // Kırmızı
        }
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Yatay organik akıntı (Drift)
        let driftX = map(noise(this.noiseOffset), 0, 1, -5, 5);
        this.x += driftX;
        this.noiseOffset += 0.015;

        // Partiküller ekranın en üst %10'luk kısmını geçince suya girmiş sayılır
        if (this.y > height * 0.1) {
            this.inWater = true;
        }

        if (this.inWater) {
            // Yatay Hız Sönümlemesi (Suya çarpınca sağa sola savrulmanın durulması)
            this.vx *= 0.92;

            // Dikey yavaşlama ve organik batma
            if (this.vy > this.terminalVelocity) {
                this.vy *= 0.85; // Suya çarpınca ani fren (sürtünme)
            } else {
                // YENİ: Tamamen düz batmak yerine, dikey eksende de Perlin Noise ile direnç/dalgalanma
                let driftY = map(noise(this.yNoiseOffset), 0, 1, -1.5, 1.5);
                this.vy = this.terminalVelocity + driftY;
            }
            this.yNoiseOffset += 0.02;

            // Çözünme ve Şeffaflaşma (Okyanusa tam yayılmaları için erime hızını düşürdük)
            this.size += 0.015;
            this.life -= random(0.2, 0.8);
        }

        // Ekranın sağından çıkıp solundan girmeleri için
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
    }

    show() {
        noStroke();
        fill(this.r, this.g, this.b, this.life);
        circle(this.x, this.y, this.size);
    }

    isDead() {
        // Eriyip yok olma veya okyanus tabanını geçme durumu
        return this.life <= 0 || this.y > height + 100;
    }
}
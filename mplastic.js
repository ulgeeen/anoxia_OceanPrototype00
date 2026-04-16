// =============================================
//  Mikroplastik Parçacık Sınıfı
// =============================================
class Microplastic {
    constructor() {
        this.init();
    }

    init() {
        this.x = random(width);
        this.y = random(height);
        this.size = random(0.25, 2); // Çok küçük noktalar
        this.alpha = random(50, 150); // Hafif şeffaf
        this.speed = random(0.2, 0.8); // Yavaş akıntı hızı
        this.offset = random(1000); // Perlin noise veya sin dalgası için
    }

    update() {
        // Hafif bir salınım ve aşağı/yukarı süzülme hareketi
        this.y += this.speed;
        this.x += sin(frameCount * 0.01 + this.offset) * 0.5;

        // Ekranın dışına çıkarsa yukarıdan tekrar başlat
        if (this.y > height) {
            this.y = -10;
            this.x = random(width);
        }
    }

    show() {
        // En performanslı çizim yöntemi: stroke ve point
        stroke(150, 200, 255, this.alpha);
        strokeWeight(this.size);
        point(this.x, this.y);
    }
}
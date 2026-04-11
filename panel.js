// =============================================
//  DOSYA: Panel.js
//  Veri Brütalizmi - Salt Okunur (Read-Only) Bilgi Paneli
// =============================================

class InfoPanel {
    constructor() {
        // Ana kapsayıcıyı (container) oluştur
        this.container = document.createElement('div');
        this.container.id = 'anoxia-hud';
        document.body.appendChild(this.container);

        // 4 Farklı Veri Modülü Oluştur
        this.phDisplay = this.createModule('BUFFER CAPACITY', 'pH');
        this.o2Display = this.createModule('DISSOLVED OXYGEN', 'O₂ (ppm)');
        this.tempDisplay = this.createModule('THERMAL GAIN', 'TEMP (°C)');

        // Scale Legend (Ölçek Barı) Oluştur
        this.scaleDisplay = this.createScaleLegend();
    }

    // Modül oluşturucu yardımcı fonksiyon
    createModule(title, unit) {
        let mod = document.createElement('div');
        mod.className = 'hud-module';

        let titleEl = document.createElement('div');
        titleEl.className = 'hud-title';
        titleEl.innerText = title;

        let valueContainer = document.createElement('div');
        valueContainer.className = 'hud-value-container';

        let valueEl = document.createElement('span');
        valueEl.className = 'hud-value';
        valueEl.innerText = '0.00';

        let unitEl = document.createElement('span');
        unitEl.className = 'hud-unit';
        unitEl.innerText = unit;

        valueContainer.appendChild(valueEl);
        valueContainer.appendChild(unitEl);
        mod.appendChild(titleEl);
        mod.appendChild(valueContainer);
        this.container.appendChild(mod);

        return valueEl; // Güncellemek için sadece sayı elementini döndür
    }

    // Ölçek (Scale Legend) özel modülü
    createScaleLegend() {
        let mod = document.createElement('div');
        mod.className = 'hud-module scale-module';

        let titleEl = document.createElement('div');
        titleEl.className = 'hud-title';
        titleEl.innerText = 'SPATIAL SCALE';

        // Ölçek çubuğu (cetvel gibi)
        let bar = document.createElement('div');
        bar.className = 'scale-bar';

        let textEl = document.createElement('div');
        textEl.className = 'scale-text';
        textEl.innerText = '1 UNIT = 10 METERS';

        mod.appendChild(titleEl);
        mod.appendChild(bar);
        mod.appendChild(textEl);
        this.container.appendChild(mod);

        return textEl;
    }

    // sketch.js içinden her frame (veya saniyede bir) çağrılacak fonksiyon
    update(phValue, o2Value, tempValue, scaleText) {
        // Değerleri formata sok (virgülden sonra 2 hane)
        this.phDisplay.innerText = phValue.toFixed(2);
        this.o2Display.innerText = o2Value.toFixed(2);

        // Sıcaklığın yanına + veya - koy
        let sign = tempValue > 0 ? '+' : '';
        this.tempDisplay.innerText = sign + tempValue.toFixed(1);

        // Ölçek metnini güncelle
        this.scaleDisplay.innerText = scaleText;

        // Kritik Seviye Uyarıları (Data Brutalism Renk Değişimi)
        if (phValue < 7.9) this.phDisplay.parentElement.classList.add('critical');
        else this.phDisplay.parentElement.classList.remove('critical');

        if (o2Value < 2.0) this.o2Display.parentElement.classList.add('critical');
        else this.o2Display.parentElement.classList.remove('critical');
    }
}
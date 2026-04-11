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

        // ── Veri Modülleri ─────────────────────────────────────────────────
        // Panel başlıkları ve birimleri buradan değiştirilir
        this.phModule = this.createPhModule();
        this.o2Display = this.createModule('OXYGEN LEVEL', 'ppm'); // title | unit label
        this.tempDisplay = this.createModule('TEMPERATURE', '°C');  // title | unit label
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
        valueEl.innerText = '0.00'; // default display value before first update

        let unitEl = document.createElement('span');
        unitEl.className = 'hud-unit';
        unitEl.innerText = unit;

        valueContainer.appendChild(valueEl);
        valueContainer.appendChild(unitEl);
        mod.appendChild(titleEl);
        mod.appendChild(valueContainer);
        this.container.appendChild(mod);

        return valueEl;
    }

    // ── pH Bar: 14-segment horizontal gauge ────────────────────────────────
    createPhModule() {
        // ── Tweakable pH bar parameters ───────────────────────────────────
        const NUM_SEGS = 14;    // total number of segments (must match the pH 0–14 scale)
        const MIN_REL_W = 0.25; // width of the thinnest (edge) segment relative to the widest (centre)
        //   0.1 = very dramatic taper | 1.0 = all segments equal width
        const MAX_RED_ALPHA = 0.25; // max opacity of the red fill on outermost segments (0–1)
        //   0 = no red tint at all | 1 = fully opaque red
        // ──────────────────────────────────────────────────────────────────

        // Pre-compute each segment's normalised distance from centre (0 = centre, 1 = edge)
        const maxDist = NUM_SEGS / 2 - 0.5; // 6.5 for 14 segments
        const normDists = Array.from({ length: NUM_SEGS }, (_, i) =>
            Math.abs(i - (NUM_SEGS / 2 - 0.5)) / maxDist
        );

        let mod = document.createElement('div');
        mod.className = 'hud-module ph-module';

        let titleEl = document.createElement('div');
        titleEl.className = 'hud-title';
        titleEl.innerText = 'pH LEVEL'; // panel heading text
        mod.appendChild(titleEl);

        // Wrapper holds the bar + the triangle pointer
        let wrapper = document.createElement('div');
        wrapper.className = 'ph-bar-wrapper';

        // The bar itself
        let bar = document.createElement('div');
        bar.className = 'ph-bar';

        this.phSegments = [];
        for (let i = 0; i < NUM_SEGS; i++) {
            const nd = normDists[i];
            const relW = 1 - nd * (1 - MIN_REL_W); // flex weight: 1 at centre → MIN_REL_W at edge

            let seg = document.createElement('div');
            seg.className = 'ph-seg';
            seg.style.flex = relW;
            seg.style.background = `rgba(255, 30, 30, ${nd * MAX_RED_ALPHA})`; // 255,30,30 = red hue

            bar.appendChild(seg);
            this.phSegments.push(seg);
        }

        // Triangle pointer
        this.phTriangle = document.createElement('div');
        this.phTriangle.className = 'ph-triangle';

        // Axis labels: 0 at left, 7.5 at centre, 14 at right — sit just above the triangle
        let axis = document.createElement('div');
        axis.className = 'ph-axis';
        ['0', '7.5', '14'].forEach(txt => {
            let lbl = document.createElement('span');
            lbl.className = 'ph-axis-label';
            lbl.innerText = txt;
            axis.appendChild(lbl);
        });
        mod.appendChild(axis);

        // Wrapper: bar on top, triangle below it
        wrapper.appendChild(bar);
        wrapper.appendChild(this.phTriangle); // triangle last → appears below bar
        mod.appendChild(wrapper);

        // Numeric readout below bar
        let readout = document.createElement('div');
        readout.className = 'ph-readout';
        readout.innerText = '—';
        this.phReadout = readout;
        mod.appendChild(readout);

        this.container.appendChild(mod);
        return mod;
    }

    // Move the pointer triangle based on pH (0–14 scale)
    updatePh(phValue) {
        const clamped = Math.max(0, Math.min(14, phValue)); // clamp to valid pH range
        const pct = (clamped / 14) * 100;              // convert to % along bar
        this.phTriangle.style.left = `calc(${pct}% - 6px)`; // 6px = half triangle width (see CSS)
        this.phReadout.innerText = phValue.toFixed(2) + ' pH'; // decimal places shown in readout
    }

    // ── Main update — called every frame from sketch.js ────────────────────
    update(phValue, o2Value, tempValue) {
        this.updatePh(phValue);

        this.o2Display.innerText = o2Value.toFixed(2);   // decimal places for O₂ readout

        let sign = tempValue > 0 ? '+' : '';
        this.tempDisplay.innerText = sign + tempValue.toFixed(1); // decimal places for temp readout

        // ── Critical threshold: turns O₂ panel red when below this value
        const O2_CRITICAL = 2.0; // ppm — lower = more permissive, raise to warn earlier
        if (o2Value < O2_CRITICAL) this.o2Display.parentElement.classList.add('critical');
        else this.o2Display.parentElement.classList.remove('critical');
    }

    // ── L-shaped scale ruler drawn with p5.js lines ────────────────────────
    // Called once per frame from sketch.js draw() via hud.drawScaleRuler()
    drawScaleRuler() {
        // ── Tweakable geometry ────────────────────────────────────────────
        const ARM = 200; // px — length of each arm (horizontal & vertical)
        const TICK_MAJOR = 8;   // px — half-size of the large end-cap tick  → total = TICK_MAJOR * 2
        const TICK_MINOR = 4;   // px — half-size of the small intermediate ticks → total = TICK_MINOR * 2
        const SPACING = 20;  // px — gap between intermediate tick marks
        const OFFSET_X = 50;  // px — distance of corner from the right edge of the canvas
        const OFFSET_Y = 40;  // px — distance of corner from the bottom edge of the canvas
        // ──────────────────────────────────────────────────────────────────

        // Corner point (where the two arms meet)
        const cx = width - OFFSET_X; // horizontal anchor
        const cy = height - OFFSET_Y; // vertical anchor

        stroke('#1dabf26d'); // line colour — change to any p5 colour string or r,g,b values
        strokeWeight(1);   // line thickness in px
        noFill();

        // ── Main arms
        line(cx - ARM, cy, cx, cy);   // horizontal arm (goes left)
        line(cx, cy - ARM, cx, cy);   // vertical arm (goes up)

        // ── End-cap ticks (large)
        line(cx - ARM, cy - TICK_MAJOR, cx - ARM, cy + TICK_MAJOR); // left end of horizontal
        line(cx - TICK_MAJOR, cy - ARM, cx + TICK_MAJOR, cy - ARM); // top end of vertical

        // ── Intermediate small ticks along horizontal arm
        for (let d = SPACING; d < ARM; d += SPACING) {
            line(cx - d, cy - TICK_MINOR, cx - d, cy + TICK_MINOR);
        }

        // ── Intermediate small ticks along vertical arm
        for (let d = SPACING; d < ARM; d += SPACING) {
            line(cx - TICK_MINOR, cy - d, cx + TICK_MINOR, cy - d);
        }
    }
}
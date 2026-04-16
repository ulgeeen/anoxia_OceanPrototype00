// =============================================
//  ANOXIA: Data Specimen (Fertilizer Use Tracker)
// =============================================

let fertilizerData;
let rawData = [];

function preload() {
    fertilizerData = loadJSON('data/fertilizer.json');
}

const regions = [
    "Northern America", "South America", "Europe",
    "Africa", "Eastern Asia", "Southern Asia"
];

let maxEmission = 0;
let t = 0; // Zaman döngüsü
let particles = []; // Mikroplastikler

function setup() {
    createCanvas(windowWidth, windowHeight);
    textFont('IBM Plex Mono');

    // Filter: keep only every 5th year starting from 1961
    let startYear = 1961;
    for (let year in fertilizerData) {
        let y = parseInt(year);
        if (y >= startYear && (y - startYear) % 5 === 0) {
            let row = fertilizerData[year];
            row.Year = y; // Add Year to the object
            rawData.push(row);
        }
    }

    // Verideki en yüksek emisyon değerini bul (Dairelerin çapını orantılamak için)
    for (let row of rawData) {
        for (let r of regions) {
            if (row[r] > maxEmission) maxEmission = row[r];
        }
    }

    // Mikroplastik parçacıklarını oluştur
    for (let i = 0; i < 200; i++) {
        particles.push(new Microplastic());
    }
}

function draw() {
    background('#010a14');

    // Arkada yüzen parçacıkları çiz
    for (let p of particles) {
        p.update();
        p.show();
    }

    t += 0.02; // Canlının kasılma hızı

    push();
    // Denizanasını ekranın ortasına ve üste yerleştir — scale dinamik hesaplanır
    // ── Layout constants (tweak here) ────────────────────────────────────
    let S = height / 1000; // scale factor: fits a 1000px-tall design into any screen
    // ─────────────────────────────────────────────────────────────────────
    translate(width / 2, height * 0.08);
    scale(S);

    // --- 1. GÖVDE (BELL) - Opaklığı Çok Düşük ---
    let spacing = 12;   // ── TWEAK: ring gap (was 16)
    let bellRings = 12; // ── TWEAK: number of rings (was 14)

    for (let i = bellRings; i >= 0; i--) {
        let py = i * spacing;
        let baseRx = 160 * sin((i / (bellRings * 0.8)) * PI * 0.5); // ── TWEAK: max radius (was 200)

        let wave = sin(t - i * 0.2);
        let rx = baseRx * (0.9 + 0.3 * wave);
        let ry = 40 * (0.8 + 0.3 * wave);

        if (rx > 0 && ry > 0) {
            noFill();
            // OPAKLIĞI ÇOK DÜŞÜRDÜK (Maksimum 40 alpha) -> Şeffaf zar etkisi
            stroke(29, 171, 242, map(i, 0, bellRings, 40, 5));
            strokeWeight(1.2 * (py / 50));
            ellipse(0, py, rx * 1.5, ry * 1.5);
        }
    }

    // --- 2. VERİ DOKUNAÇLARI (DATA TENTACLES) ---
    let startY = bellRings * spacing;
    let tLenBase = 680; // ── TWEAK: tentacle total length
    let numPoints = rawData.length;

    // ── HIGHLIGHT ANIMATION: cycle through years every 7 seconds ─────────────
    let highlightIndex = numPoints > 0 ? floor(frameCount / (5 * 60)) % numPoints : 0;
    // ────────────────────────────────────────────────────────────────

    // Track Europe's 1991 node position for annotation
    let eu1991x = 0, eu1991y = 0;

    for (let j = 0; j < 6; j++) {
        let region = regions[j];

        // Başlangıç noktaları bell'in altında çok sıkışık — ±20px dar aralık
        let startXOffset = map(j, 0, 5, -35, 35);
        let prevPx = 0, prevPy = 0; // Çizgi çizmek için önceki noktanın hafızası

        for (let p = 0; p < numPoints; p++) {
            let row = rawData[p];
            let val = row[region];

            let normP = p / (numPoints - 1);
            let py = startY + normP * tLenBase;

            // Dalga hareketi
            let wave = sin(t * 1.5 - normP * 4 + j);
            // Dışa doğru yayılma (Ortadakiler düz, dıştakiler kavisli)
            let spreadFactor = map(abs(j - 2.5), 0, 2.5, 0.1, 1.2);
            let dir = (j < 2.5) ? -1 : (j > 2.5 ? 1 : 0);

            let px = startXOffset + (normP * 200 * spreadFactor * dir) + (wave * 30 * normP);

            // Save Europe (j=2) at 1991 (p=6) for annotation
            if (j === 2 && p === 6) { eu1991x = px; eu1991y = py; }

            // VERİYİ ÇAPA ÇEVİR: Değer arttıkça daire büyür
            let rSize = map(val, 0, maxEmission, 5, 60);

            // SADECE İLK SÜTUNDA YILLARI ÇİZ — vurgulu yıl parlak
            if (j === 0) {
                push();
                let isHL = (p === highlightIndex);
                stroke(255, 255, 255, 25); // ── TWEAK: uniform base opacity 25, highlighted 50
                drawingContext.setLineDash([2, 4]);
                line(-300, py, 300, py);

                noStroke();
                if (isHL) {
                    fill(29, 171, 242); // Parlak cyan — aktif yıl texti
                    textSize(18);
                } else {
                    fill(175, 181, 188, 120); // Diğer yılların text opaklığı
                    textSize(13);
                }
                textAlign(RIGHT, CENTER);
                text(row.Year, -310, py);
                pop();
            }

            // Düğümleri (Veri Noktalarını) Birleştiren "Sinir/Damar" Çizgisi
            if (p > 0) {
                stroke(29, 171, 242, 35);
                strokeWeight(1);
                line(prevPx, prevPy, px, py);
            }
            prevPx = px; prevPy = py;

            // Düğüm Noktası — aktif yıl parlak, diğerleri soluk
            let isHL = (p === highlightIndex);
            noStroke();
            fill(29, 171, 242, isHL ? 255 : 40);
            circle(px, py, rSize);

            // DOKUNAÇIN EN ALTINA BÖLGE İSMİNİ + AKTİF YILIN DEĞERİNİ YAZ
            if (p === numPoints - 1) {
                let hlVal = rawData[highlightIndex] ? rawData[highlightIndex][region] : 0;
                push();
                fill(175, 181, 188);
                textSize(13);
                textAlign(CENTER, TOP);
                text(region.toUpperCase(), px, py + rSize / 2 + 10);

                // Aktif yılın değerini göster (yıl etiketi olmadan, sadece kt)
                fill(239, 55, 95);
                textSize(12);
                text(round(hlVal / 1000) + "kt", px, py + rSize / 2 + 28);
                pop();
            }
        }
    }

    // ── ANNOTATION: The Collapse of the Soviet Union (Europe 1991) ────
    if (eu1991x !== 0 || eu1991y !== 0) {
        push();
        // Right anchor is fixed; left tip follows the tentacle wave
        let lineAnchorX = 620; // ── TWEAK: fixed right endpoint
        stroke(175, 181, 188, 255);
        strokeWeight(1);
        drawingContext.setLineDash([4, 6]);
        line(eu1991x, eu1991y, lineAnchorX, eu1991y); // left waves, right fixed
        drawingContext.setLineDash([]);

        noStroke();
        fill(175, 181, 188, 255);
        textSize(16);
        textAlign(RIGHT, TOP);
        text("THE COLLAPSE OF THE SOVIET UNION", lineAnchorX, eu1991y + 10);
        pop();
    }
    pop();

    // SOL ÜST BİLGİ PANELİ (HUD)
    fill(175, 181, 188);
    noStroke();
    textSize(24);
    textAlign(LEFT, TOP);
    text("FERTILIZER USE BY REGION BETWEEN 1961-2023", 40, 40);

    textSize(16);
    fill(29, 171, 242);
    textWidth(100);
    text("TOTAL FERTILIZER CONSUMPTION IS THE SUM OF SYNTHETIC INPUTS OF NITROGEN, POTASSIUM AND PHOSPHOROUS, PLUS ORGANIC NITROGEN INPUTS.", 40, 80, 500);
    text("TENTACLES = REGIONS", 40, 170);
    text("NODE RADIUS = FERTILIZER USE VOL.", 40, 190);
    text("DEPTH = TIMELINE (1961-2023)", 40, 210);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
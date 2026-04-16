// =============================================
//  ANOXIA: CO2 Emission Jellyfish Bell
// =============================================

let co2Data;
let ringsData = [];
let maxTotal = 0;
let t = 0;
let particles = []; // Mikroplastikler

function preload() {
    co2Data = loadJSON('data/co2emission02.json');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    textFont('IBM Plex Mono');

    // Filter to every 10 years starting from 1884
    let startYear = 1884;
    for (let year in co2Data) {
        let y = parseInt(year);
        if (y >= startYear && (y - startYear) % 10 === 0) {
            let row = co2Data[year];

            // Sum all continents to get the global total for the year
            let total = 0;
            if (row["Africa"]) total += row["Africa"];
            if (row["Asia"]) total += row["Asia"];
            if (row["Europe"]) total += row["Europe"];
            if (row["North America"]) total += row["North America"];
            if (row["Oceania"]) total += row["Oceania"];
            if (row["South America"]) total += row["South America"];

            ringsData.push({
                year: y,
                total: total
            });
        }
    }

    // Find the maximum total to scale the radius properly
    for (let item of ringsData) {
        if (item.total > maxTotal) {
            maxTotal = item.total;
        }
    }

    // Initialize microplastics
    for (let i = 0; i < 200; i++) {
        particles.push(new Microplastic());
    }
}

function draw() {
    background('#010a14');

    // Float background particles
    for (let p of particles) {
        p.update();
        p.show();
    }

    t += 0.02; // Jellyfish wave speed

    push();
    // Center the drawing and move it closer to the top to allow the larger graph to reach the bottom
    translate(width / 2, height * 0.20);

    // Scale factor to make it responsive
    let S = height / 1500;
    scale(S);

    let ringsCount = ringsData.length;
    let spacing = 75; // Increased vertical gap to stretch it further linearly
    let xAxisOffset = -500; // Fixed offset for the y-axis timeline

    // HIGHLIGHT ANIMATION: cycle through rings every 5 seconds
    let highlightIndex = ringsCount > 0 ? floor(frameCount / (5 * 60)) % ringsCount : 0;


    // Draw rings (from oldest/smallest at the top, to newest/widest at the bottom)
    for (let i = 0; i < ringsCount; i++) {
        let data = ringsData[i];
        let py = i * spacing;

        // Map total emission to radius (min 40, max 350 pixels)
        let baseRx = map(data.total, 0, maxTotal, 20, 500);

        // Add swimming/pulsing wave effect
        let wave = sin(t - i * 0.1);
        let rx = baseRx * (0.9 + 0.15 * wave);
        let ry = (baseRx * 0.3) * (0.8 + 0.2 * wave);

        if (rx > 0 && ry > 0) {
            let isHL = (i === highlightIndex);

            noFill();
            // Draw the glowing CO2 bell ring (Full opacity if highlighted, 40 if not)
            stroke(29, 171, 242, isHL ? 255 : 40);
            strokeWeight(isHL ? 3 : 2);
            ellipse(0, py, rx * 1.5, ry * 1.25);

            // Horizontal dashed line connecting y-axis to the ellipse
            stroke(255, 255, 255, 50); // Matching transparent white from dataJelly.js
            strokeWeight(1);
            drawingContext.setLineDash([2, 4]);
            line(xAxisOffset, py, -((rx * 1.5) / 2), py);
            drawingContext.setLineDash([]);

            // Text labels
            push();
            noStroke();

            // Draw Year on the y-axis line (same vertical alignment)
            if (isHL) {
                fill(29, 171, 242);     // Cyan highlight
                textSize(24);
            } else {
                fill(175, 181, 188, 100); // Gray baseline
                textSize(20);
            }
            textAlign(RIGHT, CENTER);
            text(data.year, xAxisOffset - 15, py);

            // Draw total emission billion value next to the ring (tracks radius)
            if (isHL) {
                fill(239, 55, 95);      // Red highlight for active value
                textSize(20);
            } else {
                fill(29, 171, 242, 60); // Cyan base with low opacity
                textSize(20);
            }
            textAlign(LEFT, CENTER);
            let billions = (data.total / 1000000000).toFixed(1);
            text(`${billions}`, (rx * 1.5) / 2 + 15, py);
            pop();
        }
    }

    // ── ANNOTATION: China's membership in the WTO (2001) ────
    if (ringsData.length > 0) {
        let firstYear = ringsData[0].year;
        let wtoI = (2001 - firstYear) / 10;
        let wtoPy = wtoI * spacing;

        // Find interpolated total emission for 2001 to get the exact radius
        let indexFloor = max(0, floor(wtoI));
        let indexCeil = min(ringsData.length - 1, ceil(wtoI));

        let totalWto = 0;
        if (indexFloor !== indexCeil) {
            let lerpAmt = wtoI - indexFloor;
            totalWto = lerp(ringsData[indexFloor].total, ringsData[indexCeil].total, lerpAmt);
        } else {
            totalWto = ringsData[indexFloor].total;
        }

        if (totalWto > 0) {
            let baseRx = map(totalWto, 0, maxTotal, 20, 500);
            let wave = sin(t - wtoI * 0.1);
            let wtoRx = baseRx * (0.9 + 0.15 * wave);

            // The expanding right edge of the jellyfish bell
            let wtoRightEdgeX = (wtoRx * 1.5) / 2;
            let lineTipX = 1100; // Fixed right anchor

            push();
            stroke(255, 220, 100, 160);
            strokeWeight(1);
            drawingContext.setLineDash([4, 6]);
            line(wtoRightEdgeX, wtoPy, lineTipX, wtoPy);
            drawingContext.setLineDash([]);

            noStroke();
            fill(175, 181, 188, 255);
            textSize(26);
            textAlign(RIGHT, TOP);
            text("CHINA'S MEMBERSHIP IN THE WTO (2001)", lineTipX, wtoPy + 10);
            pop();
        }
    }

    // Draw a spinal cord connecting the centers
    stroke(29, 171, 242, 80);
    strokeWeight(1);
    drawingContext.setLineDash([4, 6]);
    line(0, 0, 0, (ringsCount - 1) * spacing);
    drawingContext.setLineDash([]);

    // Draw low opacity tentacles at the bottom of the bell
    let bottomY = (ringsCount - 1) * spacing;
    let bottomRadius = map(ringsData[ringsCount - 1].total, 0, maxTotal, 40, 350) * 0.75;

    for (let j = 0; j < 6; j++) {
        // Start from a tight gap under the last ellipse
        let startXOffset = map(j, 0, 5, -30, 30);
        let prevPx = 0, prevPy = 0;
        let numTPoints = 12;
        let tLenBase = 400; // scaled down vertical length compared to dataJelly

        for (let p = 0; p < numTPoints; p++) {
            let normP = p / (numTPoints - 1);
            let pY = bottomY + normP * tLenBase;

            // Copied exact wave movement and spread gaps from dataJelly.js
            let wave = sin(t * 1.5 - normP * 4 + j);
            let spreadFactor = map(abs(j - 2.5), 0, 2.5, 0.1, 1.2);
            let dir = (j < 2.5) ? -1 : (j > 2.5 ? 1 : 0);

            // Scaled down horizontal spread (120 vs 200)
            let pX = startXOffset + (normP * 120 * spreadFactor * dir) + (wave * 20 * normP);

            // Draw connection lines
            if (p > 0) {
                stroke(29, 171, 242, 30);
                strokeWeight(1);
                line(prevPx, prevPy, pX, pY);
            }
            prevPx = pX;
            prevPy = pY;

            // Draw small sequence node
            noStroke();
            fill(29, 171, 242, 40);
            circle(pX, pY, 5);
        }

    }

    pop();

    // TOP LEFT INFO PANEL (HUD)
    fill(175, 181, 188);
    noStroke();
    textSize(24);
    textAlign(LEFT, TOP);
    text("GLOBAL CO2 EMISSION BELL (1884-2024)", 40, 40);

    textSize(16);
    fill(29, 171, 242);
    text("EACH RING = 10 YEARS", 40, 80);
    text("RING RADIUS = TOTAL GLOBAL EMISSIONS (Billion Tons)", 40, 100);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

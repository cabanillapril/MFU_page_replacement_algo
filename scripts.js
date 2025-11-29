/* 
Project: MFU Page Replacement Algorithm Implementation

Group 6:
Barcellano, Lhendie Kaesser F.
Cabais, Jefren Paul A.
Cabanilla, April Anne C.
Pamati-an, Jade Carlo B.
Redolozo, Miguel Andrew T.
Villanueva, Jane Nicole P.
*/

// Startup intro logic
window.onload = () => {
    const introScreen = document.getElementById("startupIntro");
    const mainContent = document.getElementById("mainContent");

    // Hide main content initially
    mainContent.style.display = "none";

    // Fade out startup after delay
    setTimeout(() => {
        introScreen.style.opacity = "0";
        introScreen.style.transition = "opacity 1s ease";

        setTimeout(() => {
            introScreen.style.display = "none";
            mainContent.style.display = "block";
        }, 1000);

    }, 2500);
};

function simulateMFU() {

    // Hide intro animation when simulation starts
    document.getElementById("intro").style.display = "none";

    const framesCount = parseInt(document.getElementById("framesInput").value);

    // Convert pages to TRIMMED STRINGS instead of numbers (fixes NaN)
    const pages = document.getElementById("pagesInput").value
        .split(",")
        .map(p => p.trim())
        .filter(p => p !== "");

    let freq = {};
    let hit = 0;
    let miss = 0;

    let framesArr = Array(framesCount).fill(null);
    let fifoOrder = [];

    // Build the initial table
    let tableHTML = "<table><tr><th>Frame</th>";
    pages.forEach(p => tableHTML += `<th>${p}</th>`);
    tableHTML += "</tr>";
    
    for (let i = 0; i < framesCount; i++) {
        tableHTML += `<tr id="row${i}"><th>${i + 1}</th>` + "<td></td>".repeat(pages.length) + "</tr>";
    }

    // Add a single hit/miss row
    tableHTML += `<tr id="indicatorRow"><th>Hit/Miss</th>` + "<td></td>".repeat(pages.length) + "</tr>";

    const tableElement = document.createElement("div");
    tableElement.innerHTML = tableHTML;
    document.getElementById("result").innerHTML = "";
    document.getElementById("result").appendChild(tableElement);

    let step = 0;
    const interval = setInterval(() => {

        // Stop animation when finished
        if (step >= pages.length) {
            clearInterval(interval);

            // Show animated frequency summary
            const freqContainer = document.getElementById("frequencySummary");
            freqContainer.innerHTML = "";
            document.getElementById("frequencyLabel").classList.add("fade-in-label");

            let delay = 0;
            for (let key in freq) {
                const block = document.createElement("div");
                block.className = "freq-block";
                block.style.animationDelay = `${delay}s`;
                block.innerHTML = `<div>Page ${key}</div><span>${freq[key]}</span>`;
                freqContainer.appendChild(block);
                delay += 0.2;
            }

            // Show animated hit/miss counter
            document.getElementById("hitMissLabel").classList.add("fade-in-label");

            const hitMissContainer = document.getElementById("hitMissSummary");
            hitMissContainer.innerHTML = "";

            const counterDiv = document.createElement("div");
            counterDiv.className = "counter";
            hitMissContainer.appendChild(counterDiv);

            // Smooth counting animation
            let displayedHit = 0;
            let displayedMiss = 0;
            const totalFrames = 60;
            const hitStep = hit / totalFrames;
            const missStep = miss / totalFrames;
            let frame = 0;

            const counterAnim = setInterval(() => {
                frame++;
                displayedHit = Math.min(hit, displayedHit + hitStep);
                displayedMiss = Math.min(miss, displayedMiss + missStep);

                counterDiv.textContent = `Total Hits = ${Math.round(displayedHit)}, Total Misses = ${Math.round(displayedMiss)}`;

                if (frame >= totalFrames) {
                    clearInterval(counterAnim);
                    counterDiv.textContent = `Total Hits = ${hit}, Total Misses = ${miss}`;
                }
            }, 25);

            return;
        }

        const page = pages[step];

        // Count frequency (works for letters or numbers)
        freq[page] = (freq[page] || 0) + 1;

        let isHit = framesArr.includes(page);

        if (isHit) {
            hit++;
        } else {
            miss++;

            if (framesArr.includes(null)) {
                const emptyIndex = framesArr.indexOf(null);
                framesArr[emptyIndex] = page;
                fifoOrder.push(page);
            } else {
                // Apply MFU replacement
                let maxFreq = -1;
                let candidates = [];

                framesArr.forEach((f, idx) => {
                    if (freq[f] > maxFreq) {
                        maxFreq = freq[f];
                        candidates = [idx];
                    } else if (freq[f] === maxFreq) {
                        candidates.push(idx);
                    }
                });

                let toReplace;

                if (candidates.length === 1) {
                    toReplace = candidates[0];
                } else {
                    // FIFO tie-breaker
                    for (let f of fifoOrder) {
                        if (candidates.includes(framesArr.indexOf(f))) {
                            toReplace = framesArr.indexOf(f);
                            break;
                        }
                    }
                }

                fifoOrder = fifoOrder.filter(f => f !== framesArr[toReplace]);
                framesArr[toReplace] = page;
                fifoOrder.push(page);
            }
        }

        // Update frame table
        for (let i = 0; i < framesCount; i++) {
            const cell = tableElement.querySelector(`#row${i}`).cells[step + 1];
            cell.textContent = framesArr[i] || "";
        }

        // Update hit/miss indicator
        const indicatorCell = tableElement.querySelector("#indicatorRow").cells[step + 1];
        indicatorCell.textContent = isHit ? "✔️" : "❌";
        indicatorCell.className = isHit ? "page-hit" : "page-miss";

        step++;

    }, 400);
}

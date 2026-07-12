const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 850;
canvas.height = 450;

let isDragging = false;
let startPoint = { x: 0, y: 0 };
let endPoint = { x: 0, y: 0 };
let hasCut = false;
let hasDied = false;
let currentBlobPoints = [];
let score = 0;
let round = 0;

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function min(a, b) {
    return a < b ? a : b;
}

function generateBlobShape() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasCut = false;

    continueMessage.classList.add('hidden');
    document.getElementById('stats-container').style.margin = '51px auto 0 auto';
    document.querySelector('canvas').style.marginBottom = '8px';
    document.querySelector('p').style.marginBottom = '17.5px';

    document.getElementById('pctA-text').innerText = '- ';
    document.getElementById('ratio-colon').innerText = ':';
    document.getElementById('pctB-text').innerText = ' -';

    if (hasDied) {
        document.getElementById('score-text').innerText = `Score: 0`;
        document.getElementById('score-text').style.color = '#ffffff';
        hasDied = false;
    }

    document.querySelector('.ratio-text').style.color = '#8a8a8a';

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const baseRadius = randomInt(min(78 + round * 2, 140), min(90 + round * 3, 165));
    const spikeIntensity = randomInt(min(65 + round * 1, 100), min(76 + Math.floor(round * 2.5), 150));
    const numPoints = randomInt(min(5+Math.floor(round/3), 15), min(7+Math.floor(round/2), 20));
    currentBlobPoints = [];

    const horizontalFactor = min(1.3 + round * 0.03, 2.1);

    for (let i = 0; i < numPoints; i++) {
        const baseAngle = (i / numPoints) * Math.PI * 2;
        const angleVariance = (Math.random() * 2 - 1) * (Math.PI / numPoints * 0.4); 
        const angle = baseAngle + angleVariance;
        const randomRadius = baseRadius + (Math.random() * 2 - 1) * spikeIntensity;
        
        let x = centerX + Math.cos(angle) * randomRadius * horizontalFactor;
        let y = centerY + Math.sin(angle) * randomRadius;
        
        currentBlobPoints.push({ x, y });
    }

    const margin = 20;
    let maxScaleDown = 1.0;

    for (let i = 0; i < currentBlobPoints.length; i++) {
        let p = currentBlobPoints[i];
        let dx = p.x - centerX;
        let dy = p.y - centerY;
        let maxAllowedX = canvas.width / 2 - margin;
        let maxAllowedY = canvas.height / 2 - margin;
        
        if (Math.abs(dx) > maxAllowedX) {
            let s = maxAllowedX / Math.abs(dx);
            if (s < maxScaleDown) maxScaleDown = s;
        }
        if (Math.abs(dy) > maxAllowedY) {
            let s = maxAllowedY / Math.abs(dy);
            if (s < maxScaleDown) maxScaleDown = s;
        }
    }

    if (maxScaleDown < 1.0) {
        for (let i = 0; i < currentBlobPoints.length; i++) {
            currentBlobPoints[i].x = centerX + (currentBlobPoints[i].x - centerX) * maxScaleDown;
            currentBlobPoints[i].y = centerY + (currentBlobPoints[i].y - centerY) * maxScaleDown;
        }
    }

    drawBlob();
}

function drawBlob() {
    if (currentBlobPoints.length === 0) return;

    ctx.beginPath();
    let xc = (currentBlobPoints[0].x + currentBlobPoints[currentBlobPoints.length - 1].x) / 2;
    let yc = (currentBlobPoints[0].y + currentBlobPoints[currentBlobPoints.length - 1].y) / 2;
    ctx.moveTo(xc, yc);

    for (let i = 0; i < currentBlobPoints.length; i++) {
        const nextIndex = (i + 1) % currentBlobPoints.length;
        xc = (currentBlobPoints[i].x + currentBlobPoints[nextIndex].x) / 2;
        yc = (currentBlobPoints[i].y + currentBlobPoints[nextIndex].y) / 2;
        ctx.quadraticCurveTo(currentBlobPoints[i].x, currentBlobPoints[i].y, xc, yc);
    }

    ctx.closePath();
    ctx.fillStyle = '#007bff';
    ctx.fill();

    ctx.strokeStyle = '#df9bfb'; 
    ctx.lineWidth = 4;
    ctx.stroke();
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

canvas.addEventListener('mousedown', (e) => {
    if (hasCut) {
        generateBlobShape();
        return;
    }
    isDragging = true;
    startPoint = getMousePos(e);
    endPoint = startPoint;
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    endPoint = getMousePos(e);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBlob();
    
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(endPoint.x, endPoint.y);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 7]); 
    ctx.stroke();
    ctx.setLineDash([]); 
});

canvas.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;

    calculateSplit();
});

function calculateSplit() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBlob();

    const x1 = startPoint.x;
    const y1 = startPoint.y;
    const x2 = endPoint.x;
    const y2 = endPoint.y;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;

    function isShapePixel(x, y) {
        if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return false;
        const index = (y * canvas.width + x) * 4;
        return pixels[index] === 0 && pixels[index + 1] === 123 && pixels[index + 2] === 255 && pixels[index + 3] > 0;
    }

    if (isShapePixel(Math.floor(x1), Math.floor(y1)) || isShapePixel(Math.floor(x2), Math.floor(y2))) {
        hasCut = false;
        return;
    }

    let intersectsShape = false;
    const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
    
    for (let i = 0; i <= steps; i++) {
        const t = steps === 0 ? 0 : i / steps;
        const checkX = Math.floor(x1 + (x2 - x1) * t);
        const checkY = Math.floor(y1 + (y2 - y1) * t);

        if (isShapePixel(checkX, checkY)) {
            intersectsShape = true;
            break;
        }
    }

    if (!intersectsShape) {
        hasCut = false;
        return;
    }

    let sideAPixels = 0;
    let sideBPixels = 0;

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            if (isShapePixel(x, y)) {
                const d = (x - x1) * (y2 - y1) - (y - y1) * (x2 - x1);
                
                if (d > 0) {
                    sideAPixels++;
                } else if (d < 0) {
                    sideBPixels++;
                }
            }
        }
    }

    if (sideAPixels === 0 || sideBPixels === 0) {
        hasCut = false; 
        return;
    }
    hasCut = true;

    continueMessage.classList.remove('hidden');
    document.getElementById('stats-container').style.margin = '15px auto 0 auto';
    document.querySelector('canvas').style.marginBottom = '7px';
    document.querySelector('p').style.marginBottom = '16.5px';
    
    const totalShapePixels = sideAPixels + sideBPixels;
    const pctA = (sideAPixels / totalShapePixels) * 100;
    const pctB = (sideBPixels / totalShapePixels) * 100;
    document.getElementById('pctA-text').innerText = Math.round(pctA);
    document.getElementById('ratio-colon').innerText = ':';
    document.getElementById('pctB-text').innerText = Math.round(pctB);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBlob();
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    
    const ratioText = document.querySelector('.ratio-text');

    lowerPercentage = min(Math.round(pctA), Math.round(pctB));

    if (lowerPercentage < 45) {
        scoreColor = '#ff4757';
        document.getElementById('score-text').innerText = `Score: ${score}`;
        document.getElementById('score-text').style.color = '#ff4757';
        hasDied = true;
        score = 0;
        round = 0;
    }
    else if (lowerPercentage === 50) {
        scoreColor = '#00ff51';
        score += 10;
        round++;

        document.getElementById('score-text').innerText = `Score: ${score}`;
    }
    else {
        /*if (lowerPercentage <= 44) {score ++; scoreColor = '#ffffff';} else */if (lowerPercentage === 45 || lowerPercentage === 46) {score += 2; scoreColor = '#fee8d1';} else if (lowerPercentage === 47 || lowerPercentage === 48) {score += 3; scoreColor = '#f3ffc6';} else if (lowerPercentage === 49) {score += 5; scoreColor = '#cfd589';}
        round++;

        document.getElementById('score-text').innerText = `Score: ${score}`;
    }
    ctx.strokeStyle = scoreColor; 
    ratioText.style.color = scoreColor;
    
    ctx.lineWidth = 4;
    ctx.stroke();
}

window.addEventListener('DOMContentLoaded', () => {
    generateBlobShape();
});
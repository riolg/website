const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvasSize = 450;

canvas.width = canvasSize;
canvas.height = canvasSize;

let isDragging = false;
let startPoint = { x: 0, y: 0 };
let endPoint = { x: 0, y: 0 };
let hasCut = false;
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
    document.getElementById('pctA-text').innerText = '- ';
    document.getElementById('ratio-colon').innerText = ':';
    document.getElementById('pctB-text').innerText = ' -';

    document.querySelector('.ratio-text').style.color = '#8a8a8a';

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const baseRadius = randomInt(min(70+round*2, 110), min(70+round*4, 130));
    const spikeIntensity = randomInt(min(65+round*2, 125), min(65+round*5, 150));
    const numPoints = randomInt(min(5+Math.floor(round/3), 10), min(5+Math.floor(round/2), 15));
    currentBlobPoints = [];

    for (let i = 0; i < numPoints; i++) {
        const baseAngle = (i / numPoints) * Math.PI * 2;
        const angleVariance = (Math.random() * 2 - 1) * (Math.PI / numPoints * 0.4); 
        const angle = baseAngle + angleVariance;
        const randomRadius = baseRadius + (Math.random() * 2 - 1) * spikeIntensity;
        
        currentBlobPoints.push({
            x: centerX + Math.cos(angle) * randomRadius,
            y: centerY + Math.sin(angle) * randomRadius
        });
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
    const startPixel = ctx.getImageData(Math.floor(x1), Math.floor(y1), 1, 1).data;
    const endPixel = ctx.getImageData(Math.floor(x2), Math.floor(y2), 1, 1).data;

    const startOnShape = (startPixel[0] === 0 && startPixel[1] === 123 && startPixel[2] === 255 && startPixel[3] > 0);
    const endOnShape = (endPixel[0] === 0 && endPixel[1] === 123 && endPixel[2] === 255 && endPixel[3] > 0);

    if (startOnShape || endOnShape) {
        hasCut = false;
        return;
    }
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;

    let sideAPixels = 0;
    let sideBPixels = 0;

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const index = (y * canvas.width + x) * 4;
            const r = pixels[index];
            const g = pixels[index + 1];
            const b = pixels[index + 2];
            const a = pixels[index + 3];

            if (r === 0 && g === 123 && b === 255 && a > 0) {
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

    lowerPercentage = Math.min(Math.round(pctA), Math.round(pctB));

    if (lowerPercentage < 42) {
        ctx.strokeStyle = '#ff4757'; 
        ratioText.style.color = '#ff4757';
        score = 0;
        round = 0;
    }
    else if (lowerPercentage === 50) {
        ctx.strokeStyle = '#409f44';
        ratioText.style.color = '#409f44';
        score += 10;
        round++;
    }
    else {
        ctx.strokeStyle = '#ffffff';
        ratioText.style.color = '#ffffff';
        if (42 < lowerPercentage <= 44) {score ++;} else if (44 < lowerPercentage <= 46) {score += 2;} else if (46 < lowerPercentage <= 48) {score += 3;} else if (48 < lowerPercentage <= 49) {score += 5;}
        round++;
    }
    document.getElementById('score-text').innerText = `Score: ${score}`;
    ctx.lineWidth = 4;
    ctx.stroke();
}

window.addEventListener('DOMContentLoaded', () => {
    generateBlobShape();
});
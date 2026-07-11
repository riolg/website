window.onload = function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');


    const shapeSize   = 150;       // Size of square
    const shapeColor  = '#3498db'; // Color of square
    const framePadding = 40;       // Extra space around it
    // ==========================================

    canvas.width = shapeSize + (framePadding * 2);
    canvas.height = shapeSize + (framePadding * 2);

    const startX = (canvas.width - shapeSize) / 2;
    const startY = (canvas.height - shapeSize) / 2;

    ctx.fillStyle = shapeColor;
    ctx.fillRect(startX, startY, shapeSize, shapeSize);
};
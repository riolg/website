window.onload = function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Make the internal drawing resolution match our compact CSS frame exactly
    canvas.width = 250;
    canvas.height = 250;

    // ==========================================
    // EASY CONFIGURATION 
    // ==========================================
    const shapeSize  = 130;       // Made the square slightly smaller to fit beautifully
    const shapeColor = '#3498db'; 
    // ==========================================

    // Auto-calculate coordinates to center it perfectly inside the 250x250 space
    const startX = (canvas.width - shapeSize) / 2;
    const startY = (canvas.height - shapeSize) / 2;

    // Set the color and draw the square
    ctx.fillStyle = shapeColor;
    ctx.fillRect(startX, startY, shapeSize, shapeSize);
};
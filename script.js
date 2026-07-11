window.onload = function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const shapeSize  = 150;       //Width and height of the square
    const shapeColor = '#3498db';

    //keep it centered
    const startX = (canvas.width - shapeSize) / 2;
    const startY = (canvas.height - shapeSize) / 2;

    ctx.fillStyle = shapeColor;
    ctx.fillRect(startX, startY, shapeSize, shapeSize);
};
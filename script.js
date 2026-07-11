const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 500;
canvas.height = 500;

const shapeSize = 200; 
const borderRadius = 30;

const x = (canvas.width - shapeSize) / 2;
const y = (canvas.height - shapeSize) / 2;

ctx.fillStyle = '#007bff'; 

ctx.beginPath();
ctx.roundRect(x, y, shapeSize, shapeSize, borderRadius);
ctx.fill()
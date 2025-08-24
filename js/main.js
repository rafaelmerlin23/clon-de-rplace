
let showGrid = true; 
const toggleGridBtn = document.getElementById('toggleGridBtn'); 
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const colorInput = document.getElementById("colorInput");
const resetViewBtn = document.getElementById("resetViewBtn");
const statusElement = document.getElementById("status");
const zoomInBtn = document.getElementById("zoomInBtn");
const zoomOutBtn = document.getElementById("zoomOutBtn");
const modeIndicator = document.getElementById("modeIndicator");
const changeModeButton = document.getElementById("changeMode");
let CELL_SIDE_COUNT = 1000;
let canvasWidth = 10000;
let canvasHeight = 10000;
let cellPixelLength = canvasWidth / CELL_SIDE_COUNT;
const uses = document.getElementById("uses");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let scale = 1;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let isDrawing = false;
let startX, startY;
const colorHistory = {};

let minScale = 0.1;
let maxScale = 5;
let maxOffsetX = 0;
let maxOffsetY = 0;
let minOffsetX = 0;
let minOffsetY = 0;

if(localStorage.getItem("use")<= 0){
    startCountdown()
}

let paintUse = localStorage.getItem("use");

uses.textContent = "Usos: "+paintUse


if(localStorage.getItem("use") === null){
    localStorage.setItem("use",100);
    paintUse = 100
}


let currentMode = 'pan'; 

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

if(paintUse == 0){
    changeModeButton.disabled = true    
}

function calculateBounds() {
    maxOffsetX = 0;
    maxOffsetY = 0;
    minOffsetX = Math.min(0, canvas.width - canvasWidth * scale);
    minOffsetY = Math.min(0, canvas.height - canvasHeight * scale);
}

function updateStatus() {
    statusElement.textContent = `Zoom: ${Math.round(scale * 100)}%`;
    modeIndicator.textContent = `Modo: ${currentMode === 'pan' ? 'Desplazamiento' : 'Dibujo'}`;
    changeModeButton.textContent = currentMode === "pan" ? "Dibujar" :"Desplazar";
}

function toggleMode() {
    
    currentMode = currentMode === 'pan' ? 'draw' : 'pan';
    updateStatus();
}

canvas.addEventListener("mousedown", (e) => {
    if (e.button === 0) { 
    isDragging = true;
    startX = e.clientX - offsetX;
    startY = e.clientY - offsetY;
    canvas.style.cursor = 'grabbing';
    }
});

window.addEventListener("mouseup", () => {
    isDragging = false;
    canvas.style.cursor = 'default';
});

window.addEventListener("mousemove", (e) => {
    if (isDragging) {
    offsetX = e.clientX - startX;
    offsetY = e.clientY - startY;
    
    limitOffset();
    
    draw();
    }
});

canvas.addEventListener("click", handleDraw);

function toggleGrid() {
    showGrid = !showGrid;
    toggleGridBtn.textContent = showGrid ? 'Ocultar Guía' : 'Mostrar Guía';
    draw(); 
}

toggleGridBtn.addEventListener('click', toggleGrid);

canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
canvas.addEventListener("touchend", handleTouchEnd);

changeModeButton.addEventListener("click", toggleMode);

canvas.addEventListener("wheel", handleWheel, { passive: false });

zoomInBtn.addEventListener("click", () => adjustZoom(0.2));
zoomOutBtn.addEventListener("click", () => adjustZoom(-0.2));

resetViewBtn.addEventListener("click", resetView);

function handleTouchStart(e) {
    e.preventDefault();
    
    if (e.touches.length === 1) {
    if (currentMode === 'pan') {
        isDragging = true;
        startX = e.touches[0].clientX - offsetX;
        startY = e.touches[0].clientY - offsetY;
    } else {
        isDrawing = true;
        handleDraw(e);
    }
    } else if (e.touches.length === 2) {
    isDragging = false;
    isDrawing = false;
    handlePinchStart(e);
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    
    if (isDragging && e.touches.length === 1 && currentMode === 'pan') {
    offsetX = e.touches[0].clientX - startX;
    offsetY = e.touches[0].clientY - startY;
    
    limitOffset();
    
    draw();
    } else if (isDrawing && e.touches.length === 1 && currentMode === 'draw') {
    handleDraw(e);
    } else if (e.touches.length === 2) {
    handlePinch(e);
    }
}

function handleTouchEnd() {
    isDragging = false;
    isDrawing = false;
}

function handleWheel(e) {
    e.preventDefault();
    const zoomIntensity = 0.1;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoom = e.deltaY < 0 ? 1 + zoomIntensity : 1 - zoomIntensity;
    adjustZoom(zoom - 1, mouseX, mouseY);
}

function adjustZoom(zoomDelta, centerX, centerY) {
    const newScale = Math.min(maxScale, Math.max(minScale, scale * (1 + zoomDelta)));
    
    if (centerX !== undefined && centerY !== undefined) {
    offsetX = centerX - (centerX - offsetX) * (newScale / scale);
    offsetY = centerY - (centerY - offsetY) * (newScale / scale);
    }
    
    scale = newScale;
    
    calculateBounds();
    limitOffset();
    
    draw();
    updateStatus();
}

function handleDraw(e) {
    
    if(currentMode === "pan"){
        return
    }

    if(localStorage.getItem("use") <= 0){
        changeModeButton.disabled = true
        currentMode = 'pan'
        startCountdown()        
    }

    
    let clientX, clientY;
    
    if (e.type.includes('touch')) {
    if (!isDrawing && currentMode !== 'draw') return;
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
    } else {
    clientX = e.clientX;
    clientY = e.clientY;
    }
    
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left - offsetX) / scale;
    const y = (clientY - rect.top - offsetY) / scale;

    const cellX = Math.floor(x / cellPixelLength);
    const cellY = Math.floor(y / cellPixelLength);

    if (cellX >= 0 && cellY >= 0 && cellX < CELL_SIDE_COUNT && cellY < CELL_SIDE_COUNT) {
    console.log(cellX,cellY)
    const key = `${cellX}_${cellY}`;
    colorHistory[key] = colorInput.value;
    savePixel(cellX,cellY,key,colorInput.value);
    draw();
    localStorage.setItem("use",Number(localStorage.getItem("use")-1));
    uses.textContent = "Usos: "+localStorage.getItem("use");
    }
}

let initialPinchDistance = null;
let initialScale = 1;

function handlePinchStart(e) {
    initialScale = scale;
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    initialPinchDistance = Math.hypot(
    touch2.clientX - touch1.clientX,
    touch2.clientY - touch1.clientY
    );
}

function handlePinch(e) {
    if (initialPinchDistance === null) return;
    
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const currentDistance = Math.hypot(
    touch2.clientX - touch1.clientX,
    touch2.clientY - touch1.clientY
    );
    
    const zoomFactor = currentDistance / initialPinchDistance;
    const newScale = Math.min(maxScale, Math.max(minScale, initialScale * zoomFactor));
    
    const rect = canvas.getBoundingClientRect();
    const centerX = (touch1.clientX + touch2.clientX) / 2 - rect.left;
    const centerY = (touch1.clientY + touch2.clientY) / 2 - rect.top;
    
    offsetX = centerX - (centerX - offsetX) * (newScale / scale);
    offsetY = centerY - (centerY - offsetY) * (newScale / scale);
    
    scale = newScale;
    
    calculateBounds();
    limitOffset();
    
    draw();
    updateStatus();
}

function resetView() {

    scale = 1;
    offsetX = 0;
    offsetY = 0;
    calculateBounds();
    draw();
    updateStatus();
}

function limitOffset() {
    offsetX = Math.min(maxOffsetX, Math.max(minOffsetX, offsetX));
    offsetY = Math.min(maxOffsetY, Math.max(minOffsetY, offsetY));
}

function drawGrid() {
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= CELL_SIDE_COUNT; i++) {
    const pos = i * cellPixelLength;
    
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, canvasHeight);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(canvasWidth, pos);
    ctx.stroke();
    }
}

function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    for (const key in colorHistory) {
        const [x, y] = key.split("_").map(Number);
        ctx.fillStyle = colorHistory[key];
        ctx.fillRect(x * cellPixelLength, y * cellPixelLength, cellPixelLength, cellPixelLength);
    }

    if (showGrid) {
        drawGrid();
    }
    
    ctx.restore();
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    calculateBounds();
    limitOffset();
    draw();
});

calculateBounds();
updateStatus();



document.addEventListener('DOMContentLoaded', function() {
    loadPixels();
    pixelSocket();
    setTimeout(draw, 100);
    toggleGridBtn.textContent = showGrid ? 'Ocultar Guía' : 'Mostrar Guía';
});


if (!isMobile) {
    document.getElementById('mobile-controls').style.display = 'none';
}
const audioFile = document.getElementById('audioFile');
const videoFile = document.getElementById('videoFile');
const audioPlayer = document.getElementById('audioPlayer');
const videoPlayer = document.getElementById('videoPlayer');

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
let animationFrameId;

let x = 0;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    ctx.beginPath();
    ctx.arc(x, 150, 20, 0, Math.PI * 2); 
    ctx.fillStyle = 'blue';
    ctx.fill();
    x += 2;
    if (x > canvas.width) x = 0;
}

function startAnimation() {
    function animate() {
        draw();
        animationFrameId = requestAnimationFrame(animate);
    }
    animate();
}

function stopAnimation() {
    cancelAnimationFrame(animationFrameId);
}

const imageCanvas = document.getElementById('imageCanvas');
const imageCtx = imageCanvas.getContext('2d');
const imageUpload = document.getElementById('imageUpload');
let uploadedImage = new Image();
let isDrawing = false;
let eraserMode = false;
let drawColor = "#000000";

imageUpload.addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedImage.onload = function() {
            imageCtx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
            imageCtx.drawImage(uploadedImage, 0, 0, imageCanvas.width, imageCanvas.height);
        };
        uploadedImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

function applyFilter(filter) {
    if (uploadedImage) {
        imageCtx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
        imageCtx.drawImage(uploadedImage, 0, 0, imageCanvas.width, imageCanvas.height);
        const imageData = imageCtx.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
        const data = imageData.data;
        switch (filter) {
            case 'invert':
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = 255 - data[i];      
                    data[i + 1] = 255 - data[i+1]; 
                    data[i + 2] = 255 - data[i+2];
                }
                break;
            case 'grayscale':
                for (let i = 0; i < data.length; i += 4) {
                    const avg = (data[i] + data[i+1] + data[i+2]) / 3;
                    data[i] = avg;      
                    data[i + 1] = avg;   
                    data[i + 2] = avg;   
                }
                break;
            case 'sepia':
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i+1];
                    const b = data[i+2];
                    data[i] = Math.min(255, 0.393 * r + 0.769 * g + 0.189 * b); 
                    data[i+1] = Math.min(255, 0.349 * r + 0.686 * g + 0.168 * b);
                    data[i+2] = Math.min(255, 0.272 * r + 0.534 * g + 0.131 * b); 
                }
                break;
        }
        imageCtx.putImageData(imageData, 0, 0);
    }
}

function saveImage() {
    if (uploadedImage) {
        const link = document.createElement('a');
        link.href = imageCanvas.toDataURL('image/png');
        link.download = 'processed_image.png';
        link.click();
    }
}

imageCanvas.addEventListener('mousedown', startDrawing);
imageCanvas.addEventListener('mousemove', drawOnCanvas);
imageCanvas.addEventListener('mouseup', stopDrawing);
imageCanvas.addEventListener('mouseout', stopDrawing);

function startDrawing(e) {
    if (eraserMode) {
        return;
    }
    isDrawing = true;
    drawOnCanvas(e);
}

function drawOnCanvas(e) {
    if (!isDrawing) return;

    const rect = imageCanvas.getBoundingClientRect(); 
    const xPos = e.clientX - rect.left; 
    const yPos = e.clientY - rect.top;  

    imageCtx.beginPath();
    imageCtx.arc(xPos, yPos, 5, 0, Math.PI * 2);
    imageCtx.fillStyle = drawColor;
    imageCtx.fill();
}

function stopDrawing() {
    isDrawing = false;
}

function activateEraser() {
    eraserMode = true;
    drawColor = "#ffffff"; 
}

function deactivateEraser() {
    eraserMode = false;
    drawColor = document.getElementById('colorPicker').value;
}
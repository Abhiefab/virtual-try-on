const uploadedImage = new Image();
const glassesImg = new Image();
let currentGlasses = 'round_glasses.png';

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let detections;

let isEditing = false;
const transform = {
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0,
  dragging: false,
  offsetX: 0,
  offsetY: 0
};

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('./models/tiny_face_detector'),
  faceapi.nets.faceLandmark68Net.loadFromUri('./models/face_landmark_68')
]).then(() => {
  console.log("Models Loaded");
});

function downloadImage() {
  const link = document.createElement('a');
  link.download = 'virtual_glasses.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function toggleEditMode() {
  isEditing = !isEditing;
  alert(isEditing ? 'Manual Adjust Mode ON' : 'Manual Adjust Mode OFF');
}

document.getElementById('upload').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = async function () {
    uploadedImage.src = reader.result;
    uploadedImage.onload = async () => {
      canvas.width = uploadedImage.width;
      canvas.height = uploadedImage.height;
      ctx.drawImage(uploadedImage, 0, 0);

      detections = await faceapi.detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();

      if (!detections) {
        console.log("No face detected.");
        return;
      }

      const landmarks = detections.landmarks;
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();

      const eyeCenterX = (leftEye[0].x + rightEye[3].x) / 2;
      const eyeCenterY = (leftEye[0].y + rightEye[3].y) / 2;
      const glassesWidth = Math.abs(rightEye[3].x - leftEye[0].x) * 2;

      glassesImg.onload = () => {
        const aspectRatio = glassesImg.width / glassesImg.height;
        const glassesHeight = glassesWidth / aspectRatio;

        transform.x = eyeCenterX - glassesWidth / 2 + 3;
        transform.y = eyeCenterY - glassesHeight / 2 + 10;
        transform.scale = glassesWidth / glassesImg.width;
        transform.rotation = 0;

        draw();

        // Show the Edit button
        document.getElementById('edit-btn').style.display = 'inline-flex';
      };

      glassesImg.src = './glasses/' + currentGlasses;
    };
  };
  reader.readAsDataURL(file);
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(uploadedImage, 0, 0);
  ctx.save();
  ctx.translate(transform.x + glassesImg.width * transform.scale / 2, transform.y + glassesImg.height * transform.scale / 2);
  ctx.rotate(transform.rotation);
  ctx.scale(transform.scale, transform.scale);
  ctx.drawImage(glassesImg, -glassesImg.width / 2, -glassesImg.height / 2);
  ctx.restore();
}

canvas.addEventListener('mousedown', (e) => {
  if (!isEditing) return;
  transform.dragging = true;
  transform.offsetX = e.offsetX - transform.x;
  transform.offsetY = e.offsetY - transform.y;
});

canvas.addEventListener('mousemove', (e) => {
  if (!isEditing || !transform.dragging) return;
  transform.x = e.offsetX - transform.offsetX;
  transform.y = e.offsetY - transform.offsetY;
  draw();
});

canvas.addEventListener('mouseup', () => {
  if (isEditing) transform.dragging = false;
});

canvas.addEventListener('mouseleave', () => {
  if (isEditing) transform.dragging = false;
});

canvas.addEventListener('wheel', (e) => {
  if (!isEditing) return;
  e.preventDefault();
  if (e.shiftKey) {
    transform.rotation += e.deltaY * 0.001;
  } else {
    transform.scale += e.deltaY * -0.001;
    transform.scale = Math.max(0.1, Math.min(5, transform.scale));
  }
  draw();
});

function changeGlasses(name) {
  currentGlasses = name;
  if (uploadedImage.src) {
    glassesImg.src = './glasses/' + currentGlasses;
    document.getElementById('edit-btn').style.display = 'inline-flex';
  }
}

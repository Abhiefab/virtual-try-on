// Virtual Try-On System - Final Corrected Version

class VirtualTryOn {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');

    this.uploadedImage = new Image();
    this.glassesImg = new Image();
    this.hatImg = null;

    this.transform = { x: 0, y: 0, scale: 1, rotation: 0, dragging: false, offsetX: 0, offsetY: 0 };
    this.isEditing = false;
    this.detections = null;
    this.currentGlasses = 'round_glasses.png';

    this.init();
    this.addEventListeners();
  }

  async init() {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('./models/tiny_face_detector'),
      faceapi.nets.faceLandmark68Net.loadFromUri('./models/face_landmark_68')
    ]);
    console.log("Models Loaded");
  }

  addEventListeners() {
    document.getElementById('upload').addEventListener('change', (e) => this.handleUpload(e));
    document.getElementById('saveBtn').addEventListener('click', () => this.saveImage());
    this.canvas.addEventListener('mousedown', (e) => this.startDrag(e));
    this.canvas.addEventListener('mousemove', (e) => this.dragMove(e));
    this.canvas.addEventListener('mouseup', () => this.endDrag());
    this.canvas.addEventListener('mouseleave', () => this.endDrag());
    this.canvas.addEventListener('wheel', (e) => this.handleTransform(e));
  }

  async handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      this.uploadedImage.src = reader.result;
      this.uploadedImage.onload = async () => {
        this.canvas.width = this.uploadedImage.width;
        this.canvas.height = this.uploadedImage.height;
        this.ctx.drawImage(this.uploadedImage, 0, 0);

        this.detections = await faceapi.detectSingleFace(this.canvas, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();

        if (!this.detections) {
          alert("No face detected in the image.");
          return;
        }

        this.loadGlasses(this.currentGlasses);
      };
    };
    reader.readAsDataURL(file);
  }

  setupGlassesPosition() {
    const landmarks = this.detections.landmarks;
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    const eyeCenterX = (leftEye[0].x + rightEye[3].x) / 2;
    const eyeCenterY = (leftEye[0].y + rightEye[3].y) / 2;
    const glassesWidth = Math.abs(rightEye[3].x - leftEye[0].x) * 2;

    const aspectRatio = this.glassesImg.width / this.glassesImg.height;
    const glassesHeight = glassesWidth / aspectRatio;

    this.transform.x = eyeCenterX - glassesWidth / 2 + 3;
    this.transform.y = eyeCenterY - glassesHeight / 2 + 10;
    this.transform.scale = glassesWidth / this.glassesImg.width;
    this.transform.rotation = 0;

    this.drawScene();
    document.getElementById('top-edit-btn').style.display = 'inline-block';
  }

  loadGlasses(name) {
    if (!name || name === "none") {
      this.glassesImg.src = "";  // Clear image
      this.drawScene();         // Redraw without glasses
      return;
    }

    this.currentGlasses = name;
    this.glassesImg.onload = () => {
      if (!this.detections) {
        console.warn("Face landmarks not available yet.");
        return;
      }
      this.setupGlassesPosition();  // Safe to position after load
    };
    this.glassesImg.src = `./glasses/${name}`;
  }

  loadHat(filename) {
    if (!filename || filename === "none") {
        this.hatImg = null;   // Clear the hat
        this.drawScene();     // Redraw without the hat
        return;
    }

    const newHat = new Image();
    newHat.src = `./hats/${filename}`;
    newHat.onload = () => {
        this.hatImg = newHat;
        this.drawScene();
    };
}


  drawScene() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.uploadedImage, 0, 0);

    if (this.hatImg && this.detections) this.drawHat();
    if (this.glassesImg.src) this.drawGlasses();
  }

  drawGlasses() {
    if (!this.glassesImg.complete || !this.detections) return;

    this.ctx.save();
    this.ctx.translate(
      this.transform.x + this.glassesImg.width * this.transform.scale / 2,
      this.transform.y + this.glassesImg.height * this.transform.scale / 2
    );
    this.ctx.rotate(this.transform.rotation);
    this.ctx.scale(this.transform.scale, this.transform.scale);
    this.ctx.drawImage(this.glassesImg, -this.glassesImg.width / 2, -this.glassesImg.height / 2);
    this.ctx.restore();
  }

  drawHat() {
    const landmarks = this.detections.landmarks;
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    const noseTip = landmarks.getNose()[6];

    const eyeDistance = Math.hypot(leftEye[0].x - rightEye[3].x, leftEye[0].y - rightEye[3].y);
    const hatWidth = eyeDistance * 3.5;
    const hatHeight = hatWidth * (this.hatImg.naturalHeight / this.hatImg.naturalWidth);

    const x = noseTip.x - hatWidth / 2;
    const y = leftEye[0].y - hatHeight * 0.8;

    this.ctx.drawImage(this.hatImg, x, y, hatWidth, hatHeight);
  }

  startDrag(e) {
    if (!this.isEditing) return;
    this.transform.dragging = true;
    this.transform.offsetX = e.offsetX - this.transform.x;
    this.transform.offsetY = e.offsetY - this.transform.y;
  }

  dragMove(e) {
    if (!this.isEditing || !this.transform.dragging) return;
    this.transform.x = e.offsetX - this.transform.offsetX;
    this.transform.y = e.offsetY - this.transform.offsetY;
    this.drawScene();
  }

  endDrag() {
    this.transform.dragging = false;
  }

  handleTransform(e) {
    if (!this.isEditing) return;
    e.preventDefault();

    if (e.shiftKey) {
      this.transform.rotation += e.deltaY * 0.001;
    } else {
      this.transform.scale += e.deltaY * -0.001;
      this.transform.scale = Math.max(0.1, Math.min(5, this.transform.scale));
    }
    this.drawScene();
  }

  toggleEditMode() {
    this.isEditing = !this.isEditing;
    alert(this.isEditing ? 'Manual Adjust Mode ON' : 'Manual Adjust Mode OFF');
  }

  async saveImage() {
    const dataURL = this.canvas.toDataURL('image/png');
    try {
      const response = await fetch('gallery/saveImage.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataURL })
      });
      const result = await response.json();
      alert(result.message);
    } catch (error) {
      console.error("Error saving image:", error);
      alert("Failed to save image.");
    }
  }
}

// Initialize
const tryOnApp = new VirtualTryOn('canvas');

// Expose global functions for button handlers
window.changeGlasses = (name) => tryOnApp.loadGlasses(name);
window.changeHat = (filename) => tryOnApp.loadHat(filename);
window.toggleEditMode = () => tryOnApp.toggleEditMode();
window.downloadImage = () => {
  const link = document.createElement('a');
  link.download = 'virtual_glasses.png';
  link.href = tryOnApp.canvas.toDataURL('image/png');
  link.click();
};

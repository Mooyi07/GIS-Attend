const qrcode = new QRCode("qrcode");
function makeCode() {
  const elText = document.getElementById("lrn");
  const elName = document.getElementById("name");
  console.log(elText.value + "&" + elName.value);
  if (!elText.value || !elName.value) {
    alert("Fill the important details");
    elText.focus();
    return;
  }
  qrcode.makeCode("lrn=" + elText.value + "&name=" + elName.value);
}
document.getElementById("generateBtn").addEventListener("click", makeCode);

/* ===== QR SCANNER ===== */
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const lrnResultDiv = document.getElementById('lrnResult');
const nameResultDiv = document.getElementById('nameResult');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const cameraSelect = document.getElementById('cameraSelect');
const fileInput = document.getElementById('fileInput');

let stream = null;
let scanning = false;
let rafId = null;

async function listCameras() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter(d => d.kind === 'videoinput');
  cameraSelect.innerHTML = '';
  videoDevices.forEach((d, i) => {
    const opt = document.createElement('option');
    opt.value = d.deviceId;
    opt.text = d.label || `Camera ${i+1}`;
    cameraSelect.appendChild(opt);
  });
}

async function startCamera() {
  stopCamera();
  const deviceId = cameraSelect.value || undefined;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: deviceId ? { exact: deviceId } : undefined, facingMode: 'environment' },
      audio: false
    });
    video.srcObject = stream;
    await video.play();
    scanning = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    tick();
  } catch (err) {
    alert('Could not start camera: ' + err.message);
  }
}

function stopCamera() {
  scanning = false;
  startBtn.disabled = false;
  stopBtn.disabled = true;
  if (rafId) cancelAnimationFrame(rafId);
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
  video.srcObject = null;
}

function tick() {
  if (!scanning) return;
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });
    if (code) {
      console.log('QR Code found:', code);
      code.data.split('&').forEach(part => {
        const [key, value] = part.split('=');
        if (key === 'lrn') {
          lrnResultDiv.textContent = `LRN: ${value}`;
        } else if (key === 'name') {
          nameResultDiv.textContent = `Name: ${value}`;
        }
      });
    }
  }
  rafId = requestAnimationFrame(tick);
}

fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });
    resultDiv.textContent = code ? code.data : 'No QR code found in image.';
  };
  img.src = URL.createObjectURL(file);
});

startBtn.addEventListener('click', startCamera);
stopBtn.addEventListener('click', stopCamera);
cameraSelect.addEventListener('change', () => { if (stream) startCamera(); });

(async () => {
  if (navigator.mediaDevices) await listCameras();
})();
window.addEventListener('beforeunload', stopCamera);
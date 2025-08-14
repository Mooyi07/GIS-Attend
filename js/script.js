/* ===== QR GENERATOR ===== */
const qrcode = new QRCode("qrcode");

function makeCode() {
  const elText = document.getElementById("fullName");
  const elLRN = document.getElementById("studLRN");
  if (!elText.value || !elLRN.value) {
    alert("Input a text");
    elText.focus();
    return;
  }
  // Include both Name and LRN in QR data
  qrcode.makeCode(`Name=${encodeURIComponent(elText.value)}&LRN=${encodeURIComponent(elLRN.value)}`);
}

document.getElementById("generateBtn").addEventListener("click", makeCode);
document.getElementById("fullName").addEventListener("keydown", e => {
  if (e.key === "Enter") makeCode();
});

/* ===== QR SCANNER ===== */
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const resultDiv = document.getElementById('result');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const cameraSelect = document.getElementById('cameraSelect');
const fileInput = document.getElementById('fileInput');
const downloadBtn = document.getElementById('downloadBtn'); // New download button
const attendanceTableBody = document.querySelector('#attendanceTable tbody');

let stream = null;
let scanning = false;
let rafId = null;
let attendanceList = [];

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
      resultDiv.textContent = code.data;
      addToAttendance(code.data);
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
    if (code) {
      resultDiv.textContent = code.data;
      addToAttendance(code.data);
    } else {
      resultDiv.textContent = 'No QR code found in image.';
    }
  };
  img.src = URL.createObjectURL(file);
});

function addToAttendance(data) {
  let student = {};
  data.split('&').forEach(part => {
    let [key, value] = part.split('=');
    student[key] = decodeURIComponent(value || '');
  });

  // Avoid duplicates by LRN
  if (!attendanceList.find(s => s.LRN === student.LRN)) {
    student.time = new Date().toLocaleTimeString();
    attendanceList.push(student);

    const row = document.createElement('tr');
    row.innerHTML = `<td>${student.LRN || ''}</td><td>${student.Name || ''}</td><td>${student.time}</td>`;
    attendanceTableBody.appendChild(row);
  }
}

// ===== Download Excel =====
downloadBtn.addEventListener('click', () => {
  if (attendanceList.length === 0) {
    alert("No attendance records to export.");
    return;
  }

  // Format data for Excel
  const dataForExcel = attendanceList.map(s => ({
    Timestamp: s.time,
    LRN: s.LRN,
    Name: s.Name
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(dataForExcel);
  XLSX.utils.book_append_sheet(wb, ws, "Attendance");

  XLSX.writeFile(wb, "attendance.xlsx");
});

startBtn.addEventListener('click', startCamera);
stopBtn.addEventListener('click', stopCamera);
cameraSelect.addEventListener('change', () => { if (stream) startCamera(); });

(async () => {
  if (navigator.mediaDevices) await listCameras();
})();
window.addEventListener('beforeunload', stopCamera);

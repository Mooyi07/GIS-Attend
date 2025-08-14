# QR Code Attendance System (Vanilla JS)

A browser-based QR Code Attendance System built using **vanilla JavaScript**, HTML, and CSS — no Node.js or backend setup required.  
Supports camera-based scanning and image uploads, records attendance with timestamps, and exports the data to Excel.

## 📌 Features
- **QR Code Generation** — Generate QR codes for given text/links.
- **QR Code Scanning** — Supports live camera feed or uploaded images.
- **Multi-Camera Support** — Select from available devices.
- **Attendance Logging** — Records each scan with:
  - Timestamp
  - LRN (Learning Reference Number)
  - Student Name
- **Duplicate Prevention** — Scans are only recorded once per student.
- **Excel Export** — Download attendance records as `.xlsx`.

## 🛠 Tech Stack
- HTML5
- CSS3
- JavaScript (Vanilla)
- [jsQR](https://github.com/cozmo/jsQR) — QR code decoding
- [QRCode.js](https://github.com/davidshimjs/qrcodejs) — QR code generation
- [SheetJS](https://sheetjs.com/) — Excel file generation

## 📂 Project Structure
```
📦 qr-attendance
├── index.html        # Main HTML file
├── styles.css        # Styling
├── script.js         # Main JS logic
├── qrcode.js         # QR code generation library
├── jsQR.js           # QR decoding library
├── xlsx.full.min.js  # SheetJS library for Excel export
└── README.md         # Documentation
```

## 🚀 How to Run
1. **Clone or download** this repository.
2. Open `index.html` in a browser.  
   > ⚠️ For camera access, use `https` or `http://localhost` (some browsers block cameras on `file://`).
3. Click **Start Camera** or **Upload Image** to scan a QR code.
4. Attendance will be logged and can be downloaded as Excel.

## 📸 Screenshots
*(Add screenshots of your UI here)*

## 📜 License
This project is for demonstration and educational purposes. Modify freely for personal or educational use.

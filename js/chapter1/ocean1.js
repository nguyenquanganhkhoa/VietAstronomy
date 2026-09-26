// --- 1. THIẾT LẬP THƯ VIỆN THREE.JS ---
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030a16); // Màu đêm biển thẫm
scene.fog = new THREE.FogExp2(0x030a16, 0.003); // Sương mù biển xa

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

// Đặt camera ở độ cao quan sát trên mặt biển
const EYE_HEIGHT = 5; 
camera.position.set(0, EYE_HEIGHT, 0);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;

// --- 2. ĐIỀU CHỈNH ORBITCONTROLS ---
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false;
controls.target.set(0, EYE_HEIGHT + 0.5, -10);
controls.minPolarAngle = 0; 
controls.maxPolarAngle = Math.PI / 1.7; // Giới hạn không cho camera chìm xuống dưới mặt nước
controls.enableZoom = true;
controls.minDistance = 2;  
controls.maxDistance = 15; 

// --- 3. ÁNH SÁNG ---
const ambientLight = new THREE.AmbientLight(0x0f172a, 1.0);
scene.add(ambientLight);

const starlight = new THREE.DirectionalLight(0x38bdf8, 0.4);
starlight.position.set(10, 50, 20);
scene.add(starlight);

// --- TẠO MẶT NƯỚC ĐẠI DƯƠNG TÁN XẠ ÁNH SÁNG (KHÔNG LÓA SÁNG) ---
const oceanGeo = new THREE.PlaneGeometry(1000, 1000, 60, 60);
oceanGeo.rotateX(-Math.PI / 2);

const oceanMat = new THREE.MeshStandardMaterial({
    color: 0x0a2540,      // Tông màu xanh đại dương đêm thẫm
    roughness: 1.0,       // Tăng lên 1.0 để bề mặt nhám mờ, DẬP TẮT LÓA SÁNG
    metalness: 0.0,       // Đưa về 0.0 để không phản chiếu nguồn đèn
    flatShading: true,    // Giữ mảng khối Low-Poly
    transparent: true,
    opacity: 0.95
});

const ocean = new THREE.Mesh(oceanGeo, oceanMat);
ocean.position.y = 0;
scene.add(ocean);

// Sương mù đường chân trời giúp biển như trải dài vô tận
scene.fog = new THREE.FogExp2(0x030a16, 0.003);
scene.background = new THREE.Color(0x030a16);
// Ánh sáng phản chiếu từ dải ngân hà xuống mặt biển
const oceanLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
oceanLight.position.set(0, 50, -50);
scene.add(oceanLight);
// --- 5. BẦU TRỜI ĐẦY SAO & DẢI NGÂN HÀ ---
const starCount = 3000;
const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(starCount * 3);
const starColors = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = 200 + Math.random() * 50;

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = Math.abs(r * Math.sin(phi) * Math.sin(theta));
    const z = r * Math.cos(phi);

    starPos[i * 3] = x;
    starPos[i * 3 + 1] = y;
    starPos[i * 3 + 2] = z;

    const colorType = Math.random();
    if (colorType > 0.8) {
        starColors[i * 3] = 0.6; starColors[i * 3 + 1] = 0.8; starColors[i * 3 + 2] = 1.0;
    } else if (colorType > 0.6) {
        starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 0.9; starColors[i * 3 + 2] = 0.7;
    } else {
        starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 1.0; starColors[i * 3 + 2] = 1.0;
    }
}

starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

const starMat = new THREE.PointsMaterial({
    size: 1.8,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 1.0,
    blending: THREE.AdditiveBlending
});
const starField = new THREE.Points(starGeo, starMat);
scene.add(starField);

// --- 6. RESIZE SỰ KIỆN CỬA SỔ ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- 7. ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);
    starField.rotation.y += 0.0001;
    controls.update();
    renderer.render(scene, camera);
}

animate();
// 8. Đóng mở tờ giấy
document.addEventListener('DOMContentLoaded', () => {
  const hintToggleBtn = document.getElementById('hint-toggle-button');
  const hintModal = document.getElementById('hint-modal');
  const hintCloseBtn = document.getElementById('hint-close-button');
  const hintOverlayBg = document.getElementById('hint-overlay-badge');

  // Mở tờ giấy
  hintToggleBtn.addEventListener('click', () => {
    hintModal.classList.remove('hidden');
  });

  // Đóng tờ giấy
  const closeHint = () => {
    hintModal.classList.add('hidden');
  };

  hintCloseBtn.addEventListener('click', closeHint);
  hintOverlayBg.addEventListener('click', closeHint);
});
// --- 1. THIẾT LẬP THƯ VIỆN THREE.JS ---
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020308); // Màu nền đêm thẫm
scene.fog = new THREE.FogExp2(0x020308, 0.005); // Sương mù huyền ảo xa xa

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

// Đặt camera ở độ cao tầm mắt người đứng quan sát
const EYE_HEIGHT = 5; 
camera.position.set(0, EYE_HEIGHT, 0);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;

// --- 3. ĐIỀU CHỈNH ORBITCONTROLS
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Tắt di chuyển vị trí để cố định người chơi tại 1 tọa độ
controls.enablePan = false;

// Đặt điểm nhìn xa ban đầu
controls.target.set(0, EYE_HEIGHT + 0.5, -10);

controls.minPolarAngle = 0; 

controls.maxPolarAngle = Math.PI / 1.7;

// Giới hạn Zoom 
controls.enableZoom = true;

// Giới hạn khoảng cách camera với điểm target để tạo cảm giác Zoom trong khoảng an toàn
controls.minDistance = 2;  // Zoom tối đa vào gần
controls.maxDistance = 15; // Zoom tối đa ra xa

// --- 4. ÁNH SÁNG ---
const ambientLight = new THREE.AmbientLight(0x1a233a, 0.8);
scene.add(ambientLight);

const starlight = new THREE.DirectionalLight(0x818cf8, 1.2);
starlight.position.set(10, 50, 20);
scene.add(starlight);

// --- 5. TẠO MẶT ĐẤT LOW-POLY MÀU XANH ---
const groundGeo = new THREE.PlaneGeometry(200, 200, 40, 40);
groundGeo.rotateX(-Math.PI / 2);

const posAttr = groundGeo.attributes.position;
for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);
    const distFromCenter = Math.sqrt(x * x + z * z);
    if (distFromCenter > 8) {
        const y = (Math.sin(x * 0.2) + Math.cos(z * 0.2)) * 0.8 + (Math.random() - 0.5) * 0.4;
        posAttr.setY(i, y);
    }
}
groundGeo.computeVertexNormals();

const groundMat = new THREE.MeshStandardMaterial({
    color: 0x0f281e,
    roughness: 0.9,
    metalness: 0.1,
    flatShading: true
});
const ground = new THREE.Mesh(groundGeo, groundMat);
scene.add(ground);

// --- 6. TẠO DÃY NÚI LOW-POLY PHÍA XA (360 ĐỘ) ---
const mountainGeo = new THREE.CylinderGeometry(80, 100, 25, 32, 4, true);
const mPos = mountainGeo.attributes.position;
for (let i = 0; i < mPos.count; i++) {
    const y = mPos.getY(i);
    if (y > 0) {
        const noise = (Math.random() - 0.5) * 8 + Math.sin(i) * 5;
        mPos.setY(i, y + noise);
    }
}
mountainGeo.computeVertexNormals();
const mountainMat = new THREE.MeshStandardMaterial({
    color: 0x081018,
    flatShading: true,
    roughness: 1.0
});
const mountains = new THREE.Mesh(mountainGeo, mountainMat);
mountains.position.y = 10;
scene.add(mountains);

// --- 7. TẠO CÁC CỤM CỎ LOW-POLY ---
const bladeGeo = new THREE.ConeGeometry(0.12, 0.8, 3);
bladeGeo.translate(0, 0.4, 0);

const grassMat = new THREE.MeshStandardMaterial({
    color: 0x1e4a38,
    flatShading: true,
    roughness: 0.8
});

const grassCount = 1200;
const grassMesh = new THREE.InstancedMesh(bladeGeo, grassMat, grassCount);
const dummy = new THREE.Object3D();

for (let i = 0; i < grassCount; i++) {
    const radius = 3 + Math.random() * 55;
    const angle = Math.random() * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    dummy.position.set(x, 0, z);
    dummy.rotation.y = Math.random() * Math.PI;
    dummy.rotation.z = (Math.random() - 0.5) * 0.2;
    
    const scale = 0.6 + Math.random() * 0.8;
    dummy.scale.set(scale, scale, scale);
    
    dummy.updateMatrix();
    grassMesh.setMatrixAt(i, dummy.matrix);
}
scene.add(grassMesh);

// --- 8. TẠO BẦU TRỜI ĐẦY SAO & DẢI NGÂN HÀ ---
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

// --- 9. RESIZE SỰ KIỆN CỬA SỔ ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- 10. ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);

    starField.rotation.y += 0.0001;

    controls.update();
    renderer.render(scene, camera);
}

animate();

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
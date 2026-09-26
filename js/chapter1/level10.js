// =========================================================================
// 1. CẤU HÌNH THỜI GIAN CHUYỂN CẢNH & TỌA ĐỘ MẶT TRĂNG
// =========================================================================
const MOON_CONFIG = {
    size: 1.5,                  // Kích thước bán kính Mặt Trăng
    startPos: new THREE.Vector3(0, -15, -70), // Vị trí khi chưa mọc
    targetPos: new THREE.Vector3(15, 28, -100) // Vị trí khi mọc hoàn toàn
};

// Thời gian chuyển cảnh (tính bằng giây)
const MILKY_WAY_DURATION = 120.0; 
const MOON_RISE_DURATION = 10.0;   

// Khởi tạo đồng hồ thời gian riêng cho Level 10
const levelClock = new THREE.Clock();

// =========================================================================
// 1.B. TẠO NHÂN VẬT LOW-POLY VÀ ẨN BAN ĐẦU
// =========================================================================
let playerCharacterGroup = null;

function createLowPolyPlayer() {
    playerCharacterGroup = new THREE.Group();

    // Chất liệu
    const skinMat  = new THREE.MeshStandardMaterial({ color: 0xffdbac, flatShading: true, roughness: 0.8 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0x1e88e5, flatShading: true, roughness: 0.7 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x212121, flatShading: true, roughness: 0.8 });
    const hairMat  = new THREE.MeshStandardMaterial({ color: 0x5d4037, flatShading: true, roughness: 0.9 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.2 });

    // 1. Thân người (Áo xanh dương)
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.5), shirtMat);
    torso.position.y = 2.0;
    playerCharacterGroup.add(torso);

    // 2. Đầu
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), skinMat);
    head.position.y = 2.9;
    playerCharacterGroup.add(head);

    // 3. Tóc nâu
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.25, 0.65), hairMat);
    hair.position.set(0, 3.25, 0);
    playerCharacterGroup.add(hair);

    // 4. Kính râm
    const glasses = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.1), glassMat);
    glasses.position.set(0, 2.95, 0.31);
    playerCharacterGroup.add(glasses);

    const lensGeo = new THREE.BoxGeometry(0.2, 0.12, 0.12);
    const lensLeft = new THREE.Mesh(lensGeo, glassMat);
    lensLeft.position.set(-0.15, 2.95, 0.32);
    const lensRight = lensLeft.clone();
    lensRight.position.x = 0.15;
    playerCharacterGroup.add(lensLeft, lensRight);

    // 5. Tay
    const armGeo = new THREE.BoxGeometry(0.25, 1.0, 0.25);
    const leftArm = new THREE.Mesh(armGeo, shirtMat);
    leftArm.position.set(-0.55, 1.9, 0);
    const rightArm = new THREE.Mesh(armGeo, shirtMat);
    rightArm.position.set(0.55, 1.9, 0);
    playerCharacterGroup.add(leftArm, rightArm);

    // 6. Chân (Quần đen)
    const legGeo = new THREE.BoxGeometry(0.3, 1.2, 0.3);
    const leftLeg = new THREE.Mesh(legGeo, pantsMat);
    leftLeg.position.set(-0.25, 0.8, 0);
    const rightLeg = new THREE.Mesh(legGeo, pantsMat);
    rightLeg.position.set(0.25, 0.8, 0);
    playerCharacterGroup.add(leftLeg, rightLeg);

    // Đặt vị trí ban đầu phía trước camera gốc
    playerCharacterGroup.position.set(0, 0, -5);
    playerCharacterGroup.visible = false; // Ban đầu ẩn đi

    scene.add(playerCharacterGroup);
}

createLowPolyPlayer();

function showPlayerCharacter() {
    if (playerCharacterGroup) {
        playerCharacterGroup.visible = true;
    }
}

// =========================================================================
// 2. TẠO DẢI NGÂN HÀ & BẦU TRỜI / MẶT TRĂNG
// =========================================================================
const milkyWayGroup = new THREE.Group();
const coreCount = 10000; 
const coreGeo = new THREE.BufferGeometry();
const corePositions = new Float32Array(coreCount * 3);
const coreColors = new Float32Array(coreCount * 3);

for (let i = 0; i < coreCount; i++) {
    const u = (Math.random() - 0.5) * 500;
    const v = (Math.random() - 0.5) * 22;
    const w = (Math.random() - 0.5) * 22;

    const pos = new THREE.Vector3(u, 75 + v, -150 + w);
    corePositions[i * 3]     = pos.x;
    corePositions[i * 3 + 1] = pos.y;
    corePositions[i * 3 + 2] = pos.z;

    const colorRatio = Math.random();
    if (colorRatio > 0.55) {
        coreColors[i * 3] = 0.2; coreColors[i * 3 + 1] = 0.7; coreColors[i * 3 + 2] = 1.0;
    } else if (colorRatio > 0.15) {
        coreColors[i * 3] = 1.0; coreColors[i * 3 + 1] = 1.0; coreColors[i * 3 + 2] = 1.0;
    } else {
        coreColors[i * 3] = 1.0; coreColors[i * 3 + 1] = 0.2; coreColors[i * 3 + 2] = 0.4;
    }
}

coreGeo.setAttribute('position', new THREE.BufferAttribute(corePositions, 3));
coreGeo.setAttribute('color', new THREE.BufferAttribute(coreColors, 3));

const coreMat = new THREE.PointsMaterial({
    size: 2.0,                   
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.0,                
    blending: THREE.AdditiveBlending 
});

const milkyWayCore = new THREE.Points(coreGeo, coreMat);
milkyWayGroup.add(milkyWayCore);
milkyWayGroup.rotation.z = Math.PI / 5;
milkyWayGroup.rotation.x = Math.PI / 8;
scene.add(milkyWayGroup);

// SFX & Bầu trời
const sfxCorrect = new Audio('../../music/clear-bell-chime.ogg');
const sfxError = new Audio('../../music/error-notification.ogg');
const sfxVictory = new Audio('../../music/victory-bell-success-fanfare.ogg');

const colorDusk = new THREE.Color(0x4A0E17);   
const colorNight = new THREE.Color(0x020308);  

scene.background = colorDusk.clone();
if (scene.fog) scene.fog.color = colorDusk.clone();

// Mặt Trăng Low-Poly
const moonGroup = new THREE.Group();
const moonMesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(MOON_CONFIG.size, 2),
    new THREE.MeshStandardMaterial({
        color: 0xfffdd0,
        emissive: 0xffeeaa,
        emissiveIntensity: 0.5,
        flatShading: true,
        roughness: 0.8
    })
);
moonGroup.add(moonMesh);

const moonHalo = new THREE.Mesh(
    new THREE.IcosahedronGeometry(MOON_CONFIG.size * 1.3, 2),
    new THREE.MeshBasicMaterial({ color: 0xffffcc, transparent: true, opacity: 0.3, wireframe: true })
);
moonGroup.add(moonHalo);

const moonHitbox = new THREE.Mesh(
    new THREE.SphereGeometry(MOON_CONFIG.size * 2.5, 8, 8),
    new THREE.MeshBasicMaterial({ visible: false })
);
moonGroup.add(moonHitbox);

moonGroup.position.copy(MOON_CONFIG.startPos);
scene.add(moonGroup);

if (typeof starField !== 'undefined' && starField.material) {
    starField.material.opacity = 0.0;
}

// =========================================================================
// 3. LOGIC CUTSCENE & TÊN LỬA
// =========================================================================
let isCutsceneActive = false;
let cutsceneTimer = 0;
let rocketMesh = null;
let initialCamPos = new THREE.Vector3();

function createLowPolyRocket() {
    const rocketGroup = new THREE.Group();

    // Thân tên lửa
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.4, 2.5, 6),
        new THREE.MeshStandardMaterial({ color: 0xeeeeee, flatShading: true })
    );
    body.position.y = 1.25;
    rocketGroup.add(body);

    // Đầu tên lửa
    const nose = new THREE.Mesh(
        new THREE.ConeGeometry(0.35, 0.8, 6),
        new THREE.MeshStandardMaterial({ color: 0xe53935, flatShading: true })
    );
    nose.position.y = 2.9;
    rocketGroup.add(nose);

    // Cánh tên lửa
    const finGeo = new THREE.BoxGeometry(0.1, 0.6, 0.5);
    const finMat = new THREE.MeshStandardMaterial({ color: 0x1e88e5, flatShading: true });
    for (let i = 0; i < 4; i++) {
        const fin = new THREE.Mesh(finGeo, finMat);
        const angle = (i * Math.PI) / 2;
        fin.position.set(Math.cos(angle) * 0.35, 0.4, Math.sin(angle) * 0.35);
        fin.rotation.y = -angle;
        rocketGroup.add(fin);
    }

    return rocketGroup;
}

function triggerCutscene() {
    isCutsceneActive = true;
    cutsceneTimer = 0;

    // Lưu lại vị trí camera chính diện hiện tại
    initialCamPos.copy(camera.position);

    // Tạo Tên Lửa bên cạnh nhân vật
    rocketMesh = createLowPolyRocket();
    const playerPos = playerCharacterGroup.position;
    rocketMesh.position.set(-150, 0, -90);
    scene.add(rocketMesh);

}

function updateCutscene(delta) {
    if (!isCutsceneActive) return;

    cutsceneTimer += delta;
    const playerPos = playerCharacterGroup.position;

    // 1. CAMERA TỪ TỪ LÙI RA SAU LƯNG NHÂN VẬT (0s -> 3s)
    if (cutsceneTimer <= 3.0) {
        const progress = cutsceneTimer / 3.0;

        // Điểm camera lùi ra sau lưng và đưa lên cao ngước nhìn trời
        const targetCamPos = new THREE.Vector3(playerPos.x, playerPos.y + 3.0, playerPos.z + 15.0);
        camera.position.lerpVectors(initialCamPos, targetCamPos, progress);

        if (typeof controls !== 'undefined') {
            controls.target.set(playerPos.x, playerPos.y + 2.0, playerPos.z - 5.0);
            controls.update();
        }
    }

    // 2. TÊN LỬA PHÓNG VÚT LÊN MẶT TRĂNG 
    if (cutsceneTimer >= 1.0 && rocketMesh) {
        const t = Math.min((cutsceneTimer - 1.0) / 10.0, 1.0);

        const startRocketPos = new THREE.Vector3(100, 0, -90);
        const moonPos = MOON_CONFIG.targetPos.clone();

        // Di chuyển tên lửa đến Mặt Trăng
        rocketMesh.position.lerpVectors(startRocketPos, moonPos, Math.pow(t, 2));

        // Xoay đầu tên lửa hướng thẳng tới Mặt Trăng
        rocketMesh.lookAt(moonPos);
        rocketMesh.rotateX(Math.PI / 2);
    }

    // 3. HIỆN BẢNG CHIẾN THẮNG KHI KẾT THÚC
    if (cutsceneTimer >= 15.0) {
        isCutsceneActive = false;
        const winOverlay = document.getElementById('win-overlay');
        if (winOverlay) winOverlay.classList.remove('hidden');
    }
}

// =========================================================================
// 4. XỬ LÝ SỰ KIỆN BẤM MẶT TRĂNG
// =========================================================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('pointerdown', onPointerDownLevel10);

function onPointerDownLevel10(event) {
    if (
        event.target.tagName === 'BUTTON' || 
        event.target.closest('#game-overlay') || 
        event.target.closest('#hint-modal') ||
        event.target.closest('#hint-container') ||
        isCutsceneActive
    ) {
        return;
    }

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([moonHitbox, moonMesh], true);

    if (intersects.length > 0) {
        playSFX('correct');

        moonMesh.scale.set(1.3, 1.3, 1.3);
        setTimeout(() => moonMesh.scale.set(1, 1, 1), 300);

        // Hiện nhân vật
        showPlayerCharacter();

        // Đặt camera ngay trước mặt nhân vật
        const playerPos = playerCharacterGroup.position;
        camera.position.set(playerPos.x, playerPos.y + 2.2, playerPos.z + 3.5);

        if (typeof controls !== 'undefined') {
            controls.target.set(playerPos.x, playerPos.y + 1.8, playerPos.z);
            controls.enableRotate = false;
            controls.enableZoom = false;
            controls.enablePan = false;
            controls.update();
        }

        // Kích hoạt cutscene
        triggerCutscene();
    }
}

// =========================================================================
// 5. VÒNG LẶP ANIMATION MAIN
// =========================================================================
let milkyWayTimer = 0;
let moonRiseTimer = 0;

function animateLevel10() {
    requestAnimationFrame(animateLevel10);
    const delta = levelClock.getDelta();

    // Tiến trình Ngân Hà & Mặt Trăng mọc
    if (milkyWayTimer < MILKY_WAY_DURATION) {
        milkyWayTimer += delta;
        const t1 = Math.min(milkyWayTimer / MILKY_WAY_DURATION, 1.0);
        scene.background.lerpColors(colorDusk, colorNight, t1);
        if (scene.fog) scene.fog.color.lerpColors(colorDusk, colorNight, t1);
        coreMat.opacity = t1 * 0.95;
        if (typeof starField !== 'undefined' && starField.material) {
            starField.material.opacity = t1;
        }
    } else if (moonRiseTimer < MOON_RISE_DURATION) {
        moonRiseTimer += delta;
        const t2 = Math.min(moonRiseTimer / MOON_RISE_DURATION, 1.0);
        moonGroup.position.lerpVectors(MOON_CONFIG.startPos, MOON_CONFIG.targetPos, t2);
    } else {
        moonMesh.rotation.y += 0.003;
        const pulse = 1 + Math.sin(Date.now() * 0.003) * 0.06;
        moonHalo.scale.set(pulse, pulse, pulse);
    }

    // Cập nhật Cutscene
    updateCutscene(delta);

    if (typeof controls !== 'undefined') controls.update();
    renderer.render(scene, camera);
}

animateLevel10();

// =========================================================================
// 6. GIAO DIỆN & ÂM THANH NỀN
// =========================================================================
let progress = 0;
const fill = document.getElementById('progress-fill');
const text = document.getElementById('loading-text');
const loadingBox = document.getElementById('loading-container');
const startButton = document.getElementById('start-button');
const overlay = document.getElementById('game-overlay');

const interval = setInterval(() => {
    progress += 5;
    if (fill) fill.style.width = `${progress}%`;
    if (text) text.innerText = `Hãy chiêm ngưỡng nó nào! ${progress}%`;

    if (progress >= 100) {
        clearInterval(interval);
        if (loadingBox) loadingBox.classList.add('hidden');
        if (startButton) startButton.classList.remove('hidden');
    }
}, 150);

if (startButton) {
    startButton.addEventListener('click', () => {
        if (overlay) overlay.style.display = 'none';
    });
}

const levelBgMusic = new Audio('../../music/Dark-Times.mp3'); 
levelBgMusic.loop = true;
levelBgMusic.volume = 0.9;

document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-button');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            levelBgMusic.play().catch(err => console.log("Lỗi tự động phát âm thanh:", err));
        });
    }
});

sfxCorrect.preload = 'auto';
sfxError.preload = 'auto';
sfxVictory.preload = 'auto';
sfxCorrect.volume = 0.8;
sfxError.volume = 0.7;
sfxVictory.volume = 0.8;

function playSFX(type) {
    let sound;
    if (type === 'correct') sound = sfxCorrect;
    else if (type === 'error') sound = sfxError;
    else if (type === 'victory') sound = sfxVictory;

    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(err => console.warn(`Không thể phát SFX (${type}):`, err));
    }
}
// ========================================================
//  CẤU HÌNH DỮ LIỆU CÁC NGÔI SAO & LOGIC NỐI CHÒM SAO 
// ========================================================

// --- 💡 HƯỚNG DẪN TỰ SẮP XẾP VÀ THAY ĐỔI TỌA ĐỘ VỚI CÁC MÀN KHÁC: ---
// 1. Tọa độ x, y, z xác định vị trí sao trong không gian 3D.
// 2. Với hướng nhìn mặc định camera (target = [0, 5, -10]):
//    - x: Trái (-) / Phải (+)
//    - y: Dưới (-) / Trên (+)
//    - z: Giữ ở khoảng -20 đến -30 để sao nằm phía trước tầm nhìn người chơi.

// Khởi tạo các đối tượng âm thanh SFX
const sfxCorrect = new Audio('../../music/clear-bell-chime.ogg');
const sfxError = new Audio('../../music/error-notification.ogg');
const sfxVictory = new Audio('../../music/victory-bell-success-fanfare.ogg');

const starsData = [
    // Các sao của chòm sao Nam Thập Tự (Crux)
    { id: 'mimosa', name: 'Mimosa', pos: [100, 30, -100], color: 0xabffff, size: 0.9 }, 
    { id: 'delta_crucis', name: 'Delta Crusis', pos: [100, 50, -70], color: 0xabffff, size: 0.9 },
    { id: 'gacruz', name: 'Gacruz', pos: [100, 60, -95], color: 0xff4500, size: 0.9 }, 
    { id: 'acruz', name: 'Acruz', pos: [100, 20, -70], color: 0xabffff, size: 0.9 },
    // Chòm sao Cánh Buồn (Vela)
    { id: 'mu_velorum', name: 'Mu Velorum', pos: [100, 20, -25], color: 0xffff00, size: 1.0 },
    { id: 'phi_velorum', name: 'Phi Velorum', pos: [100, 10, 35], color: 0xabffff, size: 0.7 },
    { id: 'markeb', name: 'Markeb', pos: [90, 10, 65], color: 0xabffff, size: 1.0 },
    { id: 'delta_velorum', name: 'Delta Velorum', pos: [80, 10, 95], color: 0xabffff, size: 0.6 },
    { id: 'c85', name: 'Omicron Velorum Cluster', pos: [70, 20, 100], color: 0xabffff, size: 0.6 },
    { id: 'gamma_velorum', name: 'Gamma Velorum', pos: [50, 70, 150], color: 0xabffff, size: 1.2 },
    { id: 'suhail', name: 'Suhail', pos: [70, 80, 70], color: 0xff4500, size: 1.2 },
    { id: 'psi_velorum', name: 'psi Velorum', pos: [80, 95, 60], color: 0xabffff, size: 0.7 },
    { id: 'q_velorum', name: 'Q velorum', pos: [100, 80, 10], color: 0xabffff, size: 0.6 },
    { id: 'p_velorum', name: 'Q velorum', pos: [100, 35, -15], color: 0xabffff, size: 0.6 },
];

// Các cặp đoạn thẳng hợp lệ tạo nên hình chòm sao Orion
const validConnections = [
    ['mimosa', 'delta_crucis'],
    ['gacruz', 'acruz'],
    ['mu_velorum', 'phi_velorum'],
    ['phi_velorum', 'markeb'],
    ['markeb', 'delta_velorum'],
    ['delta_velorum', 'c85'],
    ['c85', 'gamma_velorum'],
    ['gamma_velorum', 'suhail'],
    ['suhail', 'psi_velorum'],
    ['psi_velorum', 'q_velorum'],
    ['q_velorum', 'p_velorum'],
    ['p_velorum', 'mu_velorum']
];

const starMeshes = [];
const interactiveGroup = new THREE.Group();
scene.add(interactiveGroup);

// Tạo Mesh cho từng ngôi sao chính
starsData.forEach(data => {
    // Dùng IcosahedronGeometry để giữ đúng phong cách Low-Poly
    const geo = new THREE.IcosahedronGeometry(data.size, 1);
    const mat = new THREE.MeshBasicMaterial({
        color: data.color,
        wireframe: false
    });
    
    const star = new THREE.Mesh(geo, mat);
    star.position.set(...data.pos);
    star.userData = { 
        id: data.id, 
        originalColor: data.color, 
        baseSize: data.size,
        posVector: new THREE.Vector3(...data.pos)
    };

    // Thêm vòng hào quang (Glow) xung quanh sao chính
    const haloGeo = new THREE.IcosahedronGeometry(data.size * 1.4, 1);
    const haloMat = new THREE.MeshBasicMaterial({
        color: data.color,
        transparent: true,
        opacity: 0.35,
        wireframe: true
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    star.add(halo);

    interactiveGroup.add(star);
    starMeshes.push(star);

    /* 2. HITBOX TÀNG HÌNH (Tăng diện tích bấm cho Mobile) */
    // Tăng bán kính lên gấp 3 - 4 lần (ví dụ: bán kính 2.5 đơn vị)
    const hitboxRadius = Math.max(data.size * 3.5, 2.5); 
    const hitboxGeo = new THREE.SphereGeometry(hitboxRadius, 8, 8);
    const hitboxMat = new THREE.MeshBasicMaterial({
        visible: false // Tàng hình, không hiện ra màn hình
    });
    const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
    
    // Gán tham chiếu của ngôi sao gốc vào Hitbox để Raycaster nhận diện đúng ID
    hitbox.userData = star.userData;
    hitbox.position.set(...data.pos);
    
    // Lưu ngôi sao thực tế vào hitbox để dễ kích hoạt hiệu ứng scale khi bấm
    hitbox.userData.visualMesh = star;

    interactiveGroup.add(star);
    interactiveGroup.add(hitbox);

    // QUAN TRỌNG: Đưa Hitbox vào mảng bấm raycaster thay vì star
    starMeshes.push(hitbox); 
});

// =========================================================================
// 12. XỬ LÝ SỰ KIỆN TƯƠNG TÁC (CLICK/TAP) VÀ VẼ ĐƯỜNG NỐI
// =========================================================================

let selectedStar = null;
const drawnLines = [];
const connectedPairs = new Set();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Hàm hiển thị Toast thông báo khi nối sai
function showToastMessage() {
    const toast = document.getElementById('toast-message');
    if (!toast) return;
    toast.classList.remove('hidden');
    toast.style.opacity = '1';

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.classList.add('hidden'), 300);
    }, 4000);
}

// Bắt sự kiện Click hoặc Chạm màn hình điện thoại
window.addEventListener('pointerdown', onPointerDown);

function onPointerDown(event) {
    // Không xử lý khi đang bấm vào UI (Nút bấm, Popup, Hướng dẫn,...)
    if (
        event.target.tagName === 'BUTTON' || 
        event.target.closest('#game-overlay') || 
        event.target.closest('#hint-modal') ||
        event.target.closest('#hint-container')
    ) {
        return;
    }

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(starMeshes, false);

    if (intersects.length > 0) {
        const clickedHitbox = intersects[0].object;
        
        // Lấy đúng Mesh hiển thị và ID ngôi sao
        const clickedVisual = clickedHitbox.userData.visualMesh || clickedHitbox;
        const clickedId = clickedHitbox.userData.id;

        if (!selectedStar) {
            // Trường hợp 1: Chọn ngôi sao thứ nhất
            selectedStar = clickedHitbox;
            if (clickedVisual) {
                clickedVisual.scale.set(1.4, 1.4, 1.4);
            }
        } else if (selectedStar.userData.id === clickedId) {
            // Trường hợp 2: Bấm lại chính ngôi sao vừa chọn -> Hủy chọn
            const prevVisual = selectedStar.userData.visualMesh || selectedStar;
            if (prevVisual) prevVisual.scale.set(1, 1, 1);
            selectedStar = null;
        } else {
            // Trường hợp 3: Nối từ ngôi sao thứ nhất sang ngôi sao thứ hai
            const id1 = selectedStar.userData.id;
            const id2 = clickedId;
            
            const pairKey = [id1, id2].sort().join('-');

            if (!connectedPairs.has(pairKey)) {
                // Kiểm tra tính hợp lệ của cặp sao
                const isValid = validConnections.some(pair => 
                    (pair[0] === id1 && pair[1] === id2) || (pair[0] === id2 && pair[1] === id1)
                );

                // Vẽ đường nối 3D
                createLine(selectedStar.userData.posVector, clickedHitbox.userData.posVector, isValid);

                if (isValid) {
                    connectedPairs.add(pairKey);
                    playSFX('correct'); // <--- PHÁT ÂM THANH NỐI ĐÚNG
                    checkWinCondition();
                } else {
                    playSFX('error');   // <--- PHÁT ÂM THANH NỐI SAI
                    showToastMessage();
                }
            }

            // Trả lại kích thước ban đầu cho ngôi sao thứ nhất và reset chọn
            const prevVisual = selectedStar.userData.visualMesh || selectedStar;
            if (prevVisual) prevVisual.scale.set(1, 1, 1);
            selectedStar = null;
        }
    }
}

// Hàm vẽ đường thẳng 3D giữa 2 điểm sao
function createLine(posA, posB, isValid) {
    const points = [posA, posB];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // Đúng -> Xanh lá/Xanh cyan rực rỡ, Sai -> Đỏ
    const color = isValid ? 0x00ff88 : 0xff2222;
    const material = new THREE.LineBasicMaterial({
        color: color,
        linewidth: 3,
        transparent: true,
        opacity: isValid ? 0.9 : 0.6
    });

    const line = new THREE.Line(geometry, material);
    scene.add(line);
    drawnLines.push(line);

    // Nếu nối sai, tự động xóa đường nối đỏ sau 1.2 giây
    if (!isValid) {
        setTimeout(() => {
            scene.remove(line);
            line.geometry.dispose();
            line.material.dispose();
            const index = drawnLines.indexOf(line);
            if (index > -1) drawnLines.splice(index, 1);
        }, 1200);
    }
}

// Kiểm tra khi hoàn thành đúng toàn bộ chòm sao
function checkWinCondition() {
    if (connectedPairs.size === validConnections.length) {
        setTimeout(() => {
            triggerConstellationGlow();
        }, 500);
    }
}

// Hiệu ứng bừng sáng toàn bộ chòm sao và hiển thị Overlay thông tin
function triggerConstellationGlow() {
    // 1. Cho các đường nối sáng rực lên
    drawnLines.forEach(line => {
        line.material.color.setHex(0x38bdf8);
        line.material.opacity = 1.0;
    });

    // 2. Phóng to và làm các sao chính bừng sáng
    starMeshes.forEach(star => {
        if (!star.userData.id.startsWith('fake')) {
            star.material.color.setHex(0xffffff);
            star.scale.set(1.8, 1.8, 1.8);
        }
    });

    // 3. Sau 1.5 giây thì bật Overlay trắng thông báo chiến thắng
    setTimeout(() => {
        const winOverlay = document.getElementById('win-overlay');
        if (winOverlay) {
            winOverlay.classList.remove('hidden');
        }
    }, 1500);
    // 4. Giảm bớt volume nhạc nền để tôn lên tiếng chuông chiến thắng (tùy chọn)
    if (level1BgMusic) {
        level1BgMusic.volume = 0.3;
    }

    // 5. Phát âm thanh chiến thắng
    playSFX('victory'); // <--- Phát âm thanh chiến thắng khi hoàn thành game

    // 6. Sau 1.5 giây thì bật Overlay thông báo chiến thắng
    setTimeout(() => {
        const winOverlay = document.getElementById('win-overlay');
        if (winOverlay) {
            winOverlay.classList.remove('hidden');
        }
    }, 1500);
}

// --- KHỞI TẠO ÂM THANH NHẠC NỀN ---
let progress = 0;
const fill = document.getElementById('progress-fill');
const text = document.getElementById('loading-text');
const loadingBox = document.getElementById('loading-container');
const startButton = document.getElementById('start-button');
const overlay = document.getElementById('game-overlay');

const interval = setInterval(() => {
    progress += 10;
    fill.style.width = `${progress}%`;
    text.innerText = `Fact: Những chòm sao Phương Nam chỉ được phát hiện khi những thủy thủ gan dạ nhất liều mình đi về Nam Cực! ${progress}%`;

    if (progress >= 100) {
        clearInterval(interval);
        loadingBox.classList.add('hidden');
        startButton.classList.remove('hidden');
    }
}, 200);

startButton.addEventListener('click', () => {
    overlay.style.display = 'none';
});

// Xử lí âm thanh của trò chơi
const level1BgMusic = new Audio('../../music/Vibing-Over-Venus.ogg'); 
level1BgMusic.loop = true;
level1BgMusic.volume = 1; // Tùy chỉnh âm lượng (0.0 đến 1.0)

document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-button');
    const nextButton = document.getElementById('next-level-button') || document.querySelector('.win-next-button');

    // 1. Bật nhạc khi bắt đầu chơi
    if (startButton) {
        startButton.addEventListener('click', () => {
            level1BgMusic.play().catch(error => {
                console.log("Trình duyệt chặn phát âm thanh tự động hoặc sai đường dẫn:", error);
            });
        });
    }

    // 2. Tắt nhạc khi nhấn nút "TIẾP TỤC HÀNH TRÌNH" 
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            level1BgMusic.pause();
            level1BgMusic.currentTime = 0; // Reset nhạc về lại thời điểm ban đầu
        });
    }
});


// Đảm bảo trình duyệt nạp sẵn âm thanh vào bộ nhớ
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
        sound.currentTime = 0; // Tua về đầu để phát lại tức thì khi bấm liên tục
        sound.play().catch(error => {
            console.warn(`Chưa thể phát SFX (${type}):`, error);
        });
    }
}
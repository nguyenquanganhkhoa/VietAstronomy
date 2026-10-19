/ Màn chơi VietAstronomy
/* Tổng hợp 10 màn chơi của Chapter 1: Tinh tú trên màn đêm vĩnh cửu.
Màn 1: Săn tìm Thợ Săn
"Tìm kiếm một thợ săn với chiếc đai trên bầu trời"
*/
/ Màn chơi VietAstronomy
async function renderGames() {
  const container = document.getElementById("games-list-container");
  if (!container) return;

  try {
    const response = await fetch("/data/games.json");
    if (!response.ok) throw new Error("Không tải được file games.json");

    const gamesList = await response.json();

    / Mặc định màn 1 mở (nếu chưa đăng nhập)
    let unlockedLevel = 1;

    / Kiểm tra thông tin đăng nhập và lấy progress từ Supabase
    if (typeof supabase !== 'undefined') {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('user_progress')
          .select('unlocked_level')
          .eq('user_id', user.id)
          .single();

        if (data) {
          unlockedLevel = data.unlocked_level || 1;
        } else {
          / Nếu user mới đăng nhập lần đầu chưa có dòng progress, khởi tạo mặc định màn 1
          await supabase.from('user_progress').insert([{ user_id: user.id, unlocked_level: 1 }]);
        }
      }
    }

    const cardsHTML = gamesList.map(level => {
      const isLocked = level.id > unlockedLevel;

      return `
        <div class="game-card ${isLocked ? 'locked' : ''}">
          <div class="game-banner">
            <img src="${level.banner}" alt="Banner ${level.title}">
            ${isLocked ? `<img src="/image/padlock.webp" alt="Locked" class="lock-icon">` : ''}
          </div>
          <div class="game-info">
            <h3>Màn ${level.id}: ${level.title}</h3>
            <p>${level.desc}</p>
            ${isLocked 
              ? `<button class="play-button locked-btn" onclick="alert('Bạn cần hoàn thành các màn trước để mở khóa màn này!')">Đã khóa</button>`
              : `<a href="${level.link}" class="play-button">Chơi ngay!</a>`
            }
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = cardsHTML;

  } catch (error) {
    console.error("Lỗi tải trò chơi:", error);
    container.innerHTML = "<p>Không thể tải danh sách màn chơi!</p>";
  }
}

document.addEventListener("DOMContentLoaded", renderGames);
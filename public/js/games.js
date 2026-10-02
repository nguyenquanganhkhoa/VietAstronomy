// Màn chơi VietAstronomy
/* Tổng hợp 10 màn chơi của Chapter 1: Tinh tú trên màn đêm vĩnh cửu.
Màn 1: Săn tìm Thợ Săn
"Tìm kiếm một thợ săn với chiếc đai trên bầu trời"
*/
async function renderGames() {
  const container = document.getElementById("games-list-container");
  if (!container) return;

  try {
    const response = await fetch("../data/games.json");
    if (!response.ok) throw new Error("Không tải được file games.json");

    const gamesList = await response.json();

    const cardsHTML = gamesList.map(level => `
      <div class="game-card">
        <div class="game-banner">
          <img src="${level.banner}" alt="Banner ${level.title}">
        </div>
        <div class="game-info">
          <h3>Màn ${level.id}: ${level.title}</h3>
          <p>${level.desc}</p>
          <a href="${level.link}" class="play-button">Chơi ngay!</a>
        </div>
      </div>
    `).join('');

    container.innerHTML = cardsHTML;

  } catch (error) {
    console.error("Lỗi tải trò chơi:", error);
    container.innerHTML = "<p>Không thể tải danh sách màn chơi!</p>";
  }
}

document.addEventListener("DOMContentLoaded", renderGames);
async function renderNews() {
  const container = document.getElementById("news-list-container");
  if (!container) return;

  try {
    const response = await fetch("../data/news.json");
    if (!response.ok) throw new Error("Không tải được file news.json");

    const newsList = await response.json();

    const cardsHTML = newsList.map(article => `
      <article class="news-card">
        <div class="news-banner">
          <img src="${article.banner}" alt="${article.title}">
        </div>
        <div class="news-info">
          <span class="news-badge">${article.badge}</span>
          <h3>${article.title}</h3>
          <p>${article.desc}</p>
          <a href="${article.link}" class="read-button">
          Đọc ngay 🚀
          </a>
        </div>
      </article>
    `).join('');

  container.innerHTML = cardsHTML;

  } catch (error) {
    console.error("Lỗi tải sự kiện:", error);
    container.innerHTML = "<p>Không thể tải danh sách sự kiện!</p>";
  }
}

document.addEventListener("DOMContentLoaded", renderNews);
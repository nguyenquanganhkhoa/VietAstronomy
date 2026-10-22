// Dữ liệu sự kiện (Sau này chỉ cần thay mảng này bằng dữ liệu fetch từ NASA API)
const eventsData = [
  {
    image: "image/Geminids.webp",
    description: "Mưa sao băng Geminids",
    date: "13-14/12/2026",
    title: "Vị vua của các cơn mưa sao băng sẽ trình làng vào cuối năm",
    link: "/html/news.html"
  },
  {
    image: "https://placehold.co/300x300/1a1a2e/ffffff?text=NASA+Data",
    description: "Siêu Trăng",
    date: "07/04/2027",
    title: "Mưa Sao Băng & Siêu Trăng xuất hiện cùng thời điểm",
    link: "html/news.html"
  },
  {
    image: "https://placehold.co/300x300/1a1a2e/ffffff?text=Asteroid",
    description: "Tiểu hành tinh",
    date: "20/08/2026",
    title: "Tiểu hành tinh ghé thăm Trái Đất ở khoảng cách an toàn",
    link: "/html/news.html"
  }
];

function renderEvents() {
  const container = document.getElementById("events-container");
  if (!container) return;

  // Dùng .map() tạo chuỗi HTML đúng chuẩn cấu trúc bạn đã gõ
  container.innerHTML = eventsData.map(event => `
    <article class="event-card">
      <img src="${event.image}" alt="Ảnh sự kiện" class="event-image">
      <div class="event-info">
        <span class="card-description">${event.description}</span>
        <p class="event-date">${event.date}</p>
        <h3 class="event-title">${event.title}</h3>
        <a href="${event.link}" class="event-button require-auth">Khám phá thêm</a>
      </div>
    </article>
  `).join('');
}

document.addEventListener("DOMContentLoaded", renderEvents);
const contactForm = document.getElementById('contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Kiểm tra xem Vite có đọc được key không
    const apiKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
    console.log("Key đang dùng:", apiKey); // Mở F12 -> Console để xem key có hiện ra không

    if (!apiKey) {
      alert("Lỗi: Không tìm thấy VITE_WEB3FORMS_ACCESS_KEY trong file .env!");
      return;
    }

    // 2. Gom dữ liệu form thành Object JSON
    const formData = new FormData(contactForm);
    const object = Object.fromEntries(formData);
    object.access_key = apiKey;

    const json = JSON.stringify(object);

    try {
      // 3. Gửi request dưới dạng application/json
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: json
      });

      const result = await response.json();

      if (result.success) {
        alert("Cảm ơn bạn đã đóng góp ý kiến! Chúc bạn một ngày tốt lành!");
        contactForm.reset();
      } else {
        console.error("Web3Forms Error:", result);
        alert("Gửi thất bại: " + (result.message || "Kiểm tra lại Key"));
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      alert("Đã có lỗi xảy ra khi kết nối mạng!");
    }
  });
}
const contactForm = document.getElementById('contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // FormData tự động gom luôn cả input name="access_key" ở trên
    const formData = new FormData(contactForm);
    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    try {
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
        alert("Cảm ơn bạn đã đóng góp ý kiến!");
        contactForm.reset();
      }
    } catch (error) {
      console.error("Lỗi gửi form:", error);
    }
  });
}
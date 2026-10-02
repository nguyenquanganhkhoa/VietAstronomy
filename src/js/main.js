document.addEventListener("DOMContentLoaded", () => {
  const navbarContainer = document.getElementById('navbar-container');
  
  if (navbarContainer) {
    fetch('/navbar.html')
      .then(response => {
        if (!response.ok) throw new Error("Không tải được file navbar.html");
        return response.text();
      })
      .then(data => {
        navbarContainer.innerHTML = data;
        
        const currentPath = window.location.pathname;
        const navLinks = navbarContainer.querySelectorAll('.navbar-menu li a');

        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          
          if (currentPath === href || (href === '/index.html' && currentPath === '/')) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });

        const navbarToggle = document.querySelector('.navbar-toggle');
        const navbarMenu = document.querySelector('.navbar-menu');

        if (navbarToggle && navbarMenu) {
          navbarToggle.addEventListener('click', () => {
            navbarToggle.classList.toggle('active');
            navbarMenu.classList.toggle('active');
          });
        }
        
      })
      .catch(error => console.error("Lỗi khi tải navbar:", error));
  }

  const footerContainer = document.getElementById('footer-container'); 
  if (footerContainer) {
    fetch('/footer.html')
      .then(response => response.text())
      .then(data => {
        footerContainer.innerHTML = data;
      })
      .catch(error => console.error("Lỗi tải footer:", error));
  }
  });

var swiper = new Swiper('.home-team-content', {
        slidesPerView: 1,
        spaceBetween: 25,
        loop: true,
        centerSlide: true,
        fade: 'true',
        gragCursor: 'true',
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
});

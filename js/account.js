document.addEventListener('DOMContentLoaded', function() {
    const tabBtns = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');

tabBtns.forEach(button => {
    button.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));

        tabPanes.forEach(p => p.style.display = 'none');

        button.classList.add('active');

        const targetId = button.getAttribute('data-target');
        document.getElementById(targetId).style.display = 'block';
    });
  });
});
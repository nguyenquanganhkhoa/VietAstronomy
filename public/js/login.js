import { supabase } from '/src/supabaseClient.js';

const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('login-email');
const passwordInput = document.getElementById('login-password');
const message = document.getElementById('login-message');
const submitButton = loginForm.querySelector(
    'button[type="submit"]'
);

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    message.textContent = '';
    message.style.color = '';

    submitButton.disabled = true;
    submitButton.textContent = 'Đang đăng nhập...';

    try {
        const { data, error } =
            await supabase.auth.signInWithPassword({
                email,
                password
            });

        if (error) {
            throw error;
        }

        if (!data.session) {
            throw new Error('Không tạo được phiên đăng nhập.');
        }

        message.style.color = 'green';
        message.textContent = 'Đăng nhập thành công!';

        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect');

        / Chỉ cho phép chuyển hướng đến đường dẫn nội bộ.
        const safeRedirect =
            redirect &&
            redirect.startsWith('/') &&
            !redirect.startsWith('/') &&
            !redirect.includes('\\')
                ? redirect
                : '/index.html';

        window.location.replace(safeRedirect);

    } catch (error) {
        console.error('Login error:', error);

        message.style.color = 'red';

        const errorMessage = error.message?.toLowerCase() || '';

        if (
            errorMessage.includes('email not confirmed')
        ) {
            message.textContent =
                'Bro cần xác minh email trước khi đăng nhập.';
        } else if (
            errorMessage.includes('invalid login credentials')
        ) {
            message.textContent =
                'Email hoặc mật khẩu không chính xác.';
        } else {
            message.textContent =
                'Đăng nhập chưa thành công. Bro hãy thử lại nhé!';
        }
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Đăng Nhập';
    }
});

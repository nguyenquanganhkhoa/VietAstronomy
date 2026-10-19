import { supabase } from '/src/supabaseClient.js';
console.log("🚀 Đã chạy trang Quên mật khẩu!");

const forgotForm = document.getElementById('forgot-form');
const emailInput = document.getElementById('forgot-email');
const message = document.getElementById('forgot-message');
const submitButton = forgotForm.querySelector('button[type="submit"]');

forgotForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();

    message.textContent = '';
    message.style.color = '';

    if (!email) {
        message.style.color = '#dc2626';
        message.textContent = 'Vui lòng nhập email của bạn!';
        emailInput.focus();
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Đang gửi yêu cầu...';

    try {
        / [CÓ CHÚ THÍCH]: Sử dụng phương thức resetPasswordForEmail của Supabase Auth
        / Hệ thống sẽ gửi một email chứa mã OTP hoặc link đặt lại mật khẩu về email của người dùng.
        / redirectTo trỏ đến trang reset-password.html để người dùng tiến hành nhập mật khẩu mới.
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: new URL('/reset-password.html', window.location.href).href,
        });

        if (error) {
            throw error;
        }

        message.style.color = '#15e05f';
        message.textContent = 'Đã gửi hướng dẫn đặt lại mật khẩu vào email của bạn! Vui lòng kiểm tra hộp thư.';
        forgotForm.reset();

    } catch (error) {
        console.error('Forgot password error:', error);
        message.style.color = '#dc2626';
        
        const errorMessage = error.message?.toLowerCase() ?? '';
        if (errorMessage.includes('rate limit')) {
            message.textContent = 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.';
        } else {
            message.textContent = error.message || 'Không thể gửi yêu cầu lúc này. Vui lòng kiểm tra lại email!';
        }
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Gửi mã xác thực';
    }
});
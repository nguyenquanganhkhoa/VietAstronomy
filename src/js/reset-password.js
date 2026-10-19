import { supabase } from '../../src/supabaseClient.js';
console.log("🚀 Đã chạy trang Đặt lại mật khẩu!");

const resetForm = document.getElementById('reset-form');
const passwordInput = document.getElementById('reset-password');
const confirmPasswordInput = document.getElementById('reset-confirm-password');
const message = document.getElementById('reset-message');
const submitButton = resetForm.querySelector('button[type="submit"]');

// Quy tắc kiểm tra độ mạnh mật khẩu giống hệt như trang đăng ký
const SPECIAL_CHARACTERS = "!@#$%^&*()_+-=[]{};':\"\\|<>?,./`~";

const strengthLabel = document.getElementById('password-strength-label');
const strengthFill = document.getElementById('password-strength-fill');
const strengthProgress = document.getElementById('password-strength-progress');

const passwordRules = [
    { key: 'length', test: (password) => password.length >= 8 },
    { key: 'uppercase', test: (password) => /[A-Z]/.test(password) },
    { key: 'lowercase', test: (password) => /[a-z]/.test(password) },
    { key: 'number', test: (password) => /[0-9]/.test(password) },
    { key: 'special', test: (password) => Array.from(password).some((char) => SPECIAL_CHARACTERS.includes(char)) }
];

const strengthLevels = [
    { label: 'Rất yếu', color: '#dc2626', width: '8%' },
    { label: 'Yếu', color: '#ef4444', width: '20%' },
    { label: 'Trung bình', color: '#f97316', width: '40%' },
    { label: 'Khá', color: '#eab308', width: '60%' },
    { label: 'Tốt', color: '#84cc16', width: '80%' },
    { label: 'Mạnh', color: '#16a34a', width: '100%' }
];

// [HÀM CHÚ THÍCH]: Kiểm tra chi tiết trạng thái của mật khẩu so với các quy tắc bảo mật
function getPasswordCheck(password) {
    const results = passwordRules.map((rule) => ({
        key: rule.key,
        passed: rule.test(password)
    }));
    return {
        results,
        score: results.filter((r) => r.passed).length,
        isValid: results.every((r) => r.passed)
    };
}

// [HÀM CHÚ THÍCH]: Cập nhật giao diện thanh đo độ mạnh mật khẩu theo thời gian thực (real-time input)
function updatePasswordStrength() {
    const password = passwordInput.value;
    const { results, score } = getPasswordCheck(password);

    results.forEach(({ key, passed }) => {
        const ruleElement = document.querySelector(`[data-password-rule="${key}"]`);
        if (!ruleElement) return;
        const icon = ruleElement.querySelector('.password-strength__rule-icon');
        ruleElement.classList.toggle('is-met', passed);
        if (icon) icon.textContent = passed ? '✓' : '○';
    });

    if (!password) {
        strengthLabel.textContent = 'Chưa nhập mật khẩu';
        strengthLabel.style.color = '#fdfdfd';
        strengthFill.style.width = '0%';
        strengthFill.style.backgroundColor = '#edd3d3';
        strengthProgress.setAttribute('aria-valuenow', '0');
        return;
    }

    const level = strengthLevels[score];
    strengthLabel.textContent = level.label;
    strengthLabel.style.color = level.color;
    strengthFill.style.width = level.width;
    strengthFill.style.backgroundColor = level.color;
    strengthProgress.setAttribute('aria-valuenow', String(score));
}

passwordInput.addEventListener('input', updatePasswordStrength);

// [HÀM CHÚ THÍCH]: Xử lý sự kiện submit form cập nhật mật khẩu mới thông qua Supabase
resetForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    message.textContent = '';
    message.style.color = '';

    // Kiểm tra độ mạnh mật khẩu trước khi gửi lên Supabase
    const passwordCheck = getPasswordCheck(password);
    if (!passwordCheck.isValid) {
        message.style.color = '#dc2626';
        message.textContent = 'Mật khẩu chưa đạt đủ 5 yêu cầu bảo mật!';
        passwordInput.focus();
        updatePasswordStrength();
        return;
    }

    if (password !== confirmPassword) {
        message.style.color = '#dc2626';
        message.textContent = 'Hai mật khẩu không khớp!';
        confirmPasswordInput.focus();
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Đang cập nhật...';

    try {
        // [CÓ CHÚ THÍCH]: Dùng hàm updateUser của Supabase. Khi người dùng click link từ email,
        // Supabase tự động xác thực phiên token tạm thời, cho phép thay đổi mật khẩu trực tiếp.
        const { data, error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) {
            throw error;
        }

        message.style.color = '#15e05f';
        message.textContent = 'Cập nhật mật khẩu thành công! Đang chuyển hướng về trang đăng nhập...';

        // Đợi 2 giây rồi chuyển về trang đăng nhập để người dùng login lại với mật khẩu mới
        setTimeout(() => {
            window.location.replace('./login.html');
        }, 2000);

    } catch (error) {
        console.error('Reset password error:', error);
        message.style.color = '#dc2626';
        message.textContent = error.message || 'Không thể cập nhật mật khẩu. Liên kết có thể đã hết hạn.';
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Cập nhật mật khẩu';
    }
});

updatePasswordStrength();
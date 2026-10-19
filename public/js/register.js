import { supabase } from '/src/supabaseClient.js';
console.log("🚀 Đã chạy!");

const registerForm = document.getElementById('register-form');
const nameInput = document.getElementById('register-name');
const emailInput = document.getElementById('register-email');
const passwordInput = document.getElementById('register-password');
const confirmPasswordInput = document.getElementById(
    'register-confirm-password'
);
const message = document.getElementById('register-message');
const submitButton = registerForm.querySelector(
    'button[type="submit"]'
);

// Keep the required symbols aligned with the character set supported by Supabase Auth.
const SPECIAL_CHARACTERS = "!@#$%^&*()_+-=[]{};':\"\\|<>?,/`~";

const strengthLabel = document.getElementById('password-strength-label');
const strengthFill = document.getElementById('password-strength-fill');
const strengthProgress = document.getElementById('password-strength-progress');

const passwordRules = [
    {
        key: 'length',
        test: (password) => password.length >= 8
    },
    {
        key: 'uppercase',
        test: (password) => /[A-Z]/.test(password)
    },
    {
        key: 'lowercase',
        test: (password) => /[a-z]/.test(password)
    },
    {
        key: 'number',
        test: (password) => /[0-9]/.test(password)
    },
    {
        key: 'special',
        test: (password) => Array.from(password).some(
            (character) => SPECIAL_CHARACTERS.includes(character)
        )
    }
];

const strengthLevels = [
    { label: 'Rất yếu', color: '#dc2626', width: '8%' },
    { label: 'Yếu', color: '#ef4444', width: '20%' },
    { label: 'Trung bình', color: '#f97316', width: '40%' },
    { label: 'Khá', color: '#eab308', width: '60%' },
    { label: 'Tốt', color: '#84cc16', width: '80%' },
    { label: 'Mạnh', color: '#16a34a', width: '100%' }
];

function getPasswordCheck(password) {
    const results = passwordRules.map((rule) => ({
        key: rule.key,
        passed: rule.test(password)
    }));

    return {
        results,
        score: results.filter((result) => result.passed).length,
        isValid: results.every((result) => result.passed)
    };
}

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

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    message.textContent = '';
    message.style.color = '';

    if (!name) {
        message.textContent = 'Hãy nhập tên của mình nhé!';
        nameInput.focus();
        return;
    }

    // Validate all five requirements before sending the password to Supabase Auth.
    const passwordCheck = getPasswordCheck(password);
    if (!passwordCheck.isValid) {
        message.style.color = '#dc2626';
        message.textContent =
            'Mật khẩu chưa đạt đủ 5 yêu cầu. Hãy kiểm tra danh sách bên dưới nhé!';
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
    submitButton.textContent = 'Đang tạo tài khoản...';

    try {
        // Supabase Auth remains responsible for account creation and server-side policy checks.
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name
                },
                emailRedirectTo: new URL(
                    '/login.html',
                    window.location.href
                ).href
            }
        });

        if (error) {
            throw error;
        }

        if (data.session) {
            message.style.color = '#15e05f';
            message.textContent =
                'Đăng ký thành công! Đang chuyển đến trang đăng nhập...';

            window.location.replace('/login.html');
        } else {
            message.style.color = 'green';
            message.textContent =
                'Đăng ký thành công! Hãy kiểm tra email để xác minh tài khoản trước khi đăng nhập.';

            registerForm.reset();
            updatePasswordStrength();
        }
    } catch (error) {
        console.error('Register error:', error);

        message.style.color = 'red';

        const errorMessage = error.message?.toLowerCase() ?? '';
        const errorCode = error.code?.toLowerCase() ?? '';

        if (
            errorMessage.includes('already registered') ||
            errorMessage.includes('user already exists')
        ) {
            message.textContent =
                'Email này đã được đăng ký. Bạn hãy thử đăng nhập nhé!';
        } else if (
            errorCode.includes('weak_password') ||
            errorMessage.includes('password')
        ) {
            message.textContent =
                'Mật khẩu không đủ mạnh. Hãy đảm bảo mật khẩu của bạn đáp ứng tất cả các yêu cầu.';
        } else if (errorMessage.includes('email')) {
            message.textContent =
                'Email không hợp lệ hoặc chưa được hệ thống chấp nhận.';
        } else {
            message.textContent =
                'Chưa thể đăng ký lúc này. Bạn hãy thử lại nhé!';
        }
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Đăng Kí';
    }
});

// Initialize the checklist and meter when the page opens.
updatePasswordStrength();

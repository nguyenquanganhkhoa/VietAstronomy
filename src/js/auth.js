import { supabase } from '../supabaseClient.js';

// 1. Hàm kiểm tra người dùng đã từng đăng nhập hay chưa khi mới mở web
async function checkInitialAuth() {
// Chặn các thao tác yêu cầu đăng nhập
const authClickBypass = new WeakSet();

document.addEventListener('click', async (event) => {
    const target = event.target.closest('.require-auth');

    if (!target) return;

    // Cho phép thao tác được kích hoạt lại sau khi xác thực
    if (authClickBypass.has(target)) {
        authClickBypass.delete(target);
        return;
    }

    // Tạm chặn thao tác để chờ kiểm tra đăng nhập
    event.preventDefault();
    event.stopImmediatePropagation();

    const { data: { user }, error } =
        await supabase.auth.getUser();

    if (user && !error) {
        // Đã đăng nhập: thực hiện lại thao tác ban đầu
        authClickBypass.add(target);
        target.click();
        return;
    }

    if (
        error &&
        error.name !== 'AuthSessionMissingError'
    ) {
        console.error('Lỗi xác thực:', error);
        alert('Không thể kiểm tra đăng nhập. Bro thử lại nhé!');
        return;
    }

    // Chưa đăng nhập: chuyển đến trang đăng nhập
    const loginURL = new URL(
        '/html/login.html',
        window.location.origin
    );

    loginURL.searchParams.set(
        'redirect',
        window.location.pathname +
        window.location.search +
        window.location.hash
    );

    window.location.href = loginURL.href;
}, true);}

// 2. Lắng nghe thay đổi trạng thái Auth theo thời gian thực 
// (Tự động chạy khi Đăng nhập, Đăng ký, hoặc Đăng xuất mà không cần reload trang)
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Sự kiện Auth thay đổi:', event)
  
  if (event === 'SIGNED_IN' && session) {
    showAuthenticatedUI(session.user)
  } else if (event === 'SIGNED_OUT') {
    showGuestUI()
  }
})

// 3. Hàm hiển thị Giao diện khi ĐÃ đăng nhập
function showAuthenticatedUI(user) {
  // Ẩn Form đăng ký/đăng nhập
  document.getElementById('auth-section')?.classList.add('hidden')
  // Hiện khu vực chính của Web / Hồ sơ cá nhân / Nút Đăng xuất
  document.getElementById('main-app-section')?.classList.remove('hidden')
  
  // Hiển thị tên/email người dùng lên web
  const userEmailEl = document.getElementById('user-email-display')
  if (userEmailEl) userEmailEl.innerText = user.email
}

// 4. Hàm hiển thị Giao diện khi CHƯA đăng nhập
function showGuestUI() {
  // Hiện Form đăng ký/đăng nhập
  document.getElementById('auth-section')?.classList.remove('hidden')
  // Ẩn các tính năng yêu cầu tài khoản
  document.getElementById('main-app-section')?.classList.add('hidden')
}

// Gọi hàm kiểm tra ngay khi script được tải
checkInitialAuth()


async function setupNavbarAuth() {
    const navAccount = document.getElementById('nav-item-account');
    const navLogin = document.getElementById('nav-item-login');
    const navLogout = document.getElementById('nav-item-logout');

    // Navbar chưa được tải xong
    if (!navAccount || !navLogin || !navLogout) return;

    const { data: { user }, error } = await supabase.auth.getUser();

    // Không xác minh được user thì không hiển thị trạng thái đăng nhập
    if (error || !user) {
        navAccount.classList.add('hidden');
        navLogout.classList.add('hidden');
        navLogin.classList.remove('hidden');
        return;
    }

    // Đã đăng nhập
    navAccount.classList.remove('hidden');
    navLogout.classList.remove('hidden');
    navLogin.classList.add('hidden');

    // Tránh gắn sự kiện đăng xuất nhiều lần
    if (navLogout.dataset.logoutBound === 'true') return;

    navLogout.dataset.logoutBound = 'true';

    navLogout.querySelector('a')?.addEventListener('click', async (event) => {
        event.preventDefault();

        const { error: logoutError } = await supabase.auth.signOut();

        if (logoutError) {
            console.error('Logout error:', logoutError);
            alert('Đăng xuất chưa thành công. Bro hãy thử lại nhé!');
            return;
        }

        window.location.href = '/index.html';
    });
}

// Navbar có thể được tải trước hoặc sau auth.js
document.addEventListener('navbar:loaded', setupNavbarAuth);

if (document.getElementById('nav-item-account')) {
    setupNavbarAuth();
}

// Đồng bộ Navbar khi trạng thái đăng nhập thay đổi
supabase.auth.onAuthStateChange((event, session) => {
    if (
        event === 'SIGNED_IN' ||
        event === 'SIGNED_OUT' ||
        event === 'INITIAL_SESSION'
    ) {
        setupNavbarAuth();
    }
});

// Bắt sự kiện Đăng xuất
document.getElementById('btn-navbar-logout')?.addEventListener('click', async () => {
  await supabase.auth.signOut()
  window.location.href = '/index.html'
})

// Chạy khi Navbar được nạp vào trang
document.addEventListener('DOMContentLoaded', setupNavbarAuth)
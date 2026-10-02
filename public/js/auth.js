import { supabase } from '../src/supabaseClient.js'

// 1. Hàm kiểm tra người dùng đã từng đăng nhập hay chưa khi mới mở web
async function checkInitialAuth() {
  // Lấy thông tin user từ Session hiện tại
  const { data: { user }, error } = await supabase.auth.getUser()

  if (user) {
    console.log('✅ Người dùng ĐÃ ĐĂNG NHẬP:', user.email)
    showAuthenticatedUI(user)
  } else {
    console.log('❌ Người dùng CHƯA ĐĂNG NHẬP (Lần đầu hoặc đã đăng xuất)')
    showGuestUI()
  }
}

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
  const { data: { user } } = await supabase.auth.getUser()

  const navAccount = document.getElementById('nav-item-account')
  const navLogin = document.getElementById('nav-item-login')
  const navLogout = document.getElementById('nav-item-logout')

  if (user) {
    // Đã đăng nhập -> Hiện Cosmoser & Nút Logout, Ẩn Login
    navAccount?.classList.remove('hidden')
    navLogout?.classList.remove('hidden')
    navLogin?.classList.add('hidden')
  } else {
    // Chưa đăng nhập -> Hiện Login, Ẩn Cosmoser & Logout
    navAccount?.classList.add('hidden')
    navLogout?.classList.add('hidden')
    navLogin?.classList.remove('hidden')
  }

  // Khóa các link yêu cầu đăng nhập (Trò chơi...) nếu là Guest
  document.querySelectorAll('.require-auth').forEach(link => {
    link.addEventListener('click', (e) => {
      if (!user) {
        e.preventDefault()
        alert('Vui lòng đăng nhập để trải nghiệm tính năng này!')
        window.location.href = '/html/login.html'
      }
    })
  })
}

// Bắt sự kiện Đăng xuất
document.getElementById('btn-navbar-logout')?.addEventListener('click', async () => {
  await supabase.auth.signOut()
  window.location.href = '/index.html'
})

// Chạy khi Navbar được nạp vào trang
document.addEventListener('DOMContentLoaded', setupNavbarAuth)
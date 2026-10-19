import { supabase } from '../../src/supabaseClient.js';

document.addEventListener('DOMContentLoaded', async function() {
    // 1. Xử lý chuyển tab
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

    // Các phần tử giao diện liên quan đến Avatar
    const avatarImg = document.querySelector('.avatar-img');
    const editAvatarBtn = document.querySelector('.button-edit-avatar');
    const avatarFileInput = document.getElementById('avatar-file-input');
    const userNameElement = document.querySelector('.user-name');

    // Các phần tử phần Cài đặt tài khoản
    const newNameInput = document.getElementById('new-name-input');
    const saveNameBtn = document.getElementById('button-save-name');

    // 2. Lấy thông tin người dùng từ Supabase và cập nhật tên hiển thị
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
            console.error('Lỗi lấy thông tin user:', error.message);
            return;
        }

        if (user) {
            // Lấy full_name từ user_metadata đã lưu lúc đăng ký (trong register.js)
            const fullName = user.user_metadata?.full_name;
            
            if (fullName) {
                const userNameElement = document.querySelector('.user-name');
                if (userNameElement) {
                    userNameElement.textContent = fullName;
                }
            }

            // QUAN TRỌNG: Lấy avatar_url đã lưu trong user_metadata đắp thẳng vào thẻ img
            const savedAvatarUrl = user.user_metadata?.avatar_url;
            if (savedAvatarUrl && avatarImg) {
                avatarImg.src = savedAvatarUrl;
            }
            
        } else {
            // Nếu chưa đăng nhập, có thể chuyển hướng về trang login nếu cần
            // window.location.href = './login.html';
        }
    } catch (err) {
        console.error('Đã xảy ra lỗi:', err);
    }

    // 3. Xử lý tính năng đổi avatar (Hỗ trợ cả PC và Điện thoại)
    if (editAvatarBtn && avatarFileInput) {
        // Khi bấm vào nút camera, kích hoạt input file ẩn
        editAvatarBtn.addEventListener('click', () => {
            avatarFileInput.click();
        });

        // Khi người dùng chọn file ảnh xong
        avatarFileInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (!file) return;

            // Kiểm tra định dạng file ảnh cơ bản
            if (!file.type.startsWith('image/')) {
                alert('Vui lòng chọn một tệp hình ảnh hợp lệ!');
                return;
            }

            try {
                editAvatarBtn.textContent = '⏳'; // Hiển thị trạng thái đang tải
                
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    alert('Vui lòng đăng nhập lại để thực hiện tính năng này!');
                    return;
                }

                // Tạo tên file độc lập để tránh bị trùng lặp trên storage
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}-${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                // Tải file lên Supabase Storage (Bucket: 'avatars')
                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, file, { upsert: true });

                if (uploadError) throw uploadError;

                // 1. Lấy đường dẫn Public URL công khai của ảnh vừa tải lên
                const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

                // 2. Cập nhật URL vào user_metadata của Supabase Auth (để lưu vĩnh viễn vào tài khoản)
                const { error: updateError } = await supabase.auth.updateUser({
                    data: { avatar_url: publicUrl }
                });

                if (updateError) throw updateError;

                // 3. Cập nhật trực tiếp hình ảnh trên giao diện ngay lập tức
                const avatarImg = document.querySelector('.avatar-img');
                if (avatarImg) {
                avatarImg.src = publicUrl;
                }
                editAvatarBtn.textContent = '📷';
                alert('Đổi ảnh đại diện thành công! 🎉');

                } catch (error) {
                console.error('Lỗi khi tải lên avatar:', error.message);
                alert('Không thể tải lên ảnh đại diện: ' + error.message);
                editAvatarBtn.textContent = '📷';
                } finally {
                // Reset input để có thể chọn lại chính file đó nếu muốn
                avatarFileInput.value = '';
               }
        });
    }

    // 4. Xử lý tính năng đổi tên gọi (Cập nhật vĩnh viễn lên Supabase Auth)
    if (saveNameBtn && newNameInput) {
        saveNameBtn.addEventListener('click', async () => {
            const newName = newNameInput.value.trim();

            if (!newName) {
                alert('Tên hiển thị không được để trống!');
                return;
            }

            try {
                saveNameBtn.textContent = '⏳ Đang lưu...';
                saveNameBtn.disabled = true;

                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    alert('Vui lòng đăng nhập lại để thực hiện tính năng này!');
                    return;
                }

                // Cập nhật full_name mới vào Supabase Auth user_metadata (Lưu vĩnh viễn)
                const { error: updateError } = await supabase.auth.updateUser({
                    data: { full_name: newName }
                });

                if (updateError) throw updateError;

                // Cập nhật tức thời tên trên giao diện header (phần .user-name)
                if (userNameElement) {
                    userNameElement.textContent = newName;
                }

                alert('Đổi tên hiển thị thành công! 🎉');

            } catch (error) {
                console.error('Lỗi khi cập nhật tên:', error.message);
                alert('Không thể cập nhật tên: ' + error.message);
            } finally {
                saveNameBtn.textContent = 'Lưu thay đổi';
                saveNameBtn.disabled = false;
            }
        });
    }
});
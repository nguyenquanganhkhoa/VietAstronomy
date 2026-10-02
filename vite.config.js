import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    host: true, // Cho phép truy cập qua mạng LAN / host bên ngoài
    allowedHosts: true // Cho phép tất cả các domain như ngrok
  },
  build: {
    rollupOptions: {
      input: {
        // Trang chủ mặc định
        main: resolve(__dirname, 'index.html'),
        
        // Liệt kê thêm tất cả các trang HTML khác ở đây:
        // Ví dụ: ten_key: resolve(__dirname, 'đường_dẫn_tới_file.html')
        navbar: resolve(__dirname, 'navbar.html'),
        footer: resolve(__dirname, 'footer.html'),
        
        // Nếu bro có các trang nằm trong thư mục html/ thì thêm vào như này:
        // page1: resolve(__dirname, 'html/trang1.html'),
        // page2: resolve(__dirname, 'html/trang2.html'),
      },
    },
  },
});
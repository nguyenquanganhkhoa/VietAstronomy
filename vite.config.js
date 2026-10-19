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
        main: resolve(__dirname, 'index.html'),
        navbar: resolve(__dirname, 'navbar.html'),
        footer: resolve(__dirname, 'footer.html'),
        about: resolve(__dirname, 'public/html/about.html'),
        account: resolve(__dirname, 'public/html/account.html'),
        game: resolve(__dirname, 'public/html/games.html'),
        news: resolve(__dirname, 'public/html/news.html'),
        register: resolve(__dirname, 'public/html/register.html'),
        login: resolve(__dirname, 'public/html/login.html'),
        contact: resolve(__dirname, 'public/html/contact.html'),
        level1: resolve(__dirname, 'public/html/games/level1.html'),
        level2: resolve(__dirname, 'public/html/games/level2.html'),
        level3: resolve(__dirname, 'public/html/games/level3.html'),
        level4: resolve(__dirname, 'public/html/games/level4.html'),
        level5: resolve(__dirname, 'public/html/games/level5.html'),
        level6: resolve(__dirname, 'public/html/games/level6.html'),
        level7: resolve(__dirname, 'public/html/games/level7.html'),
        level8: resolve(__dirname, 'public/html/games/level8.html'),
        level9: resolve(__dirname, 'public/html/games/level9.html'),
        level10: resolve(__dirname, 'public/html/games/level10.html'),
        news1: resolve(__dirname, 'public/html/news/Geminids.html'),
        'forgot-password': resolve(__dirname, 'public/html/forgot-password.html'),
        'reset-password': resolve(__dirname, 'public/html/reset-password.html'),
      },
    },
  },
});
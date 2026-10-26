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
        games: resolve(__dirname, 'html/games.html'),
        level1: resolve(__dirname, 'html/games/level1.html'),
        login: resolve(__dirname, 'html/login.html'),
        register: resolve(__dirname, 'html/register.html'),
      },
    },
  },
});
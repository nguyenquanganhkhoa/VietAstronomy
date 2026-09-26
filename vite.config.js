import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true, // Cho phép truy cập qua mạng LAN / host bên ngoài
    allowedHosts: true // Cho phép tất cả các domain như ngrok
  }
});
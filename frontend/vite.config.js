import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'server-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'server-cert.pem')),
    },
    host: '0.0.0.0',
    port: 2000,
  },
});

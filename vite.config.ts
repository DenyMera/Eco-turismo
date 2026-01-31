import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'pages/login.html'),
        registro: resolve(__dirname, 'pages/registro.html'),
        rutas: resolve(__dirname, 'pages/rutas.html'),
        perfil: resolve(__dirname, 'pages/perfil.html'),
        novedades: resolve(__dirname, 'pages/novedades.html'),
        ayuda: resolve(__dirname, 'pages/ayuda.html'),
        recuperar: resolve(__dirname, 'pages/recuperar.html'),
        recuperarEmail: resolve(__dirname, 'pages/recuperar-email.html'),
        reset: resolve(__dirname, 'pages/reset.html'),
        terminos: resolve(__dirname, 'pages/terminos.html'),
      },
    },
  },
})

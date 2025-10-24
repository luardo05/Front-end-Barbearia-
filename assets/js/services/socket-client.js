import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js"; // Importa de um CDN

const token = localStorage.getItem('jwt_token');
let socket;

if (token) {
    socket = io("http://localhost:3000", { // URL do seu backend
      auth: {
        token: token
      }
    });

    socket.on('connect', () => {
        console.log('Conectado ao servidor de Socket.IO!', socket.id);
    });

    socket.on('disconnect', () => {
        console.log('Desconectado do servidor de Socket.IO.');
    });
}

export default socket;
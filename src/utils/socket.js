import { io } from 'socket.io-client';

// You may need to update the URL to match your backend server
const SOCKET_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3001';

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ['websocket'],
});

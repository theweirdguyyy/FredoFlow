import { io } from 'socket.io-client';

let socket;

/**
 * Socket singleton to manage the real-time connection.
 */
export const getSocket = () => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      withCredentials: true,
      autoConnect: false,
      transports: ['websocket'],
    });
  }
  return socket;
};

/**
 * Helper to connect the socket after authentication.
 */
export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
};

/**
 * Helper to disconnect the socket on logout.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};

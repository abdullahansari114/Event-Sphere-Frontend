import { io } from 'socket.io-client'
import { API_ORIGIN } from '../config/api'

// Socket.IO ka alag URL set kar sakte ho (VITE_SOCKET_URL), warna backend wala hi use hoga.
// NOTE: Vercel serverless par WebSocket server nahi chalta, isliye live chat ke liye
// persistent host (Render/Railway) chahiye. Vercel par socket bas silently fail hoga,
// baaki poori app normal chalegi.
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_ORIGIN

// autoConnect: false — we connect it manually (from AuthContext) once the
// user is logged in. withCredentials: true is required so the httpOnly
// "token" cookie also reaches the backend with the socket handshake (the
// backend uses it to identify the user and join them to their private room
// — see script.mjs).
export const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,
  reconnectionAttempts: 3, // Vercel par infinite retry spam na ho
})

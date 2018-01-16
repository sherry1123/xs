import io from 'socket.io-client';
const socket = io('http://localhost:3456');
export default socket;
import io from 'socket.io-client';
const socket = io('http://localhost:3456');
socket.on('init status', initStatus => {
    //todo
});
export default socket;
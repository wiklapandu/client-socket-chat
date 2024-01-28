import { io } from 'socket.io-client';

const socket = io('http://localhost:3060', {reconnection: true, autoConnect: true});

export default socket;
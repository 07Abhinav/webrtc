const express=require('express');
const bodyParser = require('body-parser');
const {Server} = require('socket.io');

const io = new Server({
    cors: true,
});
const app = express();
app.use(bodyParser.json());
const emailToSocketMapping = new Map();
const socketToEmailMapping = new Map();
io.on("connection", (socket) => {
    console.log("socket connected");
    socket.on('join-room', (data) => {
        const { roomId, emailId } = data;
        console.log("user", emailId, "joined", roomId);
        emailToSocketMapping.set(emailId, socket.id);
        socketToEmailMapping.set(socket.id, emailId);
        socket.join(roomId);
        socket.emit("joined-room", { roomId });
        socket.broadcast.to(roomId).emit("user-joined", { emailId });
    });
    socket.on('call-user', (data) => {
        const { emailId, offer } = data;
        const socketId = emailToSocketMapping.get(emailId);
        const from = socketToEmailMapping.get(socket.id);
        socket.to(socketId).emit('incoming-call', { from, offer });
    });
    socket.on('call-accepted', (data) => {
        const { emailId, ans } = data;
        const socketId = emailToSocketMapping.get(emailId);
        const from = socketToEmailMapping.get(socket.id);
        socket.to(socketId).emit('call-accepted', { from, ans });
    });
});
app.listen(8000, () => {
    console.log('Server is running on port 8000');
});
io.listen(8001);
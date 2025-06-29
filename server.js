const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let users = {};
let chatHistory = {};

app.use(express.static(path.join(__dirname, '../client')));

io.on('connection', socket => {
    console.log('A user connected:', socket.id);

    socket.on('register', username => {
        users[socket.id] = username;
        io.emit('user-list', Object.values(users));
        socket.broadcast.emit('notification', `${username} joined.`);
    });

    socket.on('send-message', ({ room, message, file }) => {
        const user = users[socket.id];
        const payload = { user, message, file, time: new Date().toLocaleTimeString() };

        if (!chatHistory[room]) chatHistory[room] = [];
        chatHistory[room].push(payload);

        io.to(room).emit('receive-message', payload);
    });

    socket.on('join-room', room => {
        socket.join(room);
        socket.emit('chat-history', chatHistory[room] || []);
    });

    socket.on('disconnect', () => {
        const user = users[socket.id];
        delete users[socket.id];
        io.emit('user-list', Object.values(users));
        io.emit('notification', `${user} left.`);
    });
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});

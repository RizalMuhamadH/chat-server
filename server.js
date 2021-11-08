const express = require('express');
const app = express();
const { instrument } = require("@socket.io/admin-ui");
const http = require('http').Server(app);
// const io = require('socket.io')({
//     cors: {
//         origin: ["https://admin.socket.io"],
//         credentials: true
//     }
// });

const { Server } = require("socket.io");

const io = new Server(3000, {
        cors: {
            origin: ["https://admin.socket.io"],
            credentials: true
        }
    });

instrument(io, {
    auth: {
        type: "basic",
        username: "admin",
        password: "$2a$12$5sC3ssyUvez2ifFOpZNSvOtsK1SzFIJ5fzEeSIVYlHx/efWLRPLAS" // "changeit" encrypted with bcrypt
    }
});

// app.get('/', function (req, res) {
//     res.send('Hello world!');
// });

io.on("connect", (socket) => {

    socket.on('user', (userId) => {

        socket.join(userId)
    })

    socket.on('new-room', ({userIds, room}) =>{
        socket.to(userIds).emit('new-room', room)
    })

    socket.on('room', ({ roomId, user }) => {
        socket.join(roomId)
        socket.to(roomId).emit('user-connected', user)
    })

    socket.on('send-message', ({ roomId, message, userIds }) => {
        // socket.to(roomId).emit('new-message', message)
        socket.to(userIds).emit('notify-message', message)
    })

    socket.on('action-message', ({ roomId, userIds, action, message }) => {
        // socket.to(roomId).emit('action-message', { message: message, action: action })
        socket.to(userIds).emit('notify-message', { message: message, action: action })
    })

    socket.on('user-action', ({ roomId, userIds, action, message }) => {
        // socket.to(roomId).emit('room-action', { action: action, message: message })
        socket.to(userIds).emit('user-action', { action: action, message: message })
    })

    socket.on('typing', ({ roomId, userId }) => {
        socket.to(roomId).emit('typing', {
            userId: userId
        })
    })

    socket.on('stop-typing', ({ roomId, userId }) => {
        socket.to(roomId).emit('stop-typing', {
            userId: userId
        })
    })

    socket.on("leave", (roomId)=>{
        socket.leave(roomId)
    })

    socket.on('disconnect', () => {
        console.log('disconnect');
        // socket.to(room).emit('disconnect', { email, message });
        // console.log('diconnect ' + email)
    })
})

// const server = http.listen(3000, function () {
//     console.log('listening on *:3000');
// });

// io.listen(3000);
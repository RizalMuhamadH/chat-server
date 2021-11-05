const express = require('express');
const app = express();
const instrument = require("@socket.io/admin-ui");
const http = require('http').Server(app);
const io = require('socket.io')(http, {
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

app.get('/', function (req, res) {
    res.send('Hello world!');
});

io.on("connection", (socket) => {
    socket.on('user', ({ room, name }) => {
        socket.join(room)
    })

    socket.on('room', ({ room, name }) => {
        socket.join(room)
        socket.to(room).emit('user-connected', name)
    })

    socket.on('send-message', ({ room, email, message, user }) => {
        socket.to(room).emit('new-message', { message: message, name: room })
        socket.to(user).emit('notify-message', { message: message, email: email })
    })

    socket.on('action-message', ({ room, email, action, key, message }) => {
        socket.to(room).emit('action-message', { email: email, action: action, key: key })
        socket.to(user).emit('notify-message', { message: message, email: email, action: action })
    })

    socket.on('user-action', ({ room, email, action, message }) => {
        socket.to(room).emit('user-action', { email: email, action: action, message: message })
    })

    socket.on('typing', ({ room, email }) => {
        socket.to(room).emit('typing', {
            email: email
        })
    })

    socket.on('stop-typing', ({ room, email }) => {
        socket.to(room).emit('stop-typing', {
            email: email
        })
    })

    socket.on('disconnect', ({ room, email, message }) => {
        socket.to(room).emit('disconnect', { email, message });
        console.log('diconnect ' + email)
    })
})

const server = http.listen(3000, function () {
    console.log('listening on *:8080');
});
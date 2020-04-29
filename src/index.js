const http = require('http');
const socketIo = require('socket.io');

const app = require('./app');
const { generateMessage, generateMessageLocation } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const io = socketIo(server);

io.on('connection', (socket) => {
    
    socket.on('join', (options, callback) => {

        const { error, user } = addUser({ id: socket.id, ...options });

        if (error) {
           return callback(error);
        }

        socket.join(user.room);
        socket.emit('message', generateMessage(user.username, "Welcome!"));
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`));
        socket.to(user.room).emit("dataRoom", {
            room: user.room,
            users: getUsersInRoom(user.room)
        });
        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('message', generateMessage(user.username, message));
        callback('Message sent');
    });

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('messageLocation',
            generateMessageLocation(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callback('your location is delivered');
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            socket.to(user.room).emit('message', generateMessage(user.username, `${user.username} has left`));
            socket.to(user.room).emit("dataRoom", {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server is up on ${PORT}`);
})
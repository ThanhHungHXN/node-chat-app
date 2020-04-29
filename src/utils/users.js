const users = [];

const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();
    if (!username || !room) {
        return {
            "error": "Username and room is required!"
        };
    }
    const index = users.findIndex(user => user.username === username && user.room === room);
    if (index > -1) {
        return {
            "error": "Username is in use!"
        };
    }
    const user = { id, username, room };
    users.push(user);
    return { user };
}

const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id);
    if (index > -1) {
        return users.splice(index, 1)[0];
    }
}

const getUser = (id) => {
    return users.find(user => user.id === id);
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    return users.filter(user => user.room === room);
}

addUser({
    id: 1,
    username: "HungPrince",
    room: "Class 1"
});

addUser({
    id: 2,
    username: "Student 1",
    room: "Class 2"
});

addUser({
    id: 3,
    username: "HungKing",
    room: "Class 2"
});

addUser({
    id: 4,
    username: "Student 2",
    room: "Class 2"
});

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}

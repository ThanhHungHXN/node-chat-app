const socket = io();
// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = document.querySelector('#message');
const $messageFormButton = document.querySelector('#message-button');
const $messages = document.querySelector('#messages');
const $buttonSendLocation = document.querySelector('button[name="send-location"]');
const $sidebar = document.querySelector('.chat__sidebar');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;
// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () => {
    // New message element 
    const $newMessage = $messages.lastElementChild;

    // Height of new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible height 
    const visibleHeight = $messages.offsetHeight;

    // Height of messages container
    const containerHeight = $messages.scrollHeight;

    // How far I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight;
    if (containerHeight - newMessageHeight >= scrollOffset) {
        console.log($messages.scrollHeight);
        $messages.scrollTop = $messages.scrollHeight;
    }
}

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    $messageFormButton.setAttribute('disabled', 'disabled');
    const message = $messageForm.elements.message.value;
    socket.emit('sendMessage', message, (ack) => {
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = "";
        $messageFormInput.focus();
    });
    autoScroll();
});

socket.on('message', (message) => {
    const template = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).fromNow()
    });
    $messages.insertAdjacentHTML('beforeend', template);
});

$buttonSendLocation.addEventListener('click', () => {
    $buttonSendLocation.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition((position) => {
        const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };
        socket.emit('sendLocation', coords, (message) => {
            $buttonSendLocation.removeAttribute('disabled');
            if (!message) {
                return console.log('Can not send your location');
            }
        });
    });
})

socket.on('messageLocation', (message) => {
    const template = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).fromNow()
    });
    $messages.insertAdjacentHTML('beforeend', template);
});

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});

socket.on('dataRoom', (dataRoom) => {
    console.log(dataRoom);
    const template = Mustache.render(sidebarTemplate, {
        room: dataRoom.room,
        users: dataRoom.users
    });
    $sidebar.innerHTML = template;
});
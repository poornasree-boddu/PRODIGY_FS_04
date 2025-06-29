const socket = io();
let currentRoom = '';

function register() {
  const username = document.getElementById('username').value;
  if (!username) return alert('Enter name!');
  localStorage.setItem('username', username);
  socket.emit('register', username);
  document.getElementById('login').style.display = 'none';
  document.getElementById('chat').style.display = 'block';
}

function joinRoom() {
  currentRoom = document.getElementById('room').value;
  if (!currentRoom) return alert('Enter room!');
  socket.emit('join-room', currentRoom);
}

function sendMessage() {
  const message = document.getElementById('message').value;
  const fileInput = document.getElementById('fileInput');
  let file = null;

  if (fileInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = () => {
      socket.emit('send-message', { room: currentRoom, message, file: reader.result });
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    socket.emit('send-message', { room: currentRoom, message, file });
  }

  document.getElementById('message').value = '';
  fileInput.value = '';
}

socket.on('receive-message', ({ user, message, file, time }) => {
  const div = document.createElement('div');
  div.innerHTML = `<b>${user}:</b> ${message} <small>(${time})</small>`;
  if (file) {
    const media = file.startsWith("data:image") ?
      `<img src="${file}" style="max-width:100px;" />` :
      `<a href="${file}" download>Download file</a>`;
    div.innerHTML += "<br>" + media;
  }
  document.getElementById('chat-box').appendChild(div);
});

socket.on('user-list', (users) => {
  document.getElementById('users').innerText = 'Online: ' + users.join(', ');
});

socket.on('notification', msg => {
  alert(msg);
});

socket.on('chat-history', history => {
  document.getElementById('chat-box').innerHTML = '';
  history.forEach(({ user, message, file, time }) => {
    const div = document.createElement('div');
    div.innerHTML = `<b>${user}:</b> ${message} <small>(${time})</small>`;
    if (file) {
      const media = file.startsWith("data:image") ?
        `<img src="${file}" style="max-width:100px;" />` :
        `<a href="${file}" download>Download file</a>`;
      div.innerHTML += "<br>" + media;
    }
    document.getElementById('chat-box').appendChild(div);
  });
});

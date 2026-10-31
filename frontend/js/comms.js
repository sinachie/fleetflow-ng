document.addEventListener('DOMContentLoaded', () => {
  const log = document.getElementById('chatLog');
  const input = document.getElementById('chatInput');
  const btn = document.getElementById('sendBtn');

  // Connect to Socket.IO on Render
  const socketUrl = 'https://fleetflow-backend-bmvz.onrender.com';
  const socket = io(socketUrl, { transports: ['websocket', 'polling'] });

  socket.on('connect', () => console.log('🟢 Comms connected'));

  // Listen for incoming messages (from other devices OR server broadcasts)
  socket.on('chat:message', (payload) => {
    // Prevent duplicate messages from rendering
    if (document.getElementById(`msg-${payload.id}`)) return;

    const div = document.createElement('div');
    div.id = `msg-${payload.id}`; // Assign the unique ID to the HTML element
    
    // Check if the message was sent by the current user
    const isSentByMe = payload.author === 'Office'; 
    
    div.className = isSentByMe ? 'chat-bubble-sent' : 'chat-bubble-received';
    div.innerHTML = `<p class="text-[10px] opacity-70 mb-1">${payload.author || 'Driver'}</p>${payload.body}`;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  });

  // Send message
  function send() {
    const body = input.value.trim();
    if (!body) return;

    // Generate a unique ID for this specific message
    const messageId = Date.now().toString() + Math.random().toString(36).substring(2, 9);

    const payload = { 
      id: messageId, // Attach the ID
      author: 'Office', 
      body, 
      at: new Date().toISOString() 
    };

    // Add to own screen instantly (so it feels fast)
    const div = document.createElement('div');
    div.id = `msg-${payload.id}`; // Attach the ID to the HTML element
    div.className = 'chat-bubble-sent';
    div.innerHTML = `<p class="text-[10px] opacity-70 mb-1">${payload.author}</p>${payload.body}`;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;

    // Send to server (which broadcasts to everyone else)
    socket.emit('chat:message', payload);
    input.value = '';
  }

  btn.addEventListener('click', send);
  input.addEventListener('keydown', (e) => e.key === 'Enter' && send());
});
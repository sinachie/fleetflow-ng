// Real-time chat via Socket.IO — falls back to REST if socket fails.
document.addEventListener('DOMContentLoaded', () => {
  const log = document.getElementById('chatLog');
  const input = document.getElementById('chatInput');
  const btn = document.getElementById('sendBtn');

  const socketUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : window.location.origin;

  let socket;
  try {
    socket = io(socketUrl, { transports: ['websocket', 'polling'] });
    socket.on('connect', () => console.log('🟢 Comms connected'));
    socket.on('chat:message', (payload) => appendMessage(payload, 'received'));
  } catch (e) {
    console.warn('Socket not available, using REST only');
  }

  function appendMessage(payload, direction) {
    const div = document.createElement('div');
    div.className = direction === 'sent' ? 'chat-bubble-sent' : 'chat-bubble-received';
    div.innerHTML = `<p class="text-[10px] opacity-70 mb-1">${payload.author || 'Driver'}</p>${payload.body}`;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  function send() {
    const body = input.value.trim();
    if (!body) return;
    const payload = { author: 'Office', body, at: new Date().toISOString() };
    appendMessage(payload, 'sent');
    socket?.emit('chat:message', payload);
    input.value = '';
  }

  btn.addEventListener('click', send);
  input.addEventListener('keydown', (e) => e.key === 'Enter' && send());
});
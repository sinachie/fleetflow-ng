document.addEventListener('DOMContentLoaded', async () => {
  const log = document.getElementById('chatLog');
  const input = document.getElementById('chatInput');
  const btn = document.getElementById('sendBtn');

  // Connect to Socket.IO on Render
  const user = JSON.parse(localStorage.getItem('ff_user'));
  const socketUrl = 'https://fleetflow-backend-bmvz.onrender.com';
  
  // ADD THE QUERY PARAMETER
  const socket = io(socketUrl, { 
    transports: ['websocket', 'polling'],
    query: { company: user.company } 
  });
  

  socket.on('connect', () => console.log('🟢 Comms connected'));

  // 1. Listen for live incoming messages
  socket.on('chat:message', (payload) => {
    if (document.getElementById(`msg-${payload.id}`)) return; // Prevent duplicates
    renderMessage(payload);
  });

  // 2. Load Chat History on page load
  try {
    const history = await Api.get('/messages');
    if (history.length === 0) {
      log.innerHTML = `<p class="text-center text-slate-400 mt-10">No messages yet. Say hello!</p>`;
    } else {
      log.innerHTML = ''; // Clear loading text
      history.forEach(msg => {
        renderMessage({
          id: msg._id,
          author: msg.from ? msg.from.name : 'Unknown',
          role: msg.from ? msg.from.role : 'driver',
          body: msg.body
        });
      });
    }
  } catch (e) {
    console.error("Could not load history:", e);
  }

  // 3. Send Message via REST API (The backend will broadcast it via Socket)
  async function send() {
    const body = input.value.trim();
    if (!body) return;
    
    input.value = ''; // Clear input immediately for good UX

    try {
      await Api.post('/messages', { body });
      // Note: We don't manually render the message here. 
      // The Socket.IO broadcast from the backend will catch it and render it.
    } catch (e) {
      alert(`❌ Failed to send: ${e.message}`);
    }
  }

  btn.addEventListener('click', send);
  input.addEventListener('keydown', (e) => e.key === 'Enter' && send());

  // 4. The Render Function
  function renderMessage(payload) {
    const div = document.createElement('div');
    div.id = `msg-${payload.id}`;
    
    // Check if the sender is Office (Admin/Manager) or a Driver
    const isOffice = payload.role === 'admin' || payload.role === 'manager';
    
    div.className = isOffice ? 'chat-bubble-sent' : 'chat-bubble-received';
    
    div.innerHTML = `
      <p class="text-[10px] opacity-70 mb-1 font-bold">${payload.author}</p>
      ${payload.body}
    `;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }
});
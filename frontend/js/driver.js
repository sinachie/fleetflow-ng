document.addEventListener('DOMContentLoaded', async () => {
  // 1. Security Check: Make sure they are logged in
  const userStr = localStorage.getItem('ff_user');
  const token = localStorage.getItem('ff_token');
  if (!userStr || !token) {
    window.location.href = 'index.html'; // Kick them to login if not logged in
    return;
  }
  
  const user = JSON.parse(userStr);

  // 2. Load the Driver's Assigned Vehicle
  try {
    const vehicles = await Api.get('/vehicles');
    // Find the vehicle where the driver ID matches this user
    const myTruck = vehicles.find(v => v.driver && v.driver._id === user.id) || vehicles[0]; 
    
    if (myTruck) {
      document.getElementById('driver-truck-name').innerText = `Truck: ${myTruck.plateNumber}`;
      document.getElementById('driver-plate').innerText = myTruck.plateNumber;
      document.getElementById('driver-model').innerText = myTruck.model;
      document.getElementById('driver-odo').innerText = `${myTruck.odometerKm} km`;
      document.getElementById('driver-fuel').innerText = `${myTruck.fuelLiters} L`;
      
      // Save truck plate for the location button
      window.currentTruckPlate = myTruck.plateNumber;
    }
  } catch (e) {
    console.error("Error loading vehicle:", e);
  }

  // 3. Load Maintenance for this Driver
  try {
    const records = await Api.get('/maintenance');
    const list = document.getElementById('driver-maintenance');
    
    // Filter records to only show ones matching the driver's truck
    const myRecords = records.filter(m => m.vehicle && myTruck && m.vehicle._id === myTruck._id);

    if (myRecords.length === 0) {
      list.innerHTML = '<p class="text-slate-400">No maintenance tasks assigned.</p>';
    } else {
      list.innerHTML = myRecords.slice(0, 3).map(m => `
        <div class="flex justify-between items-center border-b pb-2">
          <p class="font-medium">${m.serviceType}</p>
          <span class="text-xs px-2 py-1 rounded ${m.status === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}">${m.status}</span>
        </div>
      `).join('');
    }
  } catch (e) { console.error(e); }

  // 4. Setup Real-Time Chat (Driver View)
  const socketUrl = 'https://fleetflow-backend-bmvz.onrender.com';
  const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
  const chatLog = document.getElementById('driver-chat-log');

  socket.on('chat:message', (payload) => {
    renderDriverMessage(payload);
  });

  // Load chat history
  const history = await Api.get('/messages');
  history.forEach(msg => {
    renderDriverMessage({
      id: msg._id,
      author: msg.from ? msg.from.name : 'Unknown',
      role: msg.from ? msg.from.role : 'driver',
      body: msg.body
    });
  });

  function renderDriverMessage(payload) {
    if (document.getElementById(`msg-${payload.id}`)) return;
    const div = document.createElement('div');
    div.id = `msg-${payload.id}`;
    
    // Driver view: Their messages are blue (right), Office is grey (left)
    const isMe = payload.role === 'driver';
    div.className = isMe ? 'chat-bubble-sent text-xs' : 'chat-bubble-received text-xs';
    div.innerHTML = `<p class="text-[9px] opacity-70 mb-1">${payload.author}</p>${payload.body}`;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  window.sendDriverMessage = async () => {
    const input = document.getElementById('driver-chat-input');
    const body = input.value.trim();
    if (!body) return;
    input.value = '';
    await Api.post('/messages', { body });
  };
});

// 5. Location Sharing Logic
window.shareDriverLocation = () => {
  if (!navigator.geolocation) return alert("GPS not supported on this device.");
  
  const btn = event.target;
  btn.innerText = '📍 Getting GPS...';

  navigator.geolocation.getCurrentPosition(async (position) => {
    try {
      await Api.post('/vehicles/update-location', {
        plateNumber: window.currentTruckPlate,
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
      btn.innerText = '✅ Location Shared!';
      setTimeout(() => btn.innerText = '📍 Share My Location with Office', 3000);
    } catch (e) {
      alert(`❌ Failed to share: ${e.message}`);
      btn.innerText = '📍 Share My Location with Office';
    }
  }, () => {
    alert("Please allow location access.");
    btn.innerText = '📍 Share My Location with Office';
  });
};

// 6. Logout
window.logoutDriver = () => {
  localStorage.removeItem('ff_token');
  localStorage.removeItem('ff_user');
  window.location.href = 'index.html';
};
document.addEventListener('DOMContentLoaded', async () => {
  const userStr = localStorage.getItem('ff_user');
  const token = localStorage.getItem('ff_token');
  if (!userStr || !token) {
    window.location.href = 'index.html';
    return;
  }
  
  const user = JSON.parse(userStr);
  let myTruck = null; // Declare outside so both blocks can use it

  // 1. Load the Driver's Assigned Vehicle
  try {
    const vehicles = await Api.get('/vehicles');
    
    // Find the vehicle where the driver ID matches this user
    myTruck = vehicles.find(v => v.driver && v.driver._id === user.id) || (vehicles.length > 0 ? vehicles[0] : null); 
    
    if (myTruck) {
      document.getElementById('driver-truck-name').innerText = `Truck: ${myTruck.plateNumber}`;
      document.getElementById('driver-plate').innerText = myTruck.plateNumber;
      document.getElementById('driver-model').innerText = myTruck.model;
      document.getElementById('driver-odo').innerText = `${myTruck.odometerKm || 0} km`;
      document.getElementById('driver-fuel').innerText = `${myTruck.fuelLiters || 0} L`;
      
      window.currentTruckPlate = myTruck.plateNumber;
    } else {
      // Fallback UI if no vehicle is assigned
      document.getElementById('driver-truck-name').innerText = 'No Vehicle Assigned';
      document.getElementById('driver-plate').innerText = '---';
      document.getElementById('driver-model').innerText = 'Contact Admin to assign a truck.';
    }
  } catch (e) {
    console.error("Error loading vehicle:", e);
    document.getElementById('driver-truck-name').innerText = 'Error loading truck';
  }

     // 2. Load Maintenance for this Driver
  try {
    const records = await Api.get('/maintenance');
    const list = document.getElementById('driver-maintenance');
    
    // Ensure records is an array
    const recordsArray = Array.isArray(records) ? records : [];
    
    // Filter records to only show ones matching the driver's truck
    const myRecords = myTruck ? recordsArray.filter(m => m.vehicle && m.vehicle._id === myTruck._id) : [];

    if (myRecords.length === 0) {
      list.innerHTML = '<p class="text-slate-400 text-sm">No maintenance tasks assigned to this truck.</p>';
    } else {
      list.innerHTML = myRecords.slice(0, 3).map(m => `
        <div class="flex justify-between items-center border-b pb-2">
          <p class="font-medium text-sm">${m.serviceType}</p>
          <span class="text-xs px-2 py-1 rounded ${m.status === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}">${m.status}</span>
        </div>
      `).join('');
    }
  } catch (e) { 
    console.error("Error loading maintenance:", e);
    document.getElementById('driver-maintenance').innerHTML = '<p class="text-red-500 text-sm">Failed to load tasks.</p>';
  }

  // 3. Setup Real-Time Chat
  const socketUrl = 'https://fleetflow-backend-bmvz.onrender.com';
  const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
  const chatLog = document.getElementById('driver-chat-log');

  socket.on('chat:message', (payload) => {
    renderDriverMessage(payload);
  });

  // Load chat history
  try {
    const history = await Api.get('/messages');
    history.forEach(msg => {
      renderDriverMessage({
        id: msg._id,
        author: msg.from ? msg.from.name : 'Unknown',
        role: msg.from ? msg.from.role : 'driver',
        body: msg.body
      });
    });
  } catch(e) { console.log(e); }

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

// 4. Location Sharing Logic
window.shareDriverLocation = () => {
  if (!navigator.geolocation) return alert("GPS not supported on this device.");
  if (!window.currentTruckPlate) return alert("You need an assigned vehicle to share location.");
  
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

// 5. Logout
window.logoutDriver = () => {
  localStorage.removeItem('ff_token');
  localStorage.removeItem('ff_user');
  window.location.href = 'index.html';
};
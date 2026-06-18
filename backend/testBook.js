const testBooking = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: '2024-12-12',
        time: '12:00',
        guests: 2,
        floor: 'Ground Floor',
        tableId: '60c72b2f9b1e8a0015a6b0c2',
        tableNumber: '1'
      })
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Data:", data);
  } catch (err) {
    console.error("Error:", err);
  }
};

testBooking();

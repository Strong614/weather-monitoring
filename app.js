const express = require('express');
const { SerialPort } = require('serialport');
const db = require('./db'); // SQLite DB connection
const app = express();
const port = 3000;

// Replace this with your correct COM port (check Device Manager)
const bluetoothPort = new SerialPort({
  path: 'COM3', // Update as needed
  baudRate: 9600,
});

// Error handling for serial port
bluetoothPort.on('error', (err) => {
  console.error(`❌ SerialPort Error: ${err.message}`);
});

// Initialize buffer for incoming data
let buffer = '';

// Process incoming data
bluetoothPort.on('data', (data) => {
  buffer += data.toString().trim();  // Concatenate new data into buffer

  // Check if the buffer contains the expected data pattern
  const regex = /Temp:(\d+(\.\d+)?)\s*Hum:(\d+(\.\d+)?)/;
  let match = regex.exec(buffer);

  if (match) {
    const temp = parseFloat(match[1]);
    const hum = parseFloat(match[3]);

    if (!isNaN(temp) && !isNaN(hum)) {
      db.run(
        'INSERT INTO readings (temperature, humidity) VALUES (?, ?)',
        [temp, hum],
        (err) => {
          if (err) return console.error('❌ DB Insert Error:', err.message);
          console.log(`✅ Saved: ${temp}°C, ${hum}%`);
        }
      );

      // Reset buffer after successful data extraction
      buffer = '';
    }
  } else {
    // If data doesn't match the expected pattern, we continue accumulating the buffer
    console.error('❌ Invalid Data (does not match expected format):', buffer);
  }
});

// API route for mobile frontend
app.get('/api/readings', (req, res) => {
  db.all('SELECT * FROM readings ORDER BY id DESC LIMIT 10', (err, rows) => {
    if (err) {
      console.error('❌ DB Query Error:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Start server
app.listen(port, () => {
  console.log(`🌐 Server running at http://localhost:${port}`);
});

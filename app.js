const express = require('express');
const SerialPort = require('serialport');
const db = require('./db'); // SQLite DB connection
const app = express();
const port = 3000;

// Replace this with your Bluetooth COM port (check Device Manager)
const bluetoothPort = new SerialPort.SerialPort({
    path: 'COM6', // ← replace with the correct COM port
    baudRate: 9600,
  });
  

// Receive serial data and insert into SQLite DB
bluetoothPort.on('data', data => {
  const text = data.toString();
  const [tempLine, humLine] = text.split('\n');
  const temp = parseFloat(tempLine?.match(/\d+/));
  const hum = parseFloat(humLine?.match(/\d+/));

  if (!isNaN(temp) && !isNaN(hum)) {
    db.run(
      'INSERT INTO readings (temperature, humidity) VALUES (?, ?)',
      [temp, hum],
      err => {
        if (err) return console.error('❌ DB Insert Error:', err.message);
        console.log(`✅ Saved: ${temp}°C, ${hum}%`);
      }
    );
  }
});

// Serve frontend
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  db.all('SELECT * FROM readings ORDER BY id DESC LIMIT 10', (err, rows) => {
    if (err) {
      console.error('❌ DB Query Error:', err.message);
      return res.status(500).send('Database error');
    }
    res.render('index', { readings: rows });
  });
});

app.listen(port, () => console.log(`🌐 Server running at http://localhost:${port}`));

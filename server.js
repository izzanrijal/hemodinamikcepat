// server.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Path to db.json
const dbFilePath = path.join(__dirname, 'db.json');

// Helper function to read data from db.json
function readData() {
  try {
    const data = fs.readJsonSync(dbFilePath, { throws: false }) || { patients: {}, examinations: [] };
    return data;
  } catch (error) {
    console.error('Error reading db.json:', error);
    return { patients: {}, examinations: [] };
  }
}

// Helper function to write data to db.json
function writeData(data) {
  try {
    fs.writeJsonSync(dbFilePath, data, { spaces: 2 });
  } catch (error) {
    console.error('Error writing to db.json:', error);
  }
}

// API endpoint to get patient data by RM
app.get('/api/patients/:rm', (req, res) => {
  const rm = req.params.rm.trim();
  const data = readData();
  const patient = data.patients[rm];
  if (patient) {
    res.json(patient);
  } else {
    res.status(404).json({ error: 'RM not found' });
  }
});

// API endpoint to add or update a patient
app.post('/api/patients', (req, res) => {
  const patientData = req.body;
  const data = readData();
  data.patients[patientData.rm.trim()] = patientData;
  writeData(data);
  res.json({ message: 'Patient data saved successfully' });
});

// API endpoint to get all examinations
app.get('/api/examinations', (req, res) => {
  const data = readData();
  res.json(data.examinations);
});

// API endpoint to add a new examination
app.post('/api/examinations', (req, res) => {
  const examinationData = req.body;
  const data = readData();
  data.examinations.unshift(examinationData); // Add to the beginning
  writeData(data);
  res.json({ message: 'Examination data saved successfully' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

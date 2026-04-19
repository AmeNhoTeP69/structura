const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DB_FILE = path.join(__dirname, 'db.json');

// Helper to read database
const readDB = () => {
  const data = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(data);
};

// Helper to write database
const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// --- USERS API (Partner 1) ---

// Get all users
app.get('/api/users', (req, res) => {
  const db = readDB();
  res.json(db.users);
});

// Login User
app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (user && user.password === password) {
    res.json(user);
  } else {
    res.status(401).json({ error: 'Invalid email or password' });
  }
});

// Create new user
app.post('/api/users', (req, res) => {
  const { name, email, role, password } = req.body;
  const db = readDB();
  
  const newUser = {
    id: `u${Date.now()}`,
    name,
    email,
    role,
    password: password || 'password123'
  };
  
  db.users.push(newUser);
  writeDB(db);
  res.status(201).json(newUser);
});

// Delete user
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  
  db.users = db.users.filter(u => u.id !== id);
  writeDB(db);
  
  res.json({ success: true });
});

// Update user
app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  const db = readDB();
  
  const userIndex = db.users.findIndex(u => u.id === id);
  if (userIndex !== -1) {
    db.users[userIndex] = { ...db.users[userIndex], ...updatedData };
    writeDB(db);
    res.json(db.users[userIndex]);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// --- PROJECTS API (Partner 2 To-Do) ---

// Get all projects
app.get('/api/projects', (req, res) => {
  const db = readDB();
  res.json(db.projects);
});

// Create new project
app.post('/api/projects', (req, res) => {
  const newProject = req.body;
  const db = readDB();
  db.projects.unshift(newProject); // add to top
  writeDB(db);
  res.status(201).json(newProject);
});

// Update project
app.put('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  const db = readDB();
  
  const projIndex = db.projects.findIndex(p => p.id === id);
  if (projIndex !== -1) {
    db.projects[projIndex] = { ...db.projects[projIndex], ...updatedData };
    writeDB(db);
    res.json(db.projects[projIndex]);
  } else {
    res.status(404).json({ error: 'Project not found' });
  }
});

// Delete project
app.delete('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  
  db.projects = db.projects.filter(p => p.id !== id);
  writeDB(db);
  
  res.json({ success: true });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

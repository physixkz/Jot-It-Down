const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const dbFilePath = path.join(__dirname, './db/db.json');

let notes = [];

const readInitialData = () => {
  try {
    const data = fs.readFileSync(dbFilePath, 'utf8');
    notes = JSON.parse(data);
  } catch (error) {
    console.error('Error reading or parsing db.json:', error);
  }
};

const saveNotesToFile = () => {
  fs.writeFile(dbFilePath, JSON.stringify(notes), 'utf8', (err) => {
    if (err) {
      console.error('Error writing db.json:', err);
    }
  });
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/notes', (req, res) => {
  res.json(notes);
});

app.post('/api/notes', (req, res) => {
  try {
    const newNote = req.body;
    newNote.id = Date.now().toString();
    notes.push(newNote);

    // Write updated notes array to db.json
    saveNotesToFile();

    res.json(newNote);
  } catch (error) {
    console.error('Error saving note:', error);
    res.status(500).json({ error: 'An error occurred while saving the note.' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.put('/api/notes/:id', (req, res) => {
  const noteId = req.params.id; // Extract the note ID from the URL
  const updatedNote = req.body; // Get the updated note data from the request body

  // Find the note in your `notes` array using the ID and update its properties
  const noteToUpdate = notes.find((note) => note.id === noteId);
  if (!noteToUpdate) {
    // If the note is not found, return a 404 response
    return res.status(404).json({ error: 'Note not found' });
  }

  // Update the note properties
  noteToUpdate.title = updatedNote.title;
  noteToUpdate.text = updatedNote.text;

  // Save the updated notes to your data store (e.g., db.json)
  saveNotesToFile();

  // Return a response indicating success
  res.json({ message: 'Note updated successfully', updatedNote });
});

// Read initial data and start the server
readInitialData();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Save notes to db.json at regular intervals (e.g., every 5 minutes)
const saveInterval = 5 * 60 * 1000; // 5 minutes (in milliseconds)
setInterval(saveNotesToFile, saveInterval);

app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id; // Extract the note ID from the URL

  // Find the index of the note to delete
  const noteIndex = notes.findIndex((note) => note.id === noteId);

  if (noteIndex === -1) {
    // If the note is not found, return a 404 response
    return res.status(404).json({ error: 'Note not found' });
  }

  // Remove the note from the notes array
  notes.splice(noteIndex, 1);

  // Save the updated notes to your data store (e.g., db.json)
  saveNotesToFile();

  // Return a response indicating success
  res.json({ message: 'Note deleted successfully' });
});
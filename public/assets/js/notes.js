document.addEventListener('DOMContentLoaded', () => {
    // Select relevant elements
    const noteTitle = document.querySelector('.note-title');
    const noteText = document.querySelector('.note-textarea');
    const saveNoteBtn = document.querySelector('.save-note');
    const newNoteBtn = document.querySelector('.new-note');
    const noteList = document.querySelector('.list-group');
  
    // Initialize activeNote to keep track of the currently selected note
    let activeNote = {};
  
    // Function to show an element
    const show = (elem) => {
      elem.style.display = 'inline';
    };
  
    // Function to hide an element
    const hide = (elem) => {
      elem.style.display = 'none';
    };
  
    // Function to render the active note in the right-hand column
    const renderActiveNote = () => {
      hide(saveNoteBtn);
  
      if (activeNote.id) {
        noteTitle.removeAttribute('readonly'); // Allow editing of title
        noteText.removeAttribute('readonly'); // Allow editing of text
        noteTitle.value = activeNote.title;
        noteText.value = activeNote.text;
      } else {
        noteTitle.value = '';
        noteText.value = '';
      }
    };
  
    // Initialize an empty array to store note data
    let notes = [];
  
    // Function to render the list of notes in the left column
    const renderNoteList = () => {
      noteList.innerHTML = '';
  
      // Loop through the notes and create list items for each note
      notes.forEach((note, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';
  
        // Add an event listener to enable editing when a note is selected
        listItem.addEventListener('click', () => {
          activeNote = notes[index];
          renderActiveNote();
          enableNoteEditing(); // Call the function to enable editing
        });
  
        // Create a delete button and add an event listener to it
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-danger delete-note';
        deleteButton.innerHTML = 'Delete';
        deleteButton.addEventListener('click', (event) => {
          event.stopPropagation(); // Prevent the note from being selected when clicking the delete button
          deleteNote(index); // Call the function to delete the note
        });
  
        listItem.innerHTML = `
          <h5 class="note-title">${note.title}</h5>
          <p class="note-content">${note.text}</p>
        `;
  
        // Append the delete button to the list item
        listItem.appendChild(deleteButton);
  
        noteList.appendChild(listItem);
      });
    };
  
    // Function to enable editing of the active note
    const enableNoteEditing = () => {
      noteTitle.removeAttribute('readonly');
      noteText.removeAttribute('readonly');
      show(saveNoteBtn);
    };
  
    // Function to fetch notes from the server and update the notes array
    const fetchNotes = () => {
      fetch('/api/notes')
        .then((response) => response.json())
        .then((data) => {
          notes = data; // Update the notes array with data from the server
          renderNoteList(); // Update the UI to display the notes
        })
        .catch((error) => {
          console.error('Error fetching notes:', error);
        });
    };
  
    // Fetch notes when the page loads
    fetchNotes();
  
    const handleNoteSave = () => {
      const title = noteTitle.value.trim();
      const text = noteText.value.trim();
  
      if (title && text) {
        if (activeNote.id) {
          // Update existing note
          activeNote.title = title;
          activeNote.text = text;
  
          // Make an API request to update the note on the server
          fetch(`/api/notes/${activeNote.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(activeNote),
          })
            .then((response) => response.json())
            .then((updatedNote) => {
              // Handle the response as needed
              // You may not need to do anything here, or you can update the UI if necessary
              console.log('Note updated:', updatedNote);
            })
            .catch((error) => {
              console.error('Error updating note:', error);
            });
        } else {
          // Create a new note
          const newNote = { title, text };
  
          // Make an API request to save the new note on the server
          fetch('/api/notes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newNote),
          })
            .then((response) => response.json())
            .then((savedNote) => {
              // Handle the response as needed
              // You may not need to do anything here, or you can update the UI if necessary
              console.log('Note saved:', savedNote);
            })
            .catch((error) => {
              console.error('Error saving note:', error);
            });
        }
      }
    };
  
    // Function to handle starting a new note
    const handleNewNote = () => {
      activeNote = {};
      renderActiveNote();
      enableNoteEditing(); // Call the function to enable editing
    };
  
    // Function to delete a note
    const deleteNote = (index) => {
      if (index >= 0 && index < notes.length) {
        // Remove the note from the array
        const deletedNote = notes.splice(index, 1)[0];
  
        // Make an API request to delete the note on the server
        fetch(`/api/notes/${deletedNote.id}`, {
          method: 'DELETE',
        })
          .then((response) => {
            if (response.ok) {
              console.log('Note deleted successfully.');
            } else {
              console.error('Error deleting note.');
            }
          })
          .catch((error) => {
            console.error('Error deleting note:', error);
          });
  
        // Update the UI to reflect the deletion
        renderNoteList();
      }
    };
  
    // Event listeners
    saveNoteBtn.addEventListener('click', handleNoteSave);
    newNoteBtn.addEventListener('click', handleNewNote);
  });
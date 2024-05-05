import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PopupNotes from "./PopupNotes";
import PopupEditNotes from './PopupEditNotes';
import './NotesPage.css';

function NotesPage() {
    const [newNoteTitle, setNewNoteTitle] = useState('');
    const [newNoteContent, setNewNoteContent] = useState('');
    const [notes, setNotes] = useState([]);
    const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
    const [editNoteId, setEditNoteId] = useState(null);
    const [editNoteTitle, setEditNoteTitle] = useState('');
    const [editNoteContent, setEditNoteContent] = useState('');
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);

    useEffect(() => {
        fetch('http://localhost:3001/notes', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch notes');
                }
                return response.json();
            })
            .then(data => {
                setNotes(data);
            })
            .catch(error => {
                console.error('Error fetching notes:', error);
            });
    }, []);

    const handleAddNote = async () => {
        try {
            const response = await fetch('http://localhost:3001/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    Title: newNoteTitle,
                    Content: newNoteContent
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setNotes([...notes, data.note]);
                setNewNoteTitle('');
                setNewNoteContent('');
            } else {
                console.error('Erreur lors de l\'ajout de la note :', data.error);
            }
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la note :', error);
        }
    };

    const handleDeleteNote = async (noteId) => {
        try {
            const response = await fetch(`http://localhost:3001/notes/${noteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });
            if (response.ok) {
                const updatedNotes = notes.filter(note => note.NoteID !== noteId);
                setNotes(updatedNotes);
            } else {
                const data = await response.json();
                console.error('Erreur lors de la suppression de la note :', data.error);
            }
        } catch (error) {
            console.error('Erreur lors de la suppression de la note :', error);
        }
    };

    const handleEditNote = async () => {
        try {
            const response = await fetch(`http://localhost:3001/notes/${editNoteId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    Title: editNoteTitle,
                    Content: editNoteContent
                }),
            });
            const data = await response.json();
            if (response.ok) {
                const updatedNotes = notes.map(note => {
                    if (note.NoteID === editNoteId) {
                        return {
                            ...note,
                            Title: editNoteTitle,
                            Content: editNoteContent
                        };
                    }
                    return note;
                });
                setNotes(updatedNotes);
                setIsEditPopupOpen(false);
            } else {
                console.error('Erreur lors de la modification de la note :', data.error);
            }
        } catch (error) {
            console.error('Erreur lors de la modification de la note :', error);
        }
    };

    const openEditPopup = (noteId, title, content) => {
        setEditNoteId(noteId);
        setEditNoteTitle(title);
        setEditNoteContent(content);
        setIsEditPopupOpen(true);
    };

    const openAddPopup = () => {
        setIsAddPopupOpen(true);
    };

    const closePopups = () => {
        setIsAddPopupOpen(false);
        setIsEditPopupOpen(false);
    };

    return (
        <div className="page-container">
            <div className="button-container">
            <div className="homepage-button">
                <Link to="/dashboard" className="homepage-link">Home Page</Link>
            </div>
            <h2>Notes</h2>
            <div className="title-container">
                <button className="add-button" onClick={openAddPopup}>Add Notes</button>
            </div>
                <PopupNotes isOpen={isAddPopupOpen} onClose={closePopups} onSubmit={handleAddNote}>
                    <input type="text" placeholder="Title" value={newNoteTitle}
                           onChange={(e) => setNewNoteTitle(e.target.value)}/>
                    <textarea placeholder="Content" value={newNoteContent}
                              onChange={(e) => setNewNoteContent(e.target.value)}/>
                </PopupNotes>
            </div>

            <ul className="notes-list">
                {notes.map(note => (
                    <li className="note-item" key={note.NoteID}>
                        <strong>{note.Title}</strong>: {note.Content}
                        <button className="edit-note-button"
                                onClick={() => openEditPopup(note.NoteID, note.Title, note.Content)}>Edit
                        </button>
                        <PopupEditNotes isOpen={isEditPopupOpen && editNoteId === note.NoteID} onClose={closePopups}
                                        onSubmit={handleEditNote}>
                            <input type="text" placeholder="Title" value={editNoteTitle}
                                   onChange={(e) => setEditNoteTitle(e.target.value)}/>
                            <textarea placeholder="Content" value={editNoteContent}
                                      onChange={(e) => setEditNoteContent(e.target.value)}/>
                        </PopupEditNotes>
                        <button className="delete-note-button" onClick={() => handleDeleteNote(note.NoteID)}>Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default NotesPage;

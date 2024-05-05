// noteRoutes.js

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { authenticateUser, getUsernameFromToken } = require('./authMiddleware');
// Chemin vers le fichier de notes

const usersDirectory = path.join(__dirname, '..', '..', 'data', 'users');

const getUserNotesDirectory = (username) => {
    return path.join(__dirname, '..', '..', 'data', 'users', username, 'notes.json');
};

router.use(authenticateUser);

// Endpoint pour récupérer toutes les notes
router.get('/', authenticateUser, (req, res) => {
    const userDirectory = path.join(usersDirectory, req.user.username);
    const userNotesFilePath = path.join(userDirectory, 'notes.json');

    // Lire les notes depuis le fichier spécifique à cet utilisateur
    fs.readFile(userNotesFilePath, 'utf-8', (err, data) => {
        if (err) {
            console.error('Erreur lors de la lecture du fichier de notes :', err);
            res.status(500).send({ error: 'Erreur lors de la lecture des notes' });
            return;
        }
        const notes = JSON.parse(data);
        res.json(notes);
    });
});


// Endpoint pour créer une nouvelle note
router.post('/', authenticateUser, (req, res) => {
    const username = req.user.username;

    if (!username) {
        return res.status(401).send({ error: 'Token invalide' });
    }

    const newNote = req.body;
    newNote.creationDate = new Date().toISOString();

    // Chemin du fichier de notes de l'utilisateur
    const notesFilePath = getUserNotesDirectory(username);

    // Lire les notes depuis le fichier de l'utilisateur
    fs.readFile(notesFilePath, 'utf-8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // Le fichier de notes n'existe pas, nous devons le créer avec une nouvelle liste de notes
                const initialNotes = [{ ...newNote, NoteID: 1 }]; // NoteID initialisé à 1
                fs.writeFile(notesFilePath, JSON.stringify(initialNotes, null, 2), (err) => {
                    if (err) {
                        return res.status(500).send({ error: 'Erreur lors de la création du fichier de notes' });
                    }
                    res.status(201).send({ message: 'Note créée avec succès', note: { ...newNote, NoteID: 1 } });
                });
            } else {
                // Erreur de lecture du fichier de notes
                console.error('Erreur lors de la lecture du fichier de notes :', err);
                res.status(500).send({ error: 'Erreur lors de la création de la note' });
            }
        } else {
            // Le fichier de notes existe, ajoutez simplement la nouvelle note
            try {
                const notes = JSON.parse(data);
                // Trouver le dernier NoteID
                const lastNoteID = notes.length > 0 ? notes[notes.length - 1].NoteID : 0;
                // Incrémenter le NoteID pour la nouvelle note
                newNote.NoteID = lastNoteID + 1;
                // Ajouter la nouvelle note à la liste des notes existantes
                notes.push(newNote);
                // Écrire les notes mises à jour dans le fichier
                fs.writeFile(notesFilePath, JSON.stringify(notes, null, 2), (err) => {
                    if (err) {
                        return res.status(500).send({ error: 'Erreur lors de l\'écriture des notes' });
                    }
                    res.status(201).send({ message: 'Note créée avec succès', note: newNote });
                });
            } catch (error) {
                // Erreur de parsing JSON
                console.error('Erreur de parsing JSON :', error);
                res.status(500).send({ error: 'Erreur lors de la création de la note' });
            }
        }
    });
});









// Endpoint pour mettre à jour une note existante
router.put('/:id', authenticateUser, (req, res) => {
    const id = parseInt(req.params.id);
    const updatedNote = req.body;

    // Chemin du fichier de notes de l'utilisateur
    const notesFilePath = getUserNotesDirectory(req.user.username);

    // Lire les notes depuis le fichier de l'utilisateur
    fs.readFile(notesFilePath, 'utf-8', (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Erreur lors de la lecture des notes' });
            return;
        }
        let notes = JSON.parse(data);

        // Trouver la note à mettre à jour
        const noteIndex = notes.findIndex(note => note.NoteID === id);
        if (noteIndex === -1) {
            res.status(404).send({ error: 'Note non trouvée' });
            return;
        }

        // Mettre à jour les propriétés de la note avec les nouvelles valeurs
        notes[noteIndex].Title = updatedNote.Title;
        notes[noteIndex].Content = updatedNote.Content;

        // Écrire les notes mises à jour dans le fichier
        fs.writeFile(notesFilePath, JSON.stringify(notes, null, 2), (err) => {
            if (err) {
                res.status(500).send({ error: 'Erreur lors de l\'écriture des notes' });
                return;
            }
            res.status(200).send({ message: 'Note mise à jour avec succès', note: notes[noteIndex] });
        });
    });
});


// Endpoint pour supprimer une note existante
router.delete('/:id', authenticateUser, (req, res) => {
    const id = parseInt(req.params.id);
    console.log(id);
    const username = getUsernameFromToken(req.token);
    // Chemin du fichier de notes de l'utilisateur
    const notesFilePath = getUserNotesDirectory(req.user.username);

    // Lire les notes depuis le fichier de l'utilisateur
    fs.readFile(notesFilePath, 'utf-8', (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Erreur lors de la lecture des notes' });
            return;
        }
        let notes = JSON.parse(data);

        // Trouver l'index de la note à supprimer
        const noteIndex = notes.findIndex(note => note.NoteID === id);
        if (noteIndex === -1) {
            res.status(404).send({ error: 'Note non trouvée' });
            return;
        }

        // Supprimer la note
        notes.splice(noteIndex, 1);

        // Écrire les notes mises à jour dans le fichier
        fs.writeFile(notesFilePath, JSON.stringify(notes, null, 2), (err) => {
            if (err) {
                res.status(500).send({ error: 'Erreur lors de l\'écriture des notes' });
                return;
            }
            res.status(200).send({ message: 'Note supprimée avec succès', deletedNoteId: id });
        });
    });
});


module.exports = router;

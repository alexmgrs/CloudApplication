const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import du module CORS
const authRoutes = require('./routes/authRoutes');
const { authenticateUser } = require('./routes/authMiddleware');

const app = express();
const PORT = 3001;

// Utilisation du middleware body-parser pour parser les corps de requête en JSON
app.use(bodyParser.json());

// Middleware CORS pour autoriser les requêtes provenant de différents domaines
app.use(cors());

// Import des routes de gestion des mots de passe
const passwordListRoutes = require('./routes/passwordListRoutes');
const noteRoutes = require('./routes/noteRoutes');

// Utilisation du middleware d'authentification pour protéger les routes sensibles
app.use('/passwords', authenticateUser, passwordListRoutes);
app.use('/notes', authenticateUser, noteRoutes);
app.use('/auth', authRoutes);

// Endpoint racine
app.get('/', (req, res) => {
    res.send('Bienvenue sur le serveur de gestion de mots de passe !');
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});

// autRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const usersDirectory = path.join(__dirname, '..', '..', 'data', 'users');
function generateAuthToken(username) {
    return jwt.sign({ username }, 'your_secret_key', { expiresIn: '1h' });
}

router.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
// Endpoint pour l'inscription
router.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Vérifier si le nom d'utilisateur est fourni
    if (!username) {
        return res.status(400).send({ error: "Username's missing" });
    }

    // Vérifier si le mot de passe est fourni
    if (!password) {
        return res.status(400).send({ error: "Password's missing" });
    }

    // Vérifier si l'utilisateur existe déjà
    const userDirectoryPath = path.join(usersDirectory, username);
    if (fs.existsSync(userDirectoryPath)) {
        return res.status(400).send({ error: 'Username already exist' });
    }

    // Créer le répertoire utilisateur
    fs.mkdirSync(userDirectoryPath);

    // Créer le fichier user.json contenant les informations d'identification
    const userData = { username, password };
    fs.writeFileSync(path.join(userDirectoryPath, 'user.json'), JSON.stringify(userData));

    res.status(201).send({ message: 'Successful registration' });
});




// Endpoint pour la connexion
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Vérifier si l'utilisateur existe
    const userDirectoryPath = path.join(usersDirectory, username);
    if (!fs.existsSync(userDirectoryPath)) {
        return res.status(401).send({ error: 'Nom d\'utilisateur ou mot de passe incorrect' });
    }

    // Charger les données de l'utilisateur
    const userDataPath = path.join(userDirectoryPath, 'user.json');
    const userData = JSON.parse(fs.readFileSync(userDataPath, 'utf-8'));

    // Vérifier si les informations d'identification sont correctes
    if (userData.password !== password) {
        return res.status(401).send({ error: 'Nom d\'utilisateur ou mot de passe incorrect' });
    }

    // Générer un token JWT
    const token = jwt.sign({ username }, 'your_secret_key');

    // Renvoyer le token JWT dans la réponse
    res.status(200).send({ token });
});

module.exports = router;

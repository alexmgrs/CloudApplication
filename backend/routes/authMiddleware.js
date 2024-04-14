const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
// Chemin vers le répertoire des utilisateurs
const usersDirectory = path.join(__dirname, '..', '..', 'data', 'users');

// Fonction pour vérifier si l'utilisateur est authentifié
function checkIfUserIsAuthenticated(req) {
    // Récupérer les informations d'identification de la requête (nom d'utilisateur et mot de passe)
    const { username, password } = req.body;

    // Construction du chemin du fichier utilisateur
    const userFilePath = path.join(usersDirectory, `${username}.json`);

    // Vérifier si le fichier utilisateur existe
    if (!fs.existsSync(userFilePath)) {
        return false; // L'utilisateur n'existe pas
    }

    // Lire les données utilisateur depuis le fichier
    const userData = fs.readFileSync(userFilePath, 'utf-8');
    const user = JSON.parse(userData);

    // Vérifier si le mot de passe fourni correspond au mot de passe de l'utilisateur
    console.log(user.password)
    return user.password === password;
}

const getUsernameFromToken = (token) => {
    try {
        // Vérifier et décoder le token
        const decodedToken = jwt.verify(token, 'votre_clé_secrète');
        // Extraire le nom d'utilisateur du token décodé
        const username = decodedToken.username;
        return username;
    } catch (error) {
        // Gérer les erreurs de décodage ou de vérification du token
        console.error('Erreur lors de la vérification du token :', error);
        return null;
    }
};

const authenticateUser = (req, res, next) => {
    // Récupérer le token d'authentification de l'en-tête Authorization de la requête
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).send({ error: 'Token non fourni' });
    }

    // Vérifier et décoder le token JWT
    jwt.verify(token, 'your_secret_key', (err, user) => {
        if (err) {
            console.error('Erreur lors de la vérification du token :', err);
            return res.status(403).send({ error: 'Token d\'authentification invalide' });
        }
        // Ajouter les données d'utilisateur extraites du token à l'objet req pour les utiliser dans les routes
        req.user = user;
        next();
    });
};


// Middleware d'authentification

// Middleware pour vérifier l'authentification de l'utilisateur à chaque requête



module.exports = {
    authenticateUser, getUsernameFromToken
};

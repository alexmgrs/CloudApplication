// passwordListRoutes.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { authenticateUser } = require('./authMiddleware');
const { generateStrongPasswordFunction, testPasswordStrength} = require('./passwordUtils');
// Fonction pour obtenir le chemin du fichier de mots de passe de l'utilisateur
const getUserPasswordsFilePath = (username) => {
    const userPasswordsDir = path.join(__dirname, '..', '..', 'data', 'users', username);
    return path.join(userPasswordsDir, 'passwords.json');
};

// Endpoint pour récupérer tous les mots de passe de l'utilisateur
router.get('/', authenticateUser, (req, res) => {
    const passwordsFilePath = getUserPasswordsFilePath(req.user.username);

    fs.readFile(passwordsFilePath, 'utf-8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // Le fichier de mots de passe n'existe pas encore, renvoyer une liste vide
                res.status(200).send([]);
            } else {
                // Erreur lors de la lecture du fichier de mots de passe
                console.error('Erreur lors de la lecture du fichier de mots de passe :', err);
                res.status(500).send({ error: 'Erreur lors de la lecture des mots de passe' });
            }
            return;
        }
        const passwords = JSON.parse(data);
        res.json(passwords);
    });
});

// Endpoint pour créer un nouveau mot de passe
router.post('/', authenticateUser, (req, res) => {
    const newPassword = req.body;
    const username = req.user.username;

    // Vérifier si l'utilisateur a fourni un mot de passe ou souhaite en générer un
    if (!newPassword.password && !newPassword.generateStrongPassword) {
        return res.status(400).send({ error: 'Veuillez fournir un mot de passe ou activer la génération de mot de passe fort' });
    }

    // Vérifier si l'utilisateur souhaite générer un mot de passe fort
    if (newPassword.generateStrongPassword) {
        const length = newPassword.passwordLength || 12; // Longueur par défaut du mot de passe
        const includeNumbers = newPassword.includeNumbers || false; // Par défaut, ne pas inclure de chiffres
        const includeSpecialChars = newPassword.includeSpecialChars || false; // Par défaut, ne pas inclure de caractères spéciaux
        // Générer un mot de passe fort
        newPassword.password = generateStrongPasswordFunction(length, includeNumbers, includeSpecialChars);
    }

    // Calculer la force du mot de passe
    newPassword.strength = testPasswordStrength(newPassword.password);

    // Ajouter la date de création
    newPassword.creationDate = new Date().toISOString();

    // Chemin du fichier de mots de passe de l'utilisateur
    const userPasswordsFilePath = path.join(__dirname, '..', '..', 'data', 'users', username, 'passwords.json');

    // Lire les mots de passe depuis le fichier de l'utilisateur
    fs.readFile(userPasswordsFilePath, 'utf-8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // Le fichier de mots de passe de l'utilisateur n'existe pas, nous devons le créer avec un nouveau mot de passe
                const initialPasswords = [{ ...newPassword, id: 1 }]; // ID initialisé à 1
                fs.writeFile(userPasswordsFilePath, JSON.stringify(initialPasswords, null, 2), (err) => {
                    if (err) {
                        return res.status(500).send({ error: 'Erreur lors de la création du fichier de mots de passe' });
                    }
                    res.status(201).send({ message: 'Mot de passe créé avec succès', newPassword });
                });
            } else {
                // Erreur de lecture du fichier de mots de passe de l'utilisateur
                console.error('Erreur lors de la lecture du fichier de mots de passe de l\'utilisateur :', err);
                res.status(500).send({ error: 'Erreur lors de la création du mot de passe' });
            }
        } else {
            // Le fichier de mots de passe de l'utilisateur existe, ajoutez simplement le nouveau mot de passe
            try {
                const passwords = JSON.parse(data);
                // Trouver le dernier ID de mot de passe
                const lastPasswordId = passwords.length > 0 ? passwords[passwords.length - 1].id : 0;
                // Incrémenter l'ID pour le nouveau mot de passe
                newPassword.id = lastPasswordId + 1;
                // Ajouter le nouveau mot de passe à la liste des mots de passe existants
                passwords.push(newPassword);
                // Écrire les mots de passe mis à jour dans le fichier
                fs.writeFile(userPasswordsFilePath, JSON.stringify(passwords, null, 2), (err) => {
                    if (err) {
                        return res.status(500).send({ error: 'Erreur lors de l\'écriture des mots de passe' });
                    }
                    res.status(201).send({ message: 'Mot de passe créé avec succès', newPassword });
                });
            } catch (error) {
                // Erreur de parsing JSON
                console.error('Erreur de parsing JSON :', error);
                res.status(500).send({ error: 'Erreur lors de la création du mot de passe' });
            }
        }
    });
});


// Endpoint pour mettre à jour un mot de passe existant
router.put('/:id', authenticateUser, (req, res) => {
    const id = parseInt(req.params.id);
    const { generateStrongPassword, passwordLength, includeNumbers, includeSpecialChars, ...updatedFields } = req.body;
    const username = req.user.username;

    // Chemin du fichier de mots de passe de l'utilisateur
    const userPasswordsFilePath = path.join(__dirname, '..', '..', 'data', 'users', username, 'passwords.json');

    // Lire les mots de passe depuis le fichier de l'utilisateur
    fs.readFile(userPasswordsFilePath, 'utf-8', (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Erreur lors de la lecture des mots de passe' });
            return;
        }
        let passwords = JSON.parse(data);

        // Trouver le mot de passe à mettre à jour
        const passwordIndex = passwords.findIndex(password => password.id === id);
        if (passwordIndex === -1) {
            res.status(404).send({ error: 'Mot de passe non trouvé' });
            return;
        }

        // Fusionner les champs mis à jour avec les champs existants
        const updatedPassword = { ...passwords[passwordIndex], ...updatedFields };

        // Mettre à jour le nom d'utilisateur s'il n'est pas vide dans la requête
        if ('username' in updatedFields && updatedFields.username !== null) {
            updatedPassword.username = updatedFields.username;
        }

        // Mettre à jour le site s'il n'est pas vide dans la requête
        if (updatedFields.website !== undefined && updatedFields.website !== '') {
            updatedPassword.website = updatedFields.website;
        }

        // Générer un nouveau mot de passe fort si nécessaire
        if (generateStrongPassword) {
            const newPassword = generateStrongPasswordFunction(passwordLength, includeNumbers, includeSpecialChars);
            updatedPassword.password = newPassword;
            // Ajouter les détails de la génération du mot de passe fort
            updatedPassword.generateStrongPassword = true;
            updatedPassword.passwordLength = passwordLength;
            updatedPassword.includeNumbers = includeNumbers;
            updatedPassword.includeSpecialChars = includeSpecialChars;
        }

        // Calculer la force du mot de passe mis à jour
        updatedPassword.strength = testPasswordStrength(updatedPassword.password);

        updatedPassword.creationDate = new Date().toISOString();

        // Mettre à jour le mot de passe dans la liste
        passwords[passwordIndex] = updatedPassword;

        // Écrire les mots de passe mis à jour dans le fichier
        fs.writeFile(userPasswordsFilePath, JSON.stringify(passwords, null, 2), (err) => {
            if (err) {
                res.status(500).send({ error: 'Erreur lors de l\'écriture des mots de passe' });
                return;
            }
            // Envoyer la réponse après la mise à jour réussie
            res.status(200).send({ message: 'Mot de passe mis à jour avec succès', updatedPassword });
        });
    });
});


// Endpoint pour supprimer un mot de passe existant
router.delete('/:id', authenticateUser, (req, res) => {
    const id = parseInt(req.params.id);
    const passwordsFilePath = getUserPasswordsFilePath(req.user.username);

    fs.readFile(passwordsFilePath, 'utf-8', (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Erreur lors de la lecture des mots de passe' });
            return;
        }
        let passwords = JSON.parse(data);

        // Trouver l'index du mot de passe à supprimer
        const passwordIndex = passwords.findIndex(password => password.id === id);
        if (passwordIndex === -1) {
            res.status(404).send({ error: 'Mot de passe non trouvé' });
            return;
        }

        // Supprimer le mot de passe
        passwords.splice(passwordIndex, 1);

        // Écrire les mots de passe mis à jour dans le fichier
        fs.writeFile(passwordsFilePath, JSON.stringify(passwords, null, 2), (err) => {
            if (err) {
                res.status(500).send({ error: 'Erreur lors de l\'écriture des mots de passe' });
                return;
            }
            res.status(200).send({ message: 'Mot de passe supprimé avec succès' });
        });
    });
});

module.exports = router;

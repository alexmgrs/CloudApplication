// passwordUtils.js
const fs = require('fs');
const path = require('path');

function generateStrongPasswordFunction(length, includeNumbers, includeSpecialChars) {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const specialChars = '!@#$%^&*()-_=+';

    let chars = uppercaseChars + lowercaseChars;
    if (includeNumbers) {
        chars += numberChars;
    }
    if (includeSpecialChars) {
        chars += specialChars;
    }

    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }

    return password;
}

function arePasswordsIdentical() {
    // Chemin vers le fichier de mots de passe
    const passwordsFilePath = path.join(__dirname, '..', '..', 'data', 'passwords.json');

    // Lire les mots de passe depuis le fichier
    const data = fs.readFileSync(passwordsFilePath, 'utf-8');
    const passwords = JSON.parse(data);
    if (passwords.length === 0) {
        console.log('Aucun mot de passe trouvé.');
        return false;
    }

    // Créer un objet où la clé est le mot de passe et la valeur est un tableau d'identifiants
    const passwordGroups = {};
    passwords.forEach(passwordObj => {
        if (!(passwordObj.password in passwordGroups)) {
            passwordGroups[passwordObj.password] = [];
        }
        passwordGroups[passwordObj.password].push(passwordObj.id);
    });

    // Filtrer les groupes ayant plus d'un identifiant
    const identicalGroups = Object.entries(passwordGroups)
        .filter(([password, ids]) => ids.length > 1)
        .map(([password, ids]) => ({ password, ids }));

    return identicalGroups;
}
function testPasswordStrength(password) {
    // Vérifier la longueur du mot de passe
    const length = password.length;
    if (length < 8) {
        return 'Weak'; // Si la longueur est inférieure à 8 caractères
    }

    // Vérifier la diversité des caractères
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChars = /[^a-zA-Z0-9]/.test(password);

    // Vérifier les suites logiques
    const hasSequentialChars = /(.)\1{2}/.test(password); // Trois caractères identiques consécutifs
    const hasSequentialNumbers = /(012|123|234|345|456|567|678|789|890)/.test(password); // Suites de chiffres consécutifs

    // Calculer le score de force du mot de passe
    let score = 0;
    if (hasLowerCase) score++;
    if (hasUpperCase) score++;
    if (hasNumbers) score++;
    if (hasSpecialChars) score++;

    // Déterminer la force du mot de passe en fonction du score
    if (score === 1) {
        return 'Weak'; // Si le mot de passe ne contient qu'un seul type de caractères
    } else if (score === 2 && length < 12) {
        return 'Medium'; // Si le mot de passe contient deux types de caractères mais est court
    } else if (score === 2 && length >= 12) {
        return 'Strong'; // Si le mot de passe contient deux types de caractères et est long
    } else if (score === 3 && length < 12) {
        return 'Strong'; // Si le mot de passe contient trois types de caractères mais est court
    } else if (score === 3 && length >= 12) {
        return 'Very Strong'; // Si le mot de passe contient trois types de caractères et est long
    } else if (score === 4) {
        return 'Very Strong'; // Si le mot de passe contient tous les types de caractères
    }

    // Si le mot de passe contient des suites logiques
    if (hasSequentialChars || hasSequentialNumbers) {
        return 'Weak'; // Considérer le mot de passe comme faible s'il contient des suites logiques
    }

    // Si le mot de passe ne correspond à aucun critère précédent, le considérer comme fort par défaut
    return 'Strong';
}




module.exports = { generateStrongPasswordFunction, arePasswordsIdentical, testPasswordStrength };

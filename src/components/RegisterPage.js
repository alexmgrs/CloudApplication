//RegisterPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './PopupForm.css';
function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault(); // Empêcher le comportement par défaut du formulaire

        try {
            const response = await fetch('http://localhost:3001/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });
            const data = await response.json();
            if (response.ok) {
                // Rediriger vers la page de connexion après une inscription réussie
                window.location.href = '/login';
            } else {
                // Gérer les erreurs
                setError(data.error);
            }
        } catch (error) {
            console.error('Error during registration:', error);
        }
    };

    return (
        <div>
            <h2>Inscription</h2>
            <form onSubmit={handleRegister}>
                <input type="text" placeholder="Nom d'utilisateur" value={username} onChange={(e) => setUsername(e.target.value)} />
                <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
                {error && <p style={{ color: 'red' }}>{error}</p>} {/* Afficher le message d'erreur */}
                <button type="submit">S'inscrire</button>
            </form>
            <Link to="/login">Déjà inscrit ? Se connecter ici</Link>
        </div>
    );
}

export default RegisterPage;

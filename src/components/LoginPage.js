// LoginPage.js

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './PopupForm.css';
function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        try {
            const response = await fetch('http://localhost:3001/auth/login', {
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
                // Auth successful, store token in localStorage
                localStorage.setItem('token', data.token);
                // Redirect to dashboard or wherever needed
                window.location.href = '/Dashboard';
            } else {
                // Handle error, for example display error message
                console.error('Login failed:', data.error);
                setError(data.error);
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            {error && <div>{error}</div>}
            <button onClick={handleLogin}>Login</button>
            <Link to="/register">Don't have an account? Register here</Link>
        </div>
    );
}

export default LoginPage;

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import DashboardPage from './components/DashboardPage';
import NotesPage from "./components/NotesPage";
import PasswordsPage from "./components/PasswordsPage";

function App() {
    // Fonction de vérification de l'authentification de l'utilisateur
    const isAuthenticated = () => {
        // Votre logique de vérification d'authentification ici
        // Par exemple, vérifiez si l'utilisateur a un jeton JWT valide
        // et s'il est stocké localement
        return localStorage.getItem('token') !== null;
    };

    // Garde de route pour protéger l'accès au tableau de bord
    const PrivateRoute = ({ element, ...props }) => {
        return isAuthenticated() ? element : <Navigate to="/login" />;
    };

    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/Dashboard" element={<PrivateRoute element={<DashboardPage />} />} />
                    <Route path="/Notes" element={<PrivateRoute element={<NotesPage />} />} />
                    <Route path="/Passwords" element={<PrivateRoute element={<PasswordsPage />} />} />
                    {/* Ajoutez ici d'autres routes */}
                </Routes>
            </div>
        </Router>
    );
}

export default App;

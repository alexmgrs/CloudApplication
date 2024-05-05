import React from 'react';
import { Link } from 'react-router-dom';
import './DashboardPage.css'; // Importez votre fichier CSS pour le style du DashboardPage

function DashboardPage() {
    // Vérifier si l'utilisateur est authentifié
    const isAuthenticated = localStorage.getItem('token') !== null;

    return (
        <div className="dashboard-container">
            <h2>Dashboard</h2>
            {isAuthenticated && (
                <div className="menu-container">
                    <div className="menu-links">
                        <Link to="/Notes" className="menu-link">
                            Notes
                        </Link>
                        <Link to="/Passwords" className="menu-link">
                            Password List
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DashboardPage;

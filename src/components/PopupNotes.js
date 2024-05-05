//PopupNotes.js
import React from 'react';
import './PopupForm.css'; // Importez votre fichier CSS pour le style du PopupForm

function PopupForm({ isOpen, onClose, onSubmit, children }) {
    // Affichez le popup form uniquement s'il est ouvert
    if (!isOpen) {
        return null;
    }

    return (
        <div className="form-popup">
            <div className="form-container">
                {/* Affichez le contenu du formulaire à l'intérieur du popup form */}
                {children}
                {/* Ajoutez un bouton pour soumettre le formulaire */}
                <button type="button" className="btn" onClick={onSubmit}>Add New Notes</button>
                {/* Ajoutez un bouton pour fermer le popup form */}
                <button type="button" className="btn cancel" onClick={onClose}>Close</button>
            </div>
        </div>
    );
}

export default PopupForm;

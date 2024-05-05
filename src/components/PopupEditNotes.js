//PopupEditNotes.js
import React from 'react';

function PopupForm({ isOpen, onClose, onSubmit, children }) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="form-popup">
            <div className="form-container">
                    {children}
                <div className="form-container button-container">
                    <button type="button" className="edit-button" onClick={onSubmit}>Edit Notes</button>
                    <button type="button" className="close-button" onClick={onClose}>Close</button>
                </div>

            </div>
        </div>
    );
}


export default PopupForm;

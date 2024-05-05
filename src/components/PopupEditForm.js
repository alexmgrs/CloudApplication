import React from 'react';
//import './PopupForm.css';

function PopupEditForm({ isOpen, onClose, onSubmit, children }) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="form-popup">
            <div className="form-container">
                {children}
                <button type="button" className="btn small-btn" onClick={onSubmit}>Edit Password</button>
                <button type="button" className="btn small-btn cancel" onClick={onClose}>Close</button>
            </div>
        </div>
    );
}

export default PopupEditForm;

//PasswordsPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PopupForm from './PopupForm';
import PopupEditForm from './PopupEditForm';
import './PopupForm';
import './PasswordsPage.css';

function PasswordListPage() {
    // State for add password form
    const [newPasswordUsername, setNewPasswordUsername] = useState('');
    const [newPasswordPassword, setNewPasswordPassword] = useState('');
    const [newPasswordWebsite, setNewPasswordWebsite] = useState('');
    const [generateStrongPassword, setGenerateStrongPassword] = useState(false);
    const [passwordLength, setPasswordLength] = useState(12);
    const [includeNumbers, setIncludeNumbers] = useState(false);
    const [includeSpecialChars, setIncludeSpecialChars] = useState(false);

    // State for edit password form
    const [editPasswordId, setEditPasswordId] = useState('');
    const [editPasswordUsername, setEditPasswordUsername] = useState('');
    const [editPasswordPassword, setEditPasswordPassword] = useState('');
    const [editPasswordWebsite, setEditPasswordWebsite] = useState('');

    const [passwords, setPasswords] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedPassword, setSelectedPassword] = useState(null);

    useEffect(() => {
        fetch('http://localhost:3001/passwords', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch passwords');
                }
                return response.json();
            })
            .then((data) => {
                setPasswords(data);
            })
            .catch((error) => {
                console.error('Error fetching passwords:', error);
            });
    }, []);

    const handleAddPassword = async () => {
        try {
            const response = await fetch('http://localhost:3001/passwords', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    generateStrongPassword: generateStrongPassword,
                    passwordLength: passwordLength,
                    includeNumbers: includeNumbers,
                    includeSpecialChars: includeSpecialChars,
                    username: newPasswordUsername,
                    password: newPasswordPassword,
                    website: newPasswordWebsite
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setPasswords([...passwords, data.newPassword]);
                setNewPasswordUsername('');
                setNewPasswordPassword('');
                setNewPasswordWebsite('');
                setGenerateStrongPassword(false);
                setPasswordLength(12);
                setIncludeNumbers(false);
                setIncludeSpecialChars(false);
                setIsFormOpen(false)
            } else {
                console.error('Erreur lors de l\'ajout du mot de passe :', data.error);
            }
        } catch (error) {
            console.error('Erreur lors de l\'ajout du mot de passe :', error);
        }
    };

    const handleEditPassword = async (passwordId) => {
        try {
            const response = await fetch(`http://localhost:3001/passwords/${passwordId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    username: editPasswordUsername,
                    password: editPasswordPassword,
                    website: editPasswordWebsite,
                    generateStrongPassword,
                    passwordLength: generateStrongPassword ? passwordLength : null,
                    includeNumbers: generateStrongPassword ? includeNumbers : null,
                    includeSpecialChars: generateStrongPassword ? includeSpecialChars : null,
                }),
            });
            if (response.ok) {
                // Mettre à jour les mots de passe après la modification réussie
                const updatedPassword = {
                    id: passwordId,
                    username: editPasswordUsername,
                    password: editPasswordPassword,
                    website: editPasswordWebsite
                };
                const updatedPasswords = passwords.map(password => {
                    if (password.id === passwordId) {
                        return updatedPassword;
                    }
                    return password;
                });
                setPasswords(updatedPasswords);
                setSelectedPassword(null);
            } else {
                const data = await response.json();
                console.error('Erreur lors de la modification du mot de passe :', data.error);
            }
        } catch (error) {
            console.error('Erreur lors de la modification du mot de passe :', error);
        }
    };


    const handleDeletePassword = async (passwordId) => {
        try {
            const response = await fetch(`http://localhost:3001/passwords/${passwordId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });
            if (response.ok) {
                const updatedPasswords = passwords.filter(password => password.id !== passwordId);
                setPasswords(updatedPasswords);
            } else {
                const data = await response.json();
                console.error('Erreur lors de la suppression du mot de passe :', data.error);
            }
        } catch (error) {
            console.error('Erreur lors de la suppression du mot de passe :', error);
        }
    };

    const handleEditPasswordClick = (password) => {
        setEditPasswordId(password.id);
        setEditPasswordUsername(password.username);
        setEditPasswordPassword(password.password);
        setEditPasswordWebsite(password.website);
        setSelectedPassword(password);
    };

    return (
        <div className="page-container">
            <div className="button-container">
                <div className="homepage-button">
                    <Link to="/dashboard" className="homepage-link">Home Page</Link>
                </div>
                <div className="title-container">
                    <button className="add-button" onClick={() => setIsFormOpen(true)}>Add New Password</button>
                </div>
            </div>
            <PopupForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleAddPassword}
            >
                <div>
                    <h3>Add New Password</h3>
                    <input type="text" placeholder="Username" value={newPasswordUsername}
                           onChange={(e) => setNewPasswordUsername(e.target.value)}/>
                    <input type="text" placeholder="Password" value={newPasswordPassword}
                           onChange={(e) => setNewPasswordPassword(e.target.value)}/>
                    <input type="text" placeholder="Web" value={newPasswordWebsite}
                           onChange={(e) => setNewPasswordWebsite(e.target.value)}/>
                    <label>
                        Use Password Generator:
                        <input type="checkbox" checked={generateStrongPassword}
                               onChange={(e) => setGenerateStrongPassword(e.target.checked)}/>
                    </label>
                    {generateStrongPassword && (
                        <div>
                            <label>
                                Length of Password :
                                <input type="number" value={passwordLength}
                                       onChange={(e) => setPasswordLength(parseInt(e.target.value))}/>
                            </label>
                            <label>
                                Include Numbers :
                                <input type="checkbox" checked={includeNumbers}
                                       onChange={(e) => setIncludeNumbers(e.target.checked)}/>
                            </label>
                            <label>
                                Include Special Characters :
                                <input type="checkbox" checked={includeSpecialChars}
                                       onChange={(e) => setIncludeSpecialChars(e.target.checked)}/>
                            </label>
                        </div>
                    )}
                </div>
            </PopupForm>
            <h2 className="password-list-title">Password List</h2>
            <div className="ag-format-container">
                <div className="ag-courses_box">
                    {passwords.map((password) => (
                        <div key={password.id} className="ag-courses_item">
                            <div className="ag-courses-item_link">
                                <div className="ag-courses-item_bg"></div>
                                <div className="ag-courses-item_content">
                                    <div className="ag-courses-item_info">
                                        <span className="ag-courses-item_label">Username:</span>
                                        <span className="ag-courses-item_value">{password.username}</span>
                                    </div>
                                    <div className="ag-courses-item_info">
                                        <span className="ag-courses-item_label">Password:</span>
                                        <span className="ag-courses-item_value">{password.password}</span>
                                    </div>
                                    <div className="ag-courses-item_info">
                                        <span className="ag-courses-item_label">Website:</span>
                                        <span className="ag-courses-item_value">{password.website}</span>
                                    </div>
                                    <div className="ag-courses-item_strength">
                                        <span className="ag-courses-item_label">Strength:</span>
                                        <span className="ag-courses-item_value">{password.strength}</span>
                                    </div>
                                </div>
                                <button className="open-button" onClick={() => handleEditPasswordClick(password)}>Edit</button>
                                {selectedPassword === password && (
                                    <PopupEditForm
                                        isOpen={true}
                                        onClose={() => setSelectedPassword(null)}
                                        onSubmit={() => handleEditPassword(password.id)}
                                    >
                                        <div>
                                            <h3>Edit Password</h3>
                                            <input type="text" placeholder="Username" value={editPasswordUsername} onChange={(e) => setEditPasswordUsername(e.target.value)}/>
                                            <input type="text" placeholder="Password" value={editPasswordPassword} onChange={(e) => setEditPasswordPassword(e.target.value)}/>
                                            <input type="text" placeholder="Web" value={editPasswordWebsite} onChange={(e) => setEditPasswordWebsite(e.target.value)}/>
                                            <div className="form-group">
                                                <label className="form-labelle">Use Password Generator :</label>
                                                <input type="checkbox" className="form-checkbox"
                                                       checked={generateStrongPassword}
                                                       onChange={(e) => setGenerateStrongPassword(e.target.checked)}/>
                                            </div>
                                            {generateStrongPassword && (
                                                <>
                                                    <div className="form-group">
                                                        <label className="form-label">Length Of Password :
                                                            <input type="number" className="form-input" value={passwordLength} onChange={(e) => setPasswordLength(parseInt(e.target.value))}/>
                                                        </label>
                                                    </div>
                                                    <div className="form-group">
                                                        <label className="form-label">Include Numbers:
                                                            <input type="checkbox" className="form-checkbox" checked={includeNumbers} onChange={(e) => setIncludeNumbers(e.target.checked)}/>
                                                        </label>
                                                    </div>
                                                    <div className="form-group">
                                                        <label className="form-label">Include Special Characters :
                                                            <input type="checkbox" className="form-checkbox" checked={includeSpecialChars} onChange={(e) => setIncludeSpecialChars(e.target.checked)}/>
                                                        </label>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </PopupEditForm>
                                )}
                                <button className="delete-button" onClick={() => handleDeletePassword(password.id)}>Delete</button>
                            </div>
                        </div>
                    ))}

                </div>
            </div>
        </div>
    );
}
export default PasswordListPage;

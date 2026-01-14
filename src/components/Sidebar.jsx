import React from 'react';
import { useData } from '../context/DataContext';

const Sidebar = ({ setView }) => {
    // 1. Destructure renameClient here
    const { store, theme, toggleTheme, setActiveClient, addClient, deleteClient, updateClientMeta, renameClient } = useData();
    const activeClient = store.clients[store.activeClientId];

    const handleAdd = () => {
        const name = prompt("Enter Client Name:");
        if (name) addClient(name);
    };

    const handleDelete = () => {
        if (Object.keys(store.clients).length <= 1) return alert("Cannot delete last client");
        if (confirm(`Delete ${activeClient.name}?`)) deleteClient(activeClient.id);
    };

    // 2. Add Handle Rename Logic
    const handleRename = () => {
        const newName = prompt("Enter new name for this client:", activeClient.name);
        if (newName && newName.trim() !== "") {
            renameClient(activeClient.id, newName);
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2>Clients</h2>
                <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
                    {theme === 'light' ? 
                        <svg className="theme-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"/></svg>
                        : 
                        <svg className="theme-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/></svg>
                    }
                </button>
            </div>

            <div className="client-list">
                {Object.values(store.clients).map(client => (
                    <div key={client.id} className={`client-item ${client.id === store.activeClientId ? 'active' : ''}`}>
                        <span className="client-name-area" onClick={() => { setActiveClient(client.id); setView('editor'); }}>
                            {client.name}
                        </span>
                        <button className="btn-sidebar-view" onClick={(e) => { e.stopPropagation(); setActiveClient(client.id); setView('viewer'); }}>
                            View
                        </button>
                    </div>
                ))}
            </div>

            <button className="btn-add-client" onClick={handleAdd}>+ Add New Client</button>

            {activeClient && (
                <div className="client-desc-box">
                    <span className="desc-label">Client Notes</span>
                    <textarea 
                        className="desc-input" 
                        value={activeClient.description || ""}
                        onChange={(e) => updateClientMeta(activeClient.id, 'description', e.target.value)}
                        placeholder="Add description/notes for this client..."
                    />
                    
                    {/* 3. Added Action Buttons Row */}
                    <div style={{marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <button 
                            onClick={handleRename} 
                            style={{background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:'0.75rem', textDecoration:'underline'}}
                        >
                            Rename Client
                        </button>

                        <button 
                            onClick={handleDelete} 
                            style={{background:'none', border:'none', color:'var(--state-danger-text)', cursor:'pointer', fontSize:'0.75rem', textDecoration:'underline'}}
                        >
                            Delete Client
                        </button>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
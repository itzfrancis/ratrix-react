import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';

// --- SVG ICONS ---
const IconEye = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);
const IconXSmall = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
const IconChevronLeft = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
);
const IconChevronRight = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);
const IconMoon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
);
const IconSun = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
);

const Sidebar = ({ onNavigate }) => {
    const { store, theme, toggleTheme, setActiveClient, addClient, deleteClient, updateClientMeta, renameClient } = useData();
    const activeClient = store.clients[store.activeClientId];
    
    // New State for sidebar collapse
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Effect to control global CSS variable for layout resizing
    useEffect(() => {
        const root = document.documentElement;
        if (isCollapsed) {
            root.style.setProperty('--sidebar-width', '80px');
        } else {
            root.style.setProperty('--sidebar-width', '280px');
        }
    }, [isCollapsed]);

    const handleAdd = () => {
        const name = prompt("Enter Client Name:");
        if (name) addClient(name);
    };

    const handleDelete = () => {
        if (Object.keys(store.clients).length <= 1) return alert("Cannot delete last client");
        if (confirm(`Delete ${activeClient.name}?`)) deleteClient(activeClient.id);
    };

    const handleRename = () => {
        const newName = prompt("Enter new name for this client:", activeClient.name);
        if (newName && newName.trim() !== "") {
            renameClient(activeClient.id, newName);
        }
    };

    const handleClearNotes = () => {
        if (confirm("Are you sure you want to clear these notes?")) {
            updateClientMeta(activeClient.id, 'description', '');
        }
    };

    const requestClientChange = (clientId, targetView) => {
        onNavigate(targetView, () => {
            setActiveClient(clientId);
        });
    };

    // Helper to get initials for collapsed view
    const getInitials = (name) => {
        return name ? name.substring(0, 2).toUpperCase() : "??";
    };

    return (
        <aside className="sidebar" style={{ 
            transition: 'width 0.3s ease', 
            padding: isCollapsed ? '20px 10px' : '20px',
            alignItems: isCollapsed ? 'center' : 'stretch'
        }}>
            {/* HEADER SECTION */}
            <div className="sidebar-header" style={{ flexDirection: isCollapsed ? 'column' : 'row', gap: isCollapsed ? 15 : 0, justifyContent: isCollapsed ? 'center' : 'space-between' }}>
                {!isCollapsed && <h2>Clients</h2>}
                
                <div style={{display:'flex', gap:5, flexDirection: isCollapsed ? 'column' : 'row'}}>
                    <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
                        {theme === 'light' ? <IconMoon /> : <IconSun />}
                    </button>
                    
                    <button className="theme-toggle-btn" onClick={() => setIsCollapsed(!isCollapsed)} title={isCollapsed ? "Expand" : "Collapse"}>
                        {isCollapsed ? <IconChevronRight /> : <IconChevronLeft />}
                    </button>
                </div>
            </div>

            {/* CLIENT LIST */}
            <div className="client-list" style={{ alignItems: isCollapsed ? 'center' : 'stretch' }}>
                {Object.values(store.clients).map(client => (
                    <div 
                        key={client.id} 
                        className={`client-item ${client.id === store.activeClientId ? 'active' : ''}`}
                        style={{ 
                            justifyContent: isCollapsed ? 'center' : 'space-between',
                            padding: isCollapsed ? '10px 0' : '10px',
                            height: isCollapsed ? '50px' : 'auto',
                            width: isCollapsed ? '50px' : 'auto',
                            borderRadius: isCollapsed ? '12px' : '8px'
                        }}
                    >
                        {isCollapsed ? (
                            // COLLAPSED VIEW: Initials Circle
                            <div 
                                onClick={() => requestClientChange(client.id, 'editor')}
                                title={client.name}
                                style={{
                                    fontWeight: 700, fontSize: '0.9rem', 
                                    cursor: 'pointer', width:'100%', height:'100%',
                                    display:'flex', alignItems:'center', justifyContent:'center',
                                    color: client.id === store.activeClientId ? 'var(--brand-primary)' : 'var(--text-muted)'
                                }}
                            >
                                {getInitials(client.name)}
                            </div>
                        ) : (
                            // EXPANDED VIEW: Full Details
                            <>
                                <div className="client-name-area" onClick={() => requestClientChange(client.id, 'editor')}>
                                    <div style={{ fontWeight: 600 }}>{client.name}</div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2, fontFamily: 'monospace' }}>
                                        ID: {client.id}
                                    </div>
                                </div>
                                <button className="btn-sidebar-view" onClick={(e) => { 
                                    e.stopPropagation(); 
                                    requestClientChange(client.id, 'viewer'); 
                                }} style={{display:'flex', alignItems:'center', gap:4}}>
                                    <IconEye /> View
                                </button>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* ADD BUTTON */}
            <button className="btn-add-client" onClick={handleAdd} title="Add New Client">
                {isCollapsed ? "+" : "+ Add New Client"}
            </button>

            {/* NOTES SECTION (Only visible when Expanded) */}
            {!isCollapsed && activeClient && (
                <div className="client-desc-box">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                        <span className="desc-label" style={{ margin: 0 }}>Client Notes</span>
                        {activeClient.description && (
                            <button
                                onClick={handleClearNotes}
                                style={{
                                    background: 'none', border: 'none', color: 'var(--state-danger-text)',
                                    cursor: 'pointer', fontSize: '0.7rem', padding: 0, opacity: 0.7,
                                    display: 'flex', alignItems: 'center', gap: 3
                                }}
                                title="Clear all notes"
                            >
                                <IconXSmall /> Clear
                            </button>
                        )}
                    </div>

                    <textarea
                        className="desc-input"
                        value={activeClient.description || ""}
                        onChange={(e) => updateClientMeta(activeClient.id, 'description', e.target.value)}
                        placeholder="Add description/notes for this client..."
                    />

                    <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button
                            onClick={handleRename}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}
                        >
                            Rename Client
                        </button>

                        <button
                            onClick={handleDelete}
                            style={{ background: 'none', border: 'none', color: 'var(--state-danger-text)', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}
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
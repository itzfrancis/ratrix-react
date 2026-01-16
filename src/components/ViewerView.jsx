import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { MODEL_KEYS, MODEL_LABELS } from '../utils/helpers';

// --- SVG ICONS ---
const IconArrowLeft = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
);
const IconFile = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);
const IconEye = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);
const IconInbox = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>
);
const IconList = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
);

const ViewerView = ({ backToEditor }) => {
    const { getActiveClient } = useData();
    const client = getActiveClient();
    
    // State to track which specific table is currently being viewed (Detail View)
    // If null, we are in List View
    const [viewingProfile, setViewingProfile] = useState(null); // { model: 'fixed', profile: object }

    if (!client) return null;

    // Check if client has any tables at all
    const hasAnyTables = MODEL_KEYS.some(model => {
        const profiles = client.data_store[model]?.profiles || {};
        return Object.keys(profiles).length > 0;
    });

    // --- RENDER DETAIL VIEW (Single Table) ---
    if (viewingProfile) {
        const { model, profile } = viewingProfile;
        return (
            <div className="viewer-container">
                <div className="viewer-header">
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.4rem', display:'flex', alignItems:'center', gap:10 }}>
                            <IconFile /> {profile.name}
                        </h1>
                        <div style={{ color: 'var(--text-muted)' }}>{client.name}</div>
                    </div>
                    <button className="btn-back" onClick={() => setViewingProfile(null)}>
                        <IconList /> Back to List
                    </button>
                </div>

                <div className="viewer-content">
                    <div className="ro-table-wrapper" style={{borderTop: 'none'}}>
                        <table className="ro-table">
                            <thead>
                                <tr>
                                    <th className="ro-origin-dest">Origin</th>
                                    <th className="ro-origin-dest">Dest</th>
                                    {profile.limits.map((lim, i) => {
                                        const isExcess = (model === 'excess' || model === 'minExcess') && i === 1;
                                        if (isExcess) {
                                            return <th key={i} style={{color: 'var(--brand-primary)'}}>Excess Rate</th>;
                                        }
                                        const prev = i === 0 ? 1 : profile.limits[i - 1] + 1;
                                        return <th key={i}>{prev}-{lim}</th>;
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {profile.rows.map((row, idx) => (
                                    <tr key={idx}>
                                        <td className="ro-origin-dest">{row.origin}</td>
                                        <td className="ro-origin-dest">{row.dest}</td>
                                        {row.rates.map((r, ri) => (
                                            <td key={ri}>{r === null ? '-' : r}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER LIST VIEW (All Tables) ---
    return (
        <div className="viewer-container">
            <div className="viewer-header">
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.4rem' }}>Saved Tables</h1>
                    <div style={{ color: 'var(--text-muted)' }}>{client.name}</div>
                </div>
                <button className="btn-back" onClick={backToEditor}>
                    <IconArrowLeft /> Back to Editor
                </button>
            </div>

            <div className="viewer-content">
                {!hasAnyTables ? (
                    <div style={{
                        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', 
                        padding: '60px 20px', color: 'var(--text-muted)', opacity: 0.6
                    }}>
                        <IconInbox />
                        <h3 style={{fontWeight: 500, marginTop: 15}}>No tables saved yet</h3>
                    </div>
                ) : (
                    MODEL_KEYS.map(model => {
                        const profiles = Object.values(client.data_store[model]?.profiles || {});
                        if (profiles.length === 0) return null;

                        return profiles.map(profile => {
                            const profileId = Object.keys(client.data_store[model].profiles).find(key => client.data_store[model].profiles[key] === profile);
                            
                            return (
                                <div key={profileId} className="profile-item-wrapper flat-view">
                                    <div className="profile-header-row">
                                        <div className="profile-info-group">
                                            <div className="profile-title">
                                                <IconFile /> {profile.name}
                                            </div>
                                            {/* REMOVED: Pricing Model Badge */}
                                        </div>

                                        <button 
                                            className="btn-toggle-view showing"
                                            onClick={() => setViewingProfile({ model, profile })}
                                        >
                                            <IconEye /> View Table
                                        </button>
                                    </div>
                                </div>
                            );
                        });
                    })
                )}
            </div>
        </div>
    );
};

export default ViewerView;
import React from 'react';
import { useData } from '../context/DataContext';
import { MODEL_KEYS } from '../utils/helpers';

// --- SVG ICONS ---
const IconArrowLeft = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
);
const IconFile = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);

const ViewerView = ({ backToEditor }) => {
    const { getActiveClient } = useData();
    const client = getActiveClient();

    if (!client) return null;

    return (
        <div className="viewer-container">
            <div className="viewer-header">
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.4rem' }}>Table Viewer</h1>
                    <div style={{ color: 'var(--text-muted)' }}>{client.name}</div>
                </div>
                <button className="btn-back" onClick={backToEditor}>
                    <IconArrowLeft /> Back to Editor
                </button>
            </div>

            <div className="viewer-content">
                {MODEL_KEYS.map(model => {
                    const profiles = Object.values(client.data_store[model]?.profiles || {});
                    if (profiles.length === 0) return null;

                    return (
                        <div key={model} className="model-section">
                            {profiles.map(profile => (
                                <div key={profile.name} className="ro-table-card">
                                    <div className="ro-table-title"><IconFile /> {profile.name} ({model})</div>
                                    <div className="ro-table-wrapper">
                                        <table className="ro-table">
                                            <thead>
                                                <tr>
                                                    <th className="ro-origin-dest">Origin</th>
                                                    <th className="ro-origin-dest">Dest</th>
                                                    {profile.limits.map((lim, i) => {
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
                            ))}
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default ViewerView;
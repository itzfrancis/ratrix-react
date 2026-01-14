import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import EditorView from './components/EditorView';
import ViewerView from './components/ViewerView';
import { DataProvider } from './context/DataContext';
import './styles/global.css';

function AppContent() {
    const [view, setView] = useState('editor');

    return (
        <div className="app-wrapper">
            <Sidebar setView={setView} />
            <main className="main-content">
                {view === 'editor' ? (
                    <div className="view-section active-view">
                        <EditorView switchToViewer={() => setView('viewer')} />
                    </div>
                ) : (
                    <div className="view-section active-view">
                        <ViewerView backToEditor={() => setView('editor')} />
                    </div>
                )}
            </main>
        </div>
    );
}

function App() {
    return (
        <DataProvider>
            <AppContent />
        </DataProvider>
    );
}

export default App;
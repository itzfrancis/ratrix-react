import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import EditorView from './components/EditorView';
import ViewerView from './components/ViewerView';
import { DataProvider } from './context/DataContext';
import './styles/global.css';

function AppContent() {
  const [view, setView] = useState('editor');
  // 1. New State: Track if the editor has unsaved changes
  const [isDirty, setIsDirty] = useState(false);

  // 2. Navigation Guard: This intercepts navigation attempts
  const handleNavigation = (targetView, actionCallback) => {
    // If we are currently editing and have unsaved changes...
    if (view === 'editor' && isDirty) {
      const confirmLeave = window.confirm("You will lose your progress, are you sure you want to continue?");
      if (!confirmLeave) return; // User clicked Cancel, do nothing
    }

    // If we proceed:
    setIsDirty(false); // Reset dirty flag
    if (actionCallback) actionCallback(); // Run any extra logic (like changing active client)
    setView(targetView); // Actually change the view
  };

  return (
    <div className="app-wrapper">
      {/* 3. Pass handleNavigation to Sidebar instead of raw setView */}
      <Sidebar 
        onNavigate={handleNavigation} 
        currentView={view}
      />
      <main className="main-content">
        {view === 'editor' ? (
          <div className="view-section active-view">
            {/* 4. Pass setIsDirty to EditorView so it can report changes */}
            <EditorView 
              switchToViewer={() => {
                setIsDirty(false); // Explicit save doesn't need a warning
                setView('viewer');
              }} 
              setIsDirty={setIsDirty}
            />
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